import Game from '../classes/models/game.class.js';
import { gameSessions } from './sessions.js';

export const addGameSession = (id) => {
  const session = new Game(id);

  gameSessions.push(session);
  return session;
};

export const removeGameSession = () => {
  gameSessions.splice(0, 1);
};

export const getGameSession = () => {
  return gameSessions[0];
};
