import { getGameSession } from '../../sessions/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { handleError } from '../../utils/error/errorHandler.js';

export const UpdateLocationHandler = ({ socket, userId, payload }) => {
  try {
    const { x, y } = payload;

    const gameSession = getGameSession();
    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임 세션을 찾을 수 없습니다.');
    }
    console.log(gameSession);

    const user = gameSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    user.updatePosition(x, y);
    const packet = gameSession.getAllLocation(userId);

    socket.write(packet);
  } catch (error) {
    handleError(socket, error);
  }
};

export default UpdateLocationHandler;
