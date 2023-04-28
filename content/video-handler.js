let video_handler_initialized = false;
let video_canvas_scanner_active = false;
let video_video_scanner_active = false;
let playimg = null;
let pauseimg = null;
let playimgh = null;
let pauseimgh = null;

let volumeimg = null;
let volumeimgh = null;

let muteimg = null;
let muteimgh = null;

let fullscreenimg = null;
let fullscreenimgh = null;

let loopimg = null;
let loopimgh = null;

let windowedimg = null;
let windowedimgh = null;

let bar_modeimg = null;
let pixel_modeimg = null;
let blur_modeimg = null;
let sticker_modeimg = null;
let sobel_modeimg = null;
let splatter_modeimg = null;
let normal_modeimg = null;
let box_modeimg = null;

let video_processors = [];

let styleCSS = 'input.puryfi-video-progressbar {\n' +
    '  border-radius: 5px;  \n' +
    '  background: rgba(255, 255, 255, 0.0);\n' +
    '}\n' +
    'input.puryfi-video-progressbar::-webkit-slider-thumb {\n' +
    '  -webkit-appearance: none;\n' +
    '  appearance: none;\n' +
    '  width: 25px;\n' +
    '  height: 25px;\n' +
    '  border-radius: 50%; \n' +
    '  background: #04AA6D;\n' +
    '  cursor: pointer;\n' +
    '}\n' +
    'input.puryfi-video-bar::-moz-range-thumb {\n' +
    '  width: 13px;\n' +
    '  height: 13px;\n' +
    '  border: none;\n' +
    '  background: white;\n' +
    '  cursor: pointer;\n' +
    '  opacity: 1;\n' +
    '}' +
    'input.puryfi-video-progressbar::-moz-range-thumb:hover {\n' +
    '  background: #48a0f7;\n' +
    '}' +
    'input.puryfi-video-progressbar::-moz-range-progress {\n' +
    '  background-color: #00b6f0; \n' +
    '  height: 5px;\n' +
    '  border-radius: 5px;' +
    '}' +
    'input.puryfi-video-progressbar::-moz-range-track {' +
    '  background-color: rgba(255, 255, 255, 0.4); \n' +
    '  border-radius: 5px;\n' +
    '  height: 5px;\n' +
    '}' +
    'input.puryfi-volume-bar::-moz-range-progress {' +
    '  border-radius: 5px;' +
    '  background: white;' +
    '  height: 100%;' +
    '}' +
    'input.puryfi-volume-bar::-moz-range-track {' +
    '  border-radius: 5px;' +
    '  background: #000000;' +
    '  height: 100%;' +
    '}' +
    'button.puryfi-censor-mode {' +
    '  position: absolute;' +
    '  background-size: cover;' +
    '  background-position: center center;' +
    '  width: 46px;' +
    '  height: 46px;' +
    '  max-width: 46px;' +
    '  max-height: 46px;' +
    '  text-align: center;' +
    '  padding: 0px;' +
    '  border-radius: 4px 4px 4px 4px;' +
    '  cursor: pointer;' +
    '  text-shadow: 0 0 9px #000000;' +
    '}';

$(document).ready(function() {
    initVideoHandler();
});

window.addEventListener('load', function () {
    initVideoHandler();
})

function initVideoHandler(){
    //setTimeout(()=> {
        let video_overlay = browser.storage.sync.get(['video_overlay','user','active','whiteblacklist_configuration']);
        video_overlay.then((res) => {
            if(res.active && res.user && res.user.permissions.permission_video_overlay <= res.user.patreon_tier) {
                let use_overlay = res.video_overlay && checkWhiteBlacklist(res.whiteblacklist_configuration, window.location.origin, window.location.origin);
                if (use_overlay) {
                    if (!video_handler_initialized) {
                        video_handler_initialized = true;
                        if(!video_video_scanner_active)videoScan();
                        if(!video_canvas_scanner_active)canvasScan();
                    }
                }
            }
        });
        //},5000);
}

function checkWhiteBlacklist(whiteblacklist_configuration, url, originUrl){
    if(whiteblacklist_configuration.mode > 0){
        if(whiteblacklist_configuration.mode == 1){
            for (let regex of whiteblacklist_configuration.white_list) {
                let regExp = new RegExp(regex);
                if(regExp.test(url) || regExp.test(originUrl)){
                    return false;
                }
            }
        }else if(whiteblacklist_configuration.mode == 2){
            let blacklisted = false;
            for (let regex of whiteblacklist_configuration.black_list) {
                let regExp = new RegExp(regex);
                if(regExp.test(url) || regExp.test(originUrl)){
                    blacklisted = true;
                    break;
                }
            }
            if(!blacklisted){
                return false;
            }
        }
    }
    return true;
}

function puryfiVideo(src){
    if(!content_handler_initialized){
        content_handler_initialized = true;
        initStorageData();
    }
    if(src === null || src == ''){
        canvasCreate($( "video" )[0]).then(processor => {
            processor.timerCallback();
        });
    }else{
        $( "video:not([puryfied])" ).each(function() {
            let given_src = $(this).attr("src");
            if(given_src.startsWith('//')){
                if(src.startsWith('https:')){
                    given_src = 'https:'+given_src;
                }else if(src.startsWith('http:')){
                    given_src = 'http:'+given_src;
                }
            }
            if(given_src === src){
                canvasCreate(this).then(processor => {
                    processor.timerCallback();
                });
                return;
            }
        });
    }
    if(!video_canvas_scanner_active)canvasScan();
}

function canvasScan(){
    video_canvas_scanner_active = true;
    $( "div[puryfied]" ).each(function() {
        let uuid = $(this).attr('puryfied');
        let r = $( 'video[puryfied="'+uuid+'"]' );
        if(r.length == 0 || !r.is(':visible')){
            r.removeAttr('puryfied');
            $(this).remove();
        }
    });
    setTimeout(() => {
        canvasScan();
    }, 100);
}

function videoScan(){
    video_video_scanner_active = true;
    $( "video:not([puryfied])" ).each(function() {
        if(!content_handler_initialized){
            content_handler_initialized = true;
            initStorageData();
        }
        canvasCreate(this);
        return;
    });
    setTimeout(() => {
        videoScan();
    }, 100);
}

function canvasCreate(video){
    let sending = browser.runtime.sendMessage({
        video: $( video ).attr('src')? $( video ).attr('src') : true,
    });
    const processor = {};
    let uuid = '_' + Math.random().toString(36).substr(2, 9)
    $( video ).attr('puryfied', uuid);
    //$( video ).attr('controls', 'controls');
    processor.c1 = document.createElement("canvas");
    processor.c2 = document.createElement("canvas");
    processor.div = document.createElement("div");
    let c1 = processor.c1;
    let c2 = processor.c2;
    let div = processor.div;

    let iframe = document.createElement("iframe");
    $( iframe ).attr('puryfied', uuid);
    $( iframe ).insertBefore($( video ));
    let p = new Promise((resolve, reject) => {
        $( iframe ).ready(function() {
            $( iframe ).contents().find("body").css({
                "margin": "0px",
                "overflow": "hidden",
            });
            $( iframe ).contents().find("head").append('<style>' + styleCSS + '</style>');
            $( iframe ).contents().find("body").append(div);
            resolve();
        });
    });
    $( div ).append(c1);

    processor.doLoad = function doLoad(video, c1, c2, resolve) {
        this.video = video;
        this.latest_result = null;
        this.latest_result_frame = null;
        this.sync_mode = true;
        this.video_censor_type = censor_type;
        this.div = div;
        this.iframe = iframe;
        this.c1 = c1;
        this.ctx1 = this.c1.getContext('2d');
        this.c2 = c2;
        this.ctx2 = this.c2.getContext('2d');
        this.frame_cache = {};
        this.frame_count = 0;
        this.frame_count_time_stamp = performance.now();
        this.stable = null;
        this.callbackInitiated = false;
        this.buildVideoUI(div, video);
        this.reAdjustSize();
        video.addEventListener('play', () => {
            this.width = video.videoWidth;
            this.height = video.videoHeight;
            if(!this.stable)this.timerCallback();
        }, false);
        const isVideoPlaying = (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
        if(!isVideoPlaying){
            this.computeFrame();
            setTimeout(() => {
                //this.video.style.opacity = '0.0';
                this.computeFrame();
            }, 1000);
        } else if (!this.callbackInitiated) {
            this.timerCallback();
            video.pause();
            video.play();
        }
        resolve(processor);
    };

    processor.reAdjustSize = function readjustSize() {
        let styles = document.defaultView.getComputedStyle(this.video, "");
        let objstyles = Object.values(styles);
        if(objstyles.length > 0) {
            const cssText = objstyles.reduce(
                (css, propertyName) =>
                    `${css}${propertyName}:${styles.getPropertyValue(
                        propertyName
                    )};`
            );
            /*
            this.div.style.cssText = cssText;
            this.div.style.background = 'none';
            this.div.style.position = 'absolute';
            this.div.style.zIndex = '2147483647';
            this.div.style.overflow = 'hidden';
            */
            this.iframe.style.cssText = cssText;
        }
        this.iframe.style.opacity = '1.0';
        this.iframe.style.background = 'none';
        this.iframe.style.position = 'absolute';
        this.iframe.style.zIndex = '2147483647';
        this.iframe.style.overflow = 'hidden';
        //this.div.style.width = this.video.offsetWidth;
        //this.div.style.height = this.video.offsetHeight;
        //this.div.style.width = "100%";
        //this.div.style.height = "100%";


        this.iframe.style.width = this.video.offsetWidth;
        this.iframe.style.height = this.video.offsetHeight;
        if(this.checkForDeadInside()){
            this.kill(true);
            return;
        }
        const videoRatio = this.c1.width / this.c1.height;
        const screenRatio = screen.width / screen.height;
        if (videoRatio === screenRatio) {
            if (this.c1.width > this.c1.height) {
                this.c1.style.width = "100%";
                this.c1.style.height = "initial";
            } else {
                this.c1.style.height = "100%";
                this.c1.style.width = "initial";
            }
        } else {
            if (screenRatio > videoRatio) {
                this.c1.style.height = "100%";
                this.c1.style.width = "initial";
            } else {
                this.c1.style.width = "100%";
                this.c1.style.height = "initial";
            }
        }
        /*
        if(this.c1.width > this.c1.height){
            this.c1.style.width = "100%";
            this.c1.style.height = "initial";
        }else{
            this.c1.style.height = "100%";
            this.c1.style.width = "initial";
        }
        */
        let fullscreen = document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;
        if (fullscreen) {
            this.c1.style.margin = "auto";
            this.c1.style.position = "absolute";
            this.c1.style.left = "50%";
            this.c1.style.right = "50%";
            this.c1.style.top = "50%";
            this.c1.style.webkitTransform = "translate(-50%, -50%)";
            this.c1.style.transform = "translate(-50%, -50%)";
        }
        if(parseInt(this.iframe.style.width) <= 300 && !fullscreen){
            if(video.mozHasAudio) {
                $(this.progressbar).css({
                    "width": "calc(100% - 214px)",
                });
                $(this.volume).css({
                    "right": "43px",
                });
                $(this.timer_text_current).css({
                    "right": "127px",
                });
                $(this.timer_text_duration).css({
                    "right": "88px",
                });
                $(this.loop).css({
                    "right": "66px",
                });
                $(this.volume_bar).css({
                    "display": "none",
                });
            }
        }else{
            if(video.mozHasAudio && this.volume_bar) {
                $( this.loop ).css({
                    "right": "126px",
                });
                $( this.progressbar ).css({
                    "width": "calc(100% - 271px)",
                });
                $( this.timer_text_current ).css({
                    "right": "190px",
                });
                $( this.timer_text_duration ).css({
                    "right": "150px",
                });
                $( this.volume ).css({
                    "right": "102px",
                });
                $(this.volume_bar).css({
                    "display": "initial",
                });
            }
        }

        if($(this.iframe).is(":visible")) {
            setTimeout(
                function () {
                    processor.reAdjustSize();
                }, this.video.paused || this.video.ended ? 100 : 10);
        }
    }

    processor.timerCallback = function timerCallback() {
        this.callbackInitiated = true;
        if (video.paused || video.ended) {
            processor.stable = false;
            return;
        }
        processor.stable = true;
        let max = video.duration;
        let dest = video.currentTime;
        let pos = dest/max;
        if(this.checkForDeadInside()){
            this.kill(true);
            return;
        }
        $(this.progressbar).val($(this.progressbar).prop('max')*pos);
        let cur = millisToMinutesAndSeconds(video.currentTime*1000);
        let dur = millisToMinutesAndSeconds(video.duration*1000);
        $(this.timer_text_current).text(cur);
        $(this.timer_text_duration).text(" / "+dur);
        this.computeFrame().then(r => {
            processor.frame_count++;
            if(performance.now() - processor.frame_count_time_stamp >= 1000){
                processor.frame_count_time_stamp = performance.now();
                $( processor.fps_meter ).text(processor.frame_count+" fps");
                processor.frame_count = 0;
            }
            setTimeout(() => {
                this.timerCallback();
            }, 0);
        });

    };

    processor.computeFrame = function computeFrame() {
        return new Promise((resolve, reject) => {
            let offset_width = this.video.offsetWidth;
            let offset_height = this.video.offsetHeight;
            if(offset_width <= 0){
                resolve();
                return;
            }
            if(offset_height <= 0){
                resolve();
                return;
            }
            let screen_width = screen.width;
            let screen_height = screen.height;
            if(this.video.videoHeight != 0 || this.video.videoWidth != 0){
                if(this.video.offsetWidth > this.video.videoWidth ||
                    this.video.offsetHeight > this.video.videoHeight ||
                    this.video.offsetWidth > screen_width ||
                    this.video.offsetHeight > screen_height
                ) {
                    let ratio = this.video.videoWidth / this.video.videoHeight;
                    offset_width = 0;
                    offset_height = Math.min(this.video.offsetHeight, screen_height);
                    offset_width = Math.trunc(offset_height * ratio);
                    if (!offset_width) {
                        offset_width = Math.min(this.video.offsetWidth, screen_width);
                    }
                }
            }
            if(this.checkForDeadInside()){
                this.kill(true);
                return;
            }
            this.c1.width = offset_width;
            this.c1.height = offset_height;


            //this.c1.width = this.video.offsetWidth;
            //this.c1.height = this.video.offsetHeight;

            //this.frame_cache.offset_width = Math.max(0,(this.video.offsetWidth - this.video.videoWidth)/2);
            //this.frame_cache.offset_height = Math.max(0,(this.video.offsetHeight - this.video.videoHeight)/2);

            /*
            let tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.c1.width;
            tempCanvas.height = this.c1.height;
            let tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.video, 0, 0, this.video.offsetWidth, this.video.offsetHeight);
            let frame = tempCtx.getImageData(0, 0, this.video.offsetWidth, this.video.offsetHeight);
             */
            //this.c2.width = this.video.offsetWidth;
            //this.c2.height = this.video.offsetHeight;
            this.c2.width = offset_width;
            this.c2.height = offset_height;
            //this.ctx2.drawImage(this.video, this.frame_cache.offset_width, this.frame_cache.offset_height, this.video.videoWidth, this.video.videoHeight);
            //this.ctx2.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight, 0, 0, this.video.offsetWidth, this.video.offsetHeight);
            this.ctx2.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight, 0, 0, offset_width, offset_height);
            //let frame = this.ctx2.getImageData(0, 0, this.video.offsetWidth, this.video.offsetHeight);

            let frame = this.ctx2.getImageData(0, 0, offset_width, offset_height);
            let resolved = false;

            if (this.latest_result != null) {
                let video_handler_options = browser.storage.sync.get(['file_types','labels','censor_type',
                    'bar_configuration','blur_configuration','pixel_configuration','gif_configuration',
                    'glitch_configuration','triangle_configuration','sticker_configuration','sobel_configuration','splatter_configuration',
                    'reverse_mode_configuration','word_wall_configuration','clustering_configuration','lock_configuration']);
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
                    lock_configuration = res.lock_configuration;
                    word_wall_configuration = res.word_wall_configuration;
                });
                if(!this.video_censor_type){
                    this.video_censor_type = "black";
                }
                let marvinImage = new MarvinImage();
                if(!this.sync_mode){
                    this.ctx1.putImageData(frame, 0, 0);
                }else{
                    this.ctx1.putImageData(this.latest_result_frame, 0, 0);
                }
                marvinImage.width = this.c1.width;
                marvinImage.height = this.c1.height;
                marvinImage.canvas = this.c1;
                marvinImage.ctx = this.ctx1;
                marvinImage.imageData = this.latest_result_frame;
                let conf = {
                    bar_configuration: bar_configuration,
                    pixel_configuration: pixel_configuration,
                    blur_configuration: blur_configuration,
                    glitch_configuration: glitch_configuration,
                    triangle_configuration: triangle_configuration,
                    sticker_configuration: sticker_configuration,
                    sobel_configuration: sobel_configuration,
                    splatter_configuration: splatter_configuration,
                    reverse_mode_configuration: reverse_mode_configuration,
                    sticker_collections: sticker_collections,
                    lock_configuration: lock_configuration,
                    word_wall_configuration: word_wall_configuration,
                };
                /*
                if(this.latest_result && this.video_censor_type === "triangle"
                    || (this.video_censor_type === "sticker" && !conf.sticker_collections)
                ){
                    let data = [this.latest_result.valid_detections, this.latest_result.classes, this.latest_result.scores, this.latest_result.boxes];
                    let outer = this;
                    This code is not really working (laggy)
                    marvinImage.canvas.toBlob(function(blob) {
                        let paint_request = browser.runtime.sendMessage({
                            paint_request: true,
                            data: data,
                            blob: blob,
                        });
                        paint_request.then(paint_response => {
                            const img = new Image()
                            img.onload = (event) => {
                                URL.revokeObjectURL(event.target.src);
                                outer.ctx1.drawImage(event.target, 0,0);
                            }
                            img.src = URL.createObjectURL(paint_response.blob);
                        });
                    });
                }
             */
                    paintCensor(marvinImage, this.video_censor_type, labels,
                        this.latest_result.valid_detections,
                        this.latest_result.classes,
                        this.latest_result.scores,
                        this.latest_result.boxes,
                        conf,
                        this.frame_cache
                    );

                    //this.ctx1.drawImage(marvinImage.canvas, 0,0, marvinImage.width, marvinImage.height);

                    //this.ctx1.putImageData(marvinImage.imageData, 0, 0);
                    if(!this.sync_mode){
                        resolved = true;
                        resolve();
                    }

            }
            if(this.video_censor_type != "normal") {
                let sending = browser.runtime.sendMessage({
                    ai_request: true,
                    video_frame: true,
                    frame: frame,
                    width: offset_width,
                    height: offset_height
                });
                sending.then(response => {
                        let valid_detections = response.valid_detections;
                        let classes = response.classes;
                        let scores = response.scores;
                        let boxes = response.boxes;
                        this.latest_result_frame = frame;
                        this.latest_result = {
                            valid_detections: valid_detections,
                            classes: classes,
                            scores: scores,
                            boxes: boxes,
                        };
                    }
                    , frameMessageError).finally(fin => {
                    if (!resolved) {
                        resolve();
                    }
                    //this.video.style.opacity = '0.0';
                });
            }else{
                let fullscreen = document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement;
                if (fullscreen) {
                    this.ctx1.drawImage(this.video, 0, 0,this.video.offsetWidth, this.video.offsetHeight)
                }else{
                    this.video.style.opacity = '1.0';
                }
                this.latest_result = null;
                if (!resolved) {
                    resolve();
                }
            }

        });
    };

    processor.buildVideoUI = function buildVideoUI(div, video){
        let ui_container = document.createElement("div");
        let ui_bar = document.createElement("div");
        let play = document.createElement("img");
        let volume = document.createElement("img");
        this.volume = volume;
        let volume_bar = null;
        this.volume_bar = null;
        let fullscreen = document.createElement("img");
        let timer_text_current = document.createElement("div");
        processor.timer_text_current = timer_text_current;
        let timer_text_duration = document.createElement("div");
        processor.timer_text_duration = timer_text_duration;
        let progressbar = document.createElement("input");
        processor.progressbar = progressbar;
        let censor_mode = document.createElement("button");
        let sync_mode = document.createElement("div");
        let sync_mode_circle = document.createElement("div");
        let fps_meter = document.createElement("div");
        this.fps_meter = fps_meter;
        let loop = document.createElement("img");
        this.loop = loop;
        let censor_modes_container = document.createElement("div");
        let bar_mode = document.createElement("button");
        let pixel_mode = document.createElement("button");
        let blur_mode = document.createElement("button");
        let sticker_mode = document.createElement("button");
        let sobel_mode = document.createElement("button");
        let splatter_mode = document.createElement("button");
        let box_mode = document.createElement("button");
        let normal_mode = document.createElement("button");


        $( censor_modes_container ).append(bar_mode);
        $( censor_modes_container ).append(pixel_mode);
        $( censor_modes_container ).append(blur_mode);
        $( censor_modes_container ).append(sticker_mode);
        $( censor_modes_container ).append(sobel_mode);
        $( censor_modes_container ).append(splatter_mode);
        $( censor_modes_container ).append(box_mode);
        $( censor_modes_container ).append(normal_mode);
        $( censor_mode ).addClass("puryfi-censor-mode");
        $( bar_mode ).addClass("puryfi-censor-mode");
        $( pixel_mode ).addClass("puryfi-censor-mode");
        $( blur_mode ).addClass("puryfi-censor-mode");
        $( sticker_mode ).addClass("puryfi-censor-mode");
        $( sobel_mode ).addClass("puryfi-censor-mode");
        $( splatter_mode ).addClass("puryfi-censor-mode");
        $( box_mode ).addClass("puryfi-censor-mode");
        $( normal_mode ).addClass("puryfi-censor-mode");

        this.progressbar = progressbar;
        this.is_dragged = false;
        this.timer_text_current = timer_text_current;
        this.timer_text_duration = timer_text_duration;
        let cur = millisToMinutesAndSeconds(video.currentTime*1000);
        let dur = millisToMinutesAndSeconds(video.duration*1000);
        $(this.timer_text_current).text(cur);
        $(this.timer_text_duration).text(" / "+dur);
        progressbar.type = 'range';
        progressbar.min = '0';
        progressbar.max = '1000';

        $( this.c1 ).css({
            // Removed since its not centering on fullscreen with these two rules
            "left": 0,
            "right": 0,
            //
            "margin-left": "auto",
            "margin-right": "auto",
            "position": "absolute",
        });
        $( ui_bar ).css({
            "position": "absolute",
            "bottom": "0px",
            "width": "100%",
            "height": "40px",
            "background": "rgb(23,23,23,0.80)",
        });
        $( sync_mode ).css({
            "position": "absolute",
            "top": "10px",
            "left": "10px",
            "height": "20px",
            "-webkit-text-fill-color": "rgba(242,242,242,0.8)",
            "font-size": "8pt",
            "cursor": "pointer",
            "font-family": "Segoe UI",
            "display": "flex",
            "-moz-user-select": " none",
        });
        $( fps_meter ).css({
            "position": "absolute",
            "top": "30px",
            "left": "10px",
            "height": "20px",
            "-webkit-text-fill-color": "rgba(242,242,242,0.8)",
            "font-size": "8pt",
            "font-family": "Segoe UI",
            "display": "flex",
            "-moz-user-select": " none",
        });
        $( sync_mode_circle ).css({
            "position": "relative",
            "-webkit-text-fill-color": "#3bde05",
            "margin-right": "5px",
            "-moz-user-select": " none",
        });
        $( sync_mode_circle ).text('●');

        $( sync_mode ).text('sync');
        $( sync_mode ).prepend(sync_mode_circle);
        $( play ).css({
            "position": "absolute",
            "left": "15px",
            "bottom": "10px",
            "cursor": "pointer",
            "width": "20px",
            "height": "20px",
            "-moz-user-select": " none",
        });
        $( volume ).css({
            "position": "absolute",
            "right": "42px",
            "bottom": "10px",
            "width": "20px",
            "height": "20px",
            "-moz-user-select": " none",
        });
        $( fullscreen ).css({
            "position": "absolute",
            "right": "14px",
            "bottom": "10px",
            "cursor": "pointer",
            "width": "20px",
            "height": "20px",
            "-moz-user-select": " none",
        });
        $( loop ).css({
            "position": "absolute",
            "right": "66px",
            "bottom": "10px",
            "cursor": "pointer",
            "width": "20px",
            "height": "20px",
            "-moz-user-select": " none",
        });
        $( ui_container ).css({"display": "none"});
        $( progressbar ).css({
            "position": "absolute",
            "left": "46px",
            "bottom": "2.5px",
            "height": "5px",
            "-webkit-appearance": "none",
            "outline": "none",
            "-webkit-transition": ".2s",
            "transition": "opacity .2s",
            "width": "calc(100% - 217px)",
            "border": "15px none",
            "border-left": "0px none",
            "border-right": "0px none",
            "border-style": "solid",
            "border-color": "rgba(0,0,0,0)",
        });
        $( progressbar ).addClass("puryfi-video-progressbar");
        $( progressbar ).addClass("puryfi-video-bar");
        $( timer_text_current ).css({
            "position": "absolute",
            "font-size": "88%",
            "font-family": "Segoe UI",
            "-webkit-text-fill-color": "#f2f2f2",
            "bottom": "15px",
            "right": "132px",
            "height": "15px",
            "-moz-user-select": " none",
        });
        $( timer_text_duration ).css({
            "position": "absolute",
            "font-size": "88%",
            "font-family": "Segoe UI",
            "-webkit-text-fill-color": "#f2f2f2",
            "bottom": "15px",
            "right": "93px",
            "height": "15px",
            "opacity": "50%",
            "-moz-user-select": " none",
        });
        $( censor_modes_container ).css({
            "position": "absolute",
            "top": "55px",
            "right": "8px",
            "width": "155px",
        });
        if(this.video.videoWidth > this.video.videoHeight || this.video.videoHeight < 520){
            $( censor_modes_container ).css({
                "display": "block",
                "display": "none",
            });
        }else{
            $( censor_modes_container ).css({
                "display": "grid",
                "width": "53px",
                "display": "none",
            });
        }
        if(bar_modeimg == null)bar_modeimg              = browser.runtime.getURL("images/buttons/black.png");
        if(pixel_modeimg == null)pixel_modeimg          = browser.runtime.getURL("images/buttons/pixel.png");
        if(blur_modeimg == null)blur_modeimg            = browser.runtime.getURL("images/buttons/blur.png");
        if(sticker_modeimg == null)sticker_modeimg      = browser.runtime.getURL("images/buttons/sticker.png");
        if(sobel_modeimg == null)sobel_modeimg          = browser.runtime.getURL("images/buttons/sobel.png");
        if(splatter_modeimg == null)splatter_modeimg    = browser.runtime.getURL("images/buttons/splatter.png");
        if(normal_modeimg  == null)normal_modeimg       = browser.runtime.getURL("images/buttons/normal.png");
        if(box_modeimg  == null)box_modeimg             = browser.runtime.getURL("images/buttons/box.png");
        function getModeImg (censor_type){
            switch (censor_type) {
                case effects.NONE.name:
                    return normal_modeimg;
                case effects.BOX.name:
                    return box_modeimg;
                case effects.STICKER.name:
                    return sticker_modeimg;
                case effects.BLUR.name:
                    return blur_modeimg;
                case effects.PIXEL.name:
                    return pixel_modeimg;
                case effects.BLACK.name:
                    return bar_modeimg;
                case effects.SOBEL.name:
                    return sobel_modeimg;
                case effects.SPLATTER.name:
                    return splatter_modeimg;
                //case effects.GLITCH.name:
                //    return bar_modeimg;
            }
        }
        let cur_typeimg = getModeImg(this.video_censor_type);
        if(!cur_typeimg){
            cur_typeimg = bar_modeimg;
        }
        $( censor_mode ).css({
            "right": "10px",
            "top": "10px",
            "background-image": "url("+cur_typeimg+")",
            //"display": "none",
        });

        $( bar_mode ).css({
            "background-image": "url("+bar_modeimg+")",
            "position": "relative",
            "margin-left": "5px",
            "margin-top": "5px",
        });
        $( pixel_mode ).css({
            "background-image": "url("+pixel_modeimg+")",
            "position": "relative",
            "margin-left": "5px",
            "margin-top": "5px",
        });
        $( blur_mode ).css({
            "background-image": "url("+blur_modeimg+")",
            "position": "relative",
            "margin-left": "5px",
            "margin-top": "5px",
        });
        $( sticker_mode ).css({
            "background-image": "url("+sticker_modeimg+")",
            "position": "relative",
            "margin-left": "5px",
            "margin-top": "5px",
        });
        $( sobel_mode ).css({
            "background-image": "url("+sobel_modeimg+")",
            "position": "relative",
            "margin-left": "5px",
            "margin-top": "5px",
        });

       $( splatter_mode ).css({
           "background-image": "url("+splatter_modeimg+")",
           "position": "relative",
           "margin-left": "5px",
           "margin-top": "5px",
       });
        $( normal_mode ).css({
            "background-image": "url("+normal_modeimg+")",
            "position": "relative",
            "margin-left": "5px",
            "margin-top": "5px",
        });
        let c = browser.storage.sync.get(['lock_configuration']);
        c.then((res) => {
            if(res.lock_configuration.enabled){
                $( normal_mode ).css({ "display": "none",});
            }
            if(res.lock_configuration.locked_options.includes('censor_type')){
                $( censor_mode ).css({ "display": "none",});
            }
        });
        $( box_mode ).css({
            "background-image": "url("+box_modeimg+")",
            "position": "relative",
            "margin-left": "5px",
            "margin-top": "5px",
        });
        if(video.mozHasAudio){
            $( volume ).css({
                "cursor": "pointer",
                "right": "102px",
            });
            volume_bar = document.createElement("input");
            processor.volume_bar = volume_bar;
            volume_bar.type = 'range';
            volume_bar.min = '0';
            volume_bar.max = '1';
            volume_bar.step = '0.01';
            volume_bar.value = video.volume;
            $( volume_bar ).css({
                "position": "absolute",
                "right": "43px",
                "bottom": "15.5px",
                "height": "5px",
                "border-radius": "5px",
                "-webkit-appearance": "none",
                "outline": "none",
                "-webkit-transition": ".2s",
                "transition": "opacity .2s",
                "width": "48px",
                "background": "#79797900",
            });
            $( volume_bar ).addClass("puryfi-volume-bar");
            $( volume_bar ).addClass("puryfi-video-bar");
            $( volume_bar ).click(function(e) {
                e.stopPropagation();
            });
            $( volume_bar ).on("input", function(e) {
                e.stopPropagation();
                let max = 1;
                let dest = $(this).val();
                let vol = dest/max;
                video.volume = vol;
            });
            $( loop ).css({
                "right": "126px",
            });
            $( progressbar ).css({
                "width": "calc(100% - 271px)",
            });
            $( timer_text_current ).css({
                "right": "190px",
            });
            $( timer_text_duration ).css({
                "right": "150px",
            });
        }else{
            $( volume ).css({
                "opacity": "0.4",
            });
        }

        if(playimg == null)playimg = browser.runtime.getURL("icons/ui/vp/play.png");
        if(playimgh == null)playimgh = browser.runtime.getURL("icons/ui/vp/play_highlighted.png");
        if(pauseimg == null)pauseimg = browser.runtime.getURL("icons/ui/vp/pause.png");
        if(pauseimgh == null)pauseimgh = browser.runtime.getURL("icons/ui/vp/pause_highlighted.png");

        if(volumeimg == null)volumeimg = browser.runtime.getURL("icons/ui/vp/sound.png");
        if(volumeimgh == null)volumeimgh = browser.runtime.getURL("icons/ui/vp/sound_highlighted.png");

        if(muteimg == null)muteimg = browser.runtime.getURL("icons/ui/vp/muted.png");
        if(muteimgh == null)muteimgh = browser.runtime.getURL("icons/ui/vp/muted_highlighted.png");

        if(fullscreenimg == null)fullscreenimg = browser.runtime.getURL("icons/ui/vp/fullscreen.png");
        if(fullscreenimgh == null)fullscreenimgh = browser.runtime.getURL("icons/ui/vp/fullscreen_highlighted.png");

        if(loopimg == null)loopimg = browser.runtime.getURL("icons/ui/vp/loop.png");
        if(loopimgh == null)loopimgh = browser.runtime.getURL("icons/ui/vp/loop_highlighted.png");

        if(windowedimg == null)windowedimg = browser.runtime.getURL("icons/ui/vp/windowed.png");
        if(windowedimgh == null)windowedimgh = browser.runtime.getURL("icons/ui/vp/windowed_highlighted.png");


        $( volume ).hover(function() {
                if(video.mozHasAudio) {
                    if (!video.muted) {
                        volume.setAttribute('src', volumeimgh);
                    } else {
                        volume.setAttribute('src', muteimgh);
                    }
                }
            }, function() {
                if(video.mozHasAudio) {
                    if (!video.muted) {
                        volume.setAttribute('src', volumeimg);
                    } else {
                        volume.setAttribute('src', muteimg);
                    }
                }
            }
        );
        $( play ).hover(function() {
                if(video.paused){
                    play.setAttribute('src', playimgh);
                }else{
                    play.setAttribute('src', pauseimgh);
                }
            }, function() {
                if(video.paused){
                    play.setAttribute('src', playimg);
                }else{
                    play.setAttribute('src', pauseimg);
                }
            }
        );
        $( fullscreen ).hover(function() {
                if (
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                ) {
                    fullscreen.setAttribute('src', windowedimgh);
                }else{
                    fullscreen.setAttribute('src', fullscreenimgh);
                }
            }, function() {
                if (
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                ) {
                    fullscreen.setAttribute('src', windowedimg);
                }else{
                    fullscreen.setAttribute('src', fullscreenimg);
                }
            }
        );
        fullscreen.setAttribute('src', fullscreenimg);
        if(video.loop){
            loop.setAttribute('src', loopimgh);
        }else{
            loop.setAttribute('src', loopimg);
        }
        if(video.paused){
            play.setAttribute('src', playimg);
        }else{
            play.setAttribute('src', pauseimg);
        }
        if(!video.muted && video.mozHasAudio){
            volume.setAttribute('src', volumeimg);
        }else{
            volume.setAttribute('src', muteimg);
        }

        $( div ).click(function(e) {
            e.stopPropagation();
            if(video.paused){
                play.setAttribute('src', pauseimg);
                video.play();
            }else{
                play.setAttribute('src', playimg);
                video.pause();
            }
        });

        $( censor_mode ).dblclick(function(e){
            e.stopPropagation();
        });

        $( censor_modes_container ).dblclick(function(e){
            e.stopPropagation();
        });
        $( div ).dblclick(function(e){
            e.stopPropagation();
            $( fullscreen ).trigger('click');
        });
        $( loop ).dblclick(function(e){
            e.stopPropagation();
        });
        $( play ).dblclick(function(e){
            e.stopPropagation();
        });
        $( volume ).dblclick(function(e){
            e.stopPropagation();
        });
        $( sync_mode ).dblclick(function(e){
            e.stopPropagation();
        });
        $( progressbar ).dblclick(function(e){
            e.stopPropagation();
        });
        $( fullscreen ).dblclick(function(e){
            e.stopPropagation();
        });
        $( fullscreen ).click(function(e) {
            e.stopPropagation();
            if (
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            ) {
                fullscreen.setAttribute('src', fullscreenimg);
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                fullscreen.setAttribute('src', windowedimg);
                if (div.requestFullscreen) {
                    div.requestFullscreen();
                } else if (div.mozRequestFullScreen) {
                    div.mozRequestFullScreen();
                } else if (div.webkitRequestFullscreen) {
                    div.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (div.msRequestFullscreen) {
                    div.msRequestFullscreen();
                }
            }
        });
        $( volume ).click(function(e) {
            e.stopPropagation();
            if(video.muted && video.mozHasAudio){
                volume.setAttribute('src', volumeimg);
                video.muted = false;
            }else{
                volume.setAttribute('src', muteimg);
                video.muted = true;
            }
        });
        $( play ).click(function(e) {
            e.stopPropagation();
            if(video.paused){
                play.setAttribute('src', pauseimg);
                video.play();
            }else{
                play.setAttribute('src', playimg);
                video.pause();
            }
        });
        $( progressbar ).click(function(e) {
            e.stopPropagation();
        });

        $( censor_mode ).click(function(e) {
            e.stopPropagation();
            if( $( censor_modes_container ).is(":visible")){
                $( censor_modes_container ).slideUp(50);
                $( censor_mode ).css({
                    "-webkit-filter": "none",
                });
            }else{
                $( censor_modes_container ).slideDown(50);
                $( censor_mode ).css({
                    "-webkit-filter": "grayscale(80%)",
                });
            }
        });

        $( loop ).click(function(e) {
            e.stopPropagation();
            if(!video.loop){
                loop.setAttribute('src', loopimgh);
                video.loop = true;
            }else{
                loop.setAttribute('src', loopimg);
                video.loop = false;
            }
        });
        $( bar_mode ).click(function(e) {
            e.stopPropagation();
            processor.video_censor_type = effects.BLACK.name;
            $( censor_mode ).css({
                "background-image": "url("+getModeImg(processor.video_censor_type)+")",
            });
            const isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
            if(!isVideoPlaying){
                processor.computeFrame();
            }
        });
        $( pixel_mode ).click(function(e) {
            e.stopPropagation();
            processor.video_censor_type = effects.PIXEL.name;
            $( censor_mode ).css({
                "background-image": "url("+getModeImg(processor.video_censor_type)+")",
            });
            const isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
            if(!isVideoPlaying){
                processor.computeFrame();
            }
        });
        $( blur_mode ).click(function(e) {
            e.stopPropagation();
            processor.video_censor_type = effects.BLUR.name;
            $( censor_mode ).css({
                "background-image": "url("+getModeImg(processor.video_censor_type)+")",
            });
            const isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
            if(!isVideoPlaying){
                processor.computeFrame();
            }
        });
        $( sticker_mode ).click(function(e) {
            e.stopPropagation();
            processor.video_censor_type = effects.STICKER.name;
            $( censor_mode ).css({
                "background-image": "url("+getModeImg(processor.video_censor_type)+")",
            });
            const isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
            if(!isVideoPlaying){
                processor.computeFrame();
            }
        });
        $( sticker_mode ).dblclick(function(e){
            e.stopPropagation();
            processor.frame_cache = {};
        });
        $( sobel_mode ).click(function(e) {
            e.stopPropagation();
            processor.video_censor_type = effects.SOBEL.name;
            $( censor_mode ).css({
                "background-image": "url("+getModeImg(processor.video_censor_type)+")",
            });
            const isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
            if(!isVideoPlaying){
                processor.computeFrame();
            }
        });
        $( splatter_mode ).click(function(e) {
            e.stopPropagation();
            processor.video_censor_type = effects.SPLATTER.name;
            $( censor_mode ).css({
                "background-image": "url("+getModeImg(processor.video_censor_type)+")",
            });
            const isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
            if(!isVideoPlaying){
                processor.computeFrame();
            }
        });
        $( box_mode ).click(function(e) {
            e.stopPropagation();
            processor.video_censor_type = effects.BOX.name;
            $( censor_mode ).css({
                "background-image": "url("+getModeImg(processor.video_censor_type)+")",
            });
            const isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
            if(!isVideoPlaying){
                processor.computeFrame();
            }
        });
        $( normal_mode ).click(function(e) {
            e.stopPropagation();
            processor.video_censor_type = effects.NONE.name;
            $( censor_mode ).css({
                "background-image": "url("+getModeImg(processor.video_censor_type)+")",
            });
            const isVideoPlaying = !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
            if(!isVideoPlaying){
                processor.computeFrame();
            }
        });
        $( progressbar ).on('input', function (e, ui) {
            if(!processor.video.paused){
                processor.is_dragged = true;
                processor.video.pause();
            }
            let max = $(this).prop('max');
            let dest = $(this).val();
            let pos = dest/max;
            video.currentTime = video.duration * pos;
            if(processor.video.paused || processor.video.ended){
                processor.computeFrame();
                let cur = millisToMinutesAndSeconds(video.currentTime*1000);
                let dur = millisToMinutesAndSeconds(video.duration*1000);
                $(this.timer_text_current).text(cur);
                $(this.timer_text_duration).text(" / "+dur);
            }
        });
        $( progressbar ).on("change", function(e) {
            e.stopPropagation();
            if(processor.is_dragged){
                processor.video.play();
                processor.is_dragged = false;
            }
        });
        $( sync_mode ).click(function(e) {
            e.stopPropagation();
            processor.sync_mode = !processor.sync_mode;
            if(processor.sync_mode){
                $( sync_mode_circle ).css({
                    "-webkit-text-fill-color": "#3bde05",
                });
                $( sync_mode ).empty();
                $( sync_mode ).text('sync');
                $( sync_mode ).prepend(sync_mode_circle);
            }else{
                $( sync_mode_circle ).css({
                    "-webkit-text-fill-color": "#de052d",
                });
                $( sync_mode ).empty();
                $( sync_mode ).text('async');
                $( sync_mode ).prepend(sync_mode_circle);
            }
        });
        $( volume ).dblclick(function(){
            e.stopPropagation();
        });
        $(video).on('ended',function(){
            if(video.paused || video.ended){
                play.setAttribute('src', playimg);
            }else{
                play.setAttribute('src', pauseimg);
            }
        });
        $( sync_mode ).dblclick(function(e){
            e.stopPropagation();
        });
        $( ui_container ).append(ui_bar);
        $( ui_container ).append(play);
        $( ui_container ).append(volume);
        $( ui_container ).append(loop);
        $( ui_container ).append(sync_mode);
        $( ui_container ).append(fps_meter);
        if(volume_bar){
            $( ui_container ).append(volume_bar);
        }
        $( ui_container ).append(fullscreen);
        $( ui_container ).append(progressbar);
        $( ui_container ).append(timer_text_current);
        $( ui_container ).append(timer_text_duration);
        $( ui_container ).append(censor_mode);
        $( ui_container ).append(censor_modes_container);
        $( div ).append(ui_container);
        $( div ).mouseenter(function() {
            $( ui_container ).stop().show(200);
        }).mouseleave(function() {
            $( ui_container ).stop().hide(200);
        });
    }

    processor.checkForDeadInside = function checkForDeadInside(){
        try {
            let deadObjCeck = this.c1.tagName;
        } catch(error) {
            return true;
        }
        return false;
    };

    processor.kill = function kill(respawn){
        if(respawn){
            $( iframe ).remove();
            $( video ).removeAttr('puryfied');
            delete this;
        }
    };

    let promise = new Promise((resolve, reject) => {
        p.then(e => {
            processor.doLoad(video, c1, c2, resolve);
        });
    });

    return promise;
}

function frameMessageError(error) {
    console.log(`Error: ${error}`);
}

function millisToMinutesAndSeconds(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
