function User(socket, x, y, name) {
    this.socket = socket;
    this.x = x;
    this.y = y;
    this.name = name;
    this.id = socket.id;
}

exports.User = User;
