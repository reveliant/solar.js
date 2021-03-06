/*jshint nocomma: true, nonew: true, plusplus: true, strict: true, browser: true, devel: true, jquery: true*/

function Canvas(id) {
    'use strict';
    var my = this,  // Public scope
        priv = {};  // Private scope

    // HTML environment
    this.element = document.getElementById(id);
    this.container = this.element.parentElement;
    this.context = this.element.getContext('2d');

    // Properties initialization
    priv.center = { x: 0, y: 0 };
    my.origin = { x: 0, y: 0 };
    this.zoomFactor = 1;
    this.scaleFactor = 1;

    this.scale = function (scale) {
        my.scaleFactor = scale;
    };

    this.center = function () {
        priv.center = {
            x: my.context.canvas.width / 2,
            y: my.context.canvas.height / 2
        };
    };

    this.resize = function () {
        console.log('Resizing canvas #' + my.element.getAttribute('id'));
        my.context.canvas.width = my.container.clientWidth;
        //this.context.canvas.height = this.container.clientHeight;
        my.center();
    };
    this.resize();

    // Geometrical private methods
    priv.point = function (point) {
        // Ensure parameter is a cartesian point
        point = point || {};
        point.x = point.hasOwnProperty('x') ? point.x : null;
        point.y = point.hasOwnProperty('y') ? point.y : null;
        return point;
    };
    priv.cartesian = function (point) {
        // Canvas affine frames are (O,x→,y↓), we've to mirror
        // on X-axis to get a usual (O,x→,y↑) affine frame
        point = priv.point(point);
        return {
            x: priv.center.x + point.x * my.zoomFactor / my.scaleFactor,
            y: priv.center.y - point.y * my.zoomFactor / my.scaleFactor // minus to mirror on X-axis
        };
    };

    // Draw methods namespace
    this.draw = {
        line: function (from, to) {
            from = priv.point(from);
            to = priv.point(to);
            my.context.beginPath();
            my.context.moveTo(from.x, from.y);
            my.context.lineTo(to.x, to.y);
            my.context.stroke();
        },
        circle: function (center, radius) {
            center = priv.point(center);
            radius = radius || 0;
            my.context.beginPath();
            my.context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            my.context.closePath();
            my.context.stroke();
        },
        ellipse: function (center, a, e, i) {
            /*
                Semi-Major Axis, a
                Eccentricity, e
                Inclination, i in degrees
                Argument of Periapsis, omega
                Time of Periapsis Passage, T
                Longitude of Ascending Node, Omega
            */
            var inclination = (2 * Math.PI) * (i / 360), // inclination in radians
                theta, angle, resolution = 1000,
                r = a * (1 - e * e) / (1 - e),
                orbit = {
                    x: center.x + (a * e) * Math.cos(inclination) + r * Math.cos(inclination),
                    y: center.y + (a * e) * Math.sin(inclination) + r * Math.sin(inclination)
                },
                cartesian = priv.cartesian(orbit);
            center = priv.point(center);

            my.context.moveTo(cartesian.x, cartesian.y);
            my.context.beginPath();

            for (angle = 0; angle <= resolution; angle = angle + 1) {
                theta = (2 * Math.PI) * (angle / resolution);
                r = a * (1 - e * e) / (1 - e * Math.cos(theta));
                orbit = {
                    x: center.x + (a * e) * Math.cos(inclination) + r * Math.cos(inclination + theta),
                    y: center.y + (a * e) * Math.sin(inclination) + r * Math.sin(inclination + theta)
                };
                cartesian = priv.cartesian(orbit);
                my.context.lineTo(cartesian.x, cartesian.y);
            }
            my.context.closePath();
            my.context.stroke();
        }
    };

    // Frame private methods and public drawer
    priv.frame = {
        zeroCross: function () {
            var topCenter = { x: priv.center.x, y: 0 },
                bottomCenter = { x: priv.center.x, y: my.context.canvas.height },
                middleLeft = { x: 0, y: priv.center.y },
                middleRight = { x: my.context.canvas.width, y: priv.center.y };
            my.draw.line(topCenter, bottomCenter);
            my.draw.line(middleLeft, middleRight);
        },
        xCross: function () {

        },
        rangeRing: function (radius, text) {
            my.draw.circle(priv.center, radius / my.scaleFactor);
            if (text) {
                if (radius >= 1000) text = radius / 1000 + " K";
                if (radius >= 1000000) text = radius / 1000000 + " M";
                my.context.fillText(text, priv.center.x - radius / my.scaleFactor + 3, priv.center.y + 10);
            }
        }
    };
    this.draw.frame = function (options) {
        var i;

        options = options || {};
        options.zero = options.hasOwnProperty('zero') ? options.zero : true;
        options.zeroCross = options.hasOwnProperty('zeroCross') ? options.zeroCross : true;
        options.xCross = options.hasOwnProperty('xCross') ? options.xCross : true;
        options.rings = options.hasOwnProperty('rings') ? options.rings : true;

        my.context.strokeStyle = '#292929';
        my.context.fillStyle = '#444444';
        my.context.font = '9px sans-serif';

        console.debug('Frame drawing options', options);
        if (options.zero) {
            priv.frame.rangeRing(3 * my.scaleFactor, false);
        }
        if (options.zeroCross) {
            priv.frame.zeroCross();
        }
        if (options.xCross) {
            priv.frame.xCross();
        }
        if (options.rings) {
            for (i = 1; i <= 50; i=i+1) {
                priv.frame.rangeRing(i * 50 * my.scaleFactor, true);
            }
        }
    };

    this.render = function () {
        my.draw.frame();
        my.context.strokeStyle = '#77aa99';
        my.draw.ellipse(my.origin, 149598261, 0.01671123, 0); // earth
    };
}

var SolarCanvas = null;

$(document).ready(function() {
    'use strict';
    SolarCanvas = new Canvas('view');
    SolarCanvas.scale(750000);
    SolarCanvas.render();

    $('canvas').scroll(function(){
        console.log('Scroll by');
    });
});

$(window).resize(function() {
    'use strict';
    SolarCanvas.resize();
    SolarCanvas.render();
    console.log('Window resized');
});
