//region Helper functions
function safe_key_union(sourceA, sourceB) {
    const aBad = sourceA === undefined || sourceA === null;
    const bBad = sourceB === undefined || sourceB === null;

    if (aBad && bBad) return new Set();

    if (aBad) {
        const bKeys = Object.keys(sourceB);
        return new Set(bKeys);
    }
    const aKeys = Object.keys(sourceA);

    if (bBad) {
        return new Set(aKeys);
    }
    const bKeys = Object.keys(sourceB);

    let setA = new Set(aKeys);
    let setB = new Set(bKeys);

    for (let elem of setB) {
        setA.add(elem);
    }
    return setA;
}

//endregion

class Mask {

    constructor() {
        this.container = {};
    }

    setRed(x, y) {
        this.ensureAvailable(x, y);
        this.container[x][y] |= 0x00FF0000;
    }

    setGreen(x, y) {
        this.ensureAvailable(x, y);
        this.container[x][y] |= 0x0000FF00;
    }

    setBlue(x, y) {
        this.ensureAvailable(x, y);
        this.container[x][y] |= 0x000000FF;
    }

    clearRed(x, y) {
        this.ensureAvailable(x, y);
        this.container[x][y] &= ~0x00FF0000;
    }

    clearGreen(x, y) {
        this.ensureAvailable(x, y);
        this.container[x][y] &= ~0x0000FF00;
    }

    clearBlue(x, y) {
        this.ensureAvailable(x, y);
        this.container[x][y] &= ~0x000000FF;
    }

    testRed(x, y) {
        return x in this.container && y in this.container[x] && (this.container[x][y] & 0x00FF0000) !== 0;
    }

    testGreen(x, y) {
        return x in this.container && y in this.container[x] && (this.container[x][y] & 0x0000FF00) !== 0;
    }

    testBlue(x, y) {
        return x in this.container && y in this.container[x] && (this.container[x][y] & 0x000000FF) !== 0;
    }

    ensureAvailable(x, y) {
        if (!(x in this.container)) {
            this.container[x] = {};
        }
        if (!(y in this.container[x])) {
            this.container[x][y] = 0xFF000000;
        }
    }

    getMask(x, y) {
        if (!(x in this.container)) return null;
        if (!(y in this.container[x])) return null;
        return this.container[x][y];

    }

    setMask(xKey, yKey, value) {
        this.ensureAvailable(xKey, yKey);
        this.container[xKey][yKey] = value;
    }

    union(that) {
        let result = new Mask();

        let xKeys = safe_key_union(this.container, that.container);
        for (const xKey of xKeys) {
            let yKeys = safe_key_union(this.container[xKey], that.container[xKey]);
            for (const yKey of yKeys) {
                const thisValue = this.getMask(xKey, yKey);
                const thatValue = that.getMask(xKey, yKey);

                let value;
                if (thisValue === null || thisValue === undefined) {
                    value = thatValue;
                } else if (thatValue === null || thatValue === undefined) {
                    value = thisValue;
                } else {
                    value = thisValue | thatValue;
                }
                result.setMask(xKey, yKey, value);
            }
        }

        return result;
    }

    calcWidth() {
        let min_x = Number.MAX_VALUE;
        let max_x = -Number.MAX_VALUE;
        for (let x in this.container) {
            if (!this.container.hasOwnProperty(x)) continue;
            x = parseInt(x);
            if (x < min_x) {
                min_x = x;
            }
            if (x > max_x) {
                max_x = x;
            }
        }
        let d_x = max_x - min_x;
        return d_x;
    }

    calcHeight() {
        let min_y = Number.MAX_VALUE;
        let max_y = -Number.MAX_VALUE;
        for (let x in this.container) {
            if (!this.container.hasOwnProperty(x)) continue;
            x = parseInt(x);

            for (let y in this.container[x]) {
                if (!this.container[x].hasOwnProperty(y)) continue;
                y = parseInt(y);

                if (y < min_y) {
                    min_y = y;
                }
                if (y > max_y) {
                    max_y = y;
                }
            }
        }
        let d_y = max_y - min_y;
        return d_y;
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    coordinateInside(x, y) {
        return !(x < this.x || y < this.y || x >= this.x + this.w || y >= this.y + this.h);
    }

    area() {
        return this.w * this.h;
    }

    scale(w_scalar, h_scalar) {
        const width_increase = Math.ceil(this.w * w_scalar) - this.w;
        const height_increase = Math.ceil(this.h * h_scalar) - this.h;

        this.x -= Math.ceil(width_increase / 2.0);
        this.y -= Math.ceil(height_increase / 2.0);

        this.w += width_increase;
        this.h += height_increase;
    }

    scaled(w_scalar, h_scalar) {
        const new_rect = this.clone();
        new_rect.scale(w_scalar, h_scalar);
        return new_rect;
    }

    stretch(width, height) {
        this.x -= width;
        this.w += 2 * width;

        this.y -= height;
        this.h += 2 * height;
    }

    stretched(width, height) {
        const new_rect = new Rectangle(this.x, this.y, this.w, this.h);
        new_rect.stretch(width, height);
        return new_rect;
    }

    resize(width, height) {
        this.x -= Math.ceil(width / 2);
        this.w += width;

        this.y -= Math.ceil(height / 2);
        this.h += height;
    }

    resized(width, height) {
        const new_rect = new Rectangle(this.x, this.y, this.w, this.h);
        new_rect.resize(width, height);
        return new_rect;
    }


    clone() {
        return new Rectangle(this.x, this.y, this.w, this.h);
    }

    global_cropped(x, y, w, h) {
        const result = this.clone();
        result.x = Math.max(result.x, x);
        result.y = Math.max(result.y, y);

        const x2 = x + w;
        const y2 = y + h;

        const result_x2 = result.x + result.w;
        const result_y2 = result.y + result.h;

        const target_result_x2 = Math.min(x2, result_x2);
        const target_result_y2 = Math.min(y2, result_y2);

        result.w = target_result_x2 - result.x;
        result.h = target_result_y2 - result.y;

        return result;
    }

    shifted(x, y) {
        const result = this.clone();
        result.x += x;
        result.y += y;
        return result;
    }

    x2() {
        return this.x + this.w;
    }

    y2() {
        return this.y + this.h;
    }

    cx() {
        return Math.floor(this.x + this.w/2);
    }

    cy() {
        return Math.floor(this.y + this.h/2);
    }
}

class GlitchConfig {
    constructor() {
        this.r_channel_intensity = 0;
        this.g_channel_intensity = 0;
        this.b_channel_intensity = 0;
        this.r_negate_intensity = 0;
        this.g_negate_intensity = 0;
        this.b_negate_intensity = 0;
        this.shift_horizontal = false;
        this.shift_vertical = false;
        this.h_bar_size_range = [0, 0];
        this.v_bar_size_range = [0, 0];
        this.shift_intensity_range = [0, 0];
    }

    set_channel_intensities(value) {
        this.r_channel_intensity = value;
        this.g_channel_intensity = value;
        this.b_channel_intensity = value;
    }

    set_negation_intensities(value) {
        this.r_negate_intensity = value;
        this.g_negate_intensity = value;
        this.b_negate_intensity = value;
    }

    set_all_intensities(value) {
        this.set_channel_intensities(value);
        this.set_negation_intensities(value);
    }
}

class ImageProcessor {
    sobelArea = this.sobelAreaPrewitt;

    constructor(original, configurations) {

        //this.sum = 0;
        this.effects_applied = 0;
        this.marvin_out = original;
        this.source = document.createElement("canvas");
        this.source.width = original.canvas.width;
        this.source.height = original.canvas.height;
        this.sourcectx = this.source.getContext("2d");
        this.sourcectx.drawImage(original.canvas, 0, 0, original.canvas.width, original.canvas.height);

        this.mask = document.createElement("canvas");
        this.mask.width = original.canvas.width;
        this.mask.height = original.canvas.height;
        this.maskctx = this.mask.getContext("2d");
        this.maskctx.fillStyle = "rgba(0,0,0,0)";
        this.maskctx.fillRect(0, 0, original.canvas.width, original.canvas.height);
        this.maskctx.fillStyle = "#fff";

        this.bar_configuration = configurations.bar_configuration;
        this.pixel_configuration = configurations.pixel_configuration;
        this.blur_configuration = configurations.blur_configuration;
        this.glitch_configuration = configurations.glitch_configuration;
        this.triangle_configuration = configurations.triangle_configuration;
        this.sticker_configuration = configurations.sticker_configuration;
        this.sticker_collections = configurations.sticker_collections;
        this.sobel_configuration = configurations.sobel_configuration;
        this.splatter_configuration = configurations.splatter_configuration;
        this.reverse_mode_configuration = configurations.reverse_mode_configuration;
        this.lock_configuration = configurations.lock_configuration;
        this.word_wall_configuration = configurations.word_wall_configuration;

        this.natural_width = original.canvas.width;
        this.natural_height = original.canvas.height;

        this.blurred = null;

        this.triangulized = false;
        this.sobelized = false;
        this.splatterized = false;

        this.per_layer_queues = [];
    }

    prepareMask(rect, config, smoothing = 0) {
        //rect = rect.clone();

        this.maskctx.save();
        if (smoothing > 0) {
            this.maskctx.filter = "blur(" + smoothing + "px)";
            //rect.x += smoothing;
            //rect.y += smoothing;
            //rect.w -= smoothing;
            //rect.h -= smoothing;
        }

        switch (config._shape) {
            //switch (3) {
            case 1:
                this.maskctx.beginPath();
                this.maskctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w / 2, rect.h / 2), 0, 2 * Math.PI);
                this.maskctx.fill();
                break;
            case 2:
                this.maskctx.beginPath();
                this.maskctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, rect.h / 2, 0, 0, 4 * Math.PI);
                this.maskctx.fill();
                break;
            case 3:  // Heart
                //Heart looks better when not streched so we adjust the witdh / height ratio to be 1

                let rwh = (rect.w + rect.h) / 2;
                rect.resize((rwh - rect.w), (rwh - rect.h));
                /*
                let x = rect.x+rect.w/2;
                let y = rect.y;
                let width = rect.w;//Math.min(rect.w, rect.h) ;
                let height = rect.h;

                this.maskctx.save();
                this.maskctx.beginPath();
                let topCurveHeight = height * 0.3;
                this.maskctx.moveTo(x, y + topCurveHeight);
                // top left curve
                this.maskctx.bezierCurveTo(
                    x, y,
                    x - width / 2, y,
                    x - width / 2, y + topCurveHeight
                );

                // bottom left curve
                this.maskctx.bezierCurveTo(
                    x - width / 2, y + (height + topCurveHeight) / 2,
                    x, y + (height + topCurveHeight) / 2,
                    x, y + height
                );

                // bottom right curve
                this.maskctx.bezierCurveTo(
                    x, y + (height + topCurveHeight) / 2,
                    x + width / 2, y + (height + topCurveHeight) / 2,
                    x + width / 2, y + topCurveHeight
                );

                // top right curve
                this.maskctx.bezierCurveTo(
                    x + width / 2, y,
                    x, y,
                    x, y + topCurveHeight
                );

                this.maskctx.closePath();
                //ctx.fillStyle = color;
                this.maskctx.fill();
                this.maskctx.restore();
                break;
                */

                let x = rect.x + rect.w / 2;
                let y = rect.y;
                let width = rect.w;//Math.min(rect.w, rect.h) ;
                let height = rect.h;
                let topCurveHeight = height * 0.3;
                this.maskctx.save();
                this.maskctx.beginPath();
                this.maskctx.moveTo(x, y + topCurveHeight);
                this.maskctx.bezierCurveTo(x, y, x - width, y, x, y + height);

                this.maskctx.moveTo(x, y + topCurveHeight);
                this.maskctx.bezierCurveTo(x, y, x + width, y, x, y + height);
                this.maskctx.closePath();
                this.maskctx.fill();
                this.maskctx.restore();

                break;
            default:
                //Rectangle
                this.maskctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        }
        this.maskctx.restore();
    }

    prepareTextMask(c){
        const word_wall_configuration = this.word_wall_configuration;
        if(word_wall_configuration.enabled && word_wall_configuration.text){
            c.save();
            let fontSize = Math.ceil(this.natural_height/100*word_wall_configuration.font_size);

            c.font = fontSize+"px Segoe UI";
            c.globalCompositeOperation = "destination-out";
            c.fillStyle = "rgba(255,255,255,0.99)";

            let gap = word_wall_configuration.distance_horizontal;
            gap =  new Array(gap+1).join(" ");
            let txtHeight = Math.ceil(this.natural_height/100*word_wall_configuration.distance_vertical);
            let offset = Math.ceil(this.natural_height/100*word_wall_configuration.offset); // idea: animated offset increase
            let textpool = [...word_wall_configuration.text];
            let txt = textpool.sort(() => 0.5 - Math.random())[0];
            if(word_wall_configuration.text_mode == 1){
                let r = [];
                for (let i = 0; i <  word_wall_configuration.text.length; i++) {
                    r.push(textpool.sort(() => 0.5 - Math.random())[0]);
                }
                txt = r.join(gap);
            }else if(word_wall_configuration.text_mode == 2){
                txt = textpool.join(gap);
            }
            let w = Math.ceil(c.measureText(txt+gap).width);
            offset = offset%w;
            for (let i = 0; i < Math.ceil(this.natural_height / txtHeight); i++) {
                let w_required = this.natural_width+i*offset;
                let t = txt;
                t = new Array(Math.ceil(w_required/w)+2).join(txt + gap);
                c.fillText(t, -(i * offset), i * txtHeight);
            }
            c.restore();
        }
    }

    pixelateArea(rect) {
        const pixel_configuration = this.pixel_configuration;

        rect = rect.scaled(pixel_configuration._scale, pixel_configuration._scale);
        if (pixel_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, pixel_configuration);
            this.prepareMask(rect, pixel_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, pixel_configuration);
        }

        if (!this.reverse_mode_configuration.enabled) {
            let distance = pixel_configuration._distance;
            let box_size = pixel_configuration._pixel_size;
            // TODO fix _geometry to be an int (or other non magic-number value)
            let geometry = parseInt(pixel_configuration._geometry);
            if (pixel_configuration._pixel_size_mode === 0) {
                const smallest_dimension = Math.min(this.natural_height, this.natural_width);
                box_size = Math.ceil(smallest_dimension / 100 * pixel_configuration._pixel_size);
            }
            if (geometry === 1) {
                // Hexelate
                hexelate_area(this.sourcectx, rect, box_size, distance, false, this.marvin_out, this.pixel_configuration._grayscale);
                // Hexelate glitch
            } else if (geometry === 2) {
                hexelate_area(this.sourcectx, rect, box_size, distance, true, this.marvin_out, this.pixel_configuration._grayscale);
            } else {
                pixelate_rectangle(this.sourcectx, rect, box_size, distance, this.marvin_out, this.pixel_configuration._grayscale);
            }
        }
    }

    blurArea(rect) {
        const blur_configuration = this.blur_configuration;
        rect = rect.scaled(blur_configuration._scale, blur_configuration._scale);
        if (this.blurred == null) {
            this.marvin_out.update();
            this.blurred = generateBaseBlurImproved(this.marvin_out.canvas, blur_configuration._blur_strength, blur_configuration._grayscale);
        }
        if (blur_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, blur_configuration);
            this.prepareMask(rect, blur_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, blur_configuration);
        }
        if (!this.reverse_mode_configuration.enabled) {
            this.sourcectx.drawImage(this.blurred, rect.x, rect.y, rect.w, rect.h, rect.x, rect.y, rect.w, rect.h);
        }
    }

    triangulizeArea(rect) {
        const triangulize_configuration = this.triangle_configuration;
        rect = rect.scaled(triangulize_configuration._scale, triangulize_configuration._scale);

        if (triangulize_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, triangulize_configuration);
            this.prepareMask(rect, triangulize_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, triangulize_configuration);
        }

        if (!this.reverse_mode_configuration.enabled && !this.triangulized) {
            this.triangulized = true;
            let imageData = this.sourcectx.getImageData(0, 0, this.source.width, this.source.height);
            let vtc = triangulize_configuration.vertexCount;
            if (triangulize_configuration.vertexMode) {
                vtc = Math.ceil(((this.source.width + this.source.height) / 100) * triangulize_configuration.vertexPercentage);
            }
            let triangulationParams = {
                accuracy: triangulize_configuration.accuracy,
                blur: triangulize_configuration.blur,
                threshold: triangulize_configuration.threshold,
                vertexCount: vtc,
                fill: triangulize_configuration.fill,
                stroke: triangulize_configuration.stroke,
                strokeWidth: triangulize_configuration.strokeWidth,
                gradients: triangulize_configuration.gradients,
                gradientStops: triangulize_configuration.gradientStops,
                lineJoin: triangulize_configuration.lineJoin,
                transparentColor: triangulize_configuration.transparentColor,
            };
            let triangulizedImageData = triangulate(triangulationParams)
                .fromImageDataSync(imageData)
                .toImageDataSync();
            this.sourcectx.putImageData(triangulizedImageData, 0, 0);
        }

    }

    blackenArea(rect) {
        const bar_configuration = this.bar_configuration;
        rect = rect.scaled(bar_configuration._scale, bar_configuration._scale);

        if (bar_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, bar_configuration);
            this.prepareMask(rect, bar_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, bar_configuration);
        }

        // If not inverse
        if (!this.reverse_mode_configuration.enabled) {
            this.sourcectx.save();
            if (bar_configuration._feathering > 0) {
                let smoothing_strength = calc_smoothing(rect, bar_configuration);

                this.sourcectx.filter = "blur(" + smoothing_strength + "px)";
            }
            this.sourcectx.fillStyle = bar_configuration._color;
            this.sourcectx.fillRect(rect.x, rect.y, rect.w, rect.h);
            this.sourcectx.restore();
        }
    }

    neppyfiArea(klass, rect) {
        const dummyConfig = {};
        let config = this.glitch_configuration;
        // The amount of layers that will be generated.
        dummyConfig.number_of_layers = config.glitch_types[1].number_of_layers;

        // The fill of these layers
        /*
        dummyConfig.gradient_configuration = [
            {"offset": 0.05, "color": "#63A3FF5F"},
            {"offset": 0.2, "color": "#B6DCFFCF"},
            {"offset": 0.3, "color": "#B6DCFFCF"},
            {"offset": 0.5, "color": "#72BEFF5F"},
        ]*/
        //dummyConfig.gradient_configuration = [{"offset": 0.0, "color": "#0000007F"},];
        dummyConfig.gradient_configuration = config.glitch_types[1].gradients;
        dummyConfig.is_border_enabled = config.glitch_types[1].border;
        // Panes will not be smaller than min_scale times the size of the detection area.
        dummyConfig.min_scale = config.glitch_types[1].min_scale;

        // Panes will be at most max_scale times the size of the detection area.
        // NOTE: Similar to regular scale, but should default to like 1.5 instead of 1.
        dummyConfig.max_scale = config._scale+(config.glitch_types[1].max_scale-1.0);//bar_configuration._scale + 0.45;

        // How far are the layers allowed to scatter?
        // NOTE: Range from 0.0 upwards. As a factor of the detection range.
        dummyConfig.scatter = config.glitch_types[1].scatter;

        // Probability of a pair of boxes appearing instead of one box.
        dummyConfig.split_chance = config.glitch_types[1].split_chance;

        if (Math.max(rect.w, rect.h) < 600) {
            dummyConfig.number_of_layers -= 1;
        }
        if (klass.erotic) {
            dummyConfig.number_of_layers += 1;
        }


        let random_width_scale = 1;
        let random_height_scale = 1;
        let x_shift = 0;
        let y_shift = 0;

        for (let i = 0; i < dummyConfig.number_of_layers; i++) {

            if (i > 0 && Math.random() < dummyConfig.split_chance) {
                this.neppySplit(rect, dummyConfig);
            } else {
                // Regular layer
                const random_rect = rect.scaled(random_width_scale, random_height_scale)
                    .shifted(x_shift, y_shift)
                    .global_cropped(0, 0, this.natural_width, this.natural_height);
                this.neppyFiOnce(random_rect, dummyConfig);
            }

            random_width_scale = generate_random_float_in_range(dummyConfig.min_scale, dummyConfig.max_scale);
            random_height_scale = generate_random_float_in_range(dummyConfig.min_scale, dummyConfig.max_scale);
            x_shift = generate_random_in_range(-rect.w * dummyConfig.scatter, rect.w * dummyConfig.scatter);
            y_shift = generate_random_in_range(-rect.h * dummyConfig.scatter, rect.h * dummyConfig.scatter);
        }
    }

    neppySplit(rect, dummyConfig) {
        // Split layer
        let rect1, rect2;
        if (Math.random() < 0.5) {
            // Horizontal split
            rect1 = rect.scaled(1, 0.5);
            rect2 = rect1.shifted(0, rect1.h / 2);
            rect1 = rect1.shifted(0, -rect1.h / 2);

        } else {
            // Vertical split
            rect1 = rect.scaled(0.5, 1);
            rect2 = rect1.shifted(rect1.w / 2, 0);
            rect1 = rect1.shifted(-rect1.w / 2, 0);

        }

        let x_shift = generate_random_in_range(-rect1.w * dummyConfig.scatter, rect1.w * dummyConfig.scatter);
        let y_shift = generate_random_in_range(-rect1.h * dummyConfig.scatter, rect1.h * dummyConfig.scatter);
        let random_width_scale = generate_random_float_in_range(dummyConfig.min_scale, dummyConfig.max_scale);
        let random_height_scale = generate_random_float_in_range(dummyConfig.min_scale, dummyConfig.max_scale);

        rect1 = rect1.scaled(random_width_scale, random_height_scale)
            .shifted(x_shift, y_shift)
            .global_cropped(0, 0, this.natural_width, this.natural_height);

        this.neppyFiOnce(rect1, dummyConfig);

        x_shift = generate_random_in_range(-rect2.w * dummyConfig.scatter, rect2.w * dummyConfig.scatter);
        y_shift = generate_random_in_range(-rect2.h * dummyConfig.scatter, rect2.h * dummyConfig.scatter);
        random_width_scale = generate_random_float_in_range(dummyConfig.min_scale, dummyConfig.max_scale);
        random_height_scale = generate_random_float_in_range(dummyConfig.min_scale, dummyConfig.max_scale);

        rect2 = rect2.scaled(random_width_scale, random_height_scale)
            .shifted(x_shift, y_shift)
            .global_cropped(0, 0, this.natural_width, this.natural_height);
        this.neppyFiOnce(rect2, dummyConfig);
    }

    neppyFiOnce(random_rect, dummyConfig) {

        const diagonal = Math.sqrt(random_rect.w * random_rect.w + random_rect.h * random_rect.h);

        // let shadow_blur_size = 30;

        const fill_gradient = this.sourcectx.createRadialGradient(random_rect.x, random_rect.y, 0, random_rect.x, random_rect.y, diagonal);
        for (const gradientConfigurationElement of dummyConfig.gradient_configuration) {
            fill_gradient.addColorStop(gradientConfigurationElement.offset, gradientConfigurationElement.color);
        }

        const edge_gradient_top = this.sourcectx.createLinearGradient(random_rect.x, random_rect.y, random_rect.x2(), random_rect.y);
        edge_gradient_top.addColorStop(0.90, "#FFFFFFCF");
        edge_gradient_top.addColorStop(0.98, "#FFFFFF00");

        const edge_gradient_left = this.sourcectx.createLinearGradient(random_rect.x, random_rect.y, random_rect.x, random_rect.y2());
        edge_gradient_left.addColorStop(0.90, "#FFFFFFCF");
        edge_gradient_left.addColorStop(0.98, "#FFFFFF00");


        //if (dummyConfig.gradient_configuration.length === 1) {
            // this.sourcectx.shadowBlur = shadow_blur_size;
            // this.prepareMask(random_rect.stretched(shadow_blur_size*2, shadow_blur_size*2), bar_configuration);
            this.prepareMask(random_rect, dummyConfig);
        //}

        if (!this.reverse_mode_configuration.enabled) {
            // const old_blur = this.sourcectx.shadowBlur;
            // const old_blur_color = this.sourcectx.shadowColor;
            this.sourcectx.fillStyle = fill_gradient;
            // if (dummyConfig.gradient_configuration.length === 1) {
                // this.sourcectx.shadowBlur = shadow_blur_size;
                // this.sourcectx.shadowColor = "black";
            // }
            this.sourcectx.fillRect(random_rect.x, random_rect.y, random_rect.w, random_rect.h);
            // this.sourcectx.shadowBlur = old_blur;
            // this.sourcectx.shadowColor = old_blur_color;

            if (dummyConfig.is_border_enabled) {
                this.sourcectx.lineWidth = 2;
                this.sourcectx.beginPath();
                this.sourcectx.strokeStyle = edge_gradient_top;
                this.sourcectx.moveTo(random_rect.x + 1, random_rect.y + 1);
                this.sourcectx.lineTo(random_rect.x2() - 1, random_rect.y + 1);
                this.sourcectx.stroke();

                this.sourcectx.beginPath();
                this.sourcectx.strokeStyle = edge_gradient_left;
                this.sourcectx.moveTo(random_rect.x + 1, random_rect.y2() - 1);
                this.sourcectx.lineTo(random_rect.x + 1, random_rect.y + 1);
                this.sourcectx.stroke();
            }

        }
    }


    sobelAreaSingle(rect) {
        const sobel_configuration = this.sobel_configuration;
        rect = rect.scaled(sobel_configuration._scale, sobel_configuration._scale);
        if (sobel_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, sobel_configuration);
            this.prepareMask(rect, sobel_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, sobel_configuration);
        }
        // If not inverse
        if (!this.reverse_mode_configuration.enabled) {
            let imageData = this.sourcectx.getImageData(rect.x, rect.y, rect.w, rect.h);
            let sobelData = Sobel(imageData);
            let sobelImageData = sobelData.toImageData();
            this.sourcectx.putImageData(sobelImageData, rect.x, rect.y);
        }
    }

    sobelAreaAll(rect, ctx_out, reverse = false) {
        const sobel_configuration = this.sobel_configuration;
        rect = rect.scaled(sobel_configuration._scale, sobel_configuration._scale);

        if (sobel_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, sobel_configuration);
            this.prepareMask(rect, sobel_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, sobel_configuration);
        }

        // If not inverse
        if (!this.reverse_mode_configuration.enabled || reverse) {
            if (this.sobelized === false) {
                this.sobelized = true;
                let imageData = ctx_out.getImageData(0, 0, this.source.width, this.source.height);
                let sobelData = Sobel(imageData);
                let sobelImageData = sobelData.toImageData();
                ctx_out.putImageData(sobelImageData, 0, 0);
            }
        }
    }

    sobelAreaMarvin(rect, ctx_out, reverse = false) {
        const sobel_configuration = this.sobel_configuration;
        rect = rect.scaled(sobel_configuration._scale, sobel_configuration._scale);
        if (sobel_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, sobel_configuration);
            this.prepareMask(rect, sobel_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, sobel_configuration);
        }
        // If not inverse
        if (!this.reverse_mode_configuration.enabled || reverse) {
            if (this.sobelized === false) {
                this.sobelized = true;
                let imageOut = new MarvinImage(this.natural_width, this.natural_height);
                Marvin.prewitt(this.marvin_out, imageOut);
                Marvin.invertColors(imageOut, imageOut);
                Marvin.thresholding(imageOut, imageOut, 250);
                ctx_out.putImageData(imageOut.imageData, 0, 0);
            }
        }
    }

    sobelAreaPrewitt(rect, ctx_out, reverse = false) {
        const sobel_configuration = this.sobel_configuration;
        rect = rect.scaled(sobel_configuration._scale, sobel_configuration._scale);

        if (sobel_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, sobel_configuration);
            this.prepareMask(rect, sobel_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, sobel_configuration);
        }
        // If not inverse
        if (!this.reverse_mode_configuration.enabled || reverse) {
            if (this.sobelized === false) {
                this.sobelized = true;
                let sobelImageData = this.gradient(ctx_out.getImageData(0, 0, this.source.width, this.source.height));
                if (this.sobel_configuration._color_inverted) {
                    const canvasElement = document.createElement("canvas");
                    canvasElement.width = this.source.width;
                    canvasElement.height = this.source.height;
                    const ctx = canvasElement.getContext("2d");
                    ctx.putImageData(sobelImageData, 0, 0);
                    ctx.globalCompositeOperation = "exclusion";
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, this.source.width, this.source.height);
                    ctx_out.drawImage(canvasElement, 0, 0, this.mask.width, this.mask.height);
                    /*
                    ctx_out.putImageData(sobelImageData,0,0);
                    ctx_out.globalCompositeOperation='exclusion';
                    ctx_out.fillStyle='white';
                    ctx_out.fillRect(0,0,this.source.width,  this.source.height);
                    */
                } else {
                    ctx_out.putImageData(sobelImageData, 0, 0);
                }
            }
        }
    }

    splashPrepare() {
        const splatter_configuration = this.splatter_configuration;
        let iterations = splatter_configuration._splatter_iterations;
        let childs = splatter_configuration._splatter_sub_amount;
        let size_modifier = 8 / splatter_configuration._splatter_size;
        let ctx = this.sourcectx;
        if (this.reverse_mode_configuration.enabled) {
            if (!this.splatterized) {
                this.splatterized = true;
                this.maskctx.fillStyle = "#fff";
                this.maskctx.fillRect(0, 0, this.natural_width, this.natural_height);
                let imgrect = new Rectangle(0, 0, this.natural_width, this.natural_height);
                let amR = Math.ceil(Math.sqrt(imgrect.w * imgrect.h) / 10 * splatter_configuration._splatter_amount);
                for (let i = 0; i < amR; i += 1) {
                    let iterations_masc = iterations;
                    let target = this.splash(ctx, imgrect, splatter_configuration, size_modifier);
                    if (target && iterations_masc > 0) {
                        let color = target.color;
                        this.splashRecursive(ctx, target, splatter_configuration, color, size_modifier, childs, iterations_masc);
                    }
                }
            }
        } else {
            this.maskctx.fillStyle = "#fff";
            this.maskctx.fillRect(0, 0, this.natural_width, this.natural_height);
        }

    }

    splashBlobs(rect) {
        const splatter_configuration = this.splatter_configuration;
        rect = rect.scaled(splatter_configuration._scale, splatter_configuration._scale);
        let size_modifier = 8 / splatter_configuration._splatter_size;
        let am = Math.ceil(Math.sqrt(rect.w * rect.h) / 10 * splatter_configuration._splatter_amount);
        let iterations = splatter_configuration._splatter_iterations;
        let childs = splatter_configuration._splatter_sub_amount;
        let color = null;
        if (!(splatter_configuration._splatter_color_scheme.length === 0)) {
            color = splatter_configuration._splatter_color_scheme.sort(() => 0.5 - Math.random())[0];
        }
        let ctx = this.sourcectx;

        this.maskctx.save();
        if (this.reverse_mode_configuration.enabled) {
            ctx = this.maskctx;
            color = "rgba(255,255,255,1)";
            ctx.fillStyle = "#fff";
            ctx.globalCompositeOperation = "destination-out";
        }
        for (let i = 0; i < am; i += 1) {
            let target = this.splash(ctx, rect, splatter_configuration, size_modifier, color);
            if (target && iterations > 0) {
                let color = target.color;

                if (!(splatter_configuration._splatter_color_scheme.length === 0)) {
                    color = splatter_configuration._splatter_color_scheme.sort(() => 0.5 - Math.random())[0];
                }
                this.splashRecursive(ctx, target, splatter_configuration, color, size_modifier, childs, iterations);
            }
        }
        this.maskctx.restore();
    }

    splashRecursive(ctx, target, splatter_configuration, color, size_modifier, childs, iterations, angle = null) {
        iterations = iterations - 1;
        let size = target.size;
        for (let k = 0; k < childs; k += 1) {
            let dist = Math.floor(Math.random() * size * 0.8 + size);
            angle = this.angleRND(angle);
            let xC = target.x + dist * Math.cos(angle);
            let yC = target.y + dist * Math.sin(angle);
            let nw = (size * 1.5 - dist * 0.5) * splatter_configuration._splatter_sub_size;
            let nh = nw;
            if (nw <= 2) {
                continue;
            }
            let sub_rect = new Rectangle(xC - nw / 2, yC - nw / 2, nw, nh);
            let ntarget = this.splash(ctx, sub_rect, splatter_configuration, size_modifier, color);
            if (iterations > 0 && ntarget) {
                this.splashRecursive(ctx, ntarget, splatter_configuration, color, size_modifier, childs, iterations, angle);
            }
        }
    }

    splash(ctx, rect, splatter_configuration, size_modifier, color = null) {
        let [rndX, rndY] = this.centeredRND(rect.x, rect.w, rect.y, rect.h, splatter_configuration._splatter_centering);
        if (!rndX || !rndY) {
            return null;
        }
        let dW = rect.w;
        let dH = rect.h;
        let dD = (dW + dH) / size_modifier;
        let rndSize = Math.floor(Math.random() * (dD - 1)) + 1;
        ctx.beginPath();
        if (color) {
            ctx.fillStyle = color;
        } else {
            let pixelArr = ctx.getImageData(rndX, rndY, 1, 1).data;
            color = "rgba(" + pixelArr[0] + "," + pixelArr[1] + "," + pixelArr[2] + "," + splatter_configuration._splatter_transparency + ")";
            ctx.fillStyle = color;
        }
        ctx.arc(rndX, rndY, rndSize, 0, 2 * Math.PI);
        ctx.fill();
        return {x: rndX, y: rndY, d: dD, size: rndSize, color: color};
    }

    centeredRND(x, w, y, h, wdh) {
        let rndY = Math.floor(Math.random() * (h)) + y;
        let rndX = Math.floor(Math.random() * (w)) + x;
        if (wdh > 0) {
            for (let i = 0; i < wdh - 1; i++) {
                rndY = (rndY + Math.floor(Math.random() * (h)) + y);
                rndX = (rndX + Math.floor(Math.random() * (w)) + x);
            }
            rndY /= wdh;
            rndX /= wdh;
            rndY = Math.floor(rndY);
            rndX = Math.floor(rndX);
        }
        return [rndX, rndY];
    }

    angleRND(angle) {
        let new_angle;
        if (angle) {
            new_angle = angle + ((Math.round(Math.random()) * 2 - 1) * Math.floor(Math.random() * (90)));
        } else {
            new_angle = Math.floor(Math.random() * (360));
        }
        return new_angle;
    }

    conv3x(data, idx, w, m) {
        return (m[0] * data[idx - w - 4] + m[1] * data[idx - 4] + m[2] * data[idx + w - 4] - m[0] * data[idx - w + 4] - m[1] * data[idx + 4] - m[2] * data[idx + 4 + 4]);
    }

    conv3y(data, idx, w, m) {
        return (m[0] * data[idx - w - 4] + m[1] * data[idx - w] + m[2] * data[idx - w + 4] - (m[0] * data[idx + w - 4] + m[1] * data[idx + w] + m[2] * data[idx + w + 4]));
    }

    gradient_internal(pixels, mask) {
        var data = pixels.data;
        var w = pixels.width * 4;
        var l = data.length - w - 4;
        var buff = new data.constructor(new ArrayBuffer(data.length));

        for (var i = w + 4; i < l; i += 4) {
            var dx = this.conv3x(data, i, w, mask);
            var dy = this.conv3y(data, i, w, mask);
            buff[i] = buff[i + 1] = buff[i + 2] = Math.sqrt(dx * dx + dy * dy);
            buff[i + 3] = 255;
        }
        pixels.data.set(buff);
    }

    gradient(imagedata) {
        this.gradient_internal(imagedata, [1, 2, 1]); // Apply Sobel operator
        return imagedata;
    }

    /**
     * Invertes the colors of a given image(data).
     * ! Good Performance in Background, BAD PERFORMANCE ON CONTENT SCRIPT / VIDEOS
     * @param imgData - imageData Object
     */
    invertImageData(imgData) {
        for (let i = 0; i < imgData.data.length; i += 4) {
            let r = imgData.data[i];
            let g = imgData.data[i + 1];
            let b = imgData.data[i + 2];
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
            imgData.data[i] = r;
            imgData.data[i + 1] = g;
            imgData.data[i + 2] = b;
            imgData.data[i + 3] = 255;
        }
    }

    applySticker(klass, rect, cache) {
        const sticker_configuration = this.sticker_configuration;
        rect = rect.scaled(sticker_configuration._scale, sticker_configuration._scale);

        let sticker_collections = this.sticker_collections.filter(obj => {
            return obj._enabled;
        });
        if(sticker_collections.length === 0){
            return;
        }
        let stickers = sticker_collections[0]._stickers;


        if (sticker_configuration._consistency && "sticker_consistency_" + klass.key in cache) {
            stickers = cache["sticker_consistency_" + klass.key];
        } else if (sticker_configuration._draw_mode === 0) {
            //Completely random, every box a sticker from any collection
            stickers = sticker_collections[Math.floor(Math.random() * sticker_collections.length)]._stickers;
        } else if (sticker_configuration._draw_mode === 1) {
            // One collection per image
            let index;
            if ("sticker_draw_collection" in cache) {
                index = cache.sticker_draw_collection;
            } else {
                index = Math.floor(Math.random() * sticker_collections.length);
                cache.sticker_draw_collection = index;
            }
            stickers = sticker_collections[index]._stickers;
        } else if (sticker_configuration._draw_mode === 2) {
            stickers = [];
            sticker_collections.forEach(function (c) {
                stickers = stickers.concat(getStickersByGroup(c, sticker_configuration._groups));
            });
        }
        //TODO: If -1 klass because of merge, try to find sticker which matches all first
        if (klass.index >= 0) {
            stickers = stickers.filter(sticker => {
                return sticker.klasses.some(clas => clas.key === klass.key);
            });
        }
        if (stickers.length === 0) {
            return;
        }
        let sticker = this.draw_sticker(stickers);
        if (sticker_configuration._consistency && !("sticker_consistency_" + klass.key in cache)) {
            cache["sticker_consistency_" + klass.key] = [sticker];
        }

        rect = rect.scaled(sticker.scale, sticker.scale);
        let buffer = sticker.file;
        const canvasElement = document.createElement("canvas");
        canvasElement.width = sticker.width;
        canvasElement.height = sticker.height;
        const ctx = canvasElement.getContext("2d");
        let imageData = ctx.createImageData(canvasElement.width, canvasElement.height);
        if (buffer != null) {
            imageData.data.set(buffer);
        } else {
            console.error("NULL Data for Sticker", sticker);
        }

        ctx.putImageData(imageData, 0, 0);
        let hRatio = rect.w / canvasElement.width;
        let vRatio = rect.h / canvasElement.height;
        let ratio = Math.max(hRatio, vRatio);
        let w_adjusted = canvasElement.width * ratio;
        let h_adjusted = canvasElement.height * ratio;
        let x_adjusted = rect.x - (Math.abs(rect.w - w_adjusted) / 2);
        let y_adjusted = rect.y - (Math.abs(rect.h - h_adjusted) / 2);
        rect = new Rectangle(x_adjusted, y_adjusted, w_adjusted, h_adjusted);
        if (sticker_configuration._feathering > 0) {
            let smoothing_strength = calc_smoothing(rect, sticker_configuration);
            this.prepareMask(rect, sticker_configuration, smoothing_strength);
            rect.resize(smoothing_strength * 2, smoothing_strength * 2);
        } else {
            this.prepareMask(rect, sticker_configuration);
        }

        // If not inverse
        if (!this.reverse_mode_configuration.enabled) {
            this.sourcectx.drawImage(canvasElement, rect.x, rect.y, rect.w, rect.h);
        }
    }

    draw_sticker(stickers) {
        if (stickers.length === 0) {
            return null;
        }

        let i;
        let weights = [];
        for (i = 0; i < stickers.length; i++) {
            if (!stickers[i].chance && stickers[i].chance !== 0) {
                stickers[i].chance = 1;
            }
            weights[i] = stickers[i].chance + (weights[i - 1] || 0);
        }
        let random = Math.random() * weights[weights.length - 1];
        for (i = 0; i < weights.length; i++) {
            if (weights[i] > random) {
                break;
            }
        }
        return stickers[i];
    }

    drawTextBox(ctx, x, y, text, bg_color, baseline = "top", font_sz = 16, font_family = "sans-serif", fg_color = "#000000") {
        ctx.font = `${font_sz}px ${font_family}`;
        ctx.textBaseline = baseline;

        const metrics = ctx.measureText(text);
        const string_width = Math.ceil(ctx.measureText(text).width);
        const font_height = font_sz;

        let y_adjust = baseline === "bottom" ? -(2 + font_height) : 0;
        ctx.fillStyle = bg_color;
        ctx.fillRect(x, y + y_adjust, string_width + 4, font_height + 4);

        // text = text + `sz: ${string_width}`;
        ctx.fillStyle = fg_color;
        ctx.fillText(text, x, y);
    }

    namedBoxRect(klass, score, rect) {

        this.prepareMask(rect, {_shape: null});

        const bg_color = "#00FFFF";

        let font_size = 2 + Math.ceil((this.natural_width * 14) / 1000);
        font_size = Math.max(9, font_size);

        const ctx = this.sourcectx;//this.marvin_out.ctx;

        ctx.strokeStyle = bg_color;
        ctx.fillStyle = bg_color;
        ctx.lineWidth = 4;

        if (this.lock_configuration.enabled) {
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        } else {
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        }

        let text_to_write = klass.name;
        this.drawTextBox(ctx, rect.x, rect.y, text_to_write, bg_color, "top", font_size);

        text_to_write = score;
        this.drawTextBox(ctx, rect.x, rect.y + rect.h, text_to_write, bg_color, "bottom", font_size - 2);

        //this.marvin_out.imageData = ctx.getImageData(0, 0, this.natural_width, this.natural_height);
        this.source.imageData = ctx.getImageData(0, 0, this.natural_width, this.natural_height);
    }

    fettyfiArea(klass, rect) {
        rect = rect.scaled(this.glitch_configuration._scale, this.glitch_configuration._scale);
        let effect_range = Math.ceil(0.3 * Math.min(rect.h, rect.w) * this.glitch_configuration.glitch_types[0].intensity_shift);
        let effect_bounds = rect.stretched(effect_range, effect_range);

        rect = rect.global_cropped(0, 0, this.natural_width, this.natural_height);
        effect_bounds = effect_bounds.global_cropped(0, 0, this.natural_width, this.natural_height);

        let mul = 1;
        if (klass.erotic) {
            mul = 5;
        }
        mul = Math.ceil(mul * this.glitch_configuration.glitch_types[0].intensity_color);


        const source_canvas = document.createElement("canvas");
        source_canvas.width = effect_bounds.w;
        source_canvas.height = effect_bounds.h;
        let source_ctx = source_canvas.getContext("2d");
        let sx = effect_bounds.x;
        let sy = effect_bounds.y;
        let sw = effect_bounds.w;
        let sh = effect_bounds.h;
        let dx = 0;
        let dy = 0;
        let dw = effect_bounds.w;
        let dh = effect_bounds.h;
        source_ctx.putImageData(this.sourcectx.getImageData(sx, sy, sw, sh), dx, dy);
        //We can prob. save some ms here as this.sourcectx.getImageData(sx, sy, sw, sh) (one line above) does already request all the pixels we need
        //so this is kinda redundant what we are doing here and just creates an offset where the array starts to contain pixels...
        //Also: We should do this once for the entire image and not once for each box, this takes 10ms or more to create... so we can save 100ms or more on many images
        const source_data_obj = source_ctx.getImageData(0, 0, source_canvas.width, source_canvas.height);

        let config;

        // Round 1:
        // Green, Horizontal, 50%, default bar & shift sizes
        config = new GlitchConfig();
        config.g_channel_intensity = 0.75 * mul;
        // config.set_channel_intensities(0.05 * mul);
        config.shift_horizontal = this.glitch_configuration.glitch_types[0].shift_horizontal;
        config.h_bar_size_range = [Math.floor(rect.h / 20), Math.ceil(rect.h / 10)];
        config.shift_intensity_range = [Math.round(effect_range / 4), effect_range];


        let t1_canvas = document.createElement("canvas");
        t1_canvas.width = effect_bounds.w;
        t1_canvas.height = effect_bounds.h;
        let t1_ctx = t1_canvas.getContext("2d");
        t1_ctx.putImageData(source_ctx.getImageData(dx, dy, dw, dh), dx, dy);


        let mask1 = this.neo_shift(source_ctx, source_data_obj, t1_ctx, t1_canvas, rect, effect_bounds, config);


        // Round 2:
        // Red, Vertical, 200%, default bar & shift sizes.
        config = new GlitchConfig();
        config.r_channel_intensity = 0.85 * (1 + mul);
        // config.set_channel_intensities(0.6 * mul);
        config.shift_vertical = this.glitch_configuration.glitch_types[0].shift_vertical;
        config.v_bar_size_range = [Math.floor(rect.w / 20), Math.ceil(rect.w / 10)];
        config.shift_intensity_range = [Math.round(effect_range / 12), Math.round(effect_range / 2)];

        let t2_canvas = document.createElement("canvas");
        t2_canvas.width = effect_bounds.w;
        t2_canvas.height = effect_bounds.h;
        let t2_ctx = t2_canvas.getContext("2d");
        t2_ctx.putImageData(t1_ctx.getImageData(dx, dy, dw, dh), dx, dy);

        /* Todo: enabling these lines will double the duration again, can we somehow improve this? */
        const t1_data_obj = t1_ctx.getImageData(0, 0, t1_canvas.width, t1_canvas.height);
        let mask2 = this.neo_shift(t1_ctx, t1_data_obj, t2_ctx, t2_canvas, rect, effect_bounds, config);
        let mask3 = mask1.union(mask2);
        // let mask3 = mask1;

        let area = effect_bounds.area();
        let logSize = Math.log(area);
        let sizeScalar = Math.round(logSize);


        this.enqueue(20 - sizeScalar, effect_bounds, t2_canvas, mask3);
    }

    enqueue(layer, rect, canvas, mask) {
        if (!(layer in this.per_layer_queues)) {
            this.per_layer_queues[layer] = [];
        }
        this.per_layer_queues[layer].push([rect, canvas, mask]);
    }

    prepareEffect(type, cache) {
        switch (type) {
            case effects.SPLATTER:
                this.splashPrepare();
                break;
        }
    }

    applyEffect(klass, score, rect, type, cache) {
        //let t0 = performance.now();
        this.effects_applied += 1;
        switch (type) {
            case effects.PIXEL:
                this.pixelateArea(rect);
                break;
            case effects.BLUR:
                this.blurArea(rect);
                break;
            case effects.BLACK:
                this.blackenArea(rect);
                break;
            case effects.BOX:
                this.namedBoxRect(klass, score, rect);
                break;
            case effects.TRIANGLE:
                this.triangulizeArea(rect);
                break;
            case effects.GLITCH:
                if(this.glitch_configuration.glitch_type == 0){
                    this.fettyfiArea(klass, rect);
                }else{
                    this.neppyfiArea(klass, rect);
                }
                break;
            case effects.STICKER:
                this.applySticker(klass, rect, cache);
                break;
            case effects.SOBEL:
                this.sobelArea(rect, this.sourcectx);
                break;
            case effects.SPLATTER:
                this.splashBlobs(rect);
                break;
            case effects.NONE:
                break;
        }
        //let t1 = performance.now();
        //console.log("Effect took " + (t1 - t0) + " ms.");
    }

    finalize(type, cache) {
        this.prepareTextMask(this.maskctx);

        this.sourcectx.globalCompositeOperation = "destination-in";
        this.sourcectx.drawImage(this.mask, 0, 0, this.mask.width, this.mask.height);
        //If inverse apply effect on bg layer
        let empty = this.effects_applied === 0;
        if(this.reverse_mode_configuration.process_no_result_censor_selection === 0) {
            empty = cache.valid_detections === 0;
        }else if(this.reverse_mode_configuration.process_no_result_censor_selection === 2){
            empty = (this.effects_applied === 0 && cache.valid_detections > 0) || cache.valid_detections === 0;
        }
        if (this.reverse_mode_configuration.enabled && (this.reverse_mode_configuration.process_no_result || !empty)) {
            let rect = null;
            switch (type) {
                case effects.PIXEL:
                    rect = new Rectangle(0, 0, this.natural_width, this.natural_height);
                    let box_size = this.pixel_configuration._pixel_size;
                    if (parseInt(this.pixel_configuration._pixel_size_mode) === 0) {
                        const smallest_dimension = Math.min(this.natural_height, this.natural_width);
                        box_size = Math.ceil(smallest_dimension / 100 * this.pixel_configuration._pixel_size);
                    }
                    if (parseInt(this.pixel_configuration._geometry) === 1) {
                        hexelate_area(this.marvin_out.ctx, rect, box_size, this.pixel_configuration._distance, false, this.marvin_out, this.pixel_configuration._grayscale);
                    } else if (parseInt(this.pixel_configuration._geometry) === 2) {
                        hexelate_area(this.marvin_out.ctx, rect, box_size, this.pixel_configuration._distance, true, this.marvin_out, this.pixel_configuration._grayscale);
                    } else {
                        pixelate_rectangle(this.marvin_out.ctx, rect, box_size, this.pixel_configuration._distance, this.marvin_out, this.pixel_configuration._grayscale);
                    }
                    break;
                case effects.BLUR:
                    if (this.blurred == null) {
                        this.marvin_out.update();
                        this.blurred = generateBaseBlurImproved(this.marvin_out.canvas, this.blur_configuration._blur_strength, this.blur_configuration._grayscale);
                    }
                    this.marvin_out.ctx.drawImage(this.blurred, 0, 0, this.natural_width, this.natural_height);
                    break;
                case effects.BLACK:
                    this.marvin_out.ctx.fillStyle = this.bar_configuration._color;
                    this.marvin_out.ctx.fillRect(0, 0, this.natural_width, this.natural_height);
                    break;
                case effects.TRIANGLE:
                    let imageData = this.marvin_out.ctx.getImageData(0, 0, this.source.width, this.source.height);
                    const triangulize_configuration = this.triangle_configuration;
                    let triangulationParams = {
                        accuracy: triangulize_configuration.accuracy,
                        blur: triangulize_configuration.blur,
                        threshold: triangulize_configuration.threshold,
                        vertexCount: triangulize_configuration.vertexCount,
                        fill: triangulize_configuration.fill,
                        stroke: triangulize_configuration.stroke,
                        strokeWidth: triangulize_configuration.strokeWidth,
                        gradients: triangulize_configuration.gradients,
                        gradientStops: triangulize_configuration.gradientStops,
                        lineJoin: triangulize_configuration.lineJoin,
                        transparentColor: triangulize_configuration.transparentColor,
                    };
                    let triangulizedImageData = triangulate(triangulationParams)
                        .fromImageDataSync(imageData)
                        .toImageDataSync();
                    this.marvin_out.ctx.putImageData(triangulizedImageData, 0, 0);
                    break;
                case effects.SOBEL:
                    rect = new Rectangle(0, 0, this.natural_width, this.natural_height);
                    this.sobelArea(rect, this.marvin_out.ctx, true);
                    break;
                case effects.BOX:
                    //this.namedBoxRect(klass, score, rect);
                    break;
                case effects.GLITCH:
                    //this.fettyfiArea(klass, rect);
                    break;
                case effects.STICKER:
                    //??
                    break;
                case effects.SPLATTER:
                    //rect = new Rectangle(0, 0, this.natural_width, this.natural_height);
                    //this.splashBlobs(rect, this.marvin_out.ctx, true);
                    break;
                case effects.NONE:
                    break;
            }
        }

        this.marvin_out.ctx.drawImage(this.source, 0, 0, this.mask.width, this.mask.height);
        this.marvin_out.imageData = this.marvin_out.ctx.getImageData(0, 0, this.natural_width, this.natural_height);

        //let t0 = performance.now();
        for (let layer_index = 0; layer_index < this.per_layer_queues.length; layer_index++) {
            if (layer_index in this.per_layer_queues) {
                let entries = this.per_layer_queues[layer_index];
                entries.forEach((entry) => {
                    let rect = entry[0];
                    let canvas = entry[1];
                    let mask = entry[2];
                    this.apply_section(rect, canvas, mask);
                });
            }
        }
        //let t1 = performance.now();
        //console.log("Effect layer_index took " + (t1 - t0) + " ms.");
        this.marvin_out.update();
    }

    apply_section(rect, canvas, mask) {
        //TODO: We should store the ctx or better the data object in the queue so we don't have to create it again and again
        const ctx = canvas.getContext("2d");
        // let failed = 0;
        // let success = 0;
        //
        // for (let x = 0; x < rect.w; x++) {
        //     for (let y = 0; y < rect.h; y++) {
        //         const fg_pixel = ctx.getImageData(x, y, 1, 1).data;
        //         const fr = Math.round(fg_pixel[0]);
        //         const fg = Math.round(fg_pixel[1]);
        //         const fb = Math.round(fg_pixel[2]);
        //
        //         if (fr === 0 && fg === 0 && fb === 0) {
        //             failed++;
        //         } else {
        //             success++;
        //         }
        //
        //         const fg_color = argb_to_int([0xff, fr, fg, 0xff]);
        //         this.marvin_out.setIntColor1(rect.x + x, rect.y + y, fg_color);
        //     }
        // }
        //
        // console.log("successes: " + success + " failures: " + failed);
        const ctx_data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let x in mask.container) {
            if (!mask.container.hasOwnProperty(x)) continue;
            // x is sourced from the eb_x which is an x from the origin of the eb_rectangle
            x = parseInt(x);
            for (let y in mask.container[x]) {
                if (!mask.container[x].hasOwnProperty(y)) continue;
                y = parseInt(y);
                const coordinate_mask = mask.container[x][y];
                /*
                const fg_pixel = ctx.getImageData(x, y, 1, 1).data;
                const fr = Math.round(fg_pixel[0]);
                const fg = Math.round(fg_pixel[1]);
                const fb = Math.round(fg_pixel[2]);
                */
                const index = (x + y * canvas.width) * 4;
                const fr = ctx_data[index];
                const fg = ctx_data[index + 1];
                const fb = ctx_data[index + 2];
                //const alpha = ctx_data[index+3];
                //Many calculations happen twice here and on top of that we convert colors to different representations
                //just for them to be converted back again as the method just wants the color in this format as the parameter
                //Info: The loop entire itself takes 500ms (without code in it), while these 3 code lines "only" consume 300ms though
                // const fg_color = argb_to_int([0xff, fr, fg, fb]);
                // this.marvin_out.setIntColor1(rect.x + x, rect.y + y, fg_color);
                const fg_color = argb_to_int([0xff, fr, fg, fb]) & coordinate_mask;
                const bg_color = this.marvin_out.getIntColor(rect.x + x, rect.y + y) & ~coordinate_mask;
                this.marvin_out.setIntColor1(rect.x + x, rect.y + y, fg_color | bg_color);
                // this.marvin_out.setIntColor1(rect.x + x, rect.y + y, coordinate_mask);
            }
        }


    }

    neo_shift(source_context, source_data, target_context, target_canvas, rect, effect_bounds, config) {
        // TODO implement internal H/V distinction.
        let shift_range = config.shift_intensity_range;
        const hShifts = this.calculateShifts(rect.h, config.h_bar_size_range, shift_range);
        const vShifts = this.calculateShifts(rect.w, config.v_bar_size_range, shift_range);

        // TODO per block
        const mask = new Mask();

        // const rect_data_obj = source_context.getImageData(0, 0, rect.w, rect.h);
        // const rect_data = rect_data_obj.data;
        const image_data_obj = source_context.getImageData(0, 0, effect_bounds.w, effect_bounds.h);
        const image_data = image_data_obj.data;

        let i = 0;
        for (let rect_y = 0; rect_y < rect.h; rect_y++) {
            const hShift = hShifts[rect_y];
            if (hShift === undefined) {
                // console.warn("Aborting early as the remaining pixels (" + (rect.h - y) + ") is smaller than the minimum allowed bar height.");
                break;
            }
            const eb_y = rect_y + (rect.y - effect_bounds.y);

            for (let rect_x = 0; rect_x < rect.w; rect_x++) {

                const vShift = vShifts[rect_x];
                if (vShift === undefined) {
                    // console.warn("Aborting early as the remaining pixels (" + (rect.w - x) + ") is smaller than the minimum allowed bar width.");
                    break;
                }
                const eb_x = rect_x + (rect.x - effect_bounds.x);

                // const a = source.getAlphaComponent(x, y);
                //const source_pixel = source_context.getImageData(eb_x, eb_y, 1, 1).data;
                const index = (eb_x + eb_y * source_data.width) * 4;
                const red = source_data.data[index];
                const green = source_data.data[index + 1];
                const blue = source_data.data[index + 2];
                const alpha = source_data.data[index + 3];
                //const source_pixel = rect_data[];
                const sr = Math.round(red * config.r_channel_intensity);
                const sg = Math.round(green * config.g_channel_intensity);
                const sb = Math.round(blue * config.b_channel_intensity);
                const tx = eb_x + hShift;
                const ty = eb_y + vShift;

                // if (!effect_bounds.coordinateInside(tx, ty)) continue;
                /*
                let target_pixel;
                try {
                    target_pixel = source_context.getImageData(tx, ty, 1, 1).data;
                } catch (e) {
                    console.error(rect_x, rect_y, eb_x, eb_y, hShift, vShift, tx, ty, rect);
                    return null;
                }

                const tr = Math.round(target_pixel[0] * (1 - config.r_channel_intensity));
                const tg = Math.round(target_pixel[1] * (1 - config.g_channel_intensity));
                const tb = Math.round(target_pixel[2] * (1 - config.b_channel_intensity));
                const ta = alpha;
                */
                let t_index = (tx + ty * source_data.width) * 4;
                const tr = Math.round(source_data.data[t_index] * (1 - config.r_channel_intensity));
                const tg = Math.round(source_data.data[t_index + 1] * (1 - config.g_channel_intensity));
                const tb = Math.round(source_data.data[t_index + 2] * (1 - config.b_channel_intensity));
                // const tr = 0;
                // const tg = 0;
                // const tb = 0;
                const ta = alpha;

                if (config.r_channel_intensity > 0) mask.setRed(tx, ty);
                if (config.g_channel_intensity > 0) mask.setGreen(tx, ty);
                if (config.b_channel_intensity > 0) mask.setBlue(tx, ty);
                /*
                const image_data = target_context.createImageData(1, 1);
                const id_bytes = image_data.data;
                id_bytes[0] = sr + tr;
                id_bytes[1] = sg + tg;
                id_bytes[2] = sb + tb;
                id_bytes[3] = ta;
                target_context.putImageData(image_data, tx, ty);
                */

                t_index = (tx + ty * image_data_obj.width) * 4;
                image_data_obj.data[t_index] = sr + tr;
                image_data_obj.data[t_index + 1] = sg + tg;
                image_data_obj.data[t_index + 2] = sb + tb;
                image_data_obj.data[t_index + 3] = ta;

            }
        }
        target_context.putImageData(image_data_obj, 0, 0);
        return mask;
    }

    calculateShifts(dimension, bar_range, shift_range) {
        if (bar_range[1] === 0 && bar_range[0] === 0) {
            return new Array(dimension).fill(0);
        }

        let bar_size = 0;
        let shift_intensity = 0;
        const indexed_shifts = [];
        for (let i = 0; i < dimension; i++) {
            if (bar_size > 0) {
                bar_size--;
            } else {
                if (dimension - i < bar_range[1]) {
                    // console.warn("Breaking loop as " + dimension + " - " + i + " < " + bar_range[1] + ".");
                    break;
                }
                bar_size = generate_random_in_range(bar_range[0], bar_range[1]);
                shift_intensity = generate_shift_intensity(shift_range[0], shift_range[1], shift_intensity);
            }
            indexed_shifts[i] = shift_intensity;
        }
        return indexed_shifts;
    }
}

function int_to_argb(int_color) {
    const a_channel = (int_color >> 24) & 0xFF;
    const r_channel = (int_color >> 16) & 0xFF;
    const g_channel = (int_color >> 8) & 0xFF;
    const b_channel = int_color & 0xFF;
    return [a_channel, r_channel, g_channel, b_channel];
}

function argb_to_int(channels) {
    const a_channel = (channels[0] & 0xFF) << 24;
    const r_channel = (channels[1] & 0xFF) << 16;
    const g_channel = (channels[2] & 0xFF) << 8;
    const b_channel = (channels[3] & 0xFF);
    return a_channel | r_channel | g_channel | b_channel;
}

function generate_random_in_range(min, max) {
    const random_value = Math.random() * (max - min);
    return Math.floor(min + random_value);
}

function generate_random_float_in_range(min, max) {
    return min + Math.random() * (max - min);
}

function generate_shift_intensity(min, max, previous) {
    const r_base = min + Math.round(Math.random() * (max - min));
    const r_sign = Math.round(Math.random()) === 0 ? -1 : 1;
    const random_delta = r_base * r_sign;

    let candidate_shift = previous + random_delta;
    if (candidate_shift < -max || max < candidate_shift) {
        candidate_shift = previous - random_delta;
    }
    return candidate_shift;
}

function make_region_buffer(local_image, x_origin, y_origin, width, height) {
    const buffer = new Array(width * height);

    for (let y_local = 0; y_local < height; y_local++) {
        let y_global = y_origin + y_local;
        for (let x_local = 0; x_local < width; x_local++) {
            let x_global = x_origin + x_local;
            buffer[y_local * width + x_local] = local_image.getIntColor(x_global, y_global);
        }
    }
    return buffer;
}

function calculate_combined_pixel(original, x_global, y_global, x_shift, y_shift, config) {
    const original_pixel = original.getIntColor(x_global, y_global);
    const original_argb = int_to_argb(original_pixel);

    const shifted_pixel = original.getIntColor(x_global + x_shift, y_global + y_shift);
    const shifted_argb = int_to_argb(shifted_pixel);

    // noinspection DuplicatedCode
    return actually_combine_pixel_values(original_argb, shifted_argb, config);
}

function actually_combine_pixel_values(original_argb, shifted_argb, config) {
    const combined_argb = [original_argb[0], shifted_argb[1] * config.r_channel_intensity + original_argb[1] * (1 - config.r_channel_intensity), shifted_argb[2] * config.g_channel_intensity + original_argb[2] * (1 - config.g_channel_intensity), shifted_argb[3] * config.b_channel_intensity + original_argb[3] * (1 - config.b_channel_intensity)];

    // noinspection DuplicatedCode
    const negative_combined_argb = [original_argb[0], (0xFF - shifted_argb[1]) * config.r_channel_intensity + (0xFF - original_argb[1]) * (1 - config.r_channel_intensity), (0xFF - shifted_argb[2]) * config.g_channel_intensity + (0xFF - original_argb[2]) * (1 - config.g_channel_intensity), (0xFF - shifted_argb[3]) * config.b_channel_intensity + (0xFF - original_argb[3]) * (1 - config.b_channel_intensity)];

    // noinspection DuplicatedCode
    const ultimate_combined_argb = [combined_argb[0], negative_combined_argb[1] * config.r_negate_intensity + combined_argb[1] * (1 - config.r_negate_intensity), negative_combined_argb[2] * config.g_negate_intensity + combined_argb[2] * (1 - config.g_negate_intensity), negative_combined_argb[3] * config.b_negate_intensity + combined_argb[3] * (1 - config.b_negate_intensity)];

    return argb_to_int(ultimate_combined_argb);
}

function merge_pixels(bg_pixel, fg_pixel) {

    const fg_argb = int_to_argb(fg_pixel);
    const bg_argb = int_to_argb(bg_pixel);

    const fg_factor = (fg_argb[0] / 255.);
    const bg_factor = 1 - fg_factor;

    const combined_argb = [bg_argb[0], fg_argb[1] & 0b1 ? bg_argb[1] * bg_factor + fg_argb[1] * fg_factor : bg_argb[1], fg_argb[2] & 0b1 ? bg_argb[2] * bg_factor + fg_argb[2] * fg_factor : bg_argb[2], fg_argb[3] & 0b1 ? bg_argb[3] * bg_factor + fg_argb[3] * fg_factor : bg_argb[3]];

    return argb_to_int(combined_argb);
}

function generateBaseBlurImproved(canvas, blur_strength, grayscale) {
    let blurredcanvas = document.createElement("canvas");
    let pxext = blur_strength * 2;
    let pxext2 = pxext * 2;
    blurredcanvas.width = canvas.width + pxext2;
    blurredcanvas.height = canvas.height + pxext2;
    const ctx = blurredcanvas.getContext("2d");
    if (grayscale) {
        ctx.filter = "grayscale(1)";
    }
    ctx.save();
    //Upper left corner
    ctx.translate(pxext, pxext);
    ctx.scale(-1, -1);
    ctx.drawImage(canvas, 0, 0, pxext, pxext, 0, 0, pxext, pxext);
    ctx.restore();
    ctx.save();
    //Top
    ctx.translate(0, pxext);
    ctx.scale(1, -1);
    ctx.drawImage(canvas, 0, 0, canvas.width, pxext, pxext, 0, canvas.width, pxext);
    ctx.restore();
    ctx.save();
    //Upper right corner
    ctx.translate(blurredcanvas.width, pxext);
    ctx.scale(-1, -1);
    ctx.drawImage(canvas, canvas.width - pxext, 0, pxext, pxext, 0, 0, pxext, pxext);
    ctx.restore();
    ctx.save();
    //Left
    ctx.translate(pxext, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, 0, 0, pxext, canvas.height, 0, pxext, pxext, canvas.height,
        //0, 0, marvinImage.width, marvinImage.height
    );
    ctx.restore();
    ctx.save();
    //Right
    ctx.translate(blurredcanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, canvas.width - pxext, 0, pxext, canvas.height, 0, pxext, pxext, canvas.height);
    ctx.restore();
    ctx.save();
    //Bottom left corner
    ctx.translate(pxext, blurredcanvas.height);
    ctx.scale(-1, -1);
    ctx.drawImage(canvas, 0, canvas.height - pxext, pxext, pxext, 0, 0, pxext, pxext);
    ctx.restore();
    ctx.save();
    //Bottom
    ctx.translate(0, blurredcanvas.height);
    ctx.scale(1, -1);
    ctx.drawImage(canvas, 0, canvas.height - pxext, canvas.width, pxext, pxext, 0, canvas.width, pxext);
    ctx.restore();
    ctx.save();
    //Bottom right corner
    ctx.translate(blurredcanvas.width, blurredcanvas.height);
    ctx.scale(-1, -1);
    ctx.drawImage(canvas, canvas.width - pxext, canvas.height - pxext, pxext, pxext, 0, 0, pxext, pxext);
    ctx.restore();
    ctx.save();
    //Center
    ctx.drawImage(canvas, pxext, pxext, canvas.width, canvas.height);
    ctx.filter = "blur(" + blur_strength + "px)";
    ctx.drawImage(blurredcanvas, 0, 0, blurredcanvas.width, blurredcanvas.height);
    let blurred = document.createElement("canvas");
    blurred.width = canvas.width;
    blurred.height = canvas.height;
    const ctx_blurred = blurred.getContext("2d");
    ctx_blurred.drawImage(blurredcanvas, pxext, pxext, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

    return blurred;
}

function pixelate_rectangle(ctx, rect, pixel_size = 20, distance = 0, marvinImage, grayscale) {
    let pixelArr = ctx.getImageData(0, 0, marvinImage.getWidth(), marvinImage.getHeight()).data;
    for (let i = rect.x; i < rect.x + rect.w; i += pixel_size + distance) {
        for (let j = rect.y; j < rect.y + rect.h; j += pixel_size + distance) {
            ctx.fillStyle = calculatePixelBoxColor(marvinImage, i, j, i + pixel_size, j + pixel_size, pixel_size, pixelArr, grayscale);
            ctx.fillRect(i, j, pixel_size, pixel_size);
        }
    }
}

function toColor(num, alpha = false) {
    num >>>= 0;
    let b = num & 0xFF, g = (num & 0xFF00) >>> 8, r = (num & 0xFF0000) >>> 16, a = ((num & 0xFF000000) >>> 24) / 255;
    if (!alpha) {
        a = 1;
    }
    return "rgba(" + [r, g, b, a].join(",") + ")";
}

function hexelate_area(ctx, rect, pixel_size = 20, distance = 0, glitch = false, marvinImage, grayscale) {
    let a = 2 * Math.PI / 6;
    let r = pixel_size;
    if (glitch) {
        a = Math.ceil(a);
    }

    function drawHexagon(ctx, x, y, r, a, pixelArr) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
        }
        ctx.fillStyle = calculatePixelBoxColor(marvinImage, Math.ceil(x), Math.ceil(y), 0, 0, r, pixelArr, grayscale);

        ctx.fill();
        ctx.closePath();
    }

    let pixelArr = ctx.getImageData(0, 0, marvinImage.getWidth(), marvinImage.getHeight()).data;

    for (let y = rect.y; y < rect.y + rect.h + r; y += 2 * (r * Math.sin(a))) {
        y += distance;
        for (let x = rect.x, j = 0; x < rect.x + rect.w + r; x += r * (1 + Math.cos(a))) {
            x += distance;
            let yc = y + 0.5 * ((-1) ** j++ * r * Math.sin(a));
            drawHexagon(ctx, x, yc, r, a, pixelArr);
        }
    }

}

function calc_smoothing(rect, config) {
    let smoothing_strength = Math.ceil(Math.min(rect.w, rect.h) / 100 * config._feathering);
    return smoothing_strength;
}

function resizeFile(imageFile, size = 80) {
    let resolver = () => {
    };
    let reader = new FileReader();
    reader.onload = function (e) {
        let img = document.createElement("img");
        img.onload = function (event) {
            let canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, size, size);
            let imageData = ctx.getImageData(0, 0, size, size);
            resolver(imageData);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
    return new Promise((resolve, reject) => {
        resolver = resolve;
    });
}

function mergeImageData(imageDataArray) {

    let newImageData = imageDataArray[0];

    for (let j = 0; j < imageDataArray.length; j++) { // iterate through the imageDataArray

        for (let i = 0, bytes = imageDataArray[j].data.length; i < bytes; i += 4) { // iterate through image bytes

            let index = (imageDataArray[j].data[i + 3] === 0 ? 0 : j);

            newImageData.data[i] = imageDataArray[index].data[i];
            newImageData.data[i + 1] = imageDataArray[index].data[i + 1];
            newImageData.data[i + 2] = imageDataArray[index].data[i + 2];
            newImageData.data[i + 3] = imageDataArray[index].data[i + 3];
        }
    }
    return newImageData;
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius = 5, fill = false, stroke = false) {
    if (typeof radius === "number") {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

/**
 *
 * @param marvinImage
 * @param x1 = pixel box starting x
 * @param y1 = pixel box starting y
 * @param x2 = pixel box ending x
 * @param y2 = pixel box ending y
 * @param pixel_size = box size
 * @param pixelArr = pixel array
 * @returns {*}
 */
function calculatePixelBoxColor(marvinImage, x1, y1, x2, y2, pixel_size, pixelArr, grayscale) {
    let p = (x1 + (y1 * marvinImage.getWidth())) * 4;
    if (grayscale) {
        let sum = 0;
        sum += parseInt(pixelArr[p]);
        sum += parseInt(pixelArr[p + 1]);
        sum += parseInt(pixelArr[p + 2]);
        sum /= 3;
        pixelArr[p] = sum;
        pixelArr[p + 1] = sum;
        pixelArr[p + 2] = sum;
    }
    return "rgba(" + pixelArr[p] + "," + pixelArr[p + 1] + "," + pixelArr[p + 2] + "," + pixelArr[p + 3] + ")";
}

function handleOOMImage(data, blob, file, filter, stream, callback) {
    let urlCreator = window.URL || window.webkitURL;
    let imageUrl = urlCreator.createObjectURL(blob);
    let image = new Image();
    image.onload = function () {
        let naturalWidth = this.naturalWidth;
        let naturalHeight = this.naturalHeight;
        let canvas = document.createElement("canvas");
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        let numDate = new Date(data.date);
        let classes = data.classes;
        let ctx = canvas.getContext("2d");
        let px = 40;
        let ratio = px / 1000;
        let fontSize = naturalWidth * ratio;
        let blur_px = only_once_mode_configuration.mode_configuration[5].blur * Math.max(naturalWidth, naturalHeight);
        let promises = [];
        if (data.date > Date.now()) {
            ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight);
        } else {
            switch (only_once_mode_configuration.mode) {
                case 1: // Slight Transparency
                    ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight);
                    let opc = 1 - only_once_mode_configuration.mode_configuration[1].transparency;
                    ctx.fillStyle = "rgba(0,0,0," + opc + ")";
                    ctx.fillRect(0, 0, naturalWidth, naturalHeight);
                    break;
                case 2: // Borderless
                    ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight);
                    let distance = only_once_mode_configuration.mode_configuration[2].distance;
                    let radius = only_once_mode_configuration.mode_configuration[2].radius;
                    let border = naturalWidth * distance;
                    //ctx.fillRect(border,border,naturalWidth-border*2,naturalHeight-border*2);
                    roundRect(ctx, border, border, naturalWidth - border * 2, naturalHeight - border * 2, radius, true, false);
                    break;
                case 3: // Preview
                    ctx.fillStyle = "rgba(0,0,0)";
                    ctx.fillRect(0, 0, naturalWidth, naturalHeight);
                    let scaled_width = naturalWidth * 0.1;
                    let scaled_height = naturalHeight * 0.1;
                    let x = naturalWidth / 2 - scaled_width / 2;
                    let y = naturalHeight / 2 - scaled_height - fontSize;
                    ctx.save();
                    blur_px = only_once_mode_configuration.mode_configuration[3].blur * Math.max(scaled_width, scaled_height);
                    ctx.filter = "blur(" + blur_px + "px)";
                    roundedImage(ctx, x, y, scaled_width, scaled_height, 10);
                    ctx.clip();
                    ctx.drawImage(image, x, y, scaled_width, scaled_height);
                    ctx.restore();
                    break;
                case 4: // Line Pattern
                    ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight);
                    let strength = only_once_mode_configuration.mode_configuration[4].strength;
                    let numberOfStripes = Math.min(naturalWidth, naturalHeight) * strength;
                    //let color1 = "rgb(0,0,0,1)",color2="rgba(255,255,255,0.55)";
                    let color1 = only_once_mode_configuration.mode_configuration[4].color_1;
                    let color2 = only_once_mode_configuration.mode_configuration[4].color_2;
                    for (let i = 0; i < numberOfStripes * 2; i++) {
                        let thickness = (naturalWidth / numberOfStripes);
                        ctx.beginPath();
                        ctx.strokeStyle = i % 2 ? color1 : color2;
                        ctx.lineWidth = thickness;
                        ctx.lineCap = "round";
                        ctx.moveTo(i * thickness + thickness / 2 - naturalWidth, 0);
                        ctx.lineTo(0 + i * thickness + thickness / 2, naturalHeight);
                        ctx.stroke();
                    }
                    for (let i = 0; i < numberOfStripes * 2; i++) {
                        let thickness = (naturalWidth / numberOfStripes);
                        ctx.beginPath();
                        ctx.strokeStyle = i % 2 ? color1 : color2;
                        ctx.lineWidth = thickness;
                        ctx.lineCap = "round";
                        ctx.moveTo(i * thickness + thickness / 2, 0);
                        ctx.lineTo(0 + i * thickness + thickness / 2 - naturalWidth, naturalHeight);
                        ctx.stroke();
                    }
                    break;
                case 5: // Strong Blur
                    ctx.save();
                    ctx.filter = "blur(" + blur_px + "px)";
                    ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight);
                    ctx.restore();
                    break;
                case 6: // Box Tease
                    ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight);
                    let p = new Promise((resolve, reject) => {
                        let frame = ctx.getImageData(0, 0, naturalWidth, naturalHeight);
                        let payload = {
                            ai_request: true, frame: frame, width: naturalWidth, height: naturalHeight,
                        };
                        handleFrameMessage(payload, null, function (ai_data) {
                            ctx.fillStyle = "rgba(0,0,0)";
                            ctx.fillRect(0, 0, naturalWidth, naturalHeight);
                            const canvasURL = canvas.toDataURL();
                            let marvinImage = new MarvinImage();
                            marvinImage.load(canvasURL, function () {
                                let conf = bundleConfiguration();
                                let cache = {};
                                let processedRequest = new ProcessedCensorRequest(imageUrl, file, naturalWidth, naturalHeight, "png", ai_data.boxes, ai_data.scores, ai_data.classes, ai_data.valid_detections, "box", all_labels);
                                paintCensorRequest(marvinImage, processedRequest, conf, cache);
                                ctx.putImageData(marvinImage.imageData, 0, 0);
                                if (only_once_mode_configuration.mode_configuration[6].allow_faces) {
                                    for (let i = 0; i < ai_data.valid_detections[0]; i++) {
                                        let translated = parse_entry_from_index(ai_data.classes[i]);
                                        if (klasses[translated].key === "FACEFEMALE" || klasses[translated].key === "FACEMALE") {
                                            let [x1, y1, x2, y2] = ai_data.boxes.slice(i * 4, (i + 1) * 4);
                                            x1 *= naturalWidth;
                                            x2 *= naturalWidth;
                                            y1 *= naturalHeight;
                                            y2 *= naturalHeight;
                                            let w = Math.ceil(x2 - x1);
                                            let h = Math.ceil(y2 - y1);
                                            ctx.drawImage(image, x1, y1, w, h, x1, y1, w, h);
                                        }
                                    }
                                }
                                URL.revokeObjectURL(canvasURL);
                                resolve();
                            });

                        });
                    });
                    promises.push(p);
                    break;
                default: // Full Block
                    ctx.fillStyle = "rgba(0,0,0)";
                    ctx.fillRect(0, 0, naturalWidth, naturalHeight);
            }
        }

        Promise.allSettled(promises).then(() => {
            if (data.date > Date.now()) {
                paintOOMFutureTimestamp(data, image, canvas, ctx);
            } else {
                ctx.font = fontSize + "px Segoe UI";
                ctx.fillStyle = "white";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                let sblur = 2;
                let slinewidth = 2;
                let text = only_once_mode_configuration.message;
                let m_text = ctx.measureText(text);
                ctx.shadowColor = "black";
                ctx.shadowBlur = sblur;
                ctx.lineWidth = slinewidth;
                ctx.strokeText(text, naturalWidth / 2, naturalHeight / 2 + (m_text.actualBoundingBoxAscent - m_text.actualBoundingBoxDescent) / 2);
                ctx.shadowBlur = 0;
                ctx.fillText(text, naturalWidth / 2, naturalHeight / 2 + (m_text.actualBoundingBoxAscent - m_text.actualBoundingBoxDescent) / 2);
                let y = naturalHeight / 2;
                if (only_once_mode_configuration.date_time_format != null && only_once_mode_configuration.date_time_format !== "") {
                    let text_date = "" + numDate.toLocaleString();
                    if (only_once_mode_configuration.date_time_format !== "local") {
                        text_date = "" + numDate.toLocaleString(only_once_mode_configuration.date_time_format);
                    }
                    let m_date = ctx.measureText(text_date);
                    y += (m_date.actualBoundingBoxAscent - m_date.actualBoundingBoxDescent) / 2 + fontSize;
                    ctx.shadowColor = "black";
                    ctx.shadowBlur = sblur;
                    ctx.lineWidth = slinewidth;
                    ctx.strokeText(text_date, naturalWidth / 2, y);
                    ctx.shadowBlur = 0;
                    ctx.fillText(text_date, naturalWidth / 2, y);
                }
                if (classes && only_once_mode_configuration.display_classes) {
                    for (const [index, value] of Object.entries(classes)) {
                        let r = Object.values(klasses).find((e) => e.index == index);
                        let text_label = r.name + ": " + value;
                        let m_text_label = ctx.measureText(text_label);
                        y += (m_text_label.actualBoundingBoxAscent - m_text_label.actualBoundingBoxDescent) / 2 + fontSize;
                        ctx.shadowColor = "black";
                        ctx.shadowBlur = sblur;
                        ctx.lineWidth = slinewidth;
                        ctx.strokeText(text_label, naturalWidth / 2, y);
                        ctx.shadowBlur = 0;
                        ctx.fillText(text_label, naturalWidth / 2, y);
                    }
                }
                canvas.toBlob(function (blob) {
                    if (filter != null) {
                        blob.arrayBuffer().then(buffer => {
                            filter.write(buffer);
                            filter.disconnect();
                            if (callback) {
                                callback(blob);
                            }
                        });
                    } else if (callback) {
                        callback(blob);
                    }
                });
                URL.revokeObjectURL(imageUrl);
            }
        });
    };
    image.src = imageUrl;
}

function paintOOMFutureTimestamp(data, image, canvas, ctx) {
    ctx.save();
    let text = "Permanently blocked in ";
    let naturalWidth = image.naturalWidth;
    let px = 14;
    let ratio = px / 1000;
    let fontSize = naturalWidth * ratio;
    let sblur = 2;
    let slinewidth = 2;
    ctx.font = fontSize + "px Segoe UI";
    ctx.fillStyle = "white";
    ctx.shadowBlur = sblur;
    ctx.lineWidth = slinewidth;
    ctx.shadowColor = "black";
    const diffTime = Math.abs(Date.now() - data.date);
    text += msToTime(diffTime);
    let m_text = ctx.measureText(text);
    ctx.fillText(text, naturalWidth - m_text.width - px, px * 1.2 + (m_text.actualBoundingBoxAscent - m_text.actualBoundingBoxDescent) / 2);
    ctx.shadowBlur = 0;
    ctx.fillText(text, naturalWidth - m_text.width - px, px * 1.2 + (m_text.actualBoundingBoxAscent - m_text.actualBoundingBoxDescent) / 2);
    ctx.restore();

    /*
    let text = "This image will be permanently blocked:";
    let naturalWidth = image.naturalWidth;
    let naturalHeight = image.naturalHeight;
    let px = 40;
    let ratio = px / 1000;
    let fontSize = naturalWidth * ratio;
    let sblur = 2;
    let slinewidth = 2;
    let numDate= new Date(data.date);
    ctx.save();
    ctx.font = fontSize+"px Segoe UI";
    ctx.fillStyle = "white";
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    let m_text = ctx.measureText(text);
    ctx.shadowColor="black";
    ctx.shadowBlur=sblur;
    ctx.lineWidth=slinewidth;
    ctx.strokeText(text, naturalWidth / 2, naturalHeight / 2 + (m_text.actualBoundingBoxAscent - m_text.actualBoundingBoxDescent) / 2);
    ctx.shadowBlur=0;
    ctx.fillText(text, naturalWidth / 2, naturalHeight / 2 + (m_text.actualBoundingBoxAscent - m_text.actualBoundingBoxDescent) / 2);
    let y = naturalHeight / 2;
    if(only_once_mode_configuration.date_time_format != null){
        let text_date = ""+numDate.toLocaleString();
        if(only_once_mode_configuration.date_time_format !== 'local'){
            text_date = ""+numDate.toLocaleString(only_once_mode_configuration.date_time_format);
        }
        let m_date = ctx.measureText(text_date);
        y += (m_date.actualBoundingBoxAscent - m_date.actualBoundingBoxDescent) / 2 + fontSize;
        ctx.shadowColor="black";
        ctx.shadowBlur=sblur;
        ctx.lineWidth=slinewidth;
        ctx.strokeText(text_date, naturalWidth / 2, y);
        ctx.shadowBlur=0;
        ctx.fillText(text_date, naturalWidth / 2, y);
    }
    ctx.restore();
    */
}