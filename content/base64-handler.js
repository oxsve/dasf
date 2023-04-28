$(document).ready(function() {
    //TODO Check every x seconds if new elements exists
    let conf = browser.storage.sync.get(['active','base64_scanner','whiteblacklist_configuration']);
    conf.then((res) => {
        let listed = checkWhiteBlacklist(res.whiteblacklist_configuration, window.location.origin, window.location.origin);
        if (!listed) {
            return;
        }
        if(res.active && res.base64_scanner){
            $( "img" ).each(function( index ) {
                let img_elem = $( this );
                let file_url = img_elem.prop('src');
                if(img_elem.prop('src') && file_url.startsWith('data:image')){
                    toDataURL(file_url, function (data, contenttype) {
                        let blob = new Blob([data]);
                        let fileReader = new FileReader();
                        fileReader.onloadend = function(e) {
                            let arr = new Uint8Array(e.target.result);
                            let header = '';
                            for (let i = 0; i < arr.length; i++) {
                                header += arr[i].toString(16);
                            }
                            checkMimeHeader(header, function (type, ext, header, cont){
                                let options = browser.storage.sync.get(['file_types','labels','censor_type','bar_configuration',
                                    'blur_configuration','pixel_configuration','gif_configuration','glitch_configuration',
                                    'triangle_configuration','sticker_configuration','splatter_configuration','sobel_configuration',
                                    'reverse_mode_configuration','word_wall_configuration','clustering_configuration','lock_configuration']);
                                options.then((res) => {
                                    let full_type = type;
                                    //Repair short content types
                                    if(res.file_types.includes(type)){
                                        full_type = 'image/'+type;
                                    }
                                    if (!processableContentType(full_type, res.file_types, res.gif_configuration)) {
                                        return;
                                    }
                                    img_elem.css('filter','blur(50px)');
                                    let imageData = new Image();
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
                                            let valid_detections = response.valid_detections;
                                            let classes = response.classes;
                                            let scores = response.scores;
                                            let boxes = response.boxes;
                                            if(full_type === "image/gif" && !res.gif_configuration._thumbnails){
                                                let gif_request = browser.runtime.sendMessage({
                                                    gif_request: true,
                                                    data: [valid_detections, classes, scores, boxes],
                                                    blob: blob,
                                                });
                                                gif_request.then(gif_response => {
                                                    let censored_url = URL.createObjectURL(gif_response.blob);
                                                    img_elem.prop("src", censored_url);
                                                    img_elem.css('filter', '');
                                                });
                                            }else{
                                                if(res.censor_type === "triangle"){
                                                    let paint_request = browser.runtime.sendMessage({
                                                        paint_request: true,
                                                        data: [valid_detections, classes, scores, boxes],
                                                        blob: blob,
                                                    });
                                                    paint_request.then(paint_response => {
                                                        let censored_url = URL.createObjectURL(paint_response.blob);
                                                        img_elem.prop("src", censored_url);
                                                        img_elem.css('filter', '');
                                                    });
                                                }else {
                                                    let marvinImage = new MarvinImage();
                                                    marvinImage.load(file_url, function () {
                                                        let conf = {
                                                            bar_configuration: res.bar_configuration,
                                                            pixel_configuration: res.pixel_configuration,
                                                            blur_configuration: res.blur_configuration,
                                                            glitch_configuration: res.glitch_configuration,
                                                            triangle_configuration: res.triangle_configuration,
                                                            sobel_configuration: res.sobel_configuration,
                                                            splatter_configuration: res.splatter_configuration,
                                                            reverse_mode_configuration: res.reverse_mode_configuration,
                                                            sticker_configuration: res.sticker_configuration,
                                                            lock_configuration: res.lock_configuration,
                                                            word_wall_configuration: res.word_wall_configuration,
                                                        };
                                                        let cache = {};
                                                        paintCensor(marvinImage, res.censor_type, res.labels, valid_detections, classes, scores, boxes, conf, cache);
                                                        let marvinBlob = marvinImage.toBlob();
                                                        let censored_url = URL.createObjectURL(marvinBlob);
                                                        img_elem.prop("src", censored_url);
                                                        img_elem.css('filter', '');
                                                    });
                                                }
                                            }
                                        });
                                    }
                                    imageData.src = file_url;
                                });
                            }, e.target.result);
                        };
                        fileReader.readAsArrayBuffer(blob.slice(0, 4))
                    });
                }
            });
        }
    });
});