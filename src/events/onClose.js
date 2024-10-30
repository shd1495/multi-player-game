import { getGameSession } from '../sessions/game.session.js';

export const onClose = (socket) => async (hadError) => {
  if (hadError) {
    console.error('에러로 인해 소켓이 닫혔습니다.');
  } else {
    console.log('소켓이 닫혔습니다.');
  }

  const gameSession = getGameSession();
  gameSession.removeUser(socket);
};
