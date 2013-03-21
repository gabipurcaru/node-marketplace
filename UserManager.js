var User = require('./User').User;
var random_name = require('./names').random_name;

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

function UserManager(sockets) {
    this.users = [];
    this.sockets = sockets;
}
UserManager.prototype.addUser = function(socket) {
    var x = Math.random() * 500;
    var y = Math.random() * 500;
    var name = random_name();
    this.sockets.emit('user-enter', {
        'x': x,
        'y': y,
        'name': name,
        'id': socket.id
    });
    socket.emit('user-you', name);
    var user = new User(socket, x, y, name);
    return this.users.push(user);
};
UserManager.prototype.removeUser = function(socket) {
    var name;
    for(var i=0; i<this.users.length; i++) {
        // cleanup
        if(!this.users[i]) {
            this.users = this.users.slice(0, i).concat(this.users.slice(i+1, this.users.lenth));
            continue;
        }

        if(this.users[i].id == socket.id) {
            name = this.users[i].name;
            delete this.users[i];
            break;
        }
    }
    if(name) {
        this.sockets.emit('user-exit', name);
    } else {
        var um = this;
        setTimeout(function() {
            um.removeUser(socket);
        }, 1000);
    }
};
UserManager.prototype.getAll = function() {
    return this.users;
};
UserManager.prototype.getBySocket = function(socket) {
    for(var i=0; i<this.users.length; i++) {
        if(this.users[i] && socket == this.users[i].socket) {
            return this.users[i];
        }
    }
    throw new Error("User not in list");
};
UserManager.prototype.getById = function(id) {
    for(var i=0; i<this.users.length; i++) {
        if(this.users[i] && id == this.users[i].id) {
            return this.users[i];
        }
    }
    throw new Error("User not in list");
};
UserManager.prototype.say = function(socket, message) {
    var um = this;
    var sending = this.getBySocket(socket);
    this.users.forEach(function(user) {
        if(um.distance(sending, user) > 240) {
            return; // too far
        }
        user.socket.emit('user-message', {
            "message": message,
            "userId": socket.id
        });
    });
};
UserManager.prototype.updateAllUsers = function(socket) {
    socket.emit('update-all-users', this.getAll().map(function(user) {
        return {
            'x': user.x,
            'y': user.y,
            'name': user.name,
            'id': user.id,
            'yours': (user.socket == socket ? true : false)
        };
    }));
};
UserManager.prototype.userMove = function(data) {
    var user = this.getById(data.userId);
    user.x = data.x;
    user.y = data.y;
    this.sockets.emit('user-move', data);
};
UserManager.prototype.distance = function(user1, user2) {
    return Math.sqrt((user1.x - user2.x)*(user1.x - user2.x)
                    +(user1.y - user2.y)*(user1.y - user2.y));
};

exports.UserManager = UserManager;
