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
  }

  updatePosition(x, y) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

  calculatePosition(latency) {
    if (this.x === this.lastX && this.y === this.lastY) {
      return {
        x: this.x,
        y: this.y,
      };
    }

    const timeDiff = (Date.now() - this.lastUpdateTime + latency) / 1000; // 초 단위
    const speed = 1; // 초당 1씩
    const distance = speed * timeDiff;
    const directionX = this.x !== this.lastX ? Math.sign(this.x - this.lastX) : 0;
    const directionY = this.y !== this.lastY ? Math.sign(this.y - this.lastY) : 0;

    return {
      x: this.x + directionX * distance,
      y: this.y + directionY * distance,
    };
  }
}

export default User;
