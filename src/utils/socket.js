import io from 'socket.io-client';
import { API_LINK } from '../config.js';

const SOCKET_URL = API_LINK;
export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: false
});
