import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Network Manager for Session-based Docker Networks
 * 
 * This module manages Docker networks for session-based container execution.
 * Each user session gets its own isolated Docker network, allowing socket
 * programming (e.g., Java Server/Client) without port conflicts between users.
 */

const NETWORK_PREFIX = 'coderunner-session-';
const NETWORK_DRIVER = 'bridge';

/**
 * Check if a Docker network exists
 */
export async function networkExists(networkName: string): Promise<boolean> {
  try {
    await execAsync(`docker network inspect ${networkName}`, { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a Docker network for a session
 */
export async function createSessionNetwork(sessionId: string): Promise<string> {
  const networkName = `${NETWORK_PREFIX}${sessionId}`;
  
  try {
    console.log(`[NetworkManager] Creating network: ${networkName}`);
    const command = `docker network create --driver ${NETWORK_DRIVER} ${networkName}`;
    console.log(`[NetworkManager] Executing: ${command}`);
    await execAsync(command, { timeout: 10000 });
    console.log(`[NetworkManager] Network created: ${networkName}`);
    return networkName;
  } catch (error: any) {
    console.error(`[NetworkManager] Failed to create network ${networkName}:`, error.message);
    throw new Error(`Failed to create session network: ${error.message}`);
  }
}

/**
 * Delete a Docker network
 */
export async function deleteSessionNetwork(sessionId: string): Promise<void> {
  const networkName = `${NETWORK_PREFIX}${sessionId}`;
  
  try {
    console.log(`[NetworkManager] Deleting network: ${networkName}`);
    await execAsync(`docker network rm ${networkName}`, { timeout: 10000 });
    console.log(`[NetworkManager] Network deleted: ${networkName}`);
  } catch (error: any) {
    console.error(`[NetworkManager] Failed to delete network ${networkName}:`, error.message);
    // Don't throw - network might already be deleted or not exist
  }
}

/**
 * Get or create a session network (idempotent)
 */
export async function getOrCreateSessionNetwork(sessionId: string): Promise<string> {
  const networkName = `${NETWORK_PREFIX}${sessionId}`;
  
  const exists = await networkExists(networkName);
  if (exists) {
    console.log(`[NetworkManager] Network already exists: ${networkName}`);
    return networkName;
  }
  
  return await createSessionNetwork(sessionId);
}

/**
 * List all session networks
 */
export async function listSessionNetworks(): Promise<string[]> {
  try {
    const { stdout } = await execAsync(
      `docker network ls --filter name=${NETWORK_PREFIX} --format "{{.Name}}"`,
      { timeout: 10000 }
    );
    return stdout.trim().split('\n').filter(name => name.length > 0);
  } catch (error) {
    console.error('[NetworkManager] Failed to list session networks:', error);
    return [];
  }
}

/**
 * Cleanup orphaned networks (networks older than maxAge with no containers)
 */
export async function cleanupOrphanedNetworks(maxAgeMs: number = 3600000): Promise<void> {
  try {
    const networks = await listSessionNetworks();
    const now = Date.now();
    
    for (const networkName of networks) {
      try {
        // Get network creation time
        const { stdout: inspectOutput } = await execAsync(
          `docker network inspect ${networkName} --format "{{.Created}}"`,
          { timeout: 10000 }
        );
        const createdAt = new Date(inspectOutput.trim()).getTime();
        
        // Check if network is old enough
        if (now - createdAt > maxAgeMs) {
          // Check if network has any containers
          const { stdout: containersOutput } = await execAsync(
            `docker network inspect ${networkName} --format "{{len .Containers}}"`,
            { timeout: 10000 }
          );
          const containerCount = parseInt(containersOutput.trim(), 10);
          
          if (containerCount === 0) {
            console.log(`[NetworkManager] Cleaning up orphaned network: ${networkName}`);
            const sessionId = networkName.replace(NETWORK_PREFIX, '');
            await deleteSessionNetwork(sessionId);
          }
        }
      } catch (error) {
        console.error(`[NetworkManager] Failed to check/cleanup network ${networkName}:`, error);
      }
    }
  } catch (error) {
    console.error('[NetworkManager] Failed to cleanup orphaned networks:', error);
  }
}

/**
 * Get network name from session ID
 */
export function getNetworkName(sessionId: string): string {
  return `${NETWORK_PREFIX}${sessionId}`;
}
