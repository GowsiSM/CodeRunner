/**
 * Admin Routes - Protected endpoints for server monitoring and management
 * Access via: /admin?key=<ADMIN_KEY>
 */

import { Router, Request, Response, NextFunction } from 'express';
import { adminMetrics } from './adminMetrics';
import { sessionPool } from './pool';
import { getNetworkStats, getNetworkMetrics, getSubnetStats } from './networkManager';
import { getWorkerPool } from './workerPool';
import { config } from './config';

const router = Router();

// Admin authentication key (set via environment variable)
const ADMIN_KEY = process.env.ADMIN_KEY || 'dev-admin-key-change-in-production';

if (ADMIN_KEY === 'dev-admin-key-change-in-production' && config.server.env === 'production') {
  console.warn('[Admin] WARNING: Using default admin key in production! Set ADMIN_KEY environment variable.');
}

/**
 * Simple admin authentication middleware
 */
function adminAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.query.key || req.headers['x-admin-key'];
  
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
  }
  
  next();
}

/**
 * GET /admin - Redirect to client-side admin page
 */
router.get('/', adminAuth, (req: Request, res: Response) => {
  // Redirect to the client-side admin page with the key
  const key = req.query.key;
  res.redirect(`/?admin=true&key=${key}#/admin?key=${key}`);
});

/**
 * GET /admin/stats - Comprehensive server statistics
 */
router.get('/stats', adminAuth, async (req: Request, res: Response) => {
  try {
    const poolMetrics = sessionPool.getMetrics();
    const sessionCount = sessionPool.getSessionCount();
    const networkStats = await getNetworkStats();
    const networkMetrics = getNetworkMetrics();
    const subnetStats = getSubnetStats();
    const workerPool = getWorkerPool(false);
    
    // Get execution queue stats - import at runtime to avoid circular dependency
    let queueStats = {
      queued: 0,
      active: 0,
      maxConcurrent: config.sessionContainers.maxConcurrentSessions,
    };
    
    try {
      const indexModule = await import('./index');
      if (indexModule.executionQueue) {
        queueStats = indexModule.executionQueue.getStats();
      }
    } catch (err) {
      // If we can't import, use default values
      console.warn('[Admin] Could not import executionQueue:', err);
    }

    const stats = {
      timestamp: new Date().toISOString(),
      server: {
        environment: config.server.env,
        port: config.server.port,
        uptime: process.uptime(),
      },
      workers: workerPool && workerPool.isEnabled() 
        ? workerPool.getStats() 
        : { totalWorkers: 0, activeWorkers: 0, idleWorkers: 0 },
      containers: {
        active: sessionCount,
        created: poolMetrics.containersCreated,
        reused: poolMetrics.containersReused,
        deleted: poolMetrics.containersDeleted,
        cleanupErrors: poolMetrics.cleanupErrors,
      },
      networks: {
        total: networkStats.total,
        active: networkStats.withContainers,
        unused: networkStats.empty,
        created: networkMetrics.networksCreated,
        deleted: networkMetrics.networksDeleted,
        cleanupErrors: networkMetrics.cleanupErrors,
      },
      executions: {
        queued: queueStats.queued,
        active: queueStats.active,
        maxConcurrent: queueStats.maxConcurrent,
      },
      clients: adminMetrics.getCurrentState(),
      metrics: adminMetrics.getSummaryStats(),
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/metrics/today - Today's metrics
 */
router.get('/metrics/today', adminAuth, (req: Request, res: Response) => {
  try {
    const metrics = adminMetrics.getTodayMetrics();
    res.json(metrics || { error: 'No metrics available for today' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/metrics/:date - Metrics for specific date (YYYY-MM-DD)
 */
router.get('/metrics/:date', adminAuth, (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const metrics = adminMetrics.getDailyMetrics(date);
    
    if (!metrics) {
      return res.status(404).json({ error: `No metrics available for ${date}` });
    }
    
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/metrics/all - All available daily metrics
 */
router.get('/metrics/all', adminAuth, (req: Request, res: Response) => {
  try {
    const allMetrics = adminMetrics.getAllDailyMetrics();
    res.json(allMetrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/report/download - Download today's report as CSV
 * Optional query param: ?date=YYYY-MM-DD
 */
router.get('/report/download', adminAuth, (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const csv = adminMetrics.generateDailyReport(date);
    
    if (csv === 'No data available for this date') {
      return res.status(404).json({ error: `No data available for ${date}` });
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="coderunner-report-${date}.csv"`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /admin/reset - Reset all metrics
 */
router.post('/reset', adminAuth, async (req: Request, res: Response) => {
  try {
    adminMetrics.resetAllMetrics();
    res.json({ 
      success: true,
      message: 'All metrics have been reset successfully'
    });
  } catch (error: any) {
    console.error('[Admin] Error resetting metrics:', error);
    res.status(500).json({ 
      error: `Failed to reset metrics: ${error.message}` 
    });
  }
});

/**
 * GET /admin/snapshots - Recent server snapshots
 */
router.get('/snapshots', adminAuth, (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string) || 60;
    const snapshots = adminMetrics.getRecentSnapshots(count);
    res.json(snapshots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /admin/history - Request history
 */
router.get('/history', adminAuth, (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const history = adminMetrics.getRequestHistory(startDate, endDate, limit);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
export { ADMIN_KEY, adminAuth };
