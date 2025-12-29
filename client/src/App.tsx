import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';
import { ThemeProvider } from './components/theme-provider';
import { Navbar } from './components/Navbar';
import { Workspace } from './components/Workspace';
import { CodeEditor } from './components/CodeEditor';
import { Console } from './components/Console';
import { DependencyResolver } from './components/dependency-resolver';
import { useSocket } from './hooks/useSocket';
import { useEditorStore } from './stores/useEditorStore';

function AppContent() {
  const [showDependencyResolver, setShowDependencyResolver] = useState(false);
  const { disconnect } = useSocket();
  const files = useEditorStore((state) => state.files);
  const activeFileId = useEditorStore((state) => state.activeFileId);
  const getAllFiles = useEditorStore((state) => state.getAllFiles);

  // Panel sizing state
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [consoleHeight, setConsoleHeight] = useState(200);
  
  // Resize state
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingConsole, setIsResizingConsole] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle run button click - show dependency resolver
  const handleRunClick = useCallback(() => {
    const allFiles = getAllFiles();
    if (allFiles.length <= 1) {
      const activeFile = activeFileId ? files[activeFileId] : null;
      if (activeFile) {
        setShowDependencyResolver(true);
      }
    } else {
      setShowDependencyResolver(true);
    }
  }, [activeFileId, files, getAllFiles]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        const newWidth = Math.max(150, Math.min(400, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingConsole && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = Math.max(100, Math.min(500, containerRect.bottom - e.clientY));
        setConsoleHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingConsole(false);
    };

    if (isResizingSidebar || isResizingConsole) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizingSidebar ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar, isResizingConsole]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Navbar />
      
      <main ref={containerRef} className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar / Workspace */}
        <div 
          className="h-full flex-shrink-0 overflow-hidden"
          style={{ width: sidebarWidth }}
        >
          <Workspace />
        </div>

        {/* Sidebar Resize Handle */}
        <div
          className="w-1 h-full bg-border hover:bg-primary cursor-col-resize flex-shrink-0 transition-colors"
          onMouseDown={() => setIsResizingSidebar(true)}
        />

        {/* Right side: Editor + Console */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeEditor onRunClick={handleRunClick} />
          </div>

          {/* Console Resize Handle */}
          <div
            className="h-1 w-full bg-border hover:bg-primary cursor-row-resize flex-shrink-0 transition-colors"
            onMouseDown={() => setIsResizingConsole(true)}
          />

          {/* Console */}
          <div 
            className="flex-shrink-0 overflow-hidden"
            style={{ height: consoleHeight }}
          >
            <Console />
          </div>
        </div>
      </main>

      {/* Dependency Resolver Dialog */}
      <DependencyResolver
        open={showDependencyResolver}
        onOpenChange={setShowDependencyResolver}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
