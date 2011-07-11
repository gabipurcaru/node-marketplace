$(function() {
    var NUM_CIRCLES = 100;
    var paper = Raphael('canvas');

    var svg = "M300,100 q25,50 100,100 l0,200 q-50,25 -100,100 q-25,-50 -100,-100 l0,-200 q50,-25 100,-100";
    var path = paper.path(svg).attr({stroke: "#000"});
    path.clone().rotate(90);

    /*var circles = [];
    for(var i=0; i<NUM_CIRCLES; i++) {
        circles[i] = paper.circle(350, 350, 50);
        circles[i].attr({
            "fill": "#f00",
            "stroke": "#f00",
        });
    }

    circles[0].attr({
        'fill': '#000'
    });

    setInterval(function() {
        for(var i=0; i<NUM_CIRCLES; i++) {
            circles[i].animate({
                "r": (Math.random() * 10) + 10,
                "cx": Math.random() * 1600,
                "cy": Math.random() * 800
            }, 550, "<>");
        }
    }, 500);*/

});
