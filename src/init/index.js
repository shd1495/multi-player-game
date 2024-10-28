import { addGameSession } from '../sessions/game.session.js';
import { loadProtos } from './loadProtos.js';
import { v4 as uuidv4 } from 'uuid';

const initServer = async () => {
  try {
    await loadProtos();
    const gameId = uuidv4();
    const gameSession = addGameSession(gameId);
    console.log(gameSession);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default initServer;
