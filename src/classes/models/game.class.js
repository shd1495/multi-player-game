import { createLocationPacket } from '../../utils/notification/game.notification.js';
import IntervalManager from '../managers/interval.manager.js';

class Game {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.intervalManager = new IntervalManager();
  }

  addUser(user) {
    this.users.push(user);

    this.intervalManager.addPlayer(
      user.id,
      () => {
        if (user.isSocketConnected()) {
          user.ping();
        }
      },
      1000,
    );
    console.log(`접속 중인 클라이언트 수: ${this.users.length}`);
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(socket) {
    const idx = this.users.findIndex((user) => user.socket === socket);
    if (idx != -1) {
      if (this.users.length === 0) this.intervalManager.clearAll();
      const user = this.users.splice(idx, 1)[0];
      this.intervalManager.removePlayer(user.id);

      console.log(`접속 중인 클라이언트 수: ${this.users.length}`);
      return user;
    }
  }

  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });
    return maxLatency;
  }

  getAllLocation(userId) {
    const maxLatency = this.getMaxLatency();

    const locationData = this.users
      .filter((user) => user.id !== userId)
      .map((user) => {
        const { x, y } = user.calculatePosition(maxLatency);
        return { id: user.id, playerId: user.playerId, x: x, y: y };
      });
    return createLocationPacket(locationData);
  }
}

export default Game;
