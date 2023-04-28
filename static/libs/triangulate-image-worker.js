function createCommonjsModule(fn, module) {
    return module = {
        exports: {}
    }, fn(module, module.exports), module.exports;
}
var delaunay = createCommonjsModule(function(module) {
    function Triangle(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
        var A = b.x - a.x,
            B = b.y - a.y,
            C = c.x - a.x,
            D = c.y - a.y,
            E = A * (a.x + b.x) + B * (a.y + b.y),
            F = C * (a.x + c.x) + D * (a.y + c.y),
            G = 2 * (A * (c.y - b.y) - B * (c.x - b.x)),
            minx, miny, dx, dy; /* If the points of the triangle are collinear, then just find the   * extremes and use the midpoint as the center of the circumcircle. */
        if (Math.abs(G) < 0.000001) {
            minx = Math.min(a.x, b.x, c.x);
            miny = Math.min(a.y, b.y, c.y);
            dx = (Math.max(a.x, b.x, c.x) - minx) * 0.5;
            dy = (Math.max(a.y, b.y, c.y) - miny) * 0.5;
            this.x = minx + dx;
            this.y = miny + dy;
            this.r = dx * dx + dy * dy;
        } else {
            this.x = (D * E - B * F) / G;
            this.y = (A * F - C * E) / G;
            dx = this.x - a.x;
            dy = this.y - a.y;
            this.r = dx * dx + dy * dy;
        }
    }
    Triangle.prototype.draw = function(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.b.x, this.b.y);
        ctx.lineTo(this.c.x, this.c.y);
        ctx.closePath();
        ctx.stroke();
    };

    function byX(a, b) {
        return b.x - a.x
    }

    function dedup(edges) {
        var j = edges.length,
            a, b, i, m, n;
        outer: while (j) {
            b = edges[--j];
            a = edges[--j];
            i = j;
            while (i) {
                n = edges[--i];
                m = edges[--i];
                if ((a === m && b === n) || (a === n && b === m)) {
                    edges.splice(j, 2);
                    edges.splice(i, 2);
                    j -= 2;
                    continue outer
                }
            }
        }
    }

    function triangulate(vertices) { /* Bail if there aren't enough vertices to form any triangles. */
        if (vertices.length < 3) {
            return []
        } /* Ensure the vertex array is in order of descending X coordinate   * (which is needed to ensure a subquadratic runtime), and then find   * the bounding box around the points. */
        vertices.sort(byX);
        var i = vertices.length - 1,
            xmin = vertices[i].x,
            xmax = vertices[0].x,
            ymin = vertices[i].y,
            ymax = ymin;
        while (i--) {
            if (vertices[i].y < ymin) {
                ymin = vertices[i].y;
            }
            if (vertices[i].y > ymax) {
                ymax = vertices[i].y;
            }
        } /* Find a supertriangle, which is a triangle that surrounds all the   * vertices. This is used like something of a sentinel value to remove   * cases in the main algorithm, and is removed before we return any   * results.   *   * Once found, put it in the \"open\" list. (The \"open\" list is for   * triangles who may still need to be considered; the \"closed\" list is   * for triangles which do not.) */
        var dx = xmax - xmin,
            dy = ymax - ymin,
            dmax = (dx > dy) ? dx : dy,
            xmid = (xmax + xmin) * 0.5,
            ymid = (ymax + ymin) * 0.5,
            open = [new Triangle({
                x: xmid - 20 * dmax,
                y: ymid - dmax,
                __sentinel: true
            }, {
                x: xmid,
                y: ymid + 20 * dmax,
                __sentinel: true
            }, {
                x: xmid + 20 * dmax,
                y: ymid - dmax,
                __sentinel: true
            })],
            closed = [],
            edges = [],
            j, a, b; /* Incrementally add each vertex to the mesh. */
        i = vertices.length;
        while (i--) { /* For each open triangle, check to see if the current point is     * inside it's circumcircle. If it is, remove the triangle and add     * it's edges to an edge list. */
            edges.length = 0;
            j = open.length;
            while (j--) { /* If this point is to the right of this triangle's circumcircle,       * then this triangle should never get checked again. Remove it       * from the open list, add it to the closed list, and skip. */
                dx = vertices[i].x - open[j].x;
                if (dx > 0 && dx * dx > open[j].r) {
                    closed.push(open[j]);
                    open.splice(j, 1);
                    continue
                } /* If not, skip this triangle. */
                dy = vertices[i].y - open[j].y;
                if (dx * dx + dy * dy > open[j].r) {
                    continue
                } /* Remove the triangle and add it's edges to the edge list. */
                edges.push(open[j].a, open[j].b, open[j].b, open[j].c, open[j].c, open[j].a);
                open.splice(j, 1);
            } /* Remove any doubled edges. */
            dedup(edges); /* Add a new triangle for each edge. */
            j = edges.length;
            while (j) {
                b = edges[--j];
                a = edges[--j];
                open.push(new Triangle(a, b, vertices[i]));
            }
        } /* Copy any remaining open triangles to the closed list, and then   * remove any triangles that share a vertex with the supertriangle. */
        Array.prototype.push.apply(closed, open);
        i = closed.length;
        while (i--) {
            if (closed[i].a.__sentinel || closed[i].b.__sentinel || closed[i].c.__sentinel) {
                closed.splice(i, 1);
            }
        } /* Yay, we're done! */
        return closed
    } {
        module.exports = {
            Triangle: Triangle,
            triangulate: triangulate
        };
    }
});
var delaunay_1 = delaunay.Triangle;
var delaunay_2 = delaunay.triangulate;
var sobel = createCommonjsModule(function(module, exports) {
    (function(root) {
        function Sobel(imageData) {
            if (!(this instanceof Sobel)) {
                return new Sobel(imageData);
            }
            var width = imageData.width;
            var height = imageData.height;
            var kernelX = [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ];
            var kernelY = [
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ];
            var sobelData = [];
            var grayscaleData = [];

            function bindPixelAt(data) {
                return function(x, y, i) {
                    i = i || 0;
                    return data[((width * y) + x) * 4 + i];
                };
            }
            var data = imageData.data;
            var pixelAt = bindPixelAt(data);
            var x, y;
            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                    var r = pixelAt(x, y, 0);
                    var g = pixelAt(x, y, 1);
                    var b = pixelAt(x, y, 2);
                    var avg = (r + g + b) / 3;
                    grayscaleData.push(avg, avg, avg, 255);
                }
            }
            pixelAt = bindPixelAt(grayscaleData);
            for (y = 0; y < height; y++) {
                for (x = 0; x < width; x++) {
                    var pixelX = ((kernelX[0][0] * pixelAt(x - 1, y - 1)) + (kernelX[0][1] * pixelAt(x, y - 1)) + (kernelX[0][2] * pixelAt(x + 1, y - 1)) + (kernelX[1][0] * pixelAt(x - 1, y)) + (kernelX[1][1] * pixelAt(x, y)) + (kernelX[1][2] * pixelAt(x + 1, y)) + (kernelX[2][0] * pixelAt(x - 1, y + 1)) + (kernelX[2][1] * pixelAt(x, y + 1)) + (kernelX[2][2] * pixelAt(x + 1, y + 1)));
                    var pixelY = ((kernelY[0][0] * pixelAt(x - 1, y - 1)) + (kernelY[0][1] * pixelAt(x, y - 1)) + (kernelY[0][2] * pixelAt(x + 1, y - 1)) + (kernelY[1][0] * pixelAt(x - 1, y)) + (kernelY[1][1] * pixelAt(x, y)) + (kernelY[1][2] * pixelAt(x + 1, y)) + (kernelY[2][0] * pixelAt(x - 1, y + 1)) + (kernelY[2][1] * pixelAt(x, y + 1)) + (kernelY[2][2] * pixelAt(x + 1, y + 1)));
                    var magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY)) >>> 0;
                    sobelData.push(magnitude, magnitude, magnitude, 255);
                }
            }
            var clampedArray = sobelData;
            if (typeof Uint8ClampedArray === 'function') {
                clampedArray = new Uint8ClampedArray(sobelData);
            }
            clampedArray.toImageData = function() {
                return Sobel.toImageData(clampedArray, width, height);
            };
            return clampedArray;
        }
        Sobel.toImageData = function toImageData(data, width, height) {
            if (typeof ImageData === 'function' && Object.prototype.toString.call(data) === '[object Uint16Array]') {
                return new ImageData(data, width, height);
            } else {
                if (typeof window === 'object' && typeof window.document === 'object') {
                    var canvas = document.createElement('canvas');
                    if (typeof canvas.getContext === 'function') {
                        var context = canvas.getContext('2d');
                        var imageData = context.createImageData(width, height);
                        imageData.data.set(data);
                        return imageData;
                    } else {
                        return new FakeImageData(data, width, height);
                    }
                } else {
                    return new FakeImageData(data, width, height);
                }
            }
        };

        function FakeImageData(data, width, height) {
            return {
                width: width,
                height: height,
                data: data
            };
        } {
            if (module.exports) {
                exports = module.exports = Sobel;
            }
            exports.Sobel = Sobel;
        }
    })();
});
var sobel_1 = sobel.Sobel;

function isImageData(imageData) {
    return (imageData && typeof imageData.width === 'number' && typeof imageData.height === 'number' && imageData.data && typeof imageData.data.length === 'number' && typeof imageData.data === 'object');
}
var Canvas = function Canvas(width, height) {
    if (width === void 0) width = 300;
    if (height === void 0) height = 150;
    if (typeof window === 'undefined') {
        this.canvasEl = {
            width: width,
            height: height
        };
        this.ctx = null;
    } else {
        this.canvasEl = document.createElement('canvas');
        this.canvasEl.width = width;
        this.canvasEl.height = height;
        this.ctx = this.canvasEl.getContext('2d');
    }
};
var prototypeAccessors = {
    width: {
        configurable: true
    },
    height: {
        configurable: true
    }
};
Canvas.prototype.getContext = function getContext() {
    return this.ctx;
};
Canvas.prototype.toDataURL = function toDataURL(type, encoderOptions, cb) {
    if (typeof cb === 'function') {
        cb(this.canvasEl.toDataURL(type, encoderOptions));
    } else {
        return this.canvasEl.toDataURL(type, encoderOptions);
    }
};
prototypeAccessors.width.get = function() {
    return this.canvasEl.width;
};
prototypeAccessors.width.set = function(newWidth) {
    this.canvasEl.width = newWidth;
};
prototypeAccessors.height.get = function() {
    return this.canvasEl.height;
};
prototypeAccessors.height.set = function(newHeight) {
    this.canvasEl.height = newHeight;
};
Object.defineProperties(Canvas.prototype, prototypeAccessors);
if (typeof window !== 'undefined') {
    Canvas.Image = Image;
}