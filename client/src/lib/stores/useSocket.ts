import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  roomId: string | null;
  gameState: any | null;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  makeMove: (move: any) => void;
}

export const useSocket = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  roomId: null,
  gameState: null,

  connect: () => {
    const { socket } = get();
    if (socket?.connected) return;

    const newSocket = io(window.location.origin, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      set({ isConnected: false, roomId: null, gameState: null });
    });

    newSocket.on('game:state-updated', (gameState) => {
      console.log('🎮 Game state updated:', gameState);
      set({ gameState });
    });

    newSocket.on('game:move', (moveData) => {
      console.log('♟️ Move received:', moveData);
      // This will be handled by the chess store
    });

    newSocket.on('game:ended', (result) => {
      console.log('🏁 Game ended:', result);
      set({ gameState: null, roomId: null });
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, roomId: null, gameState: null });
    }
  },

  joinRoom: (roomId: string) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('game:join-room', { roomId });
      set({ roomId });
    }
  },

  leaveRoom: () => {
    const { socket, roomId } = get();
    if (socket && socket.connected && roomId) {
      socket.emit('game:leave-room', { roomId });
      set({ roomId: null, gameState: null });
    }
  },

  makeMove: (move: any) => {
    const { socket, roomId } = get();
    if (socket && socket.connected && roomId) {
      socket.emit('game:make-move', { roomId, move });
    }
  }
}));