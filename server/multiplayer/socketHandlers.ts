import { Server as SocketIOServer, Socket } from 'socket.io';
export interface Player {
  id: string;
  socketId: string;
  username: string;
  rating: number;
  isPremium: boolean;
  status: 'online' | 'in-game' | 'in-room' | 'away';
  joinedAt: Date;
  roomId?: string;
}

export interface GameRoom {
  id: string;
  hostPlayer: {
    id: string;
    username: string;
    rating: number;
    isPremium: boolean;
  };
  guestPlayer?: {
    id: string;
    username: string;
    rating: number;
    isPremium: boolean;
  };
  gameMode: 'casual' | 'ranked' | 'tournament';
  timeControl: '5+0' | '10+0' | '15+10' | '30+0';
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
  gameState: any | null;
}

export interface MatchmakingQueue {
  playerId: string;
  rating: number;
  gameMode: string;
  timeControl: string;
  joinedAt: Date;
}

class MultiplayerManager {
  private gameRooms: Map<string, GameRoom> = new Map();
  private connectedPlayers: Map<string, Player> = new Map();
  private matchmakingQueue: MatchmakingQueue[] = [];
  private playerSockets: Map<string, Socket> = new Map();

  constructor(private io: SocketIOServer) {}

  handleConnection(socket: Socket) {
    console.log('🔌 Player connected:', socket.id);

    socket.on('lobby:join', () => this.handleLobbyJoin(socket));
    socket.on('lobby:create-room', (data) => this.handleCreateRoom(socket, data));
    socket.on('lobby:join-room', (data) => this.handleJoinRoom(socket, data));
    socket.on('lobby:challenge-player', (data) => this.handleChallengePlayer(socket, data));
    socket.on('matchmaking:find-opponent', (data) => this.handleFindOpponent(socket, data));
    socket.on('game:make-move', (data) => this.handleGameMove(socket, data));
    socket.on('game:leave-room', (data) => this.handleLeaveRoom(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  private handleLobbyJoin(socket: Socket) {
    // Get user info from socket (you'll need to implement authentication)
    const userId = socket.handshake.auth?.userId || socket.id;
    const username = socket.handshake.auth?.username || `Player${Math.floor(Math.random() * 1000)}`;
    
    const player: Player = {
      id: userId,
      socketId: socket.id,
      username,
      rating: 1200, // Default rating
      isPremium: false,
      status: 'online',
      joinedAt: new Date()
    };

    this.connectedPlayers.set(userId, player);
    this.playerSockets.set(socket.id, socket);

    // Send lobby data
    this.sendLobbyUpdate();
    
    console.log(`👤 Player ${username} joined lobby`);
  }

  private handleCreateRoom(socket: Socket, data: any) {
    const player = this.getPlayerBySocket(socket);
    if (!player) return;

    const roomId = this.generateRoomId();
    const gameRoom: GameRoom = {
      id: roomId,
      hostPlayer: {
        id: player.id,
        username: player.username,
        rating: player.rating,
        isPremium: player.isPremium
      },
      gameMode: data.gameMode || 'casual',
      timeControl: data.timeControl || '10+0',
      isPrivate: data.isPrivate || false,
      status: 'waiting',
      createdAt: new Date(),
      gameState: null
    };

    this.gameRooms.set(roomId, gameRoom);
    socket.join(roomId);
    
    // Update player status
    player.status = 'in-room';
    player.roomId = roomId;

    this.sendLobbyUpdate();
    console.log(`🏠 Room ${roomId} created by ${player.username}`);
  }

  private handleJoinRoom(socket: Socket, data: { roomId: string }) {
    const player = this.getPlayerBySocket(socket);
    const room = this.gameRooms.get(data.roomId);
    
    if (!player || !room || room.status !== 'waiting') return;

    // Add guest player
    room.guestPlayer = {
      id: player.id,
      username: player.username,
      rating: player.rating,
      isPremium: player.isPremium
    };

    room.status = 'playing';
    socket.join(data.roomId);

    // Update player status
    player.status = 'in-game';
    player.roomId = data.roomId;

    // Initialize game state
    room.gameState = this.initializeGameState();

    // Notify players that game is starting
    this.io.to(data.roomId).emit('game:started', {
      roomId: data.roomId,
      players: {
        white: room.hostPlayer,
        black: room.guestPlayer
      },
      gameState: room.gameState
    });

    this.sendLobbyUpdate();
    console.log(`🎮 Game started in room ${data.roomId}`);
  }

  private handleChallengePlayer(socket: Socket, data: any) {
    const challenger = this.getPlayerBySocket(socket);
    const challenged = this.connectedPlayers.get(data.challengedPlayerId);
    
    if (!challenger || !challenged) return;

    const challengeSocket = this.getSocketByPlayerId(challenged.id);
    if (challengeSocket) {
      challengeSocket.emit('game:invitation', {
        from: challenger,
        gameMode: data.gameMode,
        timeControl: data.timeControl,
        challengeId: this.generateRoomId()
      });
    }
  }

  private handleFindOpponent(socket: Socket, data: any) {
    const player = this.getPlayerBySocket(socket);
    if (!player) return;

    // Try to find a match in queue
    const matchIndex = this.matchmakingQueue.findIndex(queued => 
      Math.abs(queued.rating - player.rating) <= (data.ratingRange || 200) &&
      queued.gameMode === data.gameMode &&
      queued.timeControl === data.timeControl
    );

    if (matchIndex !== -1) {
      // Found a match
      const opponent = this.matchmakingQueue.splice(matchIndex, 1)[0];
      this.createMatchedGame(player, opponent, data);
    } else {
      // Add to queue
      this.matchmakingQueue.push({
        playerId: player.id,
        rating: player.rating,
        gameMode: data.gameMode,
        timeControl: data.timeControl,
        joinedAt: new Date()
      });
      
      socket.emit('matchmaking:queued', { position: this.matchmakingQueue.length });
    }
  }

  private createMatchedGame(player1: Player, queuedPlayer: any, gameSettings: any) {
    const roomId = this.generateRoomId();
    const player2 = this.connectedPlayers.get(queuedPlayer.playerId);
    
    if (!player2) return;

    const gameRoom: GameRoom = {
      id: roomId,
      hostPlayer: {
        id: player1.id,
        username: player1.username,
        rating: player1.rating,
        isPremium: player1.isPremium
      },
      guestPlayer: {
        id: player2.id,
        username: player2.username,
        rating: player2.rating,
        isPremium: player2.isPremium
      },
      gameMode: gameSettings.gameMode,
      timeControl: gameSettings.timeControl,
      isPrivate: false,
      status: 'playing',
      createdAt: new Date(),
      gameState: this.initializeGameState()
    };

    this.gameRooms.set(roomId, gameRoom);
    
    // Join both players to room
    const socket1 = this.getSocketByPlayerId(player1.id);
    const socket2 = this.getSocketByPlayerId(player2.id);
    
    if (socket1 && socket2) {
      socket1.join(roomId);
      socket2.join(roomId);
      
      this.io.to(roomId).emit('game:started', {
        roomId,
        players: {
          white: gameRoom.hostPlayer,
          black: gameRoom.guestPlayer
        },
        gameState: gameRoom.gameState
      });
    }

    console.log(`🎯 Matched game created: ${player1.username} vs ${player2.username}`);
  }

  private handleGameMove(socket: Socket, data: { roomId: string; move: any }) {
    const room = this.gameRooms.get(data.roomId);
    const player = this.getPlayerBySocket(socket);
    
    if (!room || !player || room.status !== 'playing') return;

    // Validate move and update game state
    if (this.isValidMove(room, player, data.move)) {
      this.applyMove(room, data.move);
      
      // Broadcast move to all players in room
      this.io.to(data.roomId).emit('game:move', {
        move: data.move,
        gameState: room.gameState,
        playerId: player.id
      });

      // Check for game end
      if (this.isGameOver(room.gameState)) {
        this.handleGameEnd(room);
      }
    }
  }

  private handleLeaveRoom(socket: Socket, data: { roomId: string }) {
    const player = this.getPlayerBySocket(socket);
    const room = this.gameRooms.get(data.roomId);
    
    if (!player || !room) return;

    socket.leave(data.roomId);
    player.status = 'online';
    player.roomId = undefined;

    if (room.status === 'playing') {
      // Handle forfeit
      this.io.to(data.roomId).emit('game:player-left', {
        playerId: player.id,
        result: 'forfeit'
      });
    }

    // Clean up room if empty
    this.gameRooms.delete(data.roomId);
    this.sendLobbyUpdate();
  }

  private handleDisconnect(socket: Socket) {
    const player = this.getPlayerBySocket(socket);
    if (!player) return;

    // Remove from matchmaking queue
    const queueIndex = this.matchmakingQueue.findIndex(q => q.playerId === player.id);
    if (queueIndex !== -1) {
      this.matchmakingQueue.splice(queueIndex, 1);
    }

    // Handle room cleanup
    if (player.roomId) {
      this.handleLeaveRoom(socket, { roomId: player.roomId });
    }

    this.connectedPlayers.delete(player.id);
    this.playerSockets.delete(socket.id);
    this.sendLobbyUpdate();
    
    console.log(`👋 Player ${player.username} disconnected`);
  }

  private sendLobbyUpdate() {
    const rooms = Array.from(this.gameRooms.values())
      .filter(room => !room.isPrivate)
      .map(room => ({
        ...room,
        gameState: undefined // Don't send game state in lobby
      }));

    const players = Array.from(this.connectedPlayers.values())
      .map(player => ({
        id: player.id,
        username: player.username,
        rating: player.rating,
        isPremium: player.isPremium,
        status: player.status
      }));

    this.io.emit('lobby:rooms-updated', rooms);
    this.io.emit('lobby:players-updated', players);
  }

  private getPlayerBySocket(socket: Socket): Player | undefined {
    return Array.from(this.connectedPlayers.values())
      .find(player => player.socketId === socket.id);
  }

  private getSocketByPlayerId(playerId: string): Socket | undefined {
    const player = this.connectedPlayers.get(playerId);
    return player ? this.playerSockets.get(player.socketId) : undefined;
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private initializeGameState() {
    // Return initial chess board state
    return {
      board: [], // Your chess board initialization
      currentPlayer: 'white',
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      timeLeft: { white: 600000, black: 600000 } // 10 minutes each
    };
  }

  private isValidMove(room: GameRoom, player: Player, move: any): boolean {
    // Implement move validation logic
    return true; // Placeholder
  }

  private applyMove(room: GameRoom, move: any) {
    // Apply move to game state
    if (room.gameState) {
      room.gameState.moveHistory.push(move);
      room.gameState.currentPlayer = room.gameState.currentPlayer === 'white' ? 'black' : 'white';
    }
  }

  private isGameOver(gameState: any): boolean {
    // Check for checkmate, stalemate, etc.
    return false; // Placeholder
  }

  private handleGameEnd(room: GameRoom) {
    room.status = 'finished';
    this.io.to(room.id).emit('game:ended', {
      result: 'checkmate', // or draw, etc.
      winner: 'white' // or black
    });
  }
}

export default MultiplayerManager;