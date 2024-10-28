import { createLocationPacket } from '../../utils/notification/game.notification.js';

class Game {
  constructor(id) {
    this.id = id;
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(socket) {
    const idx = this.users.findIndex((user) => user.socket === socket);
    if (idx != -1) return this.users.splice(idx, 1)[0];
  }

  getAllLocation(userId) {
    const locationData = this.users
      .filter((user) => user.id !== userId)
      .map((user) => {
        return { id: user.id, playerId: user.playerId, x: user.x, y: user.y };
      });
    return createLocationPacket(locationData);
  }
}

export default Game;
