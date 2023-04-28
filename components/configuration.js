/**
 * If true all images are down-scaled to 320x320 px before they are given to the AI preperation.
 * This step might be redundant as the AI preperation does also down-scale the generated Tensor, but
 * tests have shown that it will generate similar (sometimes better / sometimes worse) results while taking
 * a few ms (~10) less and spare a lot of MEMORY (<- important for the batch converter).
 * @type {boolean}
 */
let prescale = true;

let default_labels = ["BELLYEXPOSED",
    "BELLYCOVERED",
    "BUTTOCKSEXPOSED",
    "BUTTOCKSCOVERED",
    "FEMALEBREASTEXPOSED",
    "FEMALEBREASTCOVERED",
    "FEMALEGENITALIAEXPOSED",
    "FEMALEGENITALIACOVERED",
    "MALEGENITALIACOVERED",
    "MALEGENITALIAEXPOSED",
    "MALEBREASTEXPOSED",
    "MALEBREASTCOVERED",
    "FEETCOVERED",
    "FEETEXPOSED",
    "ARMPITSCOVERED",
    "ARMPITSEXPOSED",
    "ANUSCOVERED",
    "ANUSEXPOSED"];

let all_labels = [
    "FACEFEMALE",
    "FACEMALE",
    "BELLYEXPOSED",
    "BELLYCOVERED",
    "BUTTOCKSEXPOSED",
    "BUTTOCKSCOVERED",
    "FEMALEBREASTEXPOSED",
    "FEMALEBREASTCOVERED",
    "FEMALEGENITALIAEXPOSED",
    "FEMALEGENITALIACOVERED",
    "MALEGENITALIACOVERED",
    "MALEGENITALIAEXPOSED",
    "MALEBREASTEXPOSED",
    "MALEBREASTCOVERED",
    "FEETCOVERED",
    "FEETEXPOSED",
    "ARMPITSCOVERED",
    "ARMPITSEXPOSED",
    "ANUSCOVERED",
    "ANUSEXPOSED"
];

/**********************************************************************************************************************
 * Censor Types
 **********************************************************************************************************************/
class CensorTypeConfiguration {

    constructor(name, scale = 1.0, shape = 0, feathering= 0) {
        this._name = name;
        this._scale = scale;
        /**
         * 0 = Rectangle
         * 1 = Circle
         * @type {number}
         * @private
         */
        this._shape = shape;
        this._feathering = feathering;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        this._scale = value;
    }

    get shape() {
        return this._shape;
    }

    set shape(value) {
        this._shape = value;
    }

    get feathering() {
        return this._feathering;
    }

    set feathering(value) {
        this._feathering = value;
    }
}

class BarCensorTypeConfiguration extends CensorTypeConfiguration{

    constructor(name, scale, shape, feathering, color) {
        super(name, scale, shape, feathering);
        this._color = color;
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }
}

class BlurCensorTypeConfiguration extends CensorTypeConfiguration{

    constructor(name, scale, shape, feathering, blur_strength, grayscale) {
        super(name, scale, shape, feathering);
        this._blur_strength = blur_strength;
        this._grayscale = grayscale;
    }


}

class PixelCensorTypeConfiguration extends CensorTypeConfiguration{

    constructor(name, scale, shape, feathering, geometry, distance, pixel_size_mode, pixel_size, grayscale) {
        super(name, scale, shape, feathering);
        this._distance = distance;
        this._geometry = geometry;
        this._pixel_size_mode = pixel_size_mode;
        this._pixel_size = pixel_size;
        this._grayscale = grayscale;
    }

    get distance() {
        return this._distance;
    }

    set distance(value) {
        this._distance = value;
    }


    get pixel_size_mode() {
        return this._pixel_size_mode;
    }

    set pixel_size_mode(value) {
        this._pixel_size_mode = value;
    }

    get pixel_size() {
        return this._pixel_size;
    }

    set pixel_size(value) {
        this._pixel_size = value;
    }

    set geometry(value) {
        this._geometry = value;
    }
}

class GlitchCensorTypeConfiguration extends CensorTypeConfiguration{

    constructor(name, scale, shape, feathering, intensity_color, intensity_shift, shift_horizontal, shift_vertical) {
        super(name, scale, shape, feathering);
        //this.intensity_color = intensity_color;
        //this.intensity_shift = intensity_shift;
        //this.shift_horizontal = shift_horizontal;
        //this.shift_vertical = shift_vertical;

        this.glitch_type = 0;

        this.glitch_types = {
            0: { // Chromatic Aberration
                shift_vertical: shift_vertical,
                shift_horizontal:  shift_horizontal,
                intensity_shift: intensity_shift,
                intensity_color: intensity_color,
            },
            1: { // Multiple Panels
                number_of_layers: 4,
                border: false,
                min_scale: 0.85,
                max_scale: 1.45,
                scatter: 0.25,
                split_chance: 0.2,
                gradients: [{"offset": 0.0, "color": "#0000007F"},],
            },
        };
    }

}

class TriangleCensorTypeConfiguration extends CensorTypeConfiguration{

    constructor(name, scale, shape, feathering,
                accuracy, blur, threshold, vertexMode, vertexCount, vertexPercentage,
                fill, fillColor, stroke, strokeColor, strokeWidth, gradients, gradientStops, lineJoin, transparentColor
    ) {
        super(name, scale, shape, feathering);
        this.accuracy = accuracy;
        this.blur = blur;
        this.threshold = threshold;
        this.vertexMode = vertexMode;
        this.vertexCount = vertexCount;
        this.vertexPercentage = vertexPercentage;
        this.fill = fill;
        this.fillColor = fillColor;
        this.stroke = stroke;
        this.strokeColor = strokeColor;
        this.strokeWidth = strokeWidth;
        this.gradients = gradients;
        this.gradientStops = gradientStops;
        this.lineJoin = lineJoin;
        this.transparentColor = transparentColor;
    }

}

class StickerCensorTypeConfiguration extends CensorTypeConfiguration{

    constructor(name, scale, shape, feathering, draw_mode = 1, consistency = true) {
        super(name, scale, shape, feathering);
        this._draw_mode = draw_mode;
        this._groups = [];
        this._consistency = consistency;
        this._cached = false;
    }

    get draw_mode() {
        return this._draw_mode;
    }

    set draw_mode(value) {
        this._draw_mode = value;
    }

    get groups() {
        return this._groups;
    }

    set groups(value) {
        this._groups = value;
    }

    get consistency() {
        return this._consistency;
    }

    set consistency(value) {
        this._consistency = value;
    }
}

class SobelCensorTypeConfiguration extends CensorTypeConfiguration{

    constructor(name, scale, shape, feathering, color_inverted) {
        super(name, scale, shape, feathering);
        this._color_inverted = color_inverted;
    }

    get color_inverted() {
        return this._color_inverted;
    }

    set color_inverted(value) {
        this._color_inverted = value;
    }

}

class SplatterCensorTypeConfiguration extends CensorTypeConfiguration{

    constructor(name, scale, shape, feathering, color_mode,
                splatter_size, splatter_amount, splatter_sub_amount, splatter_sub_size, splatter_iterations,
                splatter_transparency, splatter_centering, splatter_color_scheme) {
        super(name, scale, shape, feathering);
        this._color_mode = color_mode;
        this._splatter_size = splatter_size;
        this._splatter_amount = splatter_amount;
        this._splatter_sub_amount = splatter_sub_amount;
        this._splatter_sub_size = splatter_sub_size;
        this._splatter_iterations = splatter_iterations;
        this._splatter_transparency = splatter_transparency;
        this._splatter_centering = splatter_centering;
        this._splatter_color_scheme = splatter_color_scheme;
    }

}

function getStickerCollection(callback){
    let sticker_request = browser.storage.local.get(['sticker_collections']);
    sticker_request.then((res) => {
        callback(res);
    });
}

function loadDefaultStickers(callback){
    let sticker_request = browser.storage.local.get(['sticker_collections']);
    sticker_request.then((res) => {
        if(!res.sticker_collections){
            res.sticker_collections = [];
        }
        let fruits = [
            {name: 'eggplant', path:'images/stickers/fruits/fruits_eggplant_border.png',
                klasses: [
                    klasses.MALE_GENITALIA_COVERED,
                    klasses.MALE_GENITALIA_EXPOSED
                ],
                scale: 1.2,
                chance: 1,
            },
            {name: 'banana', path:'images/stickers/fruits/fruits_banana_border.png',
                klasses: [
                    klasses.MALE_GENITALIA_COVERED,
                    klasses.MALE_GENITALIA_EXPOSED
                ],
                scale: 1.4,
                chance: 1,
            },
            {name: 'cucumber', path:'images/stickers/fruits/fruits_cucumber_border.png',
                klasses: [
                    klasses.MALE_GENITALIA_COVERED,
                    klasses.MALE_GENITALIA_EXPOSED
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'cherry', path:'images/stickers/fruits/fruits_cherry_border.png',
                klasses: [
                    klasses.FEMALE_GENITALIA_COVERED,
                    klasses.FEMALE_GENITALIA_EXPOSED
                ],
                scale: 2,
                chance: 1,
            },
            {name: 'peach', path:'images/stickers/fruits/fruits_peach_border.png',
                klasses: [
                    klasses.BUTTOCKS_COVERED,
                    klasses.BUTTOCKS_EXPOSED
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'watermelon', path:'images/stickers/fruits/fruits_watermelon_border.png',
                klasses: [
                    klasses.FEMALE_BREAST_COVERED,
                    klasses.FEMALE_BREAST_EXPOSED
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'half orange', path:'images/stickers/fruits/fruits_half_orange_border.png',
                klasses: [
                    klasses.FEMALE_BREAST_COVERED,
                    klasses.FEMALE_BREAST_EXPOSED,
                    klasses.ANUS_COVERED,
                    klasses.ANUS_EXPOSED
                ],
                scale: 1,
                chance: 0.5,
            },
            {name: 'half angled orange', path:'images/stickers/fruits/fruits_angled_half_orange_border.png',
                klasses: [
                    klasses.FEMALE_BREAST_COVERED,
                    klasses.FEMALE_BREAST_EXPOSED,
                    klasses.ANUS_COVERED,
                    klasses.ANUS_EXPOSED
                ],
                scale: 1,
                chance: 0.5,
            },
            {name: 'apple', path:'images/stickers/fruits/fruits_apple_border.png',
                klasses: [
                    klasses.BUTTOCKS_COVERED,
                    klasses.BUTTOCKS_EXPOSED
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'half apple', path:'images/stickers/fruits/fruits_half_apple_border.png',
                klasses: [
                    klasses.FEMALE_GENITALIA_COVERED,
                    klasses.FEMALE_GENITALIA_EXPOSED
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'coconut', path:'images/stickers/fruits/fruits_coconut_border.png',
                klasses: [
                    klasses.FEMALE_BREAST_COVERED,
                    klasses.FEMALE_BREAST_EXPOSED,
                ],
                scale: 1.1,
                chance: 1,
            },
            {name: 'pear', path:'images/stickers/fruits/fruits_pear_border.png',
                klasses: [
                    klasses.BUTTOCKS_COVERED,
                    klasses.BUTTOCKS_EXPOSED
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'strawberry', path:'images/stickers/fruits/fruits_strawberry_border.png',
                klasses: [
                    klasses.FEMALE_GENITALIA_COVERED,
                    klasses.FEMALE_GENITALIA_EXPOSED
                ],
                scale: 1.2,
                chance: 1,
            },
            {name: 'kiwi', path:'images/stickers/fruits/fruits_kiwi_border.png',
                klasses: [
                    klasses.FEMALE_GENITALIA_COVERED,
                    klasses.FEMALE_GENITALIA_EXPOSED,
                    klasses.ANUS_COVERED,
                    klasses.ANUS_EXPOSED
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'pumpkin', path:'images/stickers/fruits/fruits_pumpkin_border.png',
                klasses: [
                    klasses.FACE_MALE,
                    klasses.FACE_FEMALE
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'pumpkin face 01', path:'images/stickers/fruits/fruits_pumpkin_face_01_border.png',
                klasses: [
                    klasses.FACE_MALE,
                    klasses.FACE_FEMALE
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'pumpkin face 02', path:'images/stickers/fruits/fruits_pumpkin_face_02_border.png',
                klasses: [
                    klasses.FACE_MALE,
                    klasses.FACE_FEMALE
                ],
                scale: 1,
                chance: 1,
            },
            {name: 'pumpkin face 03', path:'images/stickers/fruits/fruits_pumpkin_face_03_border.png',
                klasses: [
                    klasses.FACE_MALE,
                    klasses.FACE_FEMALE
                ],
                scale: 1,
                chance: 1,
            },
        ];
        let klses = Object.values(klasses);
        let emoji_hearts = [
            {name: 'heart', path:'images/stickers/emojis/2764.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'heart on fire', path:'images/stickers/emojis/2764-fe0f.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'black heart', path:'images/stickers/emojis/1f5a4.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'broken heart', path:'images/stickers/emojis/1f494.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'sparkling heart', path:'images/stickers/emojis/1f496.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'cupid', path:'images/stickers/emojis/1f498.png',
                klasses: klses,
                scale: 1,chance:1,
            },
        ];
        let emoji_smilies = [
            {name: 'hot face', path:'images/stickers/emojis/1f975.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'smiling face with 3 hearts', path:'images/stickers/emojis/1f970.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'heart eyes', path:'images/stickers/emojis/1f60d.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'kissing heart', path:'images/stickers/emojis/1f618.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'yum', path:'images/stickers/emojis/1f60b.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'innocent', path:'images/stickers/emojis/1f607.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'stuck out tongue winking eye', path:'images/stickers/emojis/1f61c.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'relieved', path:'images/stickers/emojis/1f60c.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'smirk', path:'images/stickers/emojis/1f60f.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'grimacing', path:'images/stickers/emojis/1f62c.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'star struck', path:'images/stickers/emojis/1f929.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'face with symbols over mouth', path:'images/stickers/emojis/1f92c.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'rage', path:'images/stickers/emojis/1f621.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'grin', path:'images/stickers/emojis/1f601.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'smiling imp', path:'images/stickers/emojis/1f608.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'wink', path:'images/stickers/emojis/1f609.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'confounded', path:'images/stickers/emojis/1f616.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'triumph', path:'images/stickers/emojis/1f624.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'face with spiral eyes', path:'images/stickers/emojis/1f635-200d-1f4ab.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'drooling face', path:'images/stickers/emojis/1f924.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'face with raised eye brow', path:'images/stickers/emojis/1f928.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'melting face', path:'images/stickers/emojis/1fae0.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'peeking', path:'images/stickers/emojis/1fae3.png',
                klasses: klses,
                scale: 1,chance:1,
            },
        ];
        let emoji_hands = [
            {name: 'middle finger', path:'images/stickers/emojis/1f595.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'raised hand', path:'images/stickers/emojis/1f590.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'pinching hand', path:'images/stickers/emojis/1f90f.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'punch', path:'images/stickers/emojis/1f44a.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'sign of the horns', path:'images/stickers/emojis/1f918.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'call me', path:'images/stickers/emojis/1f919.png',
                klasses: klses,
                scale: 1,chance:1,
            },
        ];
        let emoji_signs = [
            {name: 'no entry sign', path:'images/stickers/emojis/1f6ab.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'octagonal', path:'images/stickers/emojis/1f6d1.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'warning', path:'images/stickers/emojis/26a0.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'no entry', path:'images/stickers/emojis/26d4.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'underage', path:'images/stickers/emojis/1f51e.png',
                klasses: klses,
                scale: 1,chance:1,
            },
        ];
        let emoji_other = [
            {name: 'skull crossbones', path:'images/stickers/emojis/2620.png',
                klasses: klses,
                scale: 1.2,
            },
            {name: 'boom', path:'images/stickers/emojis/1f4a5.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'lip bite', path:'images/stickers/emojis/1fae6.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'lock', path:'images/stickers/emojis/1f512.png',
                klasses: klses,
                scale: 1,chance:1,
            },
            {name: 'fire', path:'images/stickers/emojis/1f525.png',
                klasses: klses,
                scale: 1,chance:1,
            },
        ];
        let collections = [fruits, emoji_smilies, emoji_hearts, emoji_hands, emoji_other];
        let names = ['fruits', 'emoji smilies','emoji hearts','emoji hands','emoji other'];
        let promises = [];
        collections.forEach(function (col,idc) {
            let collection = new StickerCollection(names[idc],[], true,true);
            col.forEach(function (element, idx, array) {
                if(!res.sticker_collections.some(e => {
                    return e._name === collection.name;
                })){
                    let p = new Promise(resolve => {
                        let localUrl = browser.runtime.getURL(element.path);
                        let imageData = new Image();
                        imageData.onload = function () {
                            const canvas = document.createElement('canvas');
                            canvas.width = imageData.width;
                            canvas.height = imageData.height;
                            let ctx = canvas.getContext("2d");
                            ctx.drawImage(imageData, 0, 0);
                            let dataurl = canvas.toDataURL("image/png");
                            //let data = ctx.getImageData(0, 0, canvas.width, canvas.height);//.data.buffer;
                            let sticker = {
                                name: element.name,
                                //file: data.data,
                                file: null,
                                url: dataurl,
                                width: canvas.width,
                                height: canvas.height,
                                klasses: element.klasses,
                                scale: element.scale,
                                locked: true,
                                chance: element.chance,
                                groups: [],
                            };
                            collection._stickers.push(sticker);

                            if (idx == col.length - 1) {
                                if (!res.sticker_collections.some(e => {
                                    return e._name === collection.name;
                                })) {
                                    res.sticker_collections.push(collection);
                                } else {
                                    //Should not happen
                                }
                            }
                            resolve();
                        }
                        imageData.src = localUrl;
                    });
                    promises.push(p);
                }
            });
        });
        Promise.all(promises).then((values) => {
            browser.storage.local.set({
                sticker_collections: res.sticker_collections,
            }).then(() => {callback()});
        });
    });
}


/**********************************************************************************************************************
 * File Types
 **********************************************************************************************************************/

class FileTypeConfiguration {
    get file_output_type() {
        return this._file_output_type;
    }

    set file_output_type(value) {
        this._file_output_type = value;
    }

    constructor(name, filesize_min = 1000, filesize_max= 0, width_min= 50, width_max= 0, height_min= 50, height_max= 0, file_output_type) {
        this._name = name;
        this._filesize_min = filesize_min;
        this._filesize_max = filesize_max;
        this._width_min = width_min;
        this._width_max = width_max;
        this._height_min = height_min;
        this._height_max = height_max;
        this._file_output_type = file_output_type;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get filesize_min() {
        return this._filesize_min;
    }

    set filesize_min(value) {
        this._filesize_min = value;
    }

    get filesize_max() {
        return this._filesize_max;
    }

    set filesize_max(value) {
        this._filesize_max = value;
    }

    get width_min() {
        return this._width_min;
    }

    set width_min(value) {
        this._width_min = value;
    }

    get width_max() {
        return this._width_max;
    }

    set width_max(value) {
        this._width_max = value;
    }

    get height_min() {
        return this._height_min;
    }

    set height_min(value) {
        this._height_min = value;
    }

    get height_max() {
        return this._height_max;
    }

    set height_max(value) {
        this._height_max = value;
    }
}

class PNGTypeConfiguration extends FileTypeConfiguration{

    constructor(name,
                filesize_min = 5000, filesize_max= 0,
                width_min= 50, width_max= 0, height_min= 50, height_max= 0,
                file_output_type = "image/png") {
        super(name,filesize_min,filesize_max,width_min, width_max, height_min, height_max, file_output_type);
    }

}

class JPGTypeConfiguration extends FileTypeConfiguration{

    constructor(name,
                filesize_min = 5000, filesize_max= 0,
                width_min= 50, width_max= 0, height_min= 50, height_max= 0,
                file_output_type = "image/jpeg") {
        super(name,filesize_min,filesize_max,width_min, width_max, height_min, height_max, file_output_type);
    }

}

class BMPTypeConfiguration extends FileTypeConfiguration{

    constructor(name,
                filesize_min = 5000, filesize_max= 0,
                width_min= 50, width_max= 0, height_min= 50, height_max= 0,
                file_output_type = "image/bmp") {
        super(name,filesize_min,filesize_max,width_min, width_max, height_min, height_max, file_output_type);
    }

}

class WEBPTypeConfiguration extends FileTypeConfiguration{

    constructor(name,
                filesize_min = 5000, filesize_max= 0,
                width_min= 50, width_max= 0, height_min= 50, height_max= 0,
                file_output_type = "image/webp") {
        super(name,filesize_min,filesize_max,width_min, width_max, height_min, height_max, file_output_type);
    }

}

class AVIFTypeConfiguration extends FileTypeConfiguration{

    constructor(name,
                filesize_min = 5000, filesize_max= 0,
                width_min= 50, width_max= 0, height_min= 50, height_max= 0,
                file_output_type = "image/avif") {
        super(name,filesize_min,filesize_max,width_min, width_max, height_min, height_max, file_output_type);
    }

}

class GIFTypeConfiguration extends FileTypeConfiguration{

    constructor(name, memory_method, thumbnails, thumbnail_fallback, frame_count_max = 0,
                filesize_min = 10000, filesize_max = 100000000,
                width_min= 0, width_max= 0, height_min= 0, height_max= 0
                ) {
        super(name,filesize_min,filesize_max,width_min, width_max, height_min, height_max,"image/gif");
        this._frame_count_max = frame_count_max;
        this._memory_method = memory_method;
        this._thumbnails = thumbnails;
        this._thumbnail_fallback = thumbnail_fallback;
    }

    get memory_method() {
        return this._memory_method;
    }

    set memory_method(value) {
        this._memory_method = value;
    }

    get thumbnails() {
        return this._thumbnails;
    }

    set thumbnails(value) {
        this._thumbnails = value;
    }


    get frame_count_max() {
        return this._frame_count_max;
    }

    set frame_count_max(value) {
        this._frame_count_max = value;
    }

    get thumbnail_fallback() {
        return this._thumbnail_fallback;
    }

    set thumbnail_fallback(value) {
        this._thumbnail_fallback = value;
    }

}

/**********************************************************************************************************************
 * White & Blacklist
 **********************************************************************************************************************/

class WhiteBlackListConfiguration {

    constructor(mode = 0, white_list = [], black_list = []) {
        this.mode = mode;
        this.white_list = white_list;
        this.black_list = black_list;
    }


}

/**********************************************************************************************************************
 * ReverseMode
 **********************************************************************************************************************/

class ReverseModeConfiguration {

    constructor(enabled = false, process_no_result = false, process_no_result_censor_selection = 2) {
        this.enabled = enabled;
        this.process_no_result = process_no_result;
        this.process_no_result_censor_selection = process_no_result_censor_selection;
    }

}

/**********************************************************************************************************************
 * Clustering
 **********************************************************************************************************************/

class ClusteringConfiguration {

    constructor(enabled, mode = 0) {
        this.enabled = enabled;
        this.mode = mode;
    }

}

/**********************************************************************************************************************
 * Word Wall
 **********************************************************************************************************************/

class WordWallConfiguration {

    constructor(enabled = false, text = ["pury.fi"], text_mode = 0,
                font_size = 1, distance_horizontal =1, distance_vertical = 1, offset = 1) {
        this.enabled = enabled;
        this.text = text;
        this.text_mode = text_mode;
        this.font_size = 1;
        this.distance_horizontal = 4;
        this.distance_vertical = 1.5;
        this.offset = 1;
    }

}


/**********************************************************************************************************************
 * Only Once Mode
 **********************************************************************************************************************/

class OnlyOnceModeConfiguration {
    constructor(enabled = false, mode = 0, precision = 62, width_min = 50, height_min = 50,
    message = 'This image has been permanently blocked!', date_time_format = 'local', display_classes = false) {
        this.enabled = enabled;
        this.mode = mode;
        this.mode_configuration = {
            0: { // Full Block

            },
            1: { // See Trough
                transparency: 0.02,
            },
            2: { // Borderless
                distance: 0.5,
                radius: 0,
            },
            3: { // Thumbnail
                blur: 0.0,
            },
            4: { // Grid
                strength: 0.3,
                color_1: "rgb(0,0,0,1)",
                color_2: "rgba(255,255,255,0.55)",
            },
            5: { // Strong Blur
                blur: 0.05,
            },
            6: { // Box Tease
                allow_faces: false,
            },
        };
        this.precision = precision;
        this.message = message;
        this.date_time_format = date_time_format;
        this.display_classes = display_classes;
        this.width_min = width_min;
        this.height_min = height_min;
        this.trigger = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
        this.timer = false;
        this.timer_autorefresh = true;
        this.timer_min_duration = 1000*10;
        this.timer_max_duration = 1000*60*5;
        this.timer_animation = 1;
    }
}

class OnlyOnceModeTree {

    constructor() {
        this.tree = {};
        this.count = 0;
    }

}

class OnlyOnceModeStorageManager {

    constructor() {
        this.trees = [];
    }

}


/**********************************************************************************************************************
 * Security
 **********************************************************************************************************************/

class LockConfiguration {

    constructor(enabled = false, password = null, duration= null, timer_plus = false,
                timer_plus_weight_box = true, timer_plus_weight_box_size = 50000, locked_options = []) {
        this.enabled = enabled;
        this.password = password;
        this.duration = duration;
        this.duration_timestamp = null;
        this.token = null;
        this.locked_options = locked_options;
        this.timer_plus = timer_plus;
        this.timer_plus_data = {
            BELLY_EXPOSED: 0,
            BELLY_COVERED: 0,
            BUTTOCKS_EXPOSED: 0,
            BUTTOCKS_COVERED: 0,
            FEMALE_BREAST_EXPOSED: 0,
            FEMALE_BREAST_COVERED: 0,
            FEMALE_GENITALIA_EXPOSED: 0,
            FEMALE_GENITALIA_COVERED: 0,
            MALE_GENITALIA_EXPOSED: 0,
            MALE_GENITALIA_COVERED: 0,
            MALE_BREAST_EXPOSED: 0,
            MALE_BREAST_COVERED: 0,
            FACE_FEMALE: 0,
            FACE_MALE: 0,
            FEET_EXPOSED: 0,
            FEET_COVERED: 0,
            ARMPITS_EXPOSED: 0,
            ARMPITS_COVERED: 0,
            ANUS_EXPOSED: 0,
            ANUS_COVERED: 0,
        };
        this.timer_plus_weight_box = timer_plus_weight_box;
        this.timer_plus_weight_box_size = timer_plus_weight_box_size;
    }
}



/**
 * Repairs missing configuration variables.
 * Missing variables can often occur after version updates, when new ones got introduced.
 */
function repairConfigurations(){
    let confs = [bar_configuration,
        blur_configuration,
        pixel_configuration,
        glitch_configuration,
        triangle_configuration,
        sticker_configuration,
        sobel_configuration,
        splatter_configuration,
        gif_configuration,
        reverse_mode_configuration,
        clustering_configuration,
        word_wall_configuration,
        only_once_mode_configuration,
        lock_configuration,
    ];
    let defaults = [default_bar_configuration,
        default_blur_configuration,
        default_pixel_configuration,
        default_glitch_configuration,
        default_triangle_configuration,
        default_sticker_configuration,
        default_sobel_configuration,
        default_splatter_configuration,
        default_gif_configuration,
        default_reverse_mode_configuration,
        default_clustering_configuration,
        default_word_wall_configuration,
        default_only_once_mode_configuration,
        default_lock_configuration,
    ];

    let names = ["default_bar_configuration",
        "default_blur_configuration",
        "pixel_configuration",
        "glitch_configuration",
        "triangle_configuration",
        "sobel_configuration",
        "sticker_configuration",
        "splatter_configuration",
        "gif_configuration",
        "reverse_mode_configuration",
        "clustering_configuration",
        "word_wall_configuration",
        "only_once_mode_configuration",
        "lock_configuration"];
    for (let i = 0; i < confs.length; i++) {
        for (let prop in defaults[i]) {
            if (Object.prototype.hasOwnProperty.call(defaults[i], prop)) {
                if(confs[i][prop] === null || typeof confs[i][prop] === "undefined"){
                    confs[i][prop] = defaults[i][prop];
                }
            }
        }
        for (let prop in confs[i]) {
            if (!Object.prototype.hasOwnProperty.call(defaults[i], prop)) {
                delete confs[i][prop];
                log("DELETED CONFIG PROPERTY", prop)
            }
        }
    }
    // Repair OOM sub configs
    for (let prop in only_once_mode_configuration.mode_configuration) {
        if (Object.prototype.hasOwnProperty.call(default_only_once_mode_configuration.mode_configuration, prop)) {
            if(only_once_mode_configuration.mode_configuration[prop] === null || typeof only_once_mode_configuration.mode_configuration[prop] === "undefined"){
                only_once_mode_configuration.mode_configuration[prop] = default_only_once_mode_configuration.mode_configuration[prop];
            }
            for (let sub_prop in default_only_once_mode_configuration.mode_configuration[prop]) {
                if(only_once_mode_configuration.mode_configuration[prop][sub_prop] === null || typeof only_once_mode_configuration.mode_configuration[prop][sub_prop] === "undefined"){
                    only_once_mode_configuration.mode_configuration[prop][sub_prop] = default_only_once_mode_configuration.mode_configuration[prop][sub_prop];
                }
            }
        }
    }
    // Repair Glitch sub modes
    for (let prop in glitch_configuration.glitch_types) {
        if (Object.prototype.hasOwnProperty.call(default_glitch_configuration.glitch_types, prop)) {
            if(glitch_configuration.glitch_types[prop] === null || typeof glitch_configuration.glitch_types[prop] === "undefined"){
                glitch_configuration.glitch_types[prop] = default_glitch_configuration.glitch_types[prop];
            }
            for (let sub_prop in default_glitch_configuration.glitch_types[prop]) {
                if(glitch_configuration.glitch_types[prop][sub_prop] === null || typeof glitch_configuration.glitch_types[prop][sub_prop] === "undefined"){
                    glitch_configuration.glitch_types[prop][sub_prop] = default_glitch_configuration.glitch_types[prop][sub_prop];
                }
            }
        }
    }
    browser.storage.sync.set({
        bar_configuration: bar_configuration,
        blur_configuration: blur_configuration,
        pixel_configuration: pixel_configuration,
        glitch_configuration: glitch_configuration,
        triangle_configuration: triangle_configuration,
        sticker_configuration: sticker_configuration,
        sobel_configuration: sobel_configuration,
        splatter_configuration: splatter_configuration,
        gif_configuration: gif_configuration,
        reverse_mode_configuration: reverse_mode_configuration,
        clustering_configuration: clustering_configuration,
        word_wall_configuration: word_wall_configuration,
        only_once_mode_configuration: only_once_mode_configuration,
        lock_configuration: lock_configuration,
    });

}

function bundleConfiguration(){
    return {
        bar_configuration: bar_configuration,
        blur_configuration: blur_configuration,
        pixel_configuration: pixel_configuration,
        glitch_configuration: glitch_configuration,
        triangle_configuration: triangle_configuration,
        sticker_configuration: sticker_configuration,
        sobel_configuration: sobel_configuration,
        splatter_configuration: splatter_configuration,
        gif_configuration: gif_configuration,
        reverse_mode_configuration: reverse_mode_configuration,
        word_wall_configuration: word_wall_configuration,
        clustering_configuration: clustering_configuration,
        sticker_collections: sticker_collections,
        lock_configuration: lock_configuration,
    };
}

function hexConverter(hex) {
    return hex.replace('#','0xFF');
}

const default_bar_configuration = new BarCensorTypeConfiguration("bar", 1.0, 0,0,'#000000');
var bar_configuration = default_bar_configuration;

const default_pixel_configuration = new PixelCensorTypeConfiguration("pixel", 1.0,0,0,0, 0, 0, 2, 0);
var pixel_configuration = default_pixel_configuration;

const default_blur_configuration = new BlurCensorTypeConfiguration("blur", 1.5,2, 2,20, 0);
var blur_configuration = default_blur_configuration;

const default_glitch_configuration = new GlitchCensorTypeConfiguration("glitch", 1,0, 0,1, 1,true, true);
var glitch_configuration = default_glitch_configuration;

const default_triangle_configuration = new TriangleCensorTypeConfiguration("triangle", 1.2,1, 0,
    0.7, 0,50, false, 700, 20, true,'#000',true, '#000',0.5,
    false, 4, 'miter', false);
var triangle_configuration = default_triangle_configuration;

const default_sticker_configuration = new StickerCensorTypeConfiguration("sticker", 1.0, 0,0, 1, true);
var sticker_configuration = default_sticker_configuration;

const default_sobel_configuration = new SobelCensorTypeConfiguration("sobel", 1.0, 0,0);
var sobel_configuration = default_sobel_configuration;

const default_splatter_configuration = new SplatterCensorTypeConfiguration("splatter", 1.0, 0,0,
    1, 1, 5, 10, 1, 2, 1.0, 4, []);
var splatter_configuration = default_splatter_configuration;

const default_gif_configuration = new GIFTypeConfiguration("gif", 0, true, 100, 1000,50000, 10000000);
var gif_configuration = default_gif_configuration;

const default_png_configuration = new PNGTypeConfiguration("png");
var png_configuration = default_png_configuration;

const default_jpg_configuration = new JPGTypeConfiguration("jpg");
var jpg_configuration = default_jpg_configuration;

const default_bmp_configuration = new BMPTypeConfiguration("bmp");
var bmp_configuration = default_bmp_configuration;

const default_webp_configuration = new WEBPTypeConfiguration("webp");
var webp_configuration = default_webp_configuration;

const default_avif_configuration = new AVIFTypeConfiguration("avif");
var avif_configuration = default_avif_configuration;

const default_whiteblacklist_configuration = new WhiteBlackListConfiguration();
var whiteblacklist_configuration = default_whiteblacklist_configuration;


const default_reverse_mode_configuration = new ReverseModeConfiguration();
var reverse_mode_configuration = default_reverse_mode_configuration;

const default_clustering_configuration = new ClusteringConfiguration(false, 0);
var clustering_configuration = default_clustering_configuration;

const default_only_once_mode_configuration = new OnlyOnceModeConfiguration();
var only_once_mode_configuration = default_only_once_mode_configuration;

const default_only_once_mode_storage_manager = new OnlyOnceModeStorageManager();
var only_once_mode_storage_manager = default_only_once_mode_storage_manager;

const default_word_wall_configuration = new WordWallConfiguration();
var word_wall_configuration = default_word_wall_configuration;


const default_icon_configuration = {
    "16": '/icons/icon_16.png',
    "32": '/icons/icon_32.png',
    "64": '/icons/icon_64.png',
};
var icon_configuration = JSON.parse(JSON.stringify(default_icon_configuration));

const default_lock_configuration = new LockConfiguration();
var lock_configuration = default_lock_configuration;

function restoreDefaultConfiguration(leave_out = []){
    if(!leave_out.includes("bar_configuration"))            bar_configuration = default_bar_configuration;
    if(!leave_out.includes("pixel_configuration"))          pixel_configuration = default_pixel_configuration;
    if(!leave_out.includes("blur_configuration"))           blur_configuration = default_blur_configuration;
    if(!leave_out.includes("glitch_configuration"))         glitch_configuration = default_glitch_configuration;
    if(!leave_out.includes("triangle_configuration"))       triangle_configuration = default_triangle_configuration;
    if(!leave_out.includes("sticker_configuration"))        sticker_configuration = default_sticker_configuration;
    if(!leave_out.includes("sobel_configuration"))          sobel_configuration = default_sobel_configuration;
    if(!leave_out.includes("splatter_configuration"))       splatter_configuration = default_splatter_configuration;
    if(!leave_out.includes("gif_configuration"))            gif_configuration = default_gif_configuration;
    if(!leave_out.includes("png_configuration"))            png_configuration = default_png_configuration;
    if(!leave_out.includes("jpg_configuration"))            jpg_configuration = default_jpg_configuration;
    if(!leave_out.includes("bmp_configuration"))            bmp_configuration = default_bmp_configuration;
    if(!leave_out.includes("webp_configuration"))           webp_configuration = default_webp_configuration;
    if(!leave_out.includes("avif_configuration"))           avif_configuration = default_avif_configuration;
    if(!leave_out.includes("whiteblacklist_configuration")) whiteblacklist_configuration = default_whiteblacklist_configuration;
    if(!leave_out.includes("reverse_mode_configuration"))   reverse_mode_configuration = default_reverse_mode_configuration;
    if(!leave_out.includes("clustering_configuration"))     clustering_configuration = default_clustering_configuration;
    if(!leave_out.includes("only_once_mode_configuration")) only_once_mode_configuration = default_only_once_mode_configuration;
    if(!leave_out.includes("lock_configuration"))           lock_configuration = default_lock_configuration;
    if(!leave_out.includes("word_wall_configuration"))      word_wall_configuration = default_word_wall_configuration;
    censor_type = 'black';
    browser.storage.sync.set({
        censor_type: 'black',
        labels : ["BELLYEXPOSED",
            "BELLYCOVERED",
            "BUTTOCKSEXPOSED",
            "BUTTOCKSCOVERED",
            "FEMALEBREASTEXPOSED",
            "FEMALEBREASTCOVERED",
            "FEMALEGENITALIAEXPOSED",
            "FEMALEGENITALIACOVERED",
            "MALEGENITALIACOVERED",
            "MALEGENITALIAEXPOSED",
            "MALEBREASTEXPOSED",
            "MALEBREASTCOVERED",
            "FEETCOVERED",
            "FEETEXPOSED",
            "ARMPITSCOVERED",
            "ARMPITSEXPOSED",
            "ANUSCOVERED",
            "ANUSEXPOSED"],
        file_types: ['jpg', 'png', 'bmp', 'webp', 'avif'],
        debug: false,
        do_cache: true,
        active: true,
        prescale: true,
        base64_scanner: true,
        bar_configuration : bar_configuration,
        pixel_configuration : pixel_configuration,
        blur_configuration : blur_configuration,
        glitch_configuration : glitch_configuration,
        triangle_configuration : triangle_configuration,
        sticker_configuration : sticker_configuration,
        sobel_configuration : sobel_configuration,
        splatter_configuration: splatter_configuration,
        gif_configuration : gif_configuration,
        png_configuration : png_configuration,
        jpg_configuration : jpg_configuration,
        bmp_configuration : bmp_configuration,
        webp_configuration : webp_configuration,
        avif_configuration: avif_configuration,
        whiteblacklist_configuration : whiteblacklist_configuration,
        reverse_mode_configuration : reverse_mode_configuration,
        clustering_configuration : clustering_configuration,
        word_wall_configuration: word_wall_configuration,
        only_once_mode_configuration: only_once_mode_configuration,
        lock_configuration: lock_configuration,
        statistics: statistics,
    });
}

