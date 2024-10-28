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

  getAllLocation() {}
}

export default Game;
