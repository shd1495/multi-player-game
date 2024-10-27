import net from 'net';
import { PORT, HOST } from './constants/env.js';
import { onConnection } from './events/onConnection.js';
import initServer from './init/index.js';

const server = net.createServer(onConnection);

async function startServer() {
  try {
    await initServer();
    server.listen(PORT, HOST, () => {
      console.log(`서버가 ${HOST}:${PORT}에서 실행 중입니다.`);
      console.log(server.address());
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();
