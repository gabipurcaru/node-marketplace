// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


$(function() {
    var USER_RADIUS = 20;
    var SHOUT_RADIUS = 240;

    function User(vis, x, y, mine, name, id) {
        if(arguments.length === 0) {
            return;
        }
        this.svg = vis.append("svg:g");
        this.svg.classed("user", true);
        if(mine) {
            this.svg.classed("own", true);
        }
        this.shout = this.svg.append("svg:circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", SHOUT_RADIUS);
        this.shout.classed("shout", true);
        this.circle = this.svg.append("svg:circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", USER_RADIUS);
        this.circle.classed("circle", true);

        this.x = x;
        this.y = y;
        this.mine = mine;
        this.name = name;
        this.id = id;
    }
    User.prototype.isOwnUser = function() {
        return !!this.mine;
    };
    User.prototype.moveTo = function(x, y, supress) {
        this.x = x;
        this.y = y;
        this.circle.transition()
            .attr("cx", x)
            .attr("cy", y);
        this.shout.transition()
            .attr("cx", x)
            .attr("cy", y);

        if(!supress) {
            socket.emit('user-move', {
                "userId": this.id,
                "x": x,
                "y": y
            });
        }
    };
    User.prototype.say = function(text, supress) {
        this.svg.append("svg:text")
            .attr("x", this.x-30)
            .attr("y", this.y-15)
            .attr("fill", "black")
            .text(text)
            .transition()
            .delay(1000)
            .duration(500)
            .attr("dx", -10)
            .attr("dy", -10)
            .style("opacity", 0);
        $("#messages").append($("<li>").html("<b>" + this.name + "</b>: " + text));
        console.log("send? " + !supress);
        if(!supress) {
            socket.emit("user-message", $("#form input").val());
        }
    };
    User.prototype.setOwnUser = function(set) {
        if(set !== false) {
            set = true;
        }
        this.mine = set;
        this.svg.classed("own", this.mine);
    };
    User.prototype.remove = function() {
        this.svg.remove();
    };

    function UserManager(users) {
        this.users = [];
        if(users) {
            this.users = users;
        }
    }
    UserManager.prototype.createUser = function() {
        u = new User();
        User.prototype.constructor.apply(u, arguments);
        this.addUser(u);
    };
    UserManager.prototype.addUser = function(user) {
        this.users.push(user);
    };
    UserManager.prototype.moveOwnUser = function(x, y) {
        var i, own_user;
        own_user = this.selectUser(function(x) {return x.isOwnUser();}, true);
        if(!own_user) {
            throw "No own user to move";
        }
        own_user.moveTo(x, y);
    };
    UserManager.prototype.getOwnUser = function() {
        return this.selectUser(function(x) {return x.isOwnUser();}, true);
    };
    UserManager.prototype.setOwnUser = function(name) {
        var i;
        for(i=0; i<this.users.length; i++) {
            if(this.users[i].name == name) {
                this.users[i].setOwnUser();
                return true;
            }
        }
        return false;
    };
    UserManager.prototype.selectUser = function(selector, value) {
        var i;
        for(i=0; i<this.users.length; i++) {
            if(selector(this.users[i]) == value) {
                return this.users[i];
            }
        }
    };
    UserManager.prototype.getUserById = function(id) {
        return this.selectUser(function(x) {return x.id;}, id);
    };
    UserManager.prototype.getUserByName = function(name) {
        return this.selectUser(function(x) {return x.name;}, name);
    };
    UserManager.prototype.removeUserByName = function(name) {
        var user = this.getUserByName(name);
        user.remove();
        this.users.remove(this.users.indexOf(user));
    };
    UserManager.prototype.removeAllUsers = function() {
        var i;
        for(i=0; i<this.users.length; i++) {
            this.users[i].remove();
        }
        this.users = [];
    };
    UserManager.prototype.updateAllUsers = function(data) {
        this.removeAllUsers();
        var i;
        for(i=0; i<data.length; i++) {
            if(!data[i]) {
                continue;
            }
            var user = new User(vis, data[i].x, data[i].y, false, data[i].name,
                                data[i].id);
            if(data[i].yours) {
                user.setOwnUser();
            }
            this.addUser(user);
        }
    };

    var zoom_pan = function() {
        zoom_pan.translate = d3.event.translate;
        zoom_pan.scale = d3.event.scale;
        vis.attr("transform",
            "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
    };
    zoom_pan.translate = [0, 0];
    zoom_pan.scale = 1;
    var vis = d3.select("#canvas")
        .append("svg:svg")
        .attr("pointer-events", "all")
        .append("svg:g")
        .call(d3.behavior.zoom().on("zoom", zoom_pan))
        .on("click", function() {
            var x = d3.event.x, y = d3.event.y;
            x = (x - zoom_pan.translate[0]) / zoom_pan.scale;
            y = (y - zoom_pan.translate[1]) / zoom_pan.scale;
            um.moveOwnUser(x, y);
        });

    vis.append("svg:rect")
        .attr("width", 7000)
        .attr("height", 7000)
        .attr("fill", "white");

    vis = vis.append("svg:g");
    window.vis = vis;

    um = new UserManager();
    var socket = io.connect();

    $("#message-send-button").click(function() {
        if(!$("#message-input").val()) {
            return;
        }
        socket.emit('user-message', $('#message-input').val());
        $("#message-input").val("");
    });

    socket.on('user-enter', function(data) {
        um.createUser(vis, data.x, data.y, false, data.name, data.id);
    });
    socket.on('user-exit', function(name) {
        um.removeUserByName(name);
    });
    socket.on('user-message', function(data) {
        console.log("message");
        if(data.userId != um.getOwnUser().id) {
            um.getUserById(data.userId).say(data.message, true);
        }
    });
    socket.on('user-you', function(name) {
        um.setOwnUser(name);
    });
    socket.on('update-all-users', function(users) {
        um.updateAllUsers(users);
    });
    socket.on('user-move', function(data) {
        um.getUserById(data.userId).moveTo(data.x, data.y, true);
    });






    $(document || document.documentElement).on("keydown", function(e) {
        if(e.which == 13) {
            um.getOwnUser().say($("#form input").val());
            $("#form input").val("");
        }
        $("#form input").focus();
    });
});
