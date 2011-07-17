function User(socket, x, y, name) {
    this.socket = socket;
    this.x = x;
    this.y = y;
    this.name = name;
}

function UserManager(sockets) {
    this.users = [];
    this.sockets = sockets;
}
UserManager.prototype.addUser = function(socket) {
    var x = Math.random() * 500;
    var y = Math.random() * 500;
    var name = socket.id;
    this.sockets.emit('user-enter', {
        'x': x,
        'y': y,
        'name': name,
    });
    socket.emit('user-you', name);
    var user = new User(socket, x, y, name);
    return this.users.push(user);
}
UserManager.prototype.removeUser = function(socket) {
    for(var i=0; i<this.users.length; i++) {
        if(this.users[i].name == socket.id) {
            delete this.users[i];
            break;
        }
    }
    this.sockets.emit('user-exit', socket.id);
}
UserManager.prototype.getAll = function() {
    return this.users;
}
UserManager.prototype.getBySocket = function(socket) {
    for(var i=0; i<this.users.length; i++) {
        if(socket == this.users[i].socket) {
            return this.users[i];
        }
    }
}
UserManager.prototype.say = function(socket, message) {
    um = this;
    this.users.forEach(function(user) {
        user.socket.emit('user-message', {
            "message": message,
            "user": um.getBySocket(socket).name 
        });
    }); 
}

exports.User = User;
exports.UserManager = UserManager;
