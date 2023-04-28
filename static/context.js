const effects = {
    NONE: {name: "normal", index: 0},
    PIXEL: {name: "pixel", index: 1},
    BLUR: {name: "blur", index: 2},
    BLACK: {name: "black", index: 3},
    TRIANGLE: {name: "triangle", index: 4},
    BOX: {name: "box", index: 5},
    GLITCH: {name: "glitch", index: 6},
    STICKER: {name: "sticker", index: 7},
    SOBEL: {name: "sobel", index: 8},
    SPLATTER: {name: "splatter", index: 9},
}

function parse_effect_from_name(effect_string) {
    for (const entry in effects) {
        const effect = effects[entry];
        if (effect.name === effect_string) {
            return effect;
        }
    }
    console.error("Returning empty effect!", effect_string);
    return effects.NONE;
}

const klasses = {
    BELLY_EXPOSED: {key: "BELLYEXPOSED", name: "Belly (nude)", index: 0, nude: true, erotic: false},
    BELLY_COVERED: {key: "BELLYCOVERED", name: "Belly", index: 1, nude: false, erotic: false},
    BUTTOCKS_EXPOSED: {key: "BUTTOCKSEXPOSED", name: "Buttocks (nude)", index: 2, nude: true, erotic: false},
    BUTTOCKS_COVERED: {key: "BUTTOCKSCOVERED", name: "Buttocks", index: 3, nude: false, erotic: false},
    FEMALE_BREAST_EXPOSED: {key: "FEMALEBREASTEXPOSED", name: "Breast F (nude)", index: 4, nude: true, erotic: true},
    FEMALE_BREAST_COVERED: {key: "FEMALEBREASTCOVERED", name: "Breast F", index: 5, nude: false, erotic: false},
    FEMALE_GENITALIA_EXPOSED: {key: "FEMALEGENITALIAEXPOSED", name: "Genitalia F (nude)", index: 6, nude: true, erotic: true},
    FEMALE_GENITALIA_COVERED: {key: "FEMALEGENITALIACOVERED", name: "Genitalia F", index: 7, nude: false, erotic: false},
    MALE_GENITALIA_EXPOSED: {key: "MALEGENITALIAEXPOSED", name: "Genitalia M (nude)", index: 9, nude: true, erotic: true},
    MALE_GENITALIA_COVERED: {key: "MALEGENITALIACOVERED", name: "Genitalia M", index: 8, nude: false, erotic: false},
    MALE_BREAST_EXPOSED: {key: "MALEBREASTEXPOSED", name: "Breast M (nude)", index: 10, nude: true, erotic: false},
    MALE_BREAST_COVERED: {key: "MALEBREASTCOVERED", name: "Breast M", index: 11, nude: false, erotic: false},
    FACE_FEMALE: {key: "FACEFEMALE", name: "Female", index: 12, nude: false, erotic: false},
    FACE_MALE: {key: "FACEMALE", name: "Male", index: 13, nude: false, erotic: false},
    FEET_EXPOSED: {key: "FEETEXPOSED", name: "Feet (nude)", index: 15, nude: true, erotic: false},
    FEET_COVERED: {key: "FEETCOVERED", name: "Feet", index: 14, nude: false, erotic: false},
    ARMPITS_EXPOSED: {key: "ARMPITSEXPOSED", name: "Armpit (nude)", index: 17, nude: true, erotic: false},
    ARMPITS_COVERED: {key: "ARMPITSCOVERED", name: "Armpit", index: 16, nude: false, erotic: false},
    ANUS_EXPOSED: {key: "ANUSEXPOSED", name: "Anus (nude)", index: 19, nude: true, erotic: true},
    ANUS_COVERED: {key: "ANUSCOVERED", name: "Anus", index: 18, nude: true, erotic: false},
    NONE: {key: null, name: "Invalid", index: -1, nude: false, erotic: false},
}

function parse_klass_from_index(index) {
    for (const entry in klasses) {
        const klass = klasses[entry];
        if (klass.index === index) {
            return klass;
        }
    }
    console.error("Returning empty klass!", index);
    return klasses.NONE;
}

function parse_entry_from_index(index) {
    for (const entry in klasses) {
        const klass = klasses[entry];
        if (klass.index === index) {
            return entry;
        }
    }
    console.error("Returning empty klass!", index);
    return 'NONE';
}