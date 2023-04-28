$(document).ready(function() {
    if(location.protocol === 'file:' && puryfi_active){
        let file_url = $("img").attr("src");
        censorLocalFile(file_url, null);
    }
})

function censorLocalFile(file_url, censor_type = null) {
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
                    'triangle_configuration','sticker_configuration','sobel_configuration','splatter_configuration',
                    'reverse_mode_configuration','word_wall_configuration','clustering_configuration','lock_configuration']);
                options.then((res) => {
                    if(!censor_type){
                        censor_type = res.censor_type;
                    }
                    let full_type = type;
                    //Repair short content types
                    if(res.file_types.includes(type)){
                        full_type = 'image/'+type;
                    }
                    if (!processableContentType(full_type, res.file_types, res.gif_configuration)) {
                        return;
                    }
                    $("img").css('filter','blur(50px)');
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
                            local_file: true,
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
                                    blob: blob,
                                });
                                gif_request.then(gif_response => {
                                    let censored_url = URL.createObjectURL(gif_response.blob);
                                    $("img").attr("src", censored_url);
                                    $("img").css('filter', '');
                                });
                            }else{
                                if(censor_type === "triangle" || censor_type === "sticker"){
                                    let paint_request = browser.runtime.sendMessage({
                                        paint_request: true,
                                        blob: blob,
                                        censor_type: censor_type,
                                        content_type_header: full_type,
                                        ext: ext,
                                    });
                                    paint_request.then(paint_response => {
                                        let censored_url = URL.createObjectURL(paint_response.blob);
                                        $("img").attr("src", censored_url);
                                        $("img").css('filter', '');
                                    });
                                }else{
                                    let marvinImage = new MarvinImage();
                                    marvinImage.load(file_url, function () {
                                        let conf = {
                                            bar_configuration: res.bar_configuration,
                                            pixel_configuration: res.pixel_configuration,
                                            blur_configuration: res.blur_configuration,
                                            glitch_configuration: res.glitch_configuration,
                                            triangle_configuration: res.triangle_configuration,
                                            reverse_mode_configuration: res.reverse_mode_configuration,
                                            word_wall_configuration: res.word_wall_configuration,
                                            sticker_configuration: res.sticker_configuration,
                                            sobel_configuration: res.sobel_configuration,
                                            splatter_configuration: res.splatter_configuration,
                                            lock_configuration: res.lock_configuration,
                                        };
                                        let cache = {};
                                        paintCensor(marvinImage, censor_type, res.labels, valid_detections, classes, scores, boxes, conf, cache);
                                        let marvinBlob = marvinImage.toBlob(full_type);
                                        let censored_url = URL.createObjectURL(marvinBlob);
                                        $("img").attr("src", censored_url);
                                        $("img").css('filter', '');
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