import { useEffect, useRef, useState, useCallback } from 'react';
import AnsiToHtml from 'ansi-to-html';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEditorStore, MAX_OUTPUT_ENTRIES } from '@/stores/useEditorStore';
import type { EditorState } from '@/stores/useEditorStore';
import { useSocket } from '@/hooks/useSocket';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trash2, ArrowDownToLine, Send, Terminal as TerminalIcon, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ANSI to HTML converter instances for light and dark themes
const darkAnsiConverter = new AnsiToHtml({
  fg: '#d4d4d4',
  bg: 'transparent',
  newline: true,
  escapeXML: true,
  colors: {
    0: '#1e1e1e',
    1: '#f87171',
    2: '#4ade80',
    3: '#facc15',
    4: '#60a5fa',
    5: '#c084fc',
    6: '#22d3ee',
    7: '#d4d4d4',
    8: '#737373',
    9: '#fca5a5',
    10: '#86efac',
    11: '#fde047',
    12: '#93c5fd',
    13: '#d8b4fe',
    14: '#67e8f9',
    15: '#ffffff',
  },
});

const lightAnsiConverter = new AnsiToHtml({
  fg: '#1e1e1e',
  bg: 'transparent',
  newline: true,
  escapeXML: true,
  colors: {
    0: '#ffffff',
    1: '#dc2626',
    2: '#16a34a',
    3: '#ca8a04',
    4: '#2563eb',
    5: '#9333ea',
    6: '#0891b2',
    7: '#1e1e1e',
    8: '#737373',
    9: '#ef4444',
    10: '#22c55e',
    11: '#eab308',
    12: '#3b82f6',
    13: '#a855f7',
    14: '#06b6d4',
    15: '#000000',
  },
});

interface ConsoleProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function Console({ isMinimized, onToggleMinimize }: ConsoleProps) {
  const { theme } = useTheme();
  const output = useEditorStore((state: EditorState) => state.output);
  const isRunning = useEditorStore((state: EditorState) => state.isRunning);
  const clearOutput = useEditorStore((state: EditorState) => state.clearOutput);
  const { sendInput } = useSocket();
  const [inputValue, setInputValue] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<HTMLDivElement>(null);

  // Select the appropriate ANSI converter based on theme
  const ansiConverter = theme === 'dark' ? darkAnsiConverter : lightAnsiConverter;

  // Virtual list configuration
  // Uses @tanstack/react-virtual to only render visible output entries
  // This dramatically improves performance when output contains thousands of lines.
  // Without virtualization, all entries would be in the DOM, causing:
  // - Slow initial renders and re-renders
  // - High memory usage (DOM nodes consume memory)
  // - Janky scrolling performance
  //
  // With virtualization:
  // - Only ~20-30 rows rendered at a time (visible + overscan buffer)
  // - Smooth 60fps scrolling even with 10,000 entries
  // - Memory usage scales with visible rows, not total entries
  const rowVirtualizer = useVirtualizer({
    count: output.length,
    getScrollElement: () => scrollingRef.current,
    estimateSize: useCallback(() => 24, []), // Approximate row height in pixels
    overscan: 20, // Render extra rows outside viewport for smoother scrolling
  });

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (autoScroll && !isMinimized && output.length > 0) {
      // Schedule scroll to bottom after items are rendered
      setTimeout(() => {
        if (scrollingRef.current) {
          scrollingRef.current.scrollTop = scrollingRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [output.length, autoScroll, isMinimized]);

  // Calculate output buffer usage percentage
  const outputUsagePercent = Math.round((output.length / MAX_OUTPUT_ENTRIES) * 100);
  const isNearCapacity = outputUsagePercent > 80;

  const handleSendInput = useCallback(() => {
    if (inputValue.trim() && isRunning) {
      sendInput(inputValue + '\n');
      setInputValue('');
    }
  }, [inputValue, isRunning, sendInput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendInput();
      }
    },
    [handleSendInput]
  );

  const renderOutput = (text: string, type: 'stdout' | 'stderr' | 'system') => {
    const html = ansiConverter.toHtml(text);
    return (
      <span
        className={cn(
          type === 'stderr' && 'text-red-600 dark:text-red-400',
          type === 'system' && 'text-blue-600 dark:text-blue-400 italic'
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "h-full w-full flex flex-col border-t overflow-hidden",
        "bg-background text-foreground"
      )}>
        {/* Console header - Minimizable like LeetCode */}
        <div 
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b shrink-0 cursor-pointer select-none",
            "bg-muted/20 hover:bg-muted/30 transition-colors"
          )}
          onClick={onToggleMinimize}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <TerminalIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold">Console</span>
              {isRunning && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Running</span>
                </div>
              )}
              {isNearCapacity && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                      <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                        {outputUsagePercent}% capacity
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Output buffer approaching limit ({output.length.toLocaleString()} / {MAX_OUTPUT_ENTRIES.toLocaleString()} entries)
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {!isMinimized && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-8 w-8 transition-all',
                        autoScroll && 'text-blue-600 dark:text-blue-400 bg-blue-500/10'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAutoScroll(!autoScroll);
                      }}
                    >
                      <ArrowDownToLine className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearOutput();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear console</TooltipContent>
                </Tooltip>
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMinimize();
                  }}
                >
                  {isMinimized ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMinimized ? 'Expand console' : 'Minimize console'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Console content - Only show when not minimized */}
        {!isMinimized && (
          <>
            {/* Console output - Virtualized for performance */}
            <div
              ref={scrollingRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden font-mono text-sm"
            >
              {output.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="inline-flex p-4 rounded-xl bg-muted/30 border-2 border-dashed border-border">
                    <Sparkles className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-muted-foreground font-medium">Output will appear here</p>
                    <p className="text-xs text-muted-foreground/70">Run your code to see results</p>
                  </div>
                </div>
              ) : (
                <div ref={parentRef} style={{ position: 'relative', width: '100%', height: rowVirtualizer.getTotalSize() }}>
                  {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const entry = output[virtualItem.index];
                    return (
                      <div
                        key={`${entry.timestamp}-${virtualItem.index}`}
                        data-index={virtualItem.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                        className="px-4 py-2 leading-relaxed whitespace-pre-wrap break-words"
                      >
                        {renderOutput(entry.data, entry.type)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="flex items-center gap-3 p-3 border-t bg-muted/20 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg flex-1">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">❯</span>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRunning ? 'Type input and press Enter...' : 'Run code to enable input'}
                  disabled={!isRunning}
                  className="flex-1 bg-transparent border-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-9 w-9 rounded-lg transition-all",
                      isRunning && inputValue.trim() 
                        ? "text-blue-600 dark:text-blue-400 hover:bg-blue-500/10" 
                        : "text-muted-foreground"
                    )}
                    onClick={handleSendInput}
                    disabled={!isRunning || !inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send input (Enter)</TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}