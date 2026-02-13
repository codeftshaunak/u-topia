'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      autoConnect: true,
    });
  }
  return socket;
}

export function joinUserRoom(userId: string) {
  const socket = getSocket();
  socket.emit('join', userId);
}

export function subscribeToTable(
  table: string,
  callback: (event: any) => void
) {
  const socket = getSocket();
  socket.emit('subscribe', table);
  socket.on('table_change', (data) => {
    if (data.table === table) {
      callback(data);
    }
  });
}

export function unsubscribeFromTable(table: string) {
  const socket = getSocket();
  socket.off('table_change');
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
