import { createPingPacket } from '../../utils/notification/game.notification.js';

class User {
  constructor(socket, id, playerId, latency, position) {
    this.id = id;
    this.socket = socket;
    this.playerId = playerId;
    this.latency = latency;
    this.x = position && position.x ? position.x : 0;
    this.y = position && position.y ? position.y : 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastUpdateTime = Date.now();
    this.speed = 3;
  }

  isSocketConnected() {
    return this.socket && !this.socket.destroyed;
  }

  updatePosition(x, y) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

  calculatePosition(latency) {
    const hasMoved = this.x !== this.lastX || this.y !== this.lastY;
    if (!hasMoved) return { x: this.x, y: this.y };

    // 이동 시간이 짧거나 latency가 작으면 timeDiff도 적어지고, distance도 작아짐
    const timeDiff = (Date.now() - this.lastUpdateTime + latency) / 1000; // 초 단위
    const distance = this.speed * timeDiff;

    // 방향 계산
    const directionX = Math.sign(this.x - this.lastX);
    const directionY = Math.sign(this.y - this.lastY);

    return {
      x: this.x + directionX * distance,
      y: this.y + directionY * distance,
    };
  }

  ping() {
    if (this.isSocketConnected()) {
      try {
        const now = Date.now();
        this.socket.write(createPingPacket(now));
      } catch (error) {
        console.log(`${this.id} cannot ping`);
      }
    } else {
      console.log(`${this.id} cannot ping, socket is destroyed`);
    }
  }

  handlePong(data) {
    const now = Date.now();
    this.latency = (now - data.timestamp) / 2;
  }
}

export default User;
