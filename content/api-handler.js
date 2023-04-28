function puryFiImageByBlobToImage(blob, callback) {
    const sending = browser.runtime.sendMessage({
        paint_request: true,
        blob: blob,
    });

    sending.then(response => {
        callback(cloneInto(
            response,
            window,
            {cloneFunctions: true}));
    });
}

function puryFiImageByBlobToResults(blob, callback) {
    let blob_url = URL.createObjectURL(blob);
    let fileReader = new FileReader();
    fileReader.onloadend = function (e) {
        let arr = new Uint8Array(e.target.result);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
            header += arr[i].toString(16);
        }
        checkMimeHeader(header, function (type, ext, header, cont) {
            let full_type = type;
            //Repair short content types
            const file_types = ['jpg', 'png', 'bmp', 'webp'];
            if (file_types.includes(type)) {
                full_type = 'image/' + type;
            }
            if (!processableContentType(full_type, file_types, null)) {
                return;
            }
            const imageData = new Image();
            imageData.onload = function () {
                let tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.naturalWidth;
                tempCanvas.height = this.naturalHeight;
                let tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(imageData, 0, 0, tempCanvas.width, tempCanvas.height);
                let frame = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

                let sending = browser.runtime.sendMessage({
                    ai_request: true,
                    frame: frame,
                    width: tempCanvas.width,
                    height: tempCanvas.height
                });
                sending.then(response => {
                    /*
                    let valid_detections = response.valid_detections;
                    let classes = response.classes;
                    let scores = response.scores;
                    let boxes = response.boxes;
                    */
                    callback(cloneInto(
                        response,
                        window,
                        {cloneFunctions: true}));
                    URL.revokeObjectURL(blob_url);
                });
            }
            imageData.src = blob_url;
        }, e.target.result);
    };
    fileReader.readAsArrayBuffer(blob.slice(0, 4));
}

function puryFiImageByBlob(blob, callback, toImage = false) {
    if (toImage) {
        puryFiImageByBlobToImage(blob, callback);
    } else {
        puryFiImageByBlobToResults(blob, callback);
    }

}

function puryFiGetVersion(){
    return browser.runtime.getManifest().version;
}

exportFunction(puryFiImageByBlob, window, {defineAs: 'puryFiImageByBlob'});
exportFunction(puryFiGetVersion,  window, {defineAs: 'puryFiGetVersion'});