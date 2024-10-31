import { getGameSession } from '../../sessions/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

export const UpdateLocationHandler = ({ socket, userId, payload }) => {
  try {
    const { x, y } = payload;

    const gameSession = getGameSession();
    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임 세션을 찾을 수 없습니다.');
    }

    const user = gameSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    user.updatePosition(x, y);
    const packet = gameSession.getAllLocation(userId);

    socket.write(packet);
  } catch (error) {
    console.error(error);
    handleError(socket, new CustomError(501, `위치 동기화 오류: ${error.message}`));
  }
};

export default UpdateLocationHandler;
