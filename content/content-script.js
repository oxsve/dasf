let labels;
let censor_type;
let file_types;
let blur_configuration;
let bar_configuration;
let pixel_configuration;
let glitch_configuration;
let triangle_configuration;
let sticker_configuration;
let sobel_configuration;
let splatter_configuration;
let gif_configuration;
let reverse_mode_configuration;
let clustering_configuration;
let sticker_collections;
let lock_configuration;
let word_wall_configuration;

let content_handler_initialized = false;

let puryfi_active = false;

browser.storage.sync.get('active').then((res) => {
    puryfi_active = res.active;
});
function initStorageData(){
    let video_handler_options = browser.storage.sync.get(['file_types','labels','censor_type',
        'bar_configuration','blur_configuration','pixel_configuration','gif_configuration','glitch_configuration',
        'triangle_configuration','sticker_configuration','sobel_configuration', 'splatter_configuration',
        'reverse_mode_configuration','clustering_configuration','lock_configuration', 'word_wall_configuration']);
    video_handler_options.then((res) => {
        labels = res.labels;
        censor_type = res.censor_type;
        file_types = res.file_types;
        blur_configuration  = res.blur_configuration;
        bar_configuration   = res.bar_configuration;
        pixel_configuration = res.pixel_configuration;
        glitch_configuration = res.glitch_configuration;
        triangle_configuration = res.triangle_configuration;
        sticker_configuration = res.sticker_configuration;
        gif_configuration 	= res.gif_configuration;
        reverse_mode_configuration = res.reverse_mode_configuration;
        clustering_configuration = res.clustering_configuration;
        sobel_configuration = res.sobel_configuration;
        splatter_configuration = res.splatter_configuration;
        word_wall_configuration = res.word_wall_configuration;
    });
    let local_request = browser.storage.local.get(['sticker_collections']);
    local_request.then((res) => {
        if (res.sticker_collections != null) {
            sticker_collections = cloneInto(
                res.sticker_collections,
                window,
                {cloneFunctions: true});
            cacheStickerCollections(sticker_collections, sticker_configuration);
        }
    });
}

function handleMessage(request, sender, sendResponse) {
    // Check if you are in an iframe
    /*
    if(window.self !== window.top){
        return;
    }
    */
    if(request.video){
        puryfiVideo(request.single_tab? null : request.srcUrl);
        return
    }
    if(request.local_file && request.type){
        censorLocalFile(request.reload, request.type);
        return;
    }
    let timestamp = new Date().getTime();
    let queryString = "?t=" + timestamp;
    let newurl = request.reload + queryString
    $('img').each(function(i, obj) {
        if(obj.src === request.reload){
            sendResponse({add_context_request: newurl,
                add_context_request_original_url: request.reload
            });
            obj.src = newurl;
        }
    });
    $('source').each(function(i, obj) {
        if(obj.srcset === request.reload){
            sendResponse({add_context_request: newurl,
                          add_context_request_original_url: request.reload
            });
            obj.srcset = newurl;
        }
    });

}
browser.runtime.onMessage.addListener(handleMessage);



