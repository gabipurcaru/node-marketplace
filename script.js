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

        this.attrs = attrs;
        this.attrs.r = this.attrs.r || 10;
        this.attrs.fill = this.attrs.fill || "#FF0000";
        this.attrs.stroke = this.attrs.stroke || "#CC0000";
        this.screen = screen;

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
        this.attrs.cx = x;
        this.attrs.cy = y;
        var time = 500;
        var easing = "elastic";
        this.circle.animate({
            "cx": x,
            "cy": y
        }, time, easing);
        this.text.animate({
            "x": x,
            "y": y + this.attrs.r + 5
        }, time, easing);
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
            this.circle.animate({
                "fill": "#000",
                "stroke": "#000"
            }, 1000, "<")
        }
    }
    User.prototype.getName = function() {
        return this.name;
    }





    function UserManager() {
        this.users = [];
    }
    UserManager.prototype.addUser = function(user) {
        return this.users.push(user);
    }
    UserManager.prototype.getAll = function() {
        return this.users;
    }
    UserManager.prototype.say = function(user, message) {
        user.say(message);
        $("#messages-list").append($(
            "<li>" + "<b>" + user.getName() + "</b>:" + message + "</li>"
        ));
    }



    window.paper = new Screen("canvas", "100%", "100%");

    // #messages-list scroll
    setInterval(function(){
        $("#messages").stop();
        $("#messages").animate({ scrollTop: $("#messages").prop("scrollHeight") }, 300);
    }, 100);

    // panning listeners
    $(paper.paper.canvas).mousedown(function() {
        console.log("DOWN");
    });
    $(paper.paper.canvas).mouseup(function() {
        console.log("UP");
    });

    window.circles = new UserManager();
    window.NUM_CIRCLES = 20;
    for(var i=0; i<NUM_CIRCLES; i++) {
        circles.addUser(paper.user({
            "cx": parseInt(Math.random() * $('#canvas').width() - 20),
            "cy": parseInt(Math.random() * $('#canvas').height() - 20),
            "r" : 25, 
            "name": "woohooo"
        }));
    }
    setInterval(function() {
        circles.say(circles.users[parseInt(Math.random()*NUM_CIRCLES)],
                     ["wtf?!", "dude!", "lorem ipsum dolor sit amet", "how are you?", "!!!"]
                     [parseInt(Math.random()*5)]);
    }, 500);
});
