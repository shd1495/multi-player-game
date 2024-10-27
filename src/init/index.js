import { loadProtos } from './loadProto.js';

const initServer = async () => {
  await loadProtos();
};

export default initServer;
