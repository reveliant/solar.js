/*jshint nocomma: true, nonew: true, plusplus: true, strict: true, browser: true, devel: true, jquery: true*/

var SolarCanvas = false;

function Canvas(id) {
    'use strict';
    this.element = document.getElementById(id);
    this.container = this.element.parentElement;
    this.context = this.element.getContext('2d');
    this.center = { x: 0, y: 0 };
    this.zoomFactor = 1;
    this.scaleFactor = 1;
    this.resize();
}

Canvas.prototype.scale = function (scale) {
    'use strict';
    this.scaleFactor = scale;
};

Canvas.prototype.resize = function () {
    'use strict';
    console.log("Resizing canvas #" + this.element.getAttribute("id"));
    this.context.canvas.width = this.container.clientWidth;
    //this.context.canvas.height = this.container.clientHeight;
    this.center = {
        x: this.context.canvas.width / 2,
        y: this.context.canvas.height / 2
    };
};

Canvas.prototype.cartesian = function (coords) {
    'use strict';
    // Canvas affine frames are (O,x→,y↓), we've to mirror
    // on X-axis to get a usual (O,x→,y↑) affine frame
    return {
        x: this.center.x + coords.x * this.zoomFactor / this.scaleFactor,
        y: this.center.y - coords.y * this.zoomFactor / this.scaleFactor // minus to mirror on X-axis
    };

};

Canvas.prototype.line = function (from, to) {
    'use strict';
    this.context.beginPath();
    this.context.moveTo(from.x, from.y);
    this.context.lineTo(to.x, to.y);
    this.context.stroke();
};

Canvas.prototype.circle = function (center, radius) {
    'use strict';
    this.context.beginPath();
    this.context.arc(center.x, center.y, radius / this.scaleFactor, 0, Math.PI * 2);
    this.context.closePath();
    this.context.stroke();
};


Canvas.prototype.zeroCross = function () {
    'use strict';
    var topCenter = { x: this.center.x, y: 0 },
        bottomCenter = { x: this.center.x, y: this.context.canvas.height },
        middleLeft = { x: 0, y: this.center.y },
        middleRight = { x: this.context.canvas.width, y: this.center.y };
    this.line(topCenter, bottomCenter);
    this.line(middleLeft, middleRight);
};

Canvas.prototype.rangeRing = function (radius, text) {
    'use strict';
    this.circle(this.center, radius);
    if (text && radius >= 1000) text = radius / 1000 + " K";
    if (text && radius >= 1000000) text = radius / 1000000 + " M";
    if (text) this.context.fillText(text, this.center.x - radius / this.scaleFactor + 3, this.center.y + 10);
};

Canvas.prototype.drawFrame = function (options) {
    'use strict';
    var i;

    options = options || {};
    options.zero = options.hasOwnProperty('zero') ? options.zero : true;
    options.zeroCross = options.hasOwnProperty('zeroCross') ? options.zeroCross : true;
    options.xCross = options.hasOwnProperty('xCross') ? options.xCross : true;
    options.rings = options.hasOwnProperty('rings') ? options.rings : true;

    console.debug("Frame drawing options", options);

    /*this.context.strokeStyle = "#282828";
    this.context.fillStyle = "#666";
    this.context.font = "9px sans-serif";*/

    if (options.zero) {
        this.circle(this.center, 3 * this.scaleFactor);
    }
    if (options.zeroCross) {
        this.zeroCross();
    }
    if (options.xCross) {
        //this.xCross();
    }
    if (options.rings) {
        for (i = 1; i <= 50; i=i+1) {
            if (i !== 0) this.rangeRing(i * 50 * this.scaleFactor, true);
        }
    }
};

Canvas.prototype.drawEllipse = function (center, halfaxis, excentricity) {
    'use strict';

};

Canvas.prototype.draw = function () {
    'use strict';
    this.drawFrame();
};

$(document).ready(function() {
    'use strict';
    SolarCanvas = new Canvas('view');
    SolarCanvas.scale(500000);
    SolarCanvas.draw();

    $('canvas').scroll(function(){
        console.log('Scroll by');
    });
});

$(window).resize(function() {
    'use strict';
    SolarCanvas.resize();
    SolarCanvas.draw();
    console.log('Window resized');
});
