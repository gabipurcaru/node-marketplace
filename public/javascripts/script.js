$(function() {
    function Screen(a, b, c, d) {
        this.paper = new Raphael(a, b, c, d);
    }
    function setActiveUser(user) {
        this.activeUser = user;
    }
    function getActiveUser(user) {
        this.activeUser = user;
    }

    Screen.prototype.user = function(attrs) {
        return new User(this.paper, attrs); 
    }

    function User(screen, attrs) {
        this.name = attrs.name;
        delete attrs.name;

        this.id = attrs.id;
        delete attrs.id;

        this.attrs = attrs;
        this.attrs.r = this.attrs.r || 10;
        this.attrs.fill = this.attrs.fill || "#FF0000";
        this.attrs.stroke = this.attrs.stroke || "#CC0000";
        this.screen = screen;
        this.socket = attrs.socket;
        delete attrs.socket;

        // circle
        this.circle = screen.circle();
        this.circle.attr($.extend({}, attrs, {"r": 0}));
        this.circle.hover((function(scope) {
            return function() {
                scope.circleHover.call(scope);
            }
        })(this));
        this.circle.animate({
            "r": this.attrs.r
        }, Math.random() * 4000, "backOut")

        // name
        this.text = screen.text(attrs.cx, attrs.cy + attrs.r + 5, this.name);
    }
    User.prototype.circleHover = function() {
        this.circle.animate({
            "50%": {
                "r": this.attrs.r * 1.75,
                "easing": ""
            },
            "100%": {
                "r": this.attrs.r,
                "easing": "backOut"
            }
        }, 300);
    };
    User.prototype.moveTo = function(x, y) {
        x = parseInt(x);
        y = parseInt(y);
        this.attrs.cx = x;
        this.attrs.cy = y;
        var time = 500;
        var easing = "backOut";
        this.circle.animate({
            "cx": x,
            "cy": y
        }, time, easing);
        this.text.animate({
            "x": x,
            "y": y + this.attrs.r + 5
        }, time, easing);
        if(this.radius) {
            this.radius.animate({
                "cx": x,
                "cy": y
            }, time, easing);
        }
    };
    User.prototype.say = function(text) {
        var said = this.screen.text(this.attrs.cx, this.attrs.cy, text); 
        said.animate({
            "x": this.attrs.cx + 50,
            "y": this.attrs.cy - 50,
            "opacity": 0
        }, 500, '>', function() {
            said.remove();
        });
    }
    User.prototype.yours = function(value) {
        if(value) {
            this.isYours = true;
            this.circle.animate({
                "fill": "#000",
                "stroke": "#000"
            }, 1000, "<");

            // outer circle for listening radius
            this.radius = this.screen.circle(this.attrs.cx, this.attrs.cy, 140);
            this.radius.attr("opacity", 0);
            this.radius.animate({
                "fill": "#000",
                "opacity": 0.1
            }, 1000);

            $(this.screen.canvas).click({user: this}, function(e) {
                if(e.data.user.isYours) {
                    var x = e.pageX - this.offsetLeft;
                    var y = e.pageY - this.offsetTop;
                    e.data.user.socket.emit('user-move', {
                        "userId": e.data.user.id,
                        "x": x,
                        "y": y
                    });
                }
            });
        } else {
            this.isYours = false;
            this.circle.animate({
                "fill": "#f00",
                "stroke": "#c00"
            }, 1000, "<");
            if(this.radius) {
                this.radius.animate({
                    "opacity": 0
                }, 1000, function() {
                    if(!this || !this.radius) {
                        return;
                    }
                    this.radius.remove();
                    delete this.radius;
                })
            }
        }
    }
    User.prototype.getName = function() {
        return this.name;
    }
    User.prototype.remove = function() {
        this.yours(false);
        if(this.circle) {
            this.circle.remove();
        }
        if(this.text) {
            this.text.remove();
        }
    }





    function UserManager(paper, socket) {
        this.users = [];
        this.paper = paper;
        this.socket = socket;
    }
    UserManager.prototype.addUser = function(user) {
        return this.users.push(user);
    }
    UserManager.prototype.getAll = function() {
        return this.users;
    }
    UserManager.prototype.getByName = function(name) {
        for(var i=0; i<this.users.length; i++) {
            if(this.users[i].getName() == name) {
                return this.users[i];
            }
        }
        throw new Error("User not in room.");
    }
    UserManager.prototype.getById = function(id) {
        for(var i=0; i<this.users.length; i++) {
            if(this.users[i].id === id) {
                return this.users[i];
            }
        }
    }
    UserManager.prototype.say = function(user, message) {
        if(!(user instanceof User)) {
            user = this.getByName(user);
        }
        user.say(message);
        $("#messages-list").append($(
            "<li>" + "<b>" + user.getName() + "</b>:" + message + "</li>"
        ));
    }
    UserManager.prototype.remove = function(user) {
        if(typeof user === "string") {
            user = this.getByName(user);
        }
        var index = this.users.indexOf(user);
        user.remove();
        delete this.users[index];
    }
    UserManager.prototype.removeAll = function(user) {
        for(var i=0; i<this.users.length; i++) {
            this.users[i].remove();
        }
        this.users = [];
    }
    UserManager.prototype.updateAllUsers = function(users) {
        this.removeAll();
        for(var i=0; i<users.length; i++) {
            var user = paper.user({
                "cx": users[i].x,
                "cy": users[i].y,
                "r": 10,
                "name": users[i].name,
                "id": users[i].id,
                "socket": this.socket
            });
            if(users[i].yours) {
                user.yours(true);
            }
            this.addUser(user);
        }
    }


    // right panel heights/widths
    $('#messages-list').css("height",
            ($(document).height() - $('#message-input-div').height()) + "px");



    window.paper = new Screen("canvas", "100%", "100%");

    // #messages-list scroll
    setInterval(function(){
        $("#messages-list").stop();
        $("#messages-list").animate({ scrollTop: $("#messages").prop("scrollHeight") }, 300);
    }, 100);

    // background gradient
    var rect = paper.paper.circle($("#canvas").width() / 2, $("#canvas").height() / 2, 500);
    rect.attr('fill', 'r(0.5, 0.5)#AAA-#FFF');
    rect.attr('stroke', 0);
    rect.toBack();
    

    var socket = io.connect();

    window.userManager = new UserManager(window.paper, socket);

    socket.on('user-enter', function(data) {
        console.log('user entered');
        userManager.addUser(paper.user({
            "cx": data.x,
            "cy": data.y,
            "r": 10,
            "name": data.name,
            "id": data.id,
            "socket": socket
        }));
    });
    socket.on('user-exit', function(name) {
        userManager.remove(name);
    });
    socket.on('user-message', function(data) {
        userManager.say(data.user, data.message);
    });
    socket.on('user-you', function(name) {
        userManager.getByName(name).yours(true);
    });
    socket.on('update-all-users', function(users) {
        userManager.updateAllUsers(users);
    });
    socket.on('user-move', function(data) {
        userManager.getById(data.userId).moveTo(data.x, data.y);
    });

    setInterval(function() {
        socket.emit('user-message', "hi");
    }, 1000);
});
