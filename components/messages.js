let connectionPort;

function connected(p) {
    connectionPort = p;
    connectionPort.onMessage.addListener(function(request) {
        if(request.ai_request && request.file_url){
            let image = new Image();
            image.onload = function () {
                let tempCanvas = document.createElement('canvas');
                tempCanvas.width = request.width;
                tempCanvas.height = request.height;
                let tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

                const fromPixels = tf.browser.fromPixels(tempCanvas);
                const resized = tf.image.resizeBilinear(fromPixels, [modelWeight, modelHeight]);
                const divved = resized.div(255.0);
                const input = divved.expandDims(0);
                model.executeAsync(input).then(res => {
                    const [boxes, scores, classes, valid_detections] = res;
                    let valid_detections_sync =  valid_detections.dataSync();
                    let classes_sync =  classes.dataSync();
                    let boxes_sync =  boxes.dataSync();
                    let scores_sync =  scores.dataSync();
                    valid_detections.dispose();
                    classes.dispose();
                    scores.dispose();
                    boxes.dispose();
                    connectionPort.postMessage({
                        valid_detections: valid_detections_sync,
                        classes: classes_sync,
                        boxes: boxes_sync,
                        scores: scores_sync,
                    });
                }).catch(e => {
                    console.log("ERROR",e.message)
                    return;
                }).finally(fin => {
                    resized.dispose();
                    divved.dispose();
                    input.dispose();
                    fromPixels.dispose();
                    return;
                });

            }
            image.src = request.file_url;
            return true;
        }
    });
}

browser.runtime.onConnect.addListener(connected);

function handleMessage(request, sender, sendResponse) {
    if (request.getdata) {
        sendData(sendResponse);
        return true;
    }
    if (request.syncstatictics) {
        statisticsSync(false, sendResponse);
        return true;
    }
    if (request.resetstatistics) {
        resetStatistics(sendResponse);
        return true;
    }
    if (request.clearcache) {
        censored_cache = new Map();
    }
    if (request.reset_options) {
        restoreDefaultConfiguration(request.reset_options_leave_out);
    }
    if (request.initialize_options) {
        initializeOptions();
    }
    if (request.reset_stickers) {
        loadDefaultStickers();
        cacheStickerCollections(sticker_collections);
    }
    if (request.reset_oom_tree) {
        let local_request = browser.storage.local.get(['sticker_collections']);
        local_request.then((res) => {
            let scol = res.sticker_collections;
            let sett = res.settings;
            OOMTrees = [];
            only_once_mode_storage_manager = new OnlyOnceModeStorageManager();
            browser.storage.local.clear().then((cl) => {
                browser.storage.local.set({
                    sticker_collections: scol,
                    settings: sett,
                }).then(() => {
                    sendResponse({
                        reset_oom_tree_done: true,
                    });
                });
                }
            );
        });
        return true;
    }
    if (request.oom_test) {
        (async() => {
            generateTestData();
        })()
    }
    if (request.options) {
        updateOptions(false);
    }
    if (request.logout) {
        logout();
    }
    if (request.login) {
        login(request.username, request.password, sendResponse);
        return true;
    }
    return false;
}

function handleFrameMessage(request, sender, sendResponse) {
    if(request.batch_converter){
        stats.batch_converter.total();
    }
    if(request.local_file){
        stats.local_files.total();
    }
    if(request.video_frame){
        stats.videos.frames();
    }
    if(request.video){
        stats.videos.total();
    }

    if(request.ai_request){
        let inp = request.frame;
        if(prescale && request.width > 320 && request.height > 320){

            let canvas = document.createElement("canvas");
            canvas.width = request.width;
            canvas.height = request.height;
            let ctx = canvas.getContext("2d");
            ctx.putImageData(request.frame, 0,0, );

            let canvas2 = document.createElement("canvas");
            canvas2.width=320;
            canvas2.height=320;
            let ctx2 = canvas2.getContext("2d");
            ctx2.drawImage(canvas, 0, 0, 320, 320);

            inp = canvas2;
        }
        const fromPixels = tf.browser.fromPixels(inp);
        //const fromPixels = tf.browser.fromPixels(request.frame);
        const resized = tf.image.resizeBilinear(fromPixels, [modelWeight, modelHeight]);
        const divved = resized.div(255.0);
        const input = divved.expandDims(0);
        model.executeAsync(input).then(res => {
            const [boxes, scores, classes, valid_detections] = res;
            let valid_detections_sync =  valid_detections.dataSync();
            let classes_sync =  classes.dataSync();
            let boxes_sync =  boxes.dataSync();
            let scores_sync =  scores.dataSync();
            valid_detections.dispose();
            classes.dispose();
            scores.dispose();
            boxes.dispose();
            sendResponse({
                valid_detections: valid_detections_sync,
                classes: classes_sync,
                boxes: boxes_sync,
                scores: scores_sync,
            });
        }).catch(e => {
            log(e.message)
            return;
        }).finally(fin => {
            resized.dispose();
            divved.dispose();
            input.dispose();
            fromPixels.dispose();
            return;
        });
        return true;
    }
    else if(request.gif_request)
    {
        let censor_type_processed = censor_type;
        let blob = request.blob;
        browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
            .then(tabs => browser.tabs.get(tabs[0].id))
            .then(tab => {
                let filename = "test";
                let requestDetails = {
                    tabID: tab.id,
                    url: tab.url,
                    originUrl: tab.url,
                };
                let file = new File([blob], filename);
                let fin_func = function (gif_blob){
                    sendResponse({
                        blob: gif_blob,
                    });
                }
                handleGif(requestDetails, blob, file, null, null, filename, filename, "image/gif", null , censor_type_processed, fin_func);
            });

        return true;
    }
    else if(request.paint_request)
    {
        let censor_type_processed = censor_type;
        if(request.censor_type){
            censor_type_processed = request.censor_type;
        }
        let blob = request.blob;
        browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
            .then(tabs => browser.tabs.get(tabs[0].id))
            .then(tab => {
                let filename = blob.name? blob.name : "unknown";
                let requestDetails = {
                    tabID: tab.id,
                    url: tab.url,
                    originUrl: tab.url,
                };
                let file = new File([blob], filename);
                let fin_func = function (fin_blob){
                    sendResponse({
                        blob: fin_blob,
                    });
                }
                let content_type_header = request.content_type_header? request.content_type_header : "image/png";
                let ext = request.ext? request.ext : "png";
                handleImage(requestDetails, blob, file, null, null, filename, content_type_header, ext, null , censor_type_processed, fin_func);
            });
        return true;
    }
    else if(request.oom_time_request){
        phash.hash(request.blob).then(hash => {
            setTimeout(function () {
                let data = searchOOMTrees(hash.toBinary());
                sendResponse({
                    hash_data: data,
                });
            },1000);
        });
        return true;
    }

}

browser.runtime.onMessage.addListener(handleMessage);

browser.runtime.onMessage.addListener(handleFrameMessage);




