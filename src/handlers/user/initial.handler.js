import User from '../../classes/models/user.class.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { createUser, findUserByDeviceId, updateUserLogin } from '../../db/user/user.db.js';
import { getGameSession } from '../../sessions/game.session.js';
import { addUser } from '../../sessions/user.session.js';
import { createResponse } from '../../utils/response/createResponse.js';

const initialHandler = async ({ socket, userId, payload }) => {
  try {
    const { deviceId, latency, playerId } = payload;

    let user = await findUserByDeviceId(deviceId);
    const position = {};
    if (!user) {
      user = await createUser(userId);
    } else {
      await updateUserLogin(userId);
      position.x = user.x;
      position.y = user.y;
    }

    user = new User(socket, deviceId, playerId, latency, position);
    addUser(user);
    const gameSession = getGameSession();
    gameSession.addUser(user);

    const initialResponse = createResponse(HANDLER_IDS.INIT, RESPONSE_SUCCESS_CODE, {
      userId: deviceId,
      x: user.x,
      y: user.y,
    });

    socket.write(initialResponse);
  } catch (error) {
    console.error(error);
  }
};

export default initialHandler;
