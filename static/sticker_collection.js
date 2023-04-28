class StickerCollection {

    constructor(name, stickers, enabled = true, locked = false) {
        this._name = name;
        this._stickers = stickers;
        this._locked = locked;
        this._enabled = enabled;
    }

    get stickers() {
        return this._stickers;
    }

    set stickers(value) {
        this._stickers = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get locked() {
        return this._locked;
    }

    set locked(value) {
        this._locked = value;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value) {
        this._enabled = value;
    }

}

function getStickersByGroup(collection, groups){
    let stickers = [];
    collection._stickers.forEach(function(s){
        let intersection = s.groups.filter(value => groups.includes(value));

        if(intersection.length > 0){
            stickers.push(s);
        }
    });
    return stickers;
}

/**
 * Loads the Imagedata directly into the collection.
 * We do that as we do not want imageData in the local storage as it is 3 times bigger than a Base64 encoded image.
 */
function cacheStickerCollections(sticker_collections, sticker_configuration){
    sticker_collections.forEach(function (collection) {
        for (const i in collection._stickers) {
            let sticker = collection._stickers[i];
            let image = new Image();
            image.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = sticker.width;
                canvas.height = sticker.height;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0);
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);//.data.buffer;
                try{
                    sticker.file = cloneInto(
                        imageData.data,
                        window,
                        {cloneFunctions: true});
                }catch(e){
                    sticker.file = imageData.data;
                }
            }
            image.src = sticker.url;
        }
    });
    if(sticker_configuration){
        sticker_configuration._cached = true;
    }
};