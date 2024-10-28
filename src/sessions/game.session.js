import Game from '../classes/models/game.class.js';
import { gameSession } from './sessions.js';

export const addGameSession = (id) => {
  const session = new Game(id);

  gameSession.push(session);
  return session;
};

export const removeGameSession = () => {
  gameSession.splice(0, 1);
};

export const getGameSession = () => {
  return gameSession[0];
};
