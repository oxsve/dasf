/**
 * Statistics
 * Keeps all statistics in an object on the background, the data is loaded into the storage every x seconds (only if the data was updated).
 */
let statistics_enabled = true;

let default_statistics = {
    timestamp: 0,
    images: {
        total: 0,
        total_positive: 0,
        total_average_duration: 0,
        total_average_ai_duration: 0,
        total_average_paint_duration: 0,
        type: {
            png: 0,
            jpeg: 0,
            webp: 0,
            bmp: 0,
            avif: 0,
            gif: {
                thumbnails: 0,
                full: 0,
                total_average_frames: 0,
                total_average_duration: 0,
            },
        },
    },
    klasses: {
        total: 0,
        label: {
            BELLY_EXPOSED: {
                total: 0,
            },
            BELLY_COVERED: {
                total: 0,
            },
            BUTTOCKS_EXPOSED: {
                total: 0,
            },
            BUTTOCKS_COVERED: {
                total: 0,
            },
            FEMALE_BREAST_EXPOSED: {
                total: 0,
            },
            FEMALE_BREAST_COVERED: {
                total: 0,
            },
            FEMALE_GENITALIA_EXPOSED: {
                total: 0,
            },
            FEMALE_GENITALIA_COVERED: {
                total: 0,
            },
            MALE_GENITALIA_EXPOSED: {
                total: 0,
            },
            MALE_GENITALIA_COVERED: {
                total: 0,
            },
            MALE_BREAST_EXPOSED: {
                total: 0,
            },
            MALE_BREAST_COVERED: {
                total: 0,
            },
            FACE_FEMALE: {
                total: 0,
            },
            FACE_MALE: {
                total: 0,
            },
            FEET_EXPOSED: {
                total: 0,
            },
            FEET_COVERED: {
                total: 0,
            },
            ARMPITS_EXPOSED: {
                total: 0,
            },
            ARMPITS_COVERED: {
                total: 0,
            },
            ANUS_EXPOSED: {
                total: 0,
            },
            ANUS_COVERED: {
                total: 0,
            },
            NONE: {
                total: 0,
            },
        },
    },
    censor_modes:{

    },
    videos: {
        total: 0,
        frames: 0,
    },
    local_files: {
        total: 0,
    },
    batch_converter: {
        total: 0,
    }
}

let statistics = JSON.parse(JSON.stringify(default_statistics));

let stats = {
    timestamp: function(){
        statistics.timestamp = Date.now();
    },
    images: {
        total: function(){
            statistics.images.total++;
            stats.timestamp();
        },
        total_positive: function(){
            statistics.images.total_positive++;
            stats.timestamp();
        },
        total_average_duration: function(processing_time){
            if(statistics.images.total_average_duration > 0){
                let c = statistics.images.total_positive;
                statistics.images.total_average_duration = (c*statistics.images.total_average_duration+processing_time)/(c+1);
            }else{
                statistics.images.total_average_duration = processing_time;
            }
            stats.timestamp();
        },
        total_average_ai_duration: function(processing_time){
            if(statistics.images.total_average_ai_duration > 0){
                let c = statistics.images.total_positive;
                statistics.images.total_average_ai_duration = (c*statistics.images.total_average_ai_duration+processing_time)/(c+1);
            }else{
                statistics.images.total_average_ai_duration = processing_time;
            }
            stats.timestamp();
        },
        total_average_paint_duration: function(processing_time){
            if(statistics.images.total_average_paint_duration > 0){
                let c = statistics.images.total_positive;
                statistics.images.total_average_paint_duration = (c*statistics.images.total_average_paint_duration+processing_time)/(c+1);
            }else{
                statistics.images.total_average_paint_duration = processing_time;
            }
            stats.timestamp();
        },
        type: {
            png: function(){
                statistics.images.type.png++;
                stats.timestamp();
            },
            jpeg: function(){
                statistics.images.type.jpeg++;
                stats.timestamp();
            },
            webp: function(){
                statistics.images.type.webp++;
                stats.timestamp();
            },
            bmp: function(){
                statistics.images.type.bmp++;
                stats.timestamp();
            },
            avif: function(){
                statistics.images.type.avif++;
                stats.timestamp();
            },
            gif: function(){
                statistics.images.type.gif.full++;
                stats.timestamp();
            },
            gif_thumb: function(){
                statistics.images.type.gif.thumbnails++;
                stats.timestamp();
            },
            gif_frames: function(frame_count){
                if(statistics.images.type.gif.total_average_frames > 0){
                    let c = statistics.images.type.gif.full;
                    statistics.images.type.gif.total_average_frames = (c*statistics.images.type.gif.total_average_frames+frame_count)/(c+1);
                }else{
                    statistics.images.type.gif.total_average_frames = frame_count;
                }
                stats.timestamp();
            },
            gif_duration: function(processing_time){
                if(statistics.images.type.gif.total_average_duration > 0){
                    let c = statistics.images.type.gif.full;
                    statistics.images.type.gif.total_average_duration = (c*statistics.images.type.gif.total_average_duration+processing_time)/(c+1);
                }else{
                    statistics.images.type.gif.total_average_duration = processing_time;
                }
                stats.timestamp();
            },
            content_type: function(content_type){
                switch (content_type) {
                    case 'image/png':
                        stats.images.type.png();
                        break;
                    case 'image/gif':
                        stats.images.type.gif_thumb();
                        break;
                    case 'image/webp':
                        stats.images.type.webp();
                        break;
                    case 'image/jpeg':
                        stats.images.type.jpeg();
                        break;
                    case 'image/jpg':
                        stats.images.type.jpeg();
                        break;
                    case 'image/bmp':
                        stats.images.type.bmp();
                        break;
                    case 'image/avif':
                        stats.images.type.avif();
                        break;
                }
            },
        },

    },
    klasses: {
        total: 0,
        label: {
            BELLY_EXPOSED: function(){
                statistics.klasses.label.BELLY_EXPOSED.total++;
                stats.timestamp();
            },
            BELLY_COVERED: function(){
                statistics.klasses.label.BELLY_COVERED.total++;
                stats.timestamp();
            },
            BUTTOCKS_EXPOSED: function(){
                statistics.klasses.label.BUTTOCKS_EXPOSED.total++;
                stats.timestamp();
            },
            BUTTOCKS_COVERED: function(){
                statistics.klasses.label.BUTTOCKS_COVERED.total++;
                stats.timestamp();
            },
            FEMALE_BREAST_EXPOSED: function(){
                statistics.klasses.label.FEMALE_BREAST_EXPOSED.total++;
                stats.timestamp();
            },
            FEMALE_BREAST_COVERED: function(){
                statistics.klasses.label.FEMALE_BREAST_COVERED.total++;
                stats.timestamp();
            },
            FEMALE_GENITALIA_EXPOSED: function(){
                statistics.klasses.label.FEMALE_GENITALIA_EXPOSED.total++;
                stats.timestamp();
            },
            FEMALE_GENITALIA_COVERED: function(){
                statistics.klasses.label.FEMALE_GENITALIA_COVERED.total++;
                stats.timestamp();
            },
            MALE_GENITALIA_EXPOSED: function(){
                statistics.klasses.label.MALE_GENITALIA_EXPOSED.total++;
                stats.timestamp();
            },
            MALE_GENITALIA_COVERED: function(){
                statistics.klasses.label.MALE_GENITALIA_COVERED.total++;
                stats.timestamp();
            },
            MALE_BREAST_EXPOSED: function(){
                statistics.klasses.label.MALE_BREAST_EXPOSED.total++;
                stats.timestamp();
            },
            MALE_BREAST_COVERED: function(){
                statistics.klasses.label.MALE_BREAST_COVERED.total++;
                stats.timestamp();
            },
            FACE_FEMALE: function(){
                statistics.klasses.label.FACE_FEMALE.total++;
                stats.timestamp();
            },
            FACE_MALE: function(){
                statistics.klasses.label.FACE_MALE.total++;
                stats.timestamp();
            },
            FEET_EXPOSED: function(){
                statistics.klasses.label.FEET_EXPOSED.total++;
                stats.timestamp();
            },
            FEET_COVERED: function(){
                statistics.klasses.label.FEET_COVERED.total++;
                stats.timestamp();
            },
            ARMPITS_EXPOSED: function(){
                statistics.klasses.label.ARMPITS_EXPOSED.total++;
                stats.timestamp();
            },
            ARMPITS_COVERED: function(){
                statistics.klasses.label.ARMPITS_COVERED.total++;
                stats.timestamp();
            },
            ANUS_EXPOSED: function(){
                statistics.klasses.label.ANUS_EXPOSED.total++;
                stats.timestamp();
            },
            ANUS_COVERED: function(){
                statistics.klasses.label.ANUS_COVERED.total++;
                stats.timestamp();
            },
            NONE: function(){

            },
        },
    },
    videos: {
        total: function () {
            statistics.videos.total++;
            stats.timestamp();
        },
        frames: function () {
            statistics.videos.frames++;
            stats.timestamp();
        },
    },
    local_files: {
        total: function(){
            statistics.local_files.total++;
            stats.timestamp();
        },
    },
    batch_converter: {
        total: function(){
                statistics.batch_converter.total++;
                stats.timestamp();
            },
    }
};

initStatistics();

function initStatistics(){
    let sync = browser.storage.sync.get(['statistics','statistics_enabled']);
    sync.then((res) => {
        if(res.statistics){
            statistics = res.statistics;
        }else{
            browser.storage.sync.set({
                statistics: statistics,
            });
        }
        if(!statisticSyncRunning && statistics_enabled){
            statisticSyncRunning = true;
            statisticsSync(true);
        }
    });
}
let statisticSyncRunning = false;

function statisticsSync(keep_running = false, response = null) {
    let sync = browser.storage.sync.get(['statistics','statistics_enabled']);
    sync.then((res) => {
        if(res.statistics && res.statistics_enabled){
            if(res.statistics.timestamp != statistics.timestamp){
                browser.storage.sync.set({
                    statistics: statistics,
                });
            }
        }
        if(response != null){
            response({test: true});
        }
    });
    if(keep_running){
        setTimeout(() =>{
            statisticsSync(keep_running, null);
            }, 10000);
    }
}

function resetStatistics(response){
    statistics = JSON.parse(JSON.stringify(default_statistics));
    browser.storage.sync.set({
        statistics: statistics,
    }).then(() =>{
        response({});
    });
}