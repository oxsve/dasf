const TAG = "listener";

let censored_cache = new Map();
let context_requests = [];
let do_cache = true;
let current_tab_id = null;
let sticker_collections = null;

/**********************************************************************************************************************
 * OPTIONS
 **********************************************************************************************************************/


function sendData(sendResponse) {
    sendResponse({
        cache: censored_cache,
        queue: queue,
        tsbackend: tf.getBackend(),
        tstensors: tf.memory().numTensors,
        tsnumBytes: tf.memory().numBytes,
        tsnumDataBuffers: tf.memory().numDataBuffers,
        tsunreliable: tf.memory().unreliable,
        tsreasons: tf.memory().reasons,
        tsnumBytesInGPU: tf.memory().numBytesInGPU,
    });
}

let extension_active = true;
let labels = null;
let censor_type = null;
let file_types = null;

function initializeOptions() {

    let options_request = browser.storage.sync.get(['active', 'labels', 'censor_type', 'file_types', 'debug', 'do_cache', 'prescale',
        'bar_configuration', 'blur_configuration', 'pixel_configuration', 'glitch_configuration',
        'triangle_configuration', 'sticker_configuration', 'sobel_configuration', 'splatter_configuration',
        'gif_configuration', 'png_configuration', 'jpg_configuration', 'bmp_configuration', 'webp_configuration', 'avif_configuration',
        'whiteblacklist_configuration','reverse_mode_configuration', 'clustering_configuration', 'only_once_mode_configuration',
        'word_wall_configuration','icon_configuration', 'base64_scanner','statistics_enabled', 'lock_configuration', 'version']);
    options_request.then((res) => {
        if(!res.version){
            // Version below 7.3

        }else if(compareVersions(browser.runtime.getManifest().version, res.version)){
            browser.storage.sync.set({
                version: browser.runtime.getManifest().version,
            });
        }

        // Debugging
        if (res.debug != null) {
            debug = res.debug;
        } else {
            debug = false;
            browser.storage.sync.set({
                debug: false,
            });
        }

        //Cache
        if (res.do_cache != null) {
            do_cache = res.do_cache;
        } else {
            do_cache = true;
            browser.storage.sync.set({
                do_cache: true,
            });
        }

        //Prescale
        if (res.prescale != null) {
            prescale = res.prescale;
        } else {
            prescale = true;
            browser.storage.sync.set({
                prescale: true,
            });
        }

        // Active
        if (res.active != null) {
            extension_active = res.active;
        } else {
            extension_active = true;
            browser.storage.sync.set({
                active: true,
            });
        }
        // Labels
        if (res.labels != null) {
            labels = res.labels;
        } else {
        	// TODO obtain from list of areas
            /*
            labels = ["BELLYEXPOSED",
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
            */
            labels = default_labels;
            browser.storage.sync.set({
                labels: labels
            });
        }
        // Censor Type
        if (res.censor_type != null) {
            censor_type = res.censor_type;
        } else {
            censor_type = 'black';
            browser.storage.sync.set({
                censor_type: 'black'
            });
        }
        // File Types
        if (res.file_types != null) {
            file_types = res.file_types;
        } else {
            file_types = ['jpg', 'png', 'bmp', 'webp', 'avif'];
            browser.storage.sync.set({
                file_types: ['jpg', 'png', 'bmp', 'webp', 'avif']
            });
        }

        // CensorType Configuration
        if (res.blur_configuration != null) {
            blur_configuration = res.blur_configuration;
        } else {
            browser.storage.sync.set({
                blur_configuration: default_blur_configuration,
            });
        }
        if (res.pixel_configuration != null) {
            pixel_configuration = res.pixel_configuration;
        } else {
            browser.storage.sync.set({
                pixel_configuration: default_pixel_configuration,
            });
        }
        if (res.bar_configuration != null) {
            bar_configuration = res.bar_configuration;
        } else {
            browser.storage.sync.set({
                bar_configuration: default_bar_configuration,
            });
        }

        if (res.glitch_configuration != null) {
            glitch_configuration = res.glitch_configuration;
        } else {
            browser.storage.sync.set({
                glitch_configuration: default_glitch_configuration,
            });
        }

        if (res.triangle_configuration != null) {
            triangle_configuration = res.triangle_configuration;
        } else {
            browser.storage.sync.set({
                triangle_configuration: default_triangle_configuration,
            });
        }

        if (res.sticker_configuration != null) {
            sticker_configuration = res.sticker_configuration
        } else {
            browser.storage.sync.set({
                sticker_configuration: default_sticker_configuration,
            });
        }

        if (res.sobel_configuration != null) {
            sobel_configuration = res.sobel_configuration
        } else {
            browser.storage.sync.set({
                sobel_configuration: default_sobel_configuration,
            });
        }

        if (res.splatter_configuration != null) {
            splatter_configuration = res.splatter_configuration
        } else {
            browser.storage.sync.set({
                splatter_configuration: default_splatter_configuration,
            });
        }

        if (res.png_configuration != null) {
            png_configuration = res.png_configuration;
        } else {
            browser.storage.sync.set({
                png_configuration: default_png_configuration,
            });
        }

        if (res.jpg_configuration != null) {
            jpg_configuration = res.jpg_configuration;
        } else {
            browser.storage.sync.set({
                jpg_configuration: default_jpg_configuration,
            });
        }

        if (res.bmp_configuration != null) {
            bmp_configuration = res.bmp_configuration;
        } else {
            browser.storage.sync.set({
                bmp_configuration: default_bmp_configuration,
            });
        }

        if (res.webp_configuration != null) {
            webp_configuration = res.webp_configuration;
        } else {
            browser.storage.sync.set({
                webp_configuration: default_webp_configuration,
            });
        }

        if (res.avif_configuration != null) {
            avif_configuration = res.avif_configuration;
        } else {
            browser.storage.sync.set({
                avif_configuration: default_avif_configuration,
            });
        }

        if (res.gif_configuration != null) {
            gif_configuration = res.gif_configuration;
        } else {
            browser.storage.sync.set({
                gif_configuration: default_gif_configuration,
            });
        }
        // Blacklist / Whitelist
        if (res.whiteblacklist_configuration != null) {
            whiteblacklist_configuration = res.whiteblacklist_configuration;
        } else {
            browser.storage.sync.set({
                whiteblacklist_configuration: default_whiteblacklist_configuration,
            });
        }

        if (res.only_once_mode_configuration != null) {
            only_once_mode_configuration = res.only_once_mode_configuration;
        } else {
            browser.storage.sync.set({
                only_once_mode_configuration: default_only_once_mode_configuration,
            });
        }

        if (res.reverse_mode_configuration != null) {
            reverse_mode_configuration = res.reverse_mode_configuration;
        } else {
            browser.storage.sync.set({
                reverse_mode_configuration: default_reverse_mode_configuration,
            });
        }

        if(res.word_wall_configuration != null){
            word_wall_configuration = res.word_wall_configuration;
        } else {
            browser.storage.sync.set({
                word_wall_configuration: default_word_wall_configuration,
            });
        }

        // Icon
        if (res.icon_configuration != null) {
            icon_configuration = res.icon_configuration;
            browser.browserAction.setIcon(
                {path: icon_configuration['16']}
            );
        } else {
            browser.storage.sync.set({
                icon_configuration: default_icon_configuration,
            });
        }

        // Clustering
        if (res.clustering_configuration != null) {
            clustering_configuration = res.clustering_configuration;
        } else {
            browser.storage.sync.set({
                clustering_configuration: default_clustering_configuration,
            });
        }

        if (res.base64_scanner != null) {
            // This option is not relevant for the background script
        } else {
            browser.storage.sync.set({
                base64_scanner: true,
            });
        }
        if (res.statistics_enabled != null) {
            statistics_enabled = res.statistics_enabled;
        } else {
            browser.storage.sync.set({
                statistics_enabled: statistics_enabled,
            });
        }

        // LOCK
        if (res.lock_configuration != null) {
            lock_configuration = res.lock_configuration;
        } else {
            browser.storage.sync.set({
                lock_configuration: lock_configuration,
            });
        }

        repairConfigurations();

        refreshLogin();
    });


    loadDefaultStickers(() => {
        let local_request = browser.storage.local.get(['sticker_collections','only_once_mode_storage_manager']);
        local_request.then((res) => {

            // Stickers
            if (res.sticker_collections != null) {
                sticker_collections = res.sticker_collections;
            }
            if(sticker_collections){
                cacheStickerCollections(sticker_collections, sticker_configuration);
            }

            // OOM Tree
            if (res.only_once_mode_storage_manager != null) {
                only_once_mode_storage_manager = res.only_once_mode_storage_manager;
            }else{
                browser.storage.local.set({
                    only_once_mode_storage_manager: only_once_mode_storage_manager,
                });
            }
            initiateOOMTrees();

        });
    });

}

function updateOptions(startup) {
    let options_request = browser.storage.sync.get(['active', 'labels', 'censor_type', 'file_types', 'bar_color', 'debug',
        'do_cache', 'prescale', 'bar_configuration', 'blur_configuration', 'pixel_configuration', 'glitch_configuration',
        'triangle_configuration','sticker_configuration', 'sobel_configuration', 'splatter_configuration',
        'gif_configuration', 'png_configuration', 'jpg_configuration', 'bmp_configuration', 'webp_configuration', 'avif_configuration', 'icon_configuration',
        'whiteblacklist_configuration', 'reverse_mode_configuration', 'word_wall_configuration', 'clustering_configuration', 'only_once_mode_configuration',
        'statistics_enabled', 'lock_configuration']);
    options_request.then((res) => {
        debug = res.debug || false;
        if (extension_active !== res.active || startup) {
            browser.browsingData.remove({},
                {
                    cache: true,
                });
            log("Cacheconfiguration cleared");
        }
        extension_active = res.active;

        labels = res.labels || [];
        // Censor Type changed, unlock all locked
        if(censor_type != res.censor_type){
            for (let [url, cached_result] of censored_cache) {
                cached_result._lock_censortype = false;
            }
        }
        censor_type = res.censor_type || 'black';
        file_types = res.file_types || ['jpg', 'png', 'bmp', 'webp'];
        do_cache = res.do_cache;
        prescale = res.prescale;
        blur_configuration = res.blur_configuration || default_blur_configuration;
        bar_configuration = res.bar_configuration || default_bar_configuration;
        pixel_configuration = res.pixel_configuration || default_pixel_configuration;
        glitch_configuration = res.glitch_configuration || default_glitch_configuration;
        triangle_configuration = res.triangle_configuration || default_triangle_configuration;
        sticker_configuration = res.sticker_configuration || default_sticker_configuration;
        sobel_configuration = res.sobel_configuration || default_sobel_configuration;
        splatter_configuration = res.splatter_configuration || default_splatter_configuration;
        png_configuration = res.png_configuration || default_png_configuration;
        jpg_configuration = res.jpg_configuration || default_jpg_configuration;
        bmp_configuration = res.bmp_configuration || default_bmp_configuration;
        webp_configuration = res.webp_configuration || default_webp_configuration;
        avif_configuration = res.avif_configuration || default_avif_configuration;
        gif_configuration = res.gif_configuration || default_gif_configuration;
        whiteblacklist_configuration = res.whiteblacklist_configuration || default_whiteblacklist_configuration;
        reverse_mode_configuration = res.reverse_mode_configuration || default_reverse_mode_configuration;
        word_wall_configuration = res.word_wall_configuration || default_word_wall_configuration;
        only_once_mode_configuration = res.only_once_mode_configuration || default_only_once_mode_configuration;
        clustering_configuration = res.clustering_configuration || default_clustering_configuration;
        lock_configuration = res.lock_configuration || default_lock_configuration;
        if(res.icon_configuration){
            icon_configuration = res.icon_configuration || default_icon_configuration;
            if(extension_active){
                browser.browserAction.setIcon(
                    {path: icon_configuration['16']}
                );
            }else{
                let url = browser.runtime.getURL(icon_configuration['16']);
                let image = new Image();
                image.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = 16;
                    canvas.height = 16;
                    const ctx = canvas.getContext("2d");
                    ctx.filter = 'grayscale(1)';
                    ctx.drawImage(image, 0, 0);
                    browser.browserAction.setIcon(
                        {imageData: ctx.getImageData(0, 0, 16, 16)}
                    );
                }
                image.src = url;

            }
        }
        statistics_enabled = res.statistics_enabled;
        if (reverse_mode_configuration.enabled == true && (user == null || user.permissions.permission_reverse_censoring > user.patreon_tier)) {
            reverse_mode_configuration.enabled = false;
            browser.storage.sync.set({
                reverse_mode_configuration: reverse_mode_configuration,
            });
        }
        if (only_once_mode_configuration.enabled == true && (user == null || user.permissions.permission_only_once_mode > user.patreon_tier)) {
            only_once_mode_configuration.enabled = false;
            browser.storage.sync.set({
                only_once_mode_configuration: only_once_mode_configuration,
            });
        }
        // Todo: gif disable
        // Todo: do not rebuild cache every save_config, rather track sticker changes and trigger this
        let local_request = browser.storage.local.get(['sticker_collections']);
        local_request.then((res) => {
            if (res.sticker_collections != null) {
                sticker_collections = res.sticker_collections;
            }
            if(sticker_configuration._cached == false){
                cacheStickerCollections(sticker_collections, sticker_configuration);
            }
        });

    });
}

initializeOptions();


/**********************************************************************************************************************/


/**********************************************************************************************************************
 * AI
 **********************************************************************************************************************/
const [modelWeight, modelHeight] = [320, 320];
const weights = browser.runtime.getURL("web_model/model.json");
var model = null;

tf.loadGraphModel(weights).then(model_await => {
    model = model_await;
    //Warmup
    tf.enableProdMode();
    //tf.enableDebugMode();

    const dummy = tf.zeros([1, 320, 320, 3], 'float32');
    return model.executeAsync(dummy).then(function (result) {
        const [boxes, scores, classes, valid_detections] = result;
        valid_detections.dispose();
        classes.dispose();
        scores.dispose();
        boxes.dispose();
        dummy.dispose();
        log("Model LOADED");
        return result;
    });

});

browser.webRequest.onBeforeRequest.addListener(
    blockImages,
    {urls: ["<all_urls>"], types: ["image", "imageset", "media", "main_frame"]},
    ["blocking"]
);

browser.tabs.onRemoved.addListener(handleRemoved);

function handleRemoved(tabId, removeInfo) {
    log("Tab: " + tabId + " is closing");
    log("Window ID: " + removeInfo.windowId);
    log("Window is closing: " + removeInfo.isWindowClosing);
    log("queue length before: ", queue.length);
    queue.forEach(function (item, index, object) {
        if (item.tabId == tabId) {
            object.splice(index, 1);
            log('Removed from queue', object);
        }
    });
    log("Queue length after: ", queue.length);

}

browser.tabs.onUpdated.addListener(handleUpdated);

function handleUpdated(tabId, changeInfo, tabInfo) {
    //log("Updated tab: " + tabId);
    //log("Changed attributes: ");
    //log(changeInfo);
    //log("New tab Info: ");
    //log(tabInfo);
    if (tabInfo.active) {
        if (current_tab_id != tabInfo.id) {
            current_tab_id = tabInfo.id;
            //log("current_tab_id", current_tab_id);
            queue.sort(compareCensorRequest);
        }
    }

    // What if we open a new web-page but there are ongoing requests
    // This is bugged
    /*
    queue.forEach(function (item, index, object) {
      if(item.tabId == tabId && item.originUrl != tabInfo.url){
          object.splice(index, 1);
          log("Removing ",tabId, item.originUrl, tabInfo);
      }
    });
    */

}

browser.webRequest.onHeadersReceived.addListener(
    uncache,
    {urls: ["<all_urls>"], types: ["image", "imageset", "media", "main_frame"]}, //"main_frame"
    ["blocking", "responseHeaders"]
);

function uncache(e) {
    if (!extension_active) {
        return;
    }
    log("UNCACHING:", e);
    var asyncCacheControl = new Promise((resolve, reject) => {
        for (var i = e.responseHeaders.length - 1; i >= 0; --i) {
            if (e.responseHeaders[i].name == "Cache-Control") {
                e.responseHeaders.splice(i, 1);
            }
        }
        var cacheControl = {
            name: "Cache-Control",
            value: "no-cache, no-store, must-revalidate"
        };
        e.responseHeaders.push(cacheControl);
        resolve({responseHeaders: e.responseHeaders});
    });
    return asyncCacheControl;
}


function compareCensorRequest(a, b) {
    /*
    if(a.tabId != current_tab_id){
        return 1;
    }
    */
    if (a.tabId != b.tabId) {
        if (a.tabId == current_tab_id) {
            //log("Sortiere a nach vorne weil current ", a.tabId, "current = ", current_tab_id);
            return -1;
        }
        if (b.tabId == current_tab_id) {
            //log("Sortiere a nach vorne weil nicht current", a.tabId, "current = ", current_tab_id);
            return 1;
        }
    }
    if (a.img_dimension > b.img_dimension) {
        //log("Sortiere größeres Biild nach vorne");
        return -1;
    }
    if (a.img_dimension < b.img_dimension) {
        //log("Sortiere kleines Bild nach hinten");
        return 1;
    }
    return 0;
}

function blockImages(requestDetails) {
    if (!extension_active) {
        return {};
    }
    if(whiteblacklist_configuration.mode > 0){
        if(whiteblacklist_configuration.mode == 1){
            for (let regex of whiteblacklist_configuration.white_list) {
                let regExp = new RegExp(regex);
                if(regExp.test(requestDetails.url) || regExp.test(requestDetails.originUrl)){
                    return {};
                }
            }
        }else if(whiteblacklist_configuration.mode == 2){
            let blacklisted = false;
            for (let regex of whiteblacklist_configuration.black_list) {
                let regExp = new RegExp(regex);
                if(regExp.test(requestDetails.url) || regExp.test(requestDetails.originUrl)){
                    blacklisted = true;
                    break;
                }
            }
            if(!blacklisted){
                return {};
            }
        }
    }

    let str = requestDetails.url.substring(0, requestDetails.url.length - 4);
    let pathArray = requestDetails.url.split('/');
    let protocol = pathArray[0];
    let host = pathArray[2];
    let favicon_url = protocol + '//' + host + '/favicon';
    if (favicon_url === str) {
        return {};
    }

    let filter = browser.webRequest.filterResponseData(requestDetails.requestId);

    filter.onerror = event => {
        //console.log(`Error: ${filter.error}`, requestDetails);
    }
    let stream = [];

    let streaming = false;

    filter.onstart = event => {
        requestContentType(requestDetails.url, function (content_type_header) {
            //When we encounter a video we do not want to wait until the filter has finished
            if (content_type_header != null && content_type_header.startsWith('video')) {
                streaming = true;
                return {};
            }
        }, function(e){
            console.log(e)
        });
    }

    filter.ondata = event => {
        if(streaming){
            for (let data of stream) {
                filter.write(data);
            }
            stream = [];
            filter.write(event.data);
        }else{
            stream.push(event.data);
        }
    }

    filter.onstop = event => {
        if (streaming) {
            filter.disconnect();
            return;
        }
        //let t0 = performance.now();
        let blob = new Blob(stream);
        let filename = requestDetails.url.split('/').pop();
        let file = new File([blob], filename);
        checkMime(file, function (content_type_header, ext, header, cont, mime_info) {
            let crf = context_requests.filter(e => e.url === requestDetails.url);
            crf.forEach(f => context_requests.splice(context_requests.findIndex(e => e.name === f.name), 1));
            if (crf.length === 0 && !processableContentType(content_type_header, file_types, gif_configuration)) {
                writeOriginalFilestreamToFilter(filter, stream);
                return {};
            }
            if (do_cache && !only_once_mode_configuration.enabled && content_type_header !== "image/gif") {
                let cache_url = requestDetails.url;
                if (crf.length > 0) {
                    cache_url = crf[0].originalUrl;
                }
                let cached_result = censored_cache.get(cache_url);
                let censor_type_local = censor_type;
                if(cached_result && cached_result._lock_censortype){
                    censor_type_local = cached_result.censortype;
                }
                if (crf.length > 0) {
                    if(cached_result){
                        cached_result._lock_censortype = true;
                    }
                    censor_type_local = crf[0].censor_type;
                }
                if (cached_result) {
                    handleCache(cached_result, requestDetails, filter, censor_type_local);
                    return {};
                }
            }
            let censor_type_processed = censor_type;
            if (crf.length > 0) {
                censor_type_processed = crf[0].censor_type;
            }
            if(content_type_header === "image/webp" && mime_info['ANIM']){
                // Todo: ANIM info / webp Animation support
            }
            if ((!gif_configuration._thumbnails || crf.length > 0) && content_type_header === "image/gif" &&
                (file_types.includes('gif') || crf.length > 0)
            ) {
                handleGif(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed);
            } else {
                if (crf.length === 0 && !cont) {
                    writeOriginalFilestreamToFilter(filter, stream);
                    return {};
                }
                handleImage(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed);
            }
        }, file_types, gif_configuration, requestDetails.url);
    }
}

function handleGif(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback= null){
    if (user != null && user.permissions.permission_file_type_gif <= user.patreon_tier) {
        //For some reason gifs are loaded from ff cache and we have to reload them manually when triggered by context
        if(stream && stream.length === 0){
            toDataURL(requestDetails.url, function (imgage_data, content_type) {
                blob = new Blob([imgage_data], {type: content_type});
                    if (gif_configuration._memory_method > 0) {
                        processGIFMem(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback);
                    } else {
                        processGIF(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback);
                    }
            });
            return {};
        }
        let img_conf = gif_configuration;
        if(!checkImageFileSize(img_conf, file.size)){
            log("rejected by checkImageFileSize:", requestDetails, img_conf, 'image/gif', file.size);
            if(gif_configuration._thumbnail_fallback || file.size < gif_configuration._filesize_min){
                fallBackToThumbnail(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback);
            }else{
                writeOriginalFilestreamToFilter(filter, stream);
            }
            return {};
        }
        if (gif_configuration._memory_method > 0) {
            processGIFMem(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback);
        } else {
            processGIF(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback);
        }
    } else {
        fallBackToThumbnail(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback);
        return {};
    }
}

function fallBackToThumbnail(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback = null){
    handleImage(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback);
}

function handleImage(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_processed, callback = null){
    let urlCreator = window.URL || window.webkitURL;
    let imageUrl = urlCreator.createObjectURL(blob);
    let image = new Image();
    const current_date = Date.now()
    image.onload = function () {
    let oom_p = new Promise((resolveHash, rejectHash) => {
        if(only_once_mode_configuration.enabled &&
           user != null && user.permissions.permission_only_once_mode <= user.patreon_tier
            ) {
            let naturalWidth = this.naturalWidth;
            let naturalHeight = this.naturalHeight;
            if(naturalWidth < only_once_mode_configuration.width_min || naturalHeight < only_once_mode_configuration.height_min){
                resolveHash(null);
            }else {
                phash.hash(file).then(hash => {
                    let data = searchOOMTrees(hash.toBinary());
                    if (data.score >= only_once_mode_configuration.precision) {
                        // We know this image already
                        let r = Object.keys(data.classes);
                        if(only_once_mode_configuration.trigger.length == 0 ||
                            r.some(index => only_once_mode_configuration.trigger.includes(parseInt(index)))){
                            if(data.date > current_date){
                                resolveHash(data);
                            }else{
                                rejectHash(data);
                            }
                        }else{
                            resolveHash(data);
                        }
                    } else {
                        resolveHash(data);
                    }
                });
            }
        }else{
            resolveHash(null);
        }
    }).then(
        hash_data => {
            processImage(requestDetails, blob, file, image, filter, stream, filename, content_type_header, ext, header, censor_type_processed, hash_data).then(r =>
            {
                if(callback){
                    callback(r);
                }
            }).catch(e =>
            {
                if(stream != null && filter != null){
                    writeOriginalFilestreamToFilter(filter, stream);
                }
                log('error', e)
                if(callback){
                    callback(blob);
                }
                return null;
            });
        }
    ).catch(
            hash_data =>{
                handleOOMImage(hash_data, blob, file, filter, stream, callback);
            }
        );
    };
    image.src = imageUrl;
}


function roundedImage(ctx, x,y,width,height,radius){
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function writeOriginalFilestreamToFilter(filter, stream){
    for (let data of stream) {
        filter.write(data);
    }
    filter.disconnect();
}

function handleCache(cached_result, requestDetails, filter, censor_type_local = null) {
    log("This request was loaded from cache: ", cached_result);
    if (
        cached_result.censortype == censor_type &&
        cached_result.labels.length === labels.length &&
        cached_result.labels.every(function (value, index) {
            return value === labels[index]
        })
    ) {
        //This is for future purpose
        cached_result.load_from_cache = true;
    } else {
        cached_result.load_from_cache = false;
    }
    //New options to apply:
    if (censor_type_local == null) {
            cached_result.censortype = censor_type;
    } else {
        cached_result.censortype = censor_type_local;
    }


    cached_result.labels = labels;
    applyFilter(requestDetails, cached_result, filter);
}

function processGIF(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_local = null, callback = null) {
    if (censor_type_local == null) {
        censor_type_local = censor_type;
    }
    let t0 = performance.now();
    blob.arrayBuffer().then(buffer => {
        let gif = window.gifuct.parseGIF(buffer);
        let frames = window.gifuct.decompressFrames(gif, true);
        if(gif_configuration._frame_count_max > 0 && frames.length > gif_configuration._frame_count_max){
            log("rejected by Frame count:", gif_configuration, 'image/gif', file.size);
            fallBackToThumbnail(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_local, callback);
            return;
        }
        let gif_encoder = new GIF({
            workers: 2,
            quality: 10,
            debug: debug,
            //background: '#fff',
            //transparent: 'rgba(0,0,0,255)',
            //transparent: 0,
        });
        let gifpromises = [];
        let last_frame = null;
        let transparency_set = false;
        let gif_base_width = null;
        let gif_base_height = null;
        let cache = {};
        frames.forEach(function (element, idx, array) {
            if (idx === 0) {
                gif_base_width = element.dims.width;
                gif_base_height = element.dims.height;
                gif_encoder.setOption('width', gif_base_width);
                gif_encoder.setOption('height', gif_base_height);
                log("GIF ENC Initialised");

                /* return a single frame
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = element.dims.width;
                tempCanvas.height = element.dims.height;
                var tempCtx = tempCanvas.getContext('2d');
                var frameImageData = tempCtx.createImageData(element.dims.width, element.dims.height);
                frameImageData.data.set(element.patch);
                tempCtx.putImageData(frameImageData, 0, 0);
                tempCanvas.toBlob(function(blob) {
                    var reader  = new FileReader();
                    reader.onloadend = function () {
                        resolve({redirectUrl: reader.result});
                    }
                    reader.readAsDataURL(blob);
                });
                return;
                */
            }
            if (element.disposalType > 1 && !transparency_set && 'transparentIndex' in element) {
                gif_encoder.setOption('transparent', 'rgba(0,0,0,${element.transparentIndex})');
                transparency_set = true;
            }

            //log("frames", element);
            let tempCanvas = document.createElement('canvas');
            let tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = gif_base_width;//element.dims.width;
            tempCanvas.height = gif_base_height;//element.dims.height;
            //tempCanvas.width = element.dims.width;
            //tempCanvas.height = element.dims.height;

            //var naturalHeight = element.dims.height;
            //var naturalWidth = element.dims.width;
            let frameImageData = tempCtx.createImageData(element.dims.width, element.dims.height);
            //let frameImageData = tempCtx.createImageData(gif_base_width, gif_base_height);

            //let dif_width = Math.max(gif_base_width-element.dims.width, 0);
            //let dif_height = Math.max(gif_base_height-element.dims.height, 0);

            if (element.disposalType <= 1 && 'transparentIndex' in element && last_frame) {
                //frameImageData.data.set(last_frame.patch);
                //frameImageData = last_frame;

                frameImageData.data.set(element.patch);

                tempCtx.putImageData(frameImageData, element.dims.left, element.dims.top, 0, 0, element.dims.width, element.dims.height);
                let correctedFrameImageData = tempCtx.getImageData(0, 0, gif_base_width, gif_base_height);

                frameImageData = mergeImageData([last_frame, correctedFrameImageData]);
                //tempCtx.putImageData(frameImageData, element.dims.left, element.dims.top,0,0, element.dims.width, element.dims.height);
                tempCtx.putImageData(frameImageData, 0, 0);
            } else {
                frameImageData.data.set(element.patch);
                tempCtx.putImageData(frameImageData, element.dims.left, element.dims.top, 0, 0, element.dims.width, element.dims.height);
            }
            last_frame = tempCtx.getImageData(0, 0, gif_base_width, gif_base_height);
            //const input = tf.image.resizeBilinear(tf.browser.fromPixels(tempCanvas), [modelWeight, modelHeight]).div(255.0).expandDims(0);
            const fromPixels = tf.browser.fromPixels(tempCanvas);
            const resized = tf.image.resizeBilinear(fromPixels, [modelWeight, modelHeight]);
            const divved = resized.div(255.0);
            const input = divved.expandDims(0);
            fromPixels.dispose();
            resized.dispose();
            divved.dispose();
            let promise = //new Promise(function(resolve, reject) {
                Queue.enqueue(() => new Promise((resolve, reject) => {
                    model.executeAsync(input).then(res => {
                        const [boxes, scores, classes, valid_detections] = res;
                        let valid_detections_sync = valid_detections.dataSync();
                        let classes_sync = classes.dataSync();
                        let boxes_sync = boxes.dataSync();
                        let scores_sync = scores.dataSync();
                        valid_detections.dispose();
                        classes.dispose();
                        scores.dispose();
                        boxes.dispose();
                        let marvinImage = new MarvinImage();
                        tempCanvas.toBlob(function (blob) {
                            let urlCreator = window.URL || window.webkitURL;
                            //Revoked
                            let marvinUrl = urlCreator.createObjectURL(blob);
                            marvinImage.load(marvinUrl, function () {
                                let processedRequest = new ProcessedCensorRequest(requestDetails.url, blob, gif_base_width, gif_base_height, 'image/gif',
                                    boxes_sync, scores_sync, classes_sync, valid_detections_sync,
                                    censor_type_local, labels);
                                let conf = bundleConfiguration();
                                paintCensorRequest(marvinImage, processedRequest, conf, cache);
                                tempCtx.putImageData(marvinImage.imageData, 0, 0);
                                URL.revokeObjectURL(marvinUrl);
                                resolve(
                                    {
                                        frame: idx,
                                        delay: element.delay ? element.delay : 100,
                                        disposalType: element.disposalType,
                                        processedData: tempCtx
                                    });

                            });

                        });
                    }).catch(function (err) {
                        log("gif error", err);
                        resolve(
                            {
                                frame: idx,
                                delay: element.delay,
                                disposalType: element.disposalType,
                                processedData: tempCtx
                            }
                        );
                    }).finally(fin => {
                        input.dispose();
                        //log('Tensorcount:', tf.memory().numTensors);
                    });

                }), requestDetails.tabId, requestDetails.originUrl, requestDetails.url, blob, gif_base_width, gif_base_height);
            gifpromises.push(promise);
        });

        Promise.allSettled(gifpromises).then((results) => results.forEach(
            (result) => {
                gif_encoder.addFrame(result.value.processedData, {
                    delay: result.value.delay,
                    dispose: result.value.disposalType
                });
            }
        )).finally(function (err) {
            gif_encoder.on('finished', function (blob) {
                if(filter){
                    blob.arrayBuffer().then(buffer => {
                        try {
                            filter.write(buffer);
                            filter.close();
                        } catch (err) {
                            log('Caught ' + err, buffer);
                        }
                        if(callback){
                            callback(blob);
                        }
                    });
                }else{
                    if(callback){
                        callback(blob);
                    }
                }
                if(statistics_enabled) {
                    let t1 = performance.now();
                    log("Processing GIF time " + (t1 - t0) + " millisseconds.");
                    stats.images.type.gif();
                    stats.images.type.gif_frames(frames.length);
                    stats.images.type.gif_duration(t1 - t0);
                }
            });
            gif_encoder.render();

        });
    });
}

function processGIFMem(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_local = null, callback = null) {
    Queue.enqueue(() => new Promise((resolve, reject) => {
            if (censor_type_local == null) {
                censor_type_local = censor_type;
            }
            let t0 = performance.now();
            blob.arrayBuffer().then(buffer => {
                let gif = window.gifuct.parseGIF(buffer);
                let frames = window.gifuct.decompressFrames(gif, true);
                if(gif_configuration._frame_count_max > 0 && frames.length > gif_configuration._frame_count_max){
                    log("rejected by Frame count:", gif_configuration, 'image/gif');
                    fallBackToThumbnail(requestDetails, blob, file, filter, stream, filename, content_type_header, ext, header , censor_type_local, callback);
                    reject("rejected by Frame count");
                    return;
                }
                let gif_encoder = new GIF({
                    workers: 2,
                    quality: 10,
                    debug: debug,
                    //background: '#fff',
                    //transparent: 'rgba(0,0,0,255)',
                    //transparent: 0,
                });
                let gifpromises = [];
                let last_frame = null;
                let transparency_set = false;
                let gif_base_width = null;
                let gif_base_height = null;
                let cache = {};
                frames.forEach(function (element, idx, array) {
                    if (idx === 0) {
                        gif_base_width = element.dims.width;
                        gif_base_height = element.dims.height;
                        gif_encoder.setOption('width', gif_base_width);
                        gif_encoder.setOption('height', gif_base_height);
                        log("GIF ENC Initialised");

                        /* return a single frame
                        var tempCanvas = document.createElement('canvas');
                        tempCanvas.width = element.dims.width;
                        tempCanvas.height = element.dims.height;
                        var tempCtx = tempCanvas.getContext('2d');
                        var frameImageData = tempCtx.createImageData(element.dims.width, element.dims.height);
                        frameImageData.data.set(element.patch);
                        tempCtx.putImageData(frameImageData, 0, 0);
                        tempCanvas.toBlob(function(blob) {
                            var reader  = new FileReader();
                            reader.onloadend = function () {
                                resolve({redirectUrl: reader.result});
                            }
                            reader.readAsDataURL(blob);
                        });
                        return;
                        */
                    }
                    if (element.disposalType > 1 && !transparency_set && 'transparentIndex' in element) {
                        gif_encoder.setOption('transparent', 'rgba(0,0,0,${element.transparentIndex})');
                        transparency_set = true;
                    }
                    let promise = new Promise(function (resolve, reject) {
                        let tempCanvas = document.createElement('canvas');
                        let tempCtx = tempCanvas.getContext('2d');
                        tempCanvas.width = gif_base_width;//element.dims.width;
                        tempCanvas.height = gif_base_height;//element.dims.height;
                        let frameImageData = tempCtx.createImageData(element.dims.width, element.dims.height);
                        if (element.disposalType <= 1 && 'transparentIndex' in element && last_frame) {
                            frameImageData.data.set(element.patch);
                            tempCtx.putImageData(frameImageData, element.dims.left, element.dims.top, 0, 0, element.dims.width, element.dims.height);
                            let correctedFrameImageData = tempCtx.getImageData(0, 0, gif_base_width, gif_base_height);
                            frameImageData = mergeImageData([last_frame, correctedFrameImageData]);
                            tempCtx.putImageData(frameImageData, 0, 0);
                        } else {
                            frameImageData.data.set(element.patch);
                            tempCtx.putImageData(frameImageData, element.dims.left, element.dims.top, 0, 0, element.dims.width, element.dims.height);
                        }
                        last_frame = tempCtx.getImageData(0, 0, gif_base_width, gif_base_height);
                        const fromPixels = tf.browser.fromPixels(tempCanvas);
                        const resized = tf.image.resizeBilinear(fromPixels, [modelWeight, modelHeight]);
                        const divved = resized.div(255.0);
                        const input = divved.expandDims(0);
                        fromPixels.dispose();
                        resized.dispose();
                        divved.dispose();
                        //log('Tensorcount:', tf.memory().numTensors);
                        model.executeAsync(input).then(res => {
                            input.dispose();
                            const [boxes, scores, classes, valid_detections] = res;
                            let valid_detections_sync = valid_detections.dataSync();
                            let classes_sync = classes.dataSync();
                            let boxes_sync = boxes.dataSync();
                            let scores_sync = scores.dataSync();
                            valid_detections.dispose();
                            classes.dispose();
                            scores.dispose();
                            boxes.dispose();
                            let marvinImage = new MarvinImage();
                            tempCanvas.toBlob(function (blob) {
                                let urlCreator = window.URL || window.webkitURL;
                                //Revoked
                                let marvinUrl = urlCreator.createObjectURL(blob);
                                marvinImage.load(marvinUrl, function () {
                                    let processedRequest = new ProcessedCensorRequest(requestDetails.url, blob, gif_base_width, gif_base_height, 'image/gif',
                                        boxes_sync, scores_sync, classes_sync, valid_detections_sync,
                                        censor_type_local, labels);
                                    let conf = bundleConfiguration();

                                    paintCensorRequest(marvinImage, processedRequest, conf, cache);
                                    tempCtx.putImageData(marvinImage.imageData, 0, 0);
                                    URL.revokeObjectURL(marvinUrl);
                                    resolve(
                                        {
                                            frame: idx,
                                            delay: element.delay ? element.delay : 100,
                                            disposalType: element.disposalType,
                                            processedData: tempCtx
                                        });
                                });
                            });
                        }).catch(function (err) {
                            log("gif error", err);
                            resolve(
                                {
                                    frame: idx,
                                    delay: element.delay,
                                    disposalType: element.disposalType,
                                    processedData: tempCtx
                                }
                            );
                        });
                    });
                    gifpromises.push(promise);
                });
                Promise.allSettled(gifpromises).then((results) => results.forEach(
                    (result) => {
                        gif_encoder.addFrame(result.value.processedData, {
                            delay: result.value.delay,
                            dispose: result.value.disposalType
                        });
                    }
                )).finally(function (err) {
                    gif_encoder.on('finished', function (blob) {
                        if(filter) {
                            blob.arrayBuffer().then(buffer => {
                                let t1 = performance.now();
                                log("Processing time " + (t1 - t0) + " millisseconds.");
                                try {
                                    filter.write(buffer);
                                    filter.close();
                                    resolve();
                                } catch (err) {
                                    log('Caught ' + err, buffer);
                                }
                                if(callback){
                                    callback(blob);
                                }
                            });
                        }else{
                            if(callback){
                                callback(blob);
                            }
                        }
                        if(statistics_enabled) {
                            let t1 = performance.now();
                            log("Processing GIF time " + (t1 - t0) + " millisseconds.");
                            stats.images.type.gif();
                            stats.images.type.gif_frames(frames.length);
                            stats.images.type.gif_duration(t1 - t0);
                        }
                    });
                    gif_encoder.render();

                });
            });
        }), requestDetails.tabId, requestDetails.originUrl, requestDetails.url, blob, 9999
    );
}

function processImage(requestDetails, blob, file, image, filter, stream, filename, content_type, ext, header, censor_type_local = null, hash_data = null) {
    return new Promise((resolve, reject) => {
        let t0 = performance.now();
        if (!filename.endsWith("." + ext)) {
            filename += "." + ext;
            file = new File([blob], filename);
        }

        let img_conf = getImageConfiguration(content_type);
        if(content_type != 'image/gif' && !checkImageFileSize(img_conf, file.size)){
            log("rejected by checkImageFileSize:", requestDetails, img_conf, content_type, file.size);
            reject("rejected by checkImageFileSize");
            return;
        }
        if (censor_type_local == null) {
            censor_type_local = censor_type;
        }
        let imageUrl = image.src;
        let naturalWidth = image.naturalWidth;
        let naturalHeight = image.naturalHeight;
        if(content_type != 'image/gif' && !checkImageDimensions(img_conf, naturalWidth, naturalHeight)){
            log("rejected by checkImageDimensions:", requestDetails, img_conf, content_type, naturalWidth, naturalHeight);
            reject("rejected by checkImageDimensions");
            return;
        }
        let img_dimension = naturalWidth * naturalHeight;
        Queue.enqueue(
            () => new Promise((resolve, reject) => {
                    let inp = image;
                    if(prescale && naturalWidth > 320 && naturalHeight > 320){
                        let canvas = document.createElement("canvas");
                        canvas.width=320;
                        canvas.height=320;
                        let ctx = canvas.getContext("2d");
                        ctx.drawImage(image, 0, 0, 320, 320);
                        inp = canvas;
                    }
                    const fromPixels = tf.browser.fromPixels(inp);
                    const resized = tf.image.resizeBilinear(fromPixels, [modelWeight, modelHeight]);
                    const divved = resized.div(255.0);
                    const input = divved.expandDims(0);

                    model.executeAsync(input).then(res => {
                        let t_ai = performance.now();
                        if(statistics_enabled) {
                            stats.images.total_average_ai_duration(t_ai-t0);
                        }
                        const [boxes, scores, classes, valid_detections] = res;
                        let valid_detections_sync = valid_detections.dataSync();
                        let classes_sync = classes.dataSync();
                        let boxes_sync = boxes.dataSync();
                        let scores_sync = scores.dataSync();
                        valid_detections.dispose();
                        classes.dispose();
                        scores.dispose();
                        boxes.dispose();
                        log(valid_detections_sync, classes_sync, boxes_sync, scores_sync);
                        let oom_p = new Promise((resolveHash, rejectHash) => {
                            let class_keys = classes_sync.slice(0, valid_detections_sync[0]);
                            if(hash_data != null && only_once_mode_configuration.enabled &&
                                // Check if a trigger exists in image to store it in OOM
                                (only_once_mode_configuration.trigger.length == 0 || class_keys.some(index => only_once_mode_configuration.trigger.includes(parseInt(index))))
                                && user != null && user.permissions.permission_only_once_mode <= user.patreon_tier){
                                let cls = {};
                                for (let i = 0; i < valid_detections_sync[0]; i++) {
                                    if(cls.hasOwnProperty(classes_sync[i])){
                                        cls[classes_sync[i]]++;
                                    }else{
                                        cls[classes_sync[i]] = 1;
                                    }
                                }
                                let t0 = performance.now();
                                let hash_p = storeOOMTree(hash_data.hash, cls);
                                hash_p.then(hash_data => {
                                    let t1 = performance.now();
                                    log("Processing storeOOMTree false time " + (t1 - t0) + " millisseconds.");
                                    resolveHash(hash_data);
                                });
                            }else{
                                resolveHash(hash_data);
                            }
                        });
                        oom_p.then(hash_data => {
                            let processedRequest = new ProcessedCensorRequest(requestDetails.url, file, naturalWidth, naturalHeight, content_type,
                                boxes_sync, scores_sync, classes_sync, valid_detections_sync,
                                censor_type_local, labels);
                            if (do_cache && !censored_cache.get(requestDetails.url)) {
                                censored_cache.set(requestDetails.url, processedRequest);
                                if(lock_configuration.enabled && lock_configuration.timer_plus){
                                    let lock_time_change = 0;
                                    for (let i = 0; i < valid_detections_sync[0]; i++) {
                                        let translated = parse_entry_from_index(classes_sync[i]);
                                        let lock_time_change_local = lock_configuration.timer_plus_data[translated];
                                        if(lock_configuration.timer_plus_weight_box_size > 0 && lock_configuration.timer_plus_weight_box){
                                            let [x1, y1, x2, y2] = boxes_sync.slice(i * 4, (i + 1) * 4);
                                            x1 *= naturalWidth;
                                            x2 *= naturalWidth;
                                            y1 *= naturalHeight;
                                            y2 *= naturalHeight;
                                            let w = Math.ceil(x2 - x1);
                                            let h = Math.ceil(y2 - y1);
                                            let s = w*h;
                                            let p = Math.min(1.0,s/lock_configuration.timer_plus_weight_box_size);
                                            lock_time_change_local = lock_configuration.timer_plus_data[translated]*p;
                                        }
                                        lock_time_change += lock_time_change_local;
                                    }
                                    lock_configuration.duration += (lock_time_change*1000);
                                    browser.storage.sync.set({
                                        lock_configuration: lock_configuration,
                                    });
                                }
                            }
                            if(statistics_enabled) {
                                stats.images.total();
                                if (valid_detections_sync[0] > 0) {
                                    stats.images.total_positive();
                                }
                                stats.images.type.content_type(content_type);
                                for (let i = 0; i < valid_detections_sync[0]; i++) {
                                    let translated = parse_entry_from_index(classes_sync[i]);
                                    stats.klasses.label[translated]();
                                }
                            }
                            applyFilter(requestDetails, processedRequest, filter, img_conf, hash_data)
                                .catch(e => {
                                    reject('applyFilter filter error');
                                    return;
                                }).then(blob => {
                                let t_total = performance.now();
                                if(statistics_enabled) {
                                    stats.images.total_average_duration(t_total-t0);
                                }
                                resolve(blob);
                            });
                        });
                    }).catch(e => {
                        reject(e.message);
                        return;
                    }).finally(fin => {
                        resized.dispose();
                        divved.dispose();
                        input.dispose();
                        fromPixels.dispose();
                        URL.revokeObjectURL(imageUrl);
                        return;
                    });
                    //log('Tensorcount:', tf.memory().numTensors);
                }).catch(e => {
                    URL.revokeObjectURL(imageUrl);
                    console.log('Tensorflow-Error', e, requestDetails.url);
                    reject('Tensorflow-Error');
                }).then((val) =>
                    {
                        resolve(val)
                    }
                )
                , requestDetails.tabId, requestDetails.originUrl, requestDetails.url, image, img_dimension)
            queue.sort(compareCensorRequest);
       // };
        //image.src = imageUrl;

    });
}

function applyFilter(requestDetails, processedRequest, filter, img_conf = null, hash_data = null) {
    let promise = new Promise((resolve, reject) => {
        let imgdata = processedRequest.imgdata;
        let content_type = processedRequest.content_type;
        let marvinImage = new MarvinImage();
        let urlCreator = window.URL || window.webkitURL;
        let blob = new Blob([imgdata], {type: content_type});
        //Revoked
        let marvinUrl = urlCreator.createObjectURL(blob);
        marvinImage.load(marvinUrl, function () {
            let t0 = performance.now();
            let conf = bundleConfiguration();
            let cache = {};
            paintCensorRequest(marvinImage, processedRequest, conf, cache);
            if(hash_data != null){
                if(hash_data.date > Date.now()) {
                    paintOOMFutureTimestamp(hash_data, marvinImage.image, marvinImage.canvas, marvinImage.ctx);
                    marvinImage.imageData = marvinImage.ctx.getImageData(0, 0, marvinImage.getWidth(), marvinImage.getHeight());
                }
            }
            if(statistics_enabled) {
                let t1 = performance.now();
                stats.images.total_average_paint_duration(t1-t0);
            }
            if(img_conf === null){
                img_conf = getImageConfiguration(content_type);
            }
            let marvinBlob = marvinImage.toBlob(img_conf._file_output_type);
            if(filter) {
                marvinBlob.arrayBuffer().then(buffer => {
                    try {
                        filter.write(buffer);
                        filter.disconnect();
                        URL.revokeObjectURL(marvinUrl);
                        resolve(marvinBlob);
                    } catch (err) {
                        log('Caught ' + err, buffer);
                        URL.revokeObjectURL(marvinUrl);
                        reject();
                    }
                });
            }else{
                URL.revokeObjectURL(marvinUrl);
                resolve(marvinBlob);
            }
        });
    });
    return promise;
}

function getImageConfiguration(content_type, filesize, width, height){
    let conf = png_configuration;
    switch (content_type) {
        case 'image/png':
            conf = png_configuration;
            break;
        case 'image/jpg':
            conf = jpg_configuration;
            break;
        case 'image/jpeg':
            conf = jpg_configuration;
            break;
        case 'image/bmp':
            conf = bmp_configuration;
            break;
        case 'image/webp':
            conf = webp_configuration;
            break;
        case 'image/avif':
            conf = avif_configuration;
            break;
        case 'image/gif':
            conf = gif_configuration;
            break;
    }
    return conf;
}
function checkImageDimensions(conf, width, height){
    if( width < conf._width_min ||
        (conf._width_max > 0 && width > conf._width_max) ||
        height < conf._height_min ||
        (conf._height_max > 0 && height > conf._height_max)){
        return false;
    }
    return true;
}
function checkImageFileSize(conf, filesize){
    if( filesize < conf._filesize_min ||
        (conf._filesize_max > 0 && filesize > conf._filesize_max)
        ){
        return false;
    }
    return true;
}
