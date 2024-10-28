import pools from '../db/database.js';
import { addGameSession } from '../sessions/game.session.js';
import testDbConnection from '../utils/testConnection.js';
import { loadProtos } from './loadProtos.js';
import { v4 as uuidv4 } from 'uuid';

const initServer = async () => {
  try {
    await loadProtos();
    const gameId = uuidv4();
    const gameSession = addGameSession(gameId);
    await testDbConnection(pools.USER_DB, 'USER_DB');
    console.log(gameSession);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default initServer;
