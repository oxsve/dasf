(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["xolor"] = factory();
	else
		root["xolor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** ./xolor.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	var proto = __webpack_require__(/*! proto */ 1)
	
	var xolor = module.exports = proto(function() {
	    // static methods
	
	    this.random = function() {
	        return new xolor([
	            255 * Math.random(),
	            255 * Math.random(),
	            255 * Math.random()
	        ])
	    }
	
	    this.readable = function() {
	        if(arguments.length === 1) {
	            var domNode = arguments[0]
	            var f = ""; // font color
	            var b = ""; // background color
	
	            do {
	                if("" === f) {
	                    f = window.getComputedStyle(domNode).getPropertyValue("color")
	                    if(f === "transparent" || f === "rgba(0, 0, 0, 0)") {
	                        f = ""
	                    }
	                }
	                if ("" === b) {
	                    b = window.getComputedStyle(domNode).getPropertyValue("backgroundColor")
	                    if(b === "transparent" || b === "rgba(0, 0, 0, 0)") {
	                        b = ""
	                    }
	                }
	
	                domNode = domNode["parentNode"]
	            } while (("" === f || "" === b) && domNode.nodeName.toUpperCase() !== 'BODY')
	
	            if ("" === f) f = "black"
	            if ("" === b) b = "white"
	
	            // todo: if alpha != 1, use opacity() to calculate correct color on certain element and it's parent
	            var background = b
	            var textColor = f
	            var textSize = window.getComputedStyle(arguments[0]).getPropertyValue("fontSize")
	
	        } else { // arguments.length === 3
	            var background = arguments[0]
	            var textColor = arguments[1]
	            var textSize = arguments[2]
	        }
	
	        var a = new xolor(textColor)
	        var b = new xolor(background)
	        textSize = textSize || 10
	
	        // based on: http://www.hgrebdes.com/colour/spectrum/colourvisibility.html
	        var diff = b.r * 0.299 + b.g * 0.587 + b.b * 0.114 -
	                   a.r * 0.299 - a.g * 0.587 - a.b * 0.114
	
	        return !((diff < (1.5 + 141.162 * Math.pow(0.975, textSize)))
	              && (diff > (-.5 - 154.709 * Math.pow(0.990, textSize))))
	    }
	
	    var colorizeModifiers = {
	        // Returns number in [0, 1] (0 = FROM, 1 = TO)
	        gradient: function (k, l, diff, c) {
	            return k / l;
	        },
	        flip: function (k, l, diff, c) {
	            return (" " === c) ? diff : !diff;
	        },
	        pillow: function (k, l, diff, c) {
	            k*= 2;
	            return (k <= l)
	                ?	(k / l)
	                :	(2 - k / l);
	        }
	    }
	
	    this.colorize = function(domNode, FROM, TO, method) {
	        if ("function" !== typeof method) {
	            method = colorizeModifiers[method]
	        }
	
	        FROM = new xolor(FROM)
	        TO   = new xolor(TO)
	
	        var characterLength = 0, charactersProcessed = 0, position = 0
	
	        // get the full text length of the domNode
	        var tmp  = domNode.childNodes
	        for (var i = 0; i<tmp.length; i++){
	            characterLength+= tmp[i]["textContent"].length
	        }
	
	        var replace = function(node) {
	            if (3 === node.nodeType) {
	                var rDiff = TO.r - FROM.r
	                var gDiff = TO.g - FROM.g
	                var bDiff = TO.b - FROM.b
	                var aDiff = TO.a - FROM.a
	
	
	                var ctx = document.createElement('span'), len = node.nodeValue.length
	                for(var i = 0; i < len; i++) {
	                    var elem = document.createElement('span')
	                    var c    = node.nodeValue.charAt(i)
	
	                    position = method(charactersProcessed, characterLength, position, c);
	
	                    elem.style.color =_RGBAtoCSS(
	                        FROM.r + position * rDiff|0,
	                        FROM.g + position * gDiff|0,
	                        FROM.b + position * bDiff|0,
	                        FROM.a + position * aDiff
	                    );
	
	                    elem.appendChild(document.createTextNode(c))
	                    ctx.appendChild(elem)
	                    charactersProcessed++
	                }
	
	                node.parentNode.replaceChild(ctx, node)
	
	            } else {
	                var len = node.childNodes.length
	                for(var n=0; n < len; n++) {
	                    replace(node.childNodes[n])
	                }
	            }
	        }
	
	        replace(domNode)
	    }
	
		this.init = function(color) {
	        if(color instanceof xolor) {
	            return xolor({
	                r: color.r,
	                g: color.g,
	                b: color.b
	            })
	        } else if ("string" === typeof color) {
	            color = color.toLowerCase().replace(/[^a-z0-9,.()#%]/g, '');
	
	            var part, c;
	
	            if ('transparent' === color) {
	                this.a = this.r = this.g = this.b = 0;
	            } else {
	                if (color in colorNames) {
	                    color = '#' + colorNames[color]
	                }
					if ((part = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(color))) {  //#0000007F
						this.a = parseFloat((parseInt(part[4], 16) / 255)+'').toFixed(2);
						this.r = parseInt(part[1], 16);
						this.g = parseInt(part[2], 16);
						this.b = parseInt(part[3], 16);

					}else if ((part = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(color))) {  // #ff9000, #ff0000
	                    this.a = 1;
	                    this.r = parseInt(part[1], 16);
	                    this.g = parseInt(part[2], 16);
	                    this.b = parseInt(part[3], 16);
	
	                } else if ((part = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(color))) {   // #f00, fff
	                    this.a = 1;
	                    this.r = parseInt(part[1] + part[1], 16);
	                    this.g = parseInt(part[2] + part[2], 16);
	                    this.b = parseInt(part[3] + part[3], 16);
	
	                } else if ((part = /^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(,([0-9.]+))?\)$/.exec(color))) {  // rgb(1, 234, 56)
	                    this.a = _normalize(part[5], 1);
	                    this.r = _normalize(part[1]);
	                    this.g = _normalize(part[2]);
	                    this.b = _normalize(part[3]);
	                } else if ((part = /^rgba?\(([0-9.]+\%),([0-9.]+\%),([0-9.]+\%)(,([0-9.]+)\%?)?\)$/.exec(color))) {  // rgb(66%, 55%, 44%) in [0,100]%, [0,100]%, [0,100]%
	                    this.a = _normalize(part[5], 1);
	                    this.r = Math.round(2.55 * _normalize(part[1], 100));
	                    this.g = Math.round(2.55 * _normalize(part[2], 100));
	                    this.b = Math.round(2.55 * _normalize(part[3], 100));
	
	                }
					else if ((part = /^hs([bvl])a?\((\d{1,3}),(\d{1,3}),(\d{1,3})(,([0-9.]+))?\)$/.exec(color))) { // hsv(64, 40, 16) in [0, 360], [0,100], [0,100] or hsl(10, 90, 20)
	                    var func;
	                    if ("l" === part[1]) {
	                        func = _hsl;
	                    } else {
	                        func = _hsv;
	                    }
	
	                    c = func(parseInt(part[2], 10), parseInt(part[3], 10), parseInt(part[4], 10));
	
	                    this.a = _normalize(part[6], 1);
	                    this.r = c[0];
	                    this.g = c[1];
	                    this.b = c[2];
	
	                } else if ((part = /^(\d{1,3}),(\d{1,3}),(\d{1,3})(,([0-9.]+))?$/.exec(color))) {  // 1, 234, 56
	                    this.a = _normalize(part[5], 1);
	                    this.r = _normalize(part[1]);
	                    this.g = _normalize(part[2]);
	                    this.b = _normalize(part[3]);
	                }
	            }
	        } else if("number" === typeof color) {
	            this.a =((color >> 24) & 0xff) / 255;
	            this.r = (color >> 16) & 0xff;
	            this.g = (color >>  8) & 0xff;
	            this.b = (color      ) & 0xff;
	        } else if(color instanceof Object) {
	            if (0 in color && 1 in color && 2 in color) {
	                this.a = _normalize(color[3], 1);
	                this.r = _normalize(color[0]);
	                this.g = _normalize(color[1]);
	                this.b = _normalize(color[2]);
	            } else if ('r' in color && 'g' in color && 'b' in color) {
	                this.a = _normalize(color.a, 1);
	                this.r = _normalize(color.r);
	                this.g = _normalize(color.g);
	                this.b = _normalize(color.b);
	            } else if ('h' in color && 's' in color) {
	                var rgb;
	                if ('l' in color) {
	                    rgb = _hsl(color["h"], color["s"], color["l"]);
	                } else if ('v' in color) {
	                    rgb = _hsv(color["h"], color["s"], color["v"]);
	                } else if ('b' in color) {
	                    rgb = _hsv(color["h"], color["s"], color.b);
	                } else {
	                    throw new Error("Invalid color object")
	                }
	
	                this.a = _normalize(color.a, 1);
	                this.r = rgb[0];
	                this.g = rgb[1];
	                this.b = rgb[2];
	            }
			} else {
	            throw new Error('Invalid color')
			}
	        //this.a = Math.round(this.a) bug?
	        this.r = Math.round(this.r)
	        this.g = Math.round(this.g)
	        this.b = Math.round(this.b)
		}
	
	    // instance properties
	
	    Object.defineProperty(this, 'rbg', {
	        get: function() {
	            return {
	                r: this.r,
	                g: this.g,
	                b: this.b,
	                a: this.a
	            }
	        }
	    })
	
	    Object.defineProperty(this, 'css', {
	        get: function() {
	            if(0 === this.a) {
	                return "transparent"
	            } else if(1 === this.a) {
	                return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')'
	            } else {
	                return _RGBAtoCSS(this.r, this.g, this.b, this.a)
	            }
	        }
	    })
	
	    Object.defineProperty(this, 'array', {
	        get: function() {
	            return [this.r, this.g, this.b, 100 * this.a|0]
	        }
	    })
	
	    Object.defineProperty(this, 'fraction', {
	        get: function() {
	            return {
	                "r": this.r / 255,
	                "g": this.g / 255,
	                "b": this.b / 255,
	                "a": this.a
	            }
	        }
	    })
	
	    Object.defineProperty(this, 'hsl', {
	        get: function() {
	            // inspiration: http://130.113.54.154/~monger/hsl-rgb.html
	
	            var r = this.r / 255;
	            var g = this.g / 255;
	            var b = this.b / 255;
	
	            var min = Math.min(r, g, b);
	            var max = Math.max(r, g, b);
	            var delta = max - min;
	
	            var h, s, l = (max + min) / 2;
	
	            if (0 === delta) {
	                h = 0;
	                s = 0;
	            } else {
	
	                if (r === max) {
	                    h = (g - b) / delta;
	                } else if (g === max) {
	                    h = 2 + (b - r) / delta;
	                } else {
	                    h = 4 + (r - g) / delta;
	                }
	
	                s = delta / (l < .5 ? max + min : 2 - max - min);
	            }
	            return {
	                "h": Math.round( 60 * ((6 + h) % 6)),
	                "s": Math.round(100 * s),
	                "l": Math.round(100 * l),
	                "a": this.a
	            }
	        }
	    })
	
	    Object.defineProperty(this, 'hsv', {
	        get: function() {
	            var r = this.r / 255;
	            var g = this.g / 255;
	            var b = this.b / 255;
	
	            /*
	            if (r > g) {
	                max = r;
	                min = g;
	            } else {
	                min = r;
	                max = g;
	            }
	
	            if (b > max)
	                max = b;
	            if (b < min)
	                min = b;
	            */
	
	            var min = Math.min(r, g, b);
	            var max = Math.max(r, g, b);
	            var delta = max - min;
	
	            var h, s, v = max;
	
	            if (0 === max) {
	                s = 0;
	            } else {
	                s = delta / max;
	            }
	
	            if (0 === delta) {
	                h = 0;
	            } else if (r === max) {
	                h = (g - b) / delta;
	            } else if (g === max) {
	                h = 2 + (b - r) / delta;
	            } else {
	                h = 4 + (r - g) / delta;
	            }
	
	            return {
	                "h": Math.round( 60 * ((6 + h) % 6)),
	                "s": Math.round(100 * s),
	                "v": Math.round(100 * v),
	                "a": this.a
	            }
	        }
	    })
	
	    this.toString = function () {
	        var chars = "0123456789abcdef"
	
	        var r1 = this.r >> 4;
	        var g1 = this.g >> 4;
	        var b1 = this.b >> 4;
	
	        var r2 = this.r & 0xf;
	        var g2 = this.g & 0xf;
	        var b2 = this.b & 0xf;
	
	        return '#'
	            + chars.charAt(r1) + chars.charAt(r2)
	            + chars.charAt(g1) + chars.charAt(g2)
	            + chars.charAt(b1) + chars.charAt(b2)
	    }
	    Object.defineProperty(this, 'hex', {
	        get: this.toString
	    })
	
	    // get color as a normalize integer
	    Object.defineProperty(this, 'int', {
	        get: function() {
	            return ((100 * this.a|0) << 24 ^ this.r << 16 ^ this.g << 8 ^ this.b)
	        }
	    })
	
	    // nearest name
	    Object.defineProperty(this, 'name', {
	        get: function() {
	            var lowest = null;
	            var lowest_ndx;
	
	            var table = colorNames;
	
	            var a = this.hsl
	
	            for (var i in table) {
	
	                /* We do not handle transparency */
	                var b = xolor(table[i]).hsl
	
	                var tmp = Math.sqrt(.5 * (a["h"] - b["h"]) * (a["h"] - b["h"]) + .5 * (a["s"] - b["s"]) * (a["s"] - b["s"]) + (a["l"] - b["l"]) * (a["l"] - b["l"]));
	
	                if (null === lowest || tmp < lowest) {
	                    lowest = tmp;
	                    lowest_ndx = i;
	                }
	            }
	            return lowest_ndx
	        }
	    })
	
	    // instance methods
	
	    // gets the lightness level (a value from 0 to 255) or returns a new xolor with the new lightness level
	        // if level is undefined, returns the lightness level
	        // otherwise will return a
		this.lightness = function(level) {
	        if(level === undefined) {
	            return Math.max(this.g,this.r,this.b)
	        } else {
	            var roundedLevel = Math.round(level) // fractions won't work here
	            var levelChange = roundedLevel - this.lightness()
	
	            var r = Math.max(0,this.r+levelChange)
	            var g = Math.max(0,this.g+levelChange)
	            var b = Math.max(0,this.b+levelChange)
	
	            if(r > 0xff) r = 0xff
	            if(g > 0xff) g = 0xff
	            if(b > 0xff) b = 0xff
	
	            return xolor({r: r, g: g, b: b})
	        }
		}
	
	    // relative lightness
	    // returns a new xolor with the lightness level based on a ratio of the current lightness
		    // e.g. .5 darkens by 50% and 1.5 lightens by 50%
	    this.relLightness = function(ratio) {
	        return this.lightness(this.lightness()*ratio)
	    }
	
		// returns a lighter (or darker) color
		// level should be a value from -255 to 255
		this.lighter = function(amount) {
	        return this.lightness(this.lightness()+amount)
		}
	
	
	    // Microsoft's sepia function http://msdn.microsoft.com/en-us/magazine/cc163866.aspx
	    this.sepia = function() {
	        var r = this.r, g = this.g, b = this.b
	        return xolor({
	            r: Math.round(r * .393 + g * .769 + b * .189),
	            g: Math.round(r * .349 + g * .686 + b * .168),
	            b: Math.round(r * .272 + g * .534 + b * .131)
	        })
	    }
	
		this.red = function() {
	        return xolor({
	            r: this.r,
	            g: 0, b:0
	        })
		}
	    this.green = function() {
	        return xolor({
	            g: this.g,
	            r: 0, b:0
	        })
		}
	    this.blue = function() {
	        return xolor({
	            b: this.b,
	            r: 0, g:0
	        })
		}
	
	    this.inverse = function() {
	        return xolor({
	            r: this.r ^= 0xff,
	            g: this.g ^= 0xff,
	            b: this.b ^= 0xff
	        })
	    }
	
	    this.opacity = function (topColor, opacity) {        
	        if(opacity > 1) {
	            opacity /= 100
	        }
	
	        var a = xolor(topColor) // above
	        var b = this     // below        
	        opacity = Math.max(opacity - 1 + b.a, 0)
	
	        return xolor({
	            r: Math.round((b.r - a.r) * opacity + a.r),
	            g: Math.round((b.g - a.g) * opacity + a.g),
	            b: Math.round((b.b - a.b) * opacity + a.b)
	        })
	    }
	
	    this.greyfilter = function (formula) {
	        if(formula === 1) {
	            var v = .35 + 13 * (this.r + this.g + this.b) / 60    // Robert Eisele's formula
	        } else if(formula === 2) {
	            var v = (13 * (this.r + this.g + this.b) + 5355) / 60 // Sun's formula: (1 - avg) / (100 / 35) + avg)
	        } else {
	            var v = this.r * .3 + this.g * .59 + this.b * .11
	        }
	
	        v = Math.min(v|0, 255)
	        return xolor({r:v,g:v,b:v})
	    }
	
	    this.web = function () {
	        var c = xolor({r:this.r,g:this.g,b:this.b})
	        if ((c.r+= 0x33 - c.r % 0x33) > 0xff) c.r = 0xff
	        if ((c.g+= 0x33 - c.g % 0x33) > 0xff) c.g = 0xff
	        if ((c.b+= 0x33 - c.b % 0x33) > 0xff) c.b = 0xff
	
	        return c
	    }
	
	    this.distance = function (from) {
	        var a = this, b = xolor(from)
	
	        // Approximation attempt of http://www.compuphase.com/cmetric.htm
	        return Math.sqrt(3 * (b.r - a.r) * (b.r - a.r) + 4 * (b.g - a.g) * (b.g - a.g) + 2 * (b.b - a.b) * (b.b - a.b))
	    }
	
	    //
	    this.combine = function(other) {
	        other = xolor(other)
	        return xolor({
	            r: this.r^= other.r,
	            g: this.g^= other.g,
	            b: this.b^= other.b
	        })
	    }
	
	    // Generates a new random number with parts of the current and the passed in color.
	    this.breed = function (other) {
	        var mask = 0, i = 6;
	        while (i--) {
	            if (Math.random() < .5) {
	                mask|= 0x0f << (i << 2);
	            }
	        }
	
	        var a = xolor(other), b = this
	        return xolor({
	            r: (a.r & ((mask >> 0x10) & 0xff)) | (b.r & (((mask >> 0x10) & 0xff) ^ 0xff)),
	            g: (a.g & ((mask >> 0x08) & 0xff)) | (b.g & (((mask >> 0x08) & 0xff) ^ 0xff)),
	            b: (a.b & ((mask >> 0x00) & 0xff)) | (b.b & (((mask >> 0x00) & 0xff) ^ 0xff))
	        })
	    }
	
	    this.add = function(b) {
	        b = xolor(b)
	
	        var r = this.r+b.r, g = this.g+b.g, b = this.b+b.b
	        if(r>0xff) r=0xff
	        if(g>0xff) g=0xff
	        if(b>0xff) b=0xff
	
	        return xolor({
	            r: r,
	            g: g,
	            b: b
	        })
	    }
	
	    this.subtractive = function(b) {
	        b = xolor(b)
	
	        var r = this.r+b.r-0xff,
	            g = this.g+b.g-0xff,
	            b = this.b+b.b-0xff
	
	        if(r<0) r=0
	        if(g<0) g=0
	        if(b<0) b=0
	
	        return xolor({
	            r: r,
	            g: g,
	            b: b
	        })
	    }
	
	    this.sub = this.subtract = function(b) {
	        b = xolor(b)
	
	        var r = this.r-b.r, g = this.g-b.g, b = this.b-b.b
	        if(r<0) r=0
	        if(g<0) g=0
	        if(b<0) b=0
	
	        return xolor({
	            r: r,
	            g: g,
	            b: b
	        })
	    }
	
	    this.mult = this.multiply = function(b) {
	        b = xolor(b)
	        return xolor({
	            r: (this.r / 255 * b.r)|0,
	            g: (this.g / 255 * b.g)|0,
	            b: (this.b / 255 * b.b)|0
	        })
	    }
	
	    this.avg = this.average = function (b) {
	        b = xolor(b)
	        return xolor({
	            r: (a.r + b.r) >> 1,
	            g: (a.g + b.g) >> 1,
	            b: (a.b + b.b) >> 1
	        })
	    }
	
	    this.triad = function () {
	        return [
	            this,
	            xolor([this.b, this.r, this.g]),
	            xolor([this.g, this.b, this.r])
	        ]
	    }
	
	    this.tetrad = function () {
	        return [
	            this,
	            xolor([this.b, this.r, this.b]),
	            xolor([this.b, this.g, this.r]),
	            xolor([this.r, this.b, this.r])
	        ]
	    }
	
	    // position should be a number from 0 to 1 (inclusive) describing how far from the calling color you want to calculate the color
	    this.gradient = function (to, level) {
	        if (level < 0 || 1 < level) throw new Error('`level` must a number between 0 and 1 (inclusive)')
	
	        var a = this, b = xolor(to)
	
	        var raisedLevel = level*1000
	        return xolor({
	            r: (a.r + ((b.r - a.r) / 1000) * raisedLevel)|0,
	            g: (a.g + ((b.g - a.g) / 1000) * raisedLevel)|0,
	            b: (a.b + ((b.b - a.b) / 1000) * raisedLevel)|0
	        })
	    }
	
	    this.analogous = function (number, slices) {
	        if(number === undefined) number = 8
	        if(slices === undefined) slices = 30
	
	        var hsv = this.hsv
	        var part = 360 / slices, ret = [this]
	        for (hsv["h"] = ((hsv["h"] - (part * number >> 1)) + 720) % 360; --number; ) {
	            hsv["h"]+= part;
	            hsv["h"]%= 360;
	            ret.push(xolor(hsv))
	        }
	        return ret
	    }
	
	    this.comp = this.complementary = function() {
	        var hsl = this.hsl
	        hsl["h"] = (hsl["h"] + 180) % 360
	        return xolor(hsl)
	    }
	
	    // split complement
	    this.splitcomp = this.splitcomplement = function () {
	        var hsv = this.hsv
	        var ret = [this]
	
	        hsv["h"]+= 72;
	        hsv["h"]%= 360;
	        ret.push(new xolor(hsv))
	
	        hsv["h"]+= 144;
	        hsv["h"]%= 360;
	        ret.push(new xolor(hsv))
	
	        return ret
	    }
	
	    this.monochromes = this.monochromatic = function (number) {
	        if(undefined === number) number = 6
	
	        var hsv = this.hsv
	        var ret = [this]
	        while (--number) {
	            hsv["v"]+= 20;
	            hsv["v"]%= 100;
	            ret.push(new xolor(hsv))
	        }
	
	        return ret
	    }
	})
	
	
	// http://www.w3.org/TR/css3-color/#svg-color
	var colorNames = {
	    "aliceblue": "f0f8ff",
	    "antiquewhite": "faebd7",
	    "aqua": "0ff",
	    "aquamarine": "7fffd4",
	    "azure": "f0ffff",
	    "beige": "f5f5dc",
	    "bisque": "ffe4c4",
	    "black": "000",
	    "blanchedalmond": "ffebcd",
	    "blue": "00f",
	    "blueviolet": "8a2be2",
	    "brown": "a52a2a",
	    "burlywood": "deb887",
	    "burntsienna": "ea7e5d",
	    "cadetblue": "5f9ea0",
	    "chartreuse": "7fff00",
	    "chocolate": "d2691e",
	    "coral": "ff7f50",
	    "cornflowerblue": "6495ed",
	    "cornsilk": "fff8dc",
	    "crimson": "dc143c",
	    "cyan": "0ff",
	    "darkblue": "00008b",
	    "darkcyan": "008b8b",
	    "darkgoldenrod": "b8860b",
	    "darkgray": "a9a9a9",
	    "darkgreen": "006400",
	    "darkgrey": "a9a9a9",
	    "darkkhaki": "bdb76b",
	    "darkmagenta": "8b008b",
	    "darkolivegreen": "556b2f",
	    "darkorange": "ff8c00",
	    "darkorchid": "9932cc",
	    "darkred": "8b0000",
	    "darksalmon": "e9967a",
	    "darkseagreen": "8fbc8f",
	    "darkslateblue": "483d8b",
	    "darkslategray": "2f4f4f",
	    "darkslategrey": "2f4f4f",
	    "darkturquoise": "00ced1",
	    "darkviolet": "9400d3",
	    "deeppink": "ff1493",
	    "deepskyblue": "00bfff",
	    "dimgray": "696969",
	    "dimgrey": "696969",
	    "dodgerblue": "1e90ff",
	    "firebrick": "b22222",
	    "floralwhite": "fffaf0",
	    "forestgreen": "228b22",
	    "fuchsia": "f0f",
	    "gainsboro": "dcdcdc",
	    "ghostwhite": "f8f8ff",
	    "gold": "ffd700",
	    "goldenrod": "daa520",
	    "gray": "808080",
	    "green": "008000",
	    "greenyellow": "adff2f",
	    "grey": "808080",
	    "honeydew": "f0fff0",
	    "hotpink": "ff69b4",
	    "indianred": "cd5c5c",
	    "indigo": "4b0082",
	    "ivory": "fffff0",
	    "khaki": "f0e68c",
	    "lavender": "e6e6fa",
	    "lavenderblush": "fff0f5",
	    "lawngreen": "7cfc00",
	    "lemonchiffon": "fffacd",
	    "lightblue": "add8e6",
	    "lightcoral": "f08080",
	    "lightcyan": "e0ffff",
	    "lightgoldenrodyellow": "fafad2",
	    "lightgray": "d3d3d3",
	    "lightgreen": "90ee90",
	    "lightgrey": "d3d3d3",
	    "lightpink": "ffb6c1",
	    "lightsalmon": "ffa07a",
	    "lightseagreen": "20b2aa",
	    "lightskyblue": "87cefa",
	    "lightslategray": "789",
	    "lightslategrey": "789",
	    "lightsteelblue": "b0c4de",
	    "lightyellow": "ffffe0",
	    "lime": "0f0",
	    "limegreen": "32cd32",
	    "linen": "faf0e6",
	    "magenta": "f0f",
	    "maroon": "800000",
	    "mediumaquamarine": "66cdaa",
	    "mediumblue": "0000cd",
	    "mediumorchid": "ba55d3",
	    "mediumpurple": "9370db",
	    "mediumseagreen": "3cb371",
	    "mediumslateblue": "7b68ee",
	    "mediumspringgreen": "00fa9a",
	    "mediumturquoise": "48d1cc",
	    "mediumvioletred": "c71585",
	    "midnightblue": "191970",
	    "mintcream": "f5fffa",
	    "mistyrose": "ffe4e1",
	    "moccasin": "ffe4b5",
	    "navajowhite": "ffdead",
	    "navy": "000080",
	    "oldlace": "fdf5e6",
	    "olive": "808000",
	    "olivedrab": "6b8e23",
	    "orange": "ffa500",
	    "orangered": "ff4500",
	    "orchid": "da70d6",
	    "palegoldenrod": "eee8aa",
	    "palegreen": "98fb98",
	    "paleturquoise": "afeeee",
	    "palevioletred": "db7093",
	    "papayawhip": "ffefd5",
	    "peachpuff": "ffdab9",
	    "peru": "cd853f",
	    "pink": "ffc0cb",
	    "plum": "dda0dd",
	    "powderblue": "b0e0e6",
	    "purple": "800080",
	    "red": "f00",
	    "rosybrown": "bc8f8f",
	    "royalblue": "4169e1",
	    "saddlebrown": "8b4513",
	    "salmon": "fa8072",
	    "sandybrown": "f4a460",
	    "seagreen": "2e8b57",
	    "seashell": "fff5ee",
	    "sienna": "a0522d",
	    "silver": "c0c0c0",
	    "skyblue": "87ceeb",
	    "slateblue": "6a5acd",
	    "slategray": "708090",
	    "slategrey": "708090",
	    "snow": "fffafa",
	    "springgreen": "00ff7f",
	    "steelblue": "4682b4",
	    "tan": "d2b48c",
	    "teal": "008080",
	    "thistle": "d8bfd8",
	    "tomato": "ff6347",
	    "turquoise": "40e0d0",
	    "violet": "ee82ee",
	    "wheat": "f5deb3",
	    "white": "fff",
	    "whitesmoke": "f5f5f5",
	    "yellow": "ff0",
	    "yellowgreen": "9acd32"
	}
	
	function _RGBAtoCSS(r, g, b, a) {
	    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
	}
	
	
	/**
	 * normalize function
	 * @param {(number|string)=} n (optional)
	 * @param {(number|string)=} s (optional)
	 */
	function _normalize(n, s) {
	
	    var m;
	
	    if (undefined !== n) {
	        n = parseFloat(n);
	    }
	
	    if (undefined === s) {
	        s = 255;
	        m = 255;
	    } else if (1 === s) {
	
	        if (undefined === n || 1 === n) {
	            return 1;
	        }
	        s = 100;
	        m = 1;
	    } else {
	        m = s;
	    }
	
	    if (isNaN(n) || n <= 0) {
	        return 0;
	    }
	
	    if (s < n) {
	        return m;
	    }
	
	    if (n < 1 || 1 === s) {
	        if (1 === m) {
	            return n;
	        } else {
	            return (n * m) | 0;
	        }
	    }
	    return n * m / s;
	}

	function _hsl(h,s,l) {
	
	    h = _normalize(h, 360) / 360;
	    s = _normalize(s, 1);
	    l = _normalize(l, 1);
	
	    if (0 === s) {
	        l = Math.round(255 * l);
	        return [l, l, l];
	    }
	
	    function _hue(v1, v2, h) {
	        h = ++h % 1;
	
	        if (6 * h < 1) return v1 + (v2 - v1) * 6 * h;
	        if (2 * h < 1) return v2;
	        if (3 * h < 2) return v1 + (v2 - v1) * (4 - 6 * h);
	        return v1;
	    }
	
	    var v = l < .5 ? (l + l * s) : (l + s - l * s);
	    var m = l + l - v;
	
	    return [
	    Math.round(255 *_hue(m, v, h + 1 / 3)),
	    Math.round(255 *_hue(m, v, h)),
	    Math.round(255 *_hue(m, v, h - 1 / 3)) ];
	}
	
	function _hsv(h,s,v) {
	
	    h = _normalize(h, 360) / 60;
	    s = _normalize(s, 1);
	    v = _normalize(v, 1);
	
	    var hi = h|0;
	    var f = h - hi;
	
	    var p = Math.round(255 * v * (1 - s));
	    var q = Math.round(255 * v * (1 - s * f));
	    var t = Math.round(255 * v * (1 - s * (1 - f)));
	        v = Math.round(255 * v);
	
	    switch(hi) {
	    case 1:
	        return [q, v, p];
	    case 2:
	        return [p, v, t];
	    case 3:
	        return [p, q, v];
	    case 4:
	        return [t, p, v];
	    case 5:
	        return [v, p, q];
	    }
	    return [v, t, p];
	}

/***/ },
/* 1 */
/*!**************************!*\
  !*** ./~/proto/proto.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* Copyright (c) 2013 Billy Tetrud - Free to use for any purpose: MIT License*/
	
	var noop = function() {}
	
	var prototypeName='prototype', undefined, protoUndefined='undefined', init='init', ownProperty=({}).hasOwnProperty; // minifiable variables
	function proto() {
	    var args = arguments // minifiable variables
	
	    if(args.length == 1) {
	        var parent = {init: noop}
	        var prototypeBuilder = args[0]
	
	    } else { // length == 2
	        var parent = args[0]
	        var prototypeBuilder = args[1]
	    }
	
	    // special handling for Error objects
	    var namePointer = {}    // name used only for Error Objects
	    if([Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError].indexOf(parent) !== -1) {
	        parent = normalizeErrorObject(parent, namePointer)
	    }
	
	    // set up the parent into the prototype chain if a parent is passed
	    var parentIsFunction = typeof(parent) === "function"
	    if(parentIsFunction) {
	        prototypeBuilder[prototypeName] = parent[prototypeName]
	    } else {
	        prototypeBuilder[prototypeName] = parent
	    }
	
	    // the prototype that will be used to make instances
	    var prototype = new prototypeBuilder(parent)
	    namePointer.name = prototype.name
	
	    // if there's no init, assume its inheriting a non-proto class, so default to applying the superclass's constructor.
	    if(!prototype[init] && parentIsFunction) {
	        prototype[init] = function() {
	            parent.apply(this, arguments)
	        }
	    }
	
	    // constructor for empty object which will be populated via the constructor
	    var F = function() {}
	        F[prototypeName] = prototype    // set the prototype for created instances
	
	    var constructorName = prototype.name?prototype.name:''
	    if(prototype[init] === undefined || prototype[init] === noop) {
	        var ProtoObjectFactory = new Function('F',
	            "return function " + constructorName + "(){" +
	                "return new F()" +
	            "}"
	        )(F)
	    } else {
	        // dynamically creating this function cause there's no other way to dynamically name a function
	        var ProtoObjectFactory = new Function('F','i','u','n', // shitty variables cause minifiers aren't gonna minify my function string here
	            "return function " + constructorName + "(){ " +
	                "var x=new F(),r=i.apply(x,arguments)\n" +    // populate object via the constructor
	                "if(r===n)\n" +
	                    "return x\n" +
	                "else if(r===u)\n" +
	                    "return n\n" +
	                "else\n" +
	                    "return r\n" +
	            "}"
	        )(F, prototype[init], proto[protoUndefined]) // note that n is undefined
	    }
	
	    prototype.constructor = ProtoObjectFactory;    // set the constructor property on the prototype
	
	    // add all the prototype properties onto the static class as well (so you can access that class when you want to reference superclass properties)
	    for(var n in prototype) {
	        addProperty(ProtoObjectFactory, prototype, n)
	    }
	
	    // add properties from parent that don't exist in the static class object yet
	    for(var n in parent) {
	        if(ownProperty.call(parent, n) && ProtoObjectFactory[n] === undefined) {
	            addProperty(ProtoObjectFactory, parent, n)
	        }
	    }
	
	    ProtoObjectFactory.parent = parent;            // special parent property only available on the returned proto class
	    ProtoObjectFactory[prototypeName] = prototype  // set the prototype on the object factory
	
	    return ProtoObjectFactory;
	}
	
	proto[protoUndefined] = {} // a special marker for when you want to return undefined from a constructor
	
	module.exports = proto
	
	function normalizeErrorObject(ErrorObject, namePointer) {
	    function NormalizedError() {
	        var tmp = new ErrorObject(arguments[0])
	        tmp.name = namePointer.name
	
	        this.message = tmp.message
	        if(Object.defineProperty) {
	            /*this.stack = */Object.defineProperty(this, 'stack', { // getter for more optimizy goodness
	                get: function() {
	                    return tmp.stack
	                },
	                configurable: true // so you can change it if you want
	            })
	        } else {
	            this.stack = tmp.stack
	        }
	
	        return this
	    }
	
	    var IntermediateInheritor = function() {}
	        IntermediateInheritor.prototype = ErrorObject.prototype
	    NormalizedError.prototype = new IntermediateInheritor()
	
	    return NormalizedError
	}
	
	function addProperty(factoryObject, prototype, property) {
	    try {
	        var info = Object.getOwnPropertyDescriptor(prototype, property)
	        if(info.get !== undefined || info.get !== undefined && Object.defineProperty !== undefined) {
	            Object.defineProperty(factoryObject, property, info)
	        } else {
	            factoryObject[property] = prototype[property]
	        }
	    } catch(e) {
	        // do nothing, if a property (like `name`) can't be set, just ignore it
	    }
	}

/***/ }
/******/ ])
});

//# sourceMappingURL=xolor.umd.js.map