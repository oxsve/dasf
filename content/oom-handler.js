$(document).ready(function() {
    const imagesLoaded = new Map(); // Pool containing all images on the page
    const oomImageMap = new Map();  // Pool containing all currently processing images, if url === null then image was processed
    const oomImageProcessed = new Map();  // Pool containing all new URLs and their original URLs (url?1378123 -> url)
    let conf = browser.storage.sync.get(['active','only_once_mode_configuration','whiteblacklist_configuration']);
    conf.then((res) => {
        let listed = checkWhiteBlacklist(res.whiteblacklist_configuration, window.location.origin, window.location.origin);
        if (!listed) {
            return;
        }
        if(res.active && res.only_once_mode_configuration.enabled && res.only_once_mode_configuration.timer_autorefresh) {
            $("img").on('load', function () {
                let img_elem = $(this);
                let file_url = img_elem.prop('src');
                imagesLoaded.set(file_url, img_elem);
                // If loaded trough refresh
                let entry = oomImageProcessed.get(file_url);
                if (entry) {
                    setTimeout(function () {
                        switch (res.only_once_mode_configuration.timer_animation) {
                            case 1:
                                img_elem.css("border-image", "initial");
                                break;
                            case 2:
                                img_elem.css("filter", "brightness(100%)");
                                break;
                            case 3:
                                img_elem.css("filter", "blur(0px)");
                                break;
                        }
                    }, 200);
                }
            })
            $("img").on("error", function () {
                let img_elem = $(this);
                let file_url = img_elem.prop('src');
                let entry = oomImageProcessed.get(file_url);
                if (entry) {
                    img_elem.css("filter", "brightness(0%)");
                    refreshImage(img_elem, entry);
                }
           });
            setInterval(function () {
                if (!document.hidden) {
                    imagesLoaded.forEach(function (value, key, map) {
                        checkImagesLoaded(value, res.only_once_mode_configuration);
                    });
                }
            }, 50);
            setTimeout(function () {
                setInterval(function () {
                        if (!document.hidden) {
                            $("img").each(function (index) {
                                let img_elem = $(this);
                                let file_url = img_elem.prop('src');
                                if(!imagesLoaded.has(file_url) && !oomImageProcessed.has(file_url)){
                                    imagesLoaded.set(file_url, img_elem);
                                }
                            });
                        }
                    },1000);
            }, 1000);
        }
    });

    function checkImagesLoaded(img_elem, only_once_mode_configuration) {
        let file_url = img_elem.prop('src');
        if(file_url && !oomImageProcessed.has(file_url)){
            let entry = oomImageMap.get(file_url);
            if(entry === undefined && entry !== null){
                oomImageMap.set(file_url, null);
                let realWidth = img_elem.get( 0 ).naturalWidth;
                let realHeight = img_elem.get( 0 ).naturalHeight;
                if(realWidth == 0 || realHeight == 0){
                    let max = 5000;
                    let imgLoadIntervalCheck = setInterval(function () {
                        realWidth = img_elem.get( 0 ).naturalWidth;
                        realHeight = img_elem.get( 0 ).naturalHeight;
                        if(realWidth > only_once_mode_configuration.width_min && realHeight > only_once_mode_configuration.height_min){
                            max = 0;
                            sendOOMRequest(img_elem, file_url, only_once_mode_configuration);
                        }else{
                            max -= 500;
                        }
                        if(max <= 0){
                            clearInterval(imgLoadIntervalCheck);
                        }
                    },500);
                }else{
                    if(realWidth > only_once_mode_configuration.width_min && realHeight > only_once_mode_configuration.height_min){
                        sendOOMRequest(img_elem, file_url, only_once_mode_configuration);
                    }
                }
            }else if(entry != null){
                //check if element still exists
                if(!img_elem.is(":visible")){
                    let min_url = file_url.replace(/(^\w+:|^)\/\//, '');
                    let search = $("img[src$='"+min_url+"']");
                    if(search.length > 0){
                        img_elem = $(search[0]);
                        if (only_once_mode_configuration.timer_animation == 1) {
                            addBorderCSS(img_elem);
                        }
                    }
                }
                checkOOMTimer(img_elem, file_url, entry, only_once_mode_configuration);
            }
        }
    }

    function sendOOMRequest(img_elem, file_url, only_once_mode_configuration){
            loadImageAsBlob(file_url).then(blob => {
                if(blob.type != "text/html"){
                    let sending = browser.runtime.sendMessage({
                        oom_time_request: true,
                        blob: blob,
                        file_url: file_url,
                    });
                    sending.then(response => {
                        let clss = Object.keys(response.hash_data.classes);
                        // Check if image contains a trigger currently active
                        if(only_once_mode_configuration.trigger.length == 0 ||
                            clss.some(index => only_once_mode_configuration.trigger.includes(parseInt(index)))) {
                            // We put images in future mode to the data
                            // Old images will remain in NULL state and won't be checked again!
                            let now = Date.now();
                            if (now < response.hash_data.date) {
                                if (only_once_mode_configuration.timer_animation == 1) {
                                    addBorderCSS(img_elem);
                                }
                                oomImageMap.set(file_url, {
                                    timestamp: now,
                                    hash_data: response.hash_data
                                });
                            } else if (response.hash_data.date !== null && oomImageMap.get(file_url) !== null) {
                                oomImageMap.set(file_url, null);
                                img_elem.attr("src", file_url + "?" + new Date().getTime());
                            } else {
                                console.log("OOM timing error");
                            }
                        }
                    });
                }
            });
    }

    function loadImageAsBlob(file_url, f = true){
        let req = prepareFetch(file_url);
        if(f){
            return fetch(file_url, req)
                .then(function (response) {
                    let blob = response.blob();
                    return blob;
                })
            /*
            .then(function (blob) {

            });
            */
        }else{
            // Blob too different from fetch blob for reasons unknown...
            return new Promise(resolve => {
                let img = new Image();
                img.onload = function(){
                    let height = img.height;
                    let width = img.width;
                    let c = document.createElement("canvas");
                    c.width = this.naturalWidth;
                    c.height = this.naturalHeight;
                    c.width = width;
                    c.height = height;
                    let ctx = c.getContext("2d");
                    ctx.drawImage(this, 0, 0);
                    c.toBlob(function(blob) {
                        resolve(blob);
                    }, "image/jpeg", 0.75);
                }
                img.src = file_url;
            });
        }
    }

    function checkOOMTimer(img_elem, file_url, data, only_once_mode_configuration){
        let now = Date.now();
        if(now > data.hash_data.date){
            oomImageMap.set(file_url, null);
            let date = new Date().getTime();
            let url = new URL(file_url);
            url.searchParams.append('', ''+date);
            let newUrl = url.href;
            newUrl = refreshImage(img_elem, file_url, newUrl);
            oomImageProcessed.set(newUrl, file_url);
        }else if(only_once_mode_configuration.timer_animation){
            let time_window = data.hash_data.date-data.timestamp; // -> 0
            let time_left =  data.hash_data.date-now;
            if(time_left > 0){
                let p = time_left/time_window;
                switch (only_once_mode_configuration.timer_animation) {
                    case 1:
                        let pp = 100-100*p;
                        if(!img_elem.hasClass( "overflowingVertical" )){
                            img_elem.css("border-image", "linear-gradient(to right top, #2c00ff "+pp+"%, #fff 0%) 30");
                            img_elem.css("max-height", "calc(100% - 20px)");
                        }else{
                            img_elem.css("max-height", "initial");
                        }
                        break;
                    case 2:
                        img_elem.css("filter", "brightness("+p+")");
                        break;
                    case 3:
                        let blur = 20-20*p;
                        img_elem.css("filter", "blur("+blur+"px)");
                        break;
                }
            }
        }
    }

    function addBorderCSS(img_elem){
        img_elem.css("border-style", "solid");
        img_elem.css("border-width", "10px");
        img_elem.css("max-height", "calc(100% - 20px)");
    }

    function refreshImage(img_elem, oldUrl, newUrl){
        newUrl = prepareUrl(oldUrl, newUrl);
        img_elem.attr("src", newUrl+'0');
        img_elem.attr("src", newUrl);
        let srcset = img_elem.attr('srcset');
        if (typeof srcset !== 'undefined' && srcset !== false) {
            img_elem.attr("srcset", newUrl);
        }
        // Find alternative <source> elements
        img_elem.siblings('source').each(function (index) {
            $(this).attr("src", newUrl);
            $(this).attr("srcset", newUrl);
        });
        return newUrl;
    }

    function prepareUrl(oldUrl, newUrl){
        let url = new URL(newUrl);
        // Reddit-Fix
        // Reddit does not like additional Parameters in images, but we can call http instead of https for refresh
        if(url.hostname === 'external-preview.redd.it' || url.hostname === 'preview.redd.it'){
            oldUrl = oldUrl.replace('https://','http://');
            return oldUrl;
        }
        return newUrl;
    }

    function prepareFetch(imgUrl){
        let url = new URL(imgUrl);
        // Pixiv wants this parameter for fetch
        if(url.hostname === 'i.pximg.net'){
            return {
                "referrer": "https://www.pixiv.net/",
            };
        }
        return {};
    }


});


