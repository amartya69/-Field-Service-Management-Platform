import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { Message } from '@stomp/stompjs';
import { useSnackbar } from 'notistack';
import type { Notification } from '../types';

interface SocketContextType {
  connected: boolean;
  notifications: Notification[];
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketContextProvider');
  }
  return context;
};

export const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { enqueueSnackbar } = useSnackbar();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setConnected(false);
      return;
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const socketUrl = `${apiBase}/ws`;
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      debug: (str) => console.log('STOMP Debug:', str),
    });

    stompClient.onConnect = () => {
      setConnected(true);
      console.log('STOMP Connected!');

      // Subscribe to user notifications
      stompClient.subscribe(`/topic/notifications/${user.username}`, (message: Message) => {
        try {
          const payload: Notification = JSON.parse(message.body);
          setNotifications((prev) => [payload, ...prev]);

          enqueueSnackbar(payload.message, {
            variant: 'info',
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          });
        } catch (err) {
          console.error('Failed to parse WebSocket notification:', err);
        }
      });
    };

    stompClient.onDisconnect = () => {
      setConnected(false);
      console.log('STOMP Disconnected.');
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user, isAuthenticated, enqueueSnackbar]);

  return (
    <SocketContext.Provider value={{ connected, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
export default SocketContext;
