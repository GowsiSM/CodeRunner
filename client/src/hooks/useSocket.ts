import { useEffect, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket, waitForConnection, isConnected } from '@/lib/socket';
import { useEditorStore } from '@/stores/useEditorStore';

interface ExecutionFile {
  name: string;
  content: string;
  toBeExec?: boolean;
}

export const useSocket = () => {
  // Initialize socket connection on mount
  useEffect(() => {
    connectSocket();
  }, []);

  const runCode = useCallback(
    async (files: ExecutionFile[], language: string) => {
      const store = useEditorStore.getState();
      store.clearOutput();
      store.setRunning(true);
      store.appendOutput({
        type: 'system',
        data: `[Connecting to server...]\n`,
      });

      // Wait for connection if not already connected
      const connected = await waitForConnection();
      if (!connected) {
        store.appendOutput({
          type: 'stderr',
          data: 'Error: Could not connect to server. Please check if the server is running.',
        });
        store.setRunning(false);
        return;
      }

      const socket = getSocket();
      store.appendOutput({
        type: 'system',
        data: `[Running ${language} code...]\n`,
      });

      console.log('[useSocket] Emitting run event:', { language, files });
      socket!.emit('run', { language, files });
    },
    []
  );

  const sendInput = useCallback((input: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('input', input);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
  }, []);

  return {
    runCode,
    sendInput,
    disconnect,
    isConnected,
  };
};
