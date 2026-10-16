import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class CollabWebSocket {
  private client: Client | null = null;
  private wsUrl: string;

  constructor() {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:5173';
    this.wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${host}/api/ws`;
  }

  connect(onMessageReceived: (payload: any) => void) {
    if (this.client) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket!');
      
      this.client?.subscribe('/topic/collaboration', (frame) => {
        try {
          const payload = JSON.parse(frame.body);
          onMessageReceived(payload);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
      console.error('Additional details:', frame.body);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  sendMessage(destination: string, body: any) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('Cannot send message: WebSocket is not connected.');
    }
  }
}

export const collabSocket = new CollabWebSocket();
