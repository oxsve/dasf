let lastMenuInstanceId = 0;
let nextMenuInstanceId = 1;

browser.contextMenus.create({
    id: "puryFi-censor",
    title: "PuryFi",
    contexts: ["image","video"],
    icons: {
        "16": "icons/icon_16.png",
        "32": "icons/icon_32.png"
    }
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-pixelate",
    title: "Pixelate",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-black",
    title: "Black Bar",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-blur",
    title: "Blur",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-box",
    title: "Box",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-triangle",
    title: "Triangle",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-glitch",
    title: "Glitch",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-sticker",
    title: "Sticker",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-sobel",
    title: "Sobel",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);

browser.contextMenus.create({
    id: "puryFi-splatter",
    title: "Splatter",
    contexts: ["image"],
    parentId: "puryFi-censor",
}, onCreated);


// VIDEO
browser.contextMenus.create({
    id: "puryFi-overlay",
    title: "Overlay",
    contexts: ["video"],
    parentId: "puryFi-censor",
}, onCreated);

function onCreated() {
    if (browser.runtime.lastError) {
        log(`Error: ${browser.runtime.lastError}`);
    } else {
        //log("Item created successfully");
    }
}

browser.contextMenus.onShown.addListener(async function(info, tab) {
    let menuInstanceId = nextMenuInstanceId++;
    lastMenuInstanceId = menuInstanceId;

    let gif = false;
    let ct = await getCT(info.srcUrl);
    if(ct === "image/gif"){
        gif = true;
    }
    // After completing the async operation, check whether the menu is still shown.
    if (menuInstanceId !== lastMenuInstanceId) {
        return; // Menu was closed and shown again.
    }
    if(info.mediaType === 'video'){
        browser.contextMenus.update("puryFi-censor", {
            enabled: user !== null,
        });
        browser.contextMenus.refresh();
        return
    }else{
        if(lock_configuration.enabled && lock_configuration.locked_options.includes('censor_type')){
            browser.contextMenus.update("puryFi-censor", {
                enabled: false,
            });
            browser.contextMenus.refresh();
            return
        }
    }
    // Now use menus.create/update + menus.refresh.
    if(gif){
        browser.contextMenus.update("puryFi-censor", {
            enabled: user != null && user.permissions.permission_file_type_gif <= user.patreon_tier,
        });
    }else{
        browser.contextMenus.update("puryFi-censor", {
            enabled: true,
        });
    }
    browser.contextMenus.refresh();

});

/**
 * returns the ContentType of a given URL asynchronously.
 * Used for the context-menu to identify GIFs.
 * @param url
 * @returns {Promise<unknown>}
 */
async function getCT(url) {
    return new Promise(resolve => {
        let xhr1 = new XMLHttpRequest();
        let ct = "";
        function hand () {
            ct = this.getResponseHeader('content-type');
        }
        xhr1.onreadystatechange = hand;
        xhr1.onload = function() {
            let reader = new FileReader();
            reader.onloadend = function() {
                resolve(ct);
            }
            reader.readAsArrayBuffer(xhr1.response);
        };
        xhr1.open('GET', url);
        xhr1.responseType = 'blob';
        xhr1.send();
    });
}

browser.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId) {
        case "puryFi-pixelate":
            handleContextCall(info, tab,'pixel')
            break;
        case "puryFi-black":
            handleContextCall(info, tab,'black')
            break;
        case "puryFi-box":
            handleContextCall(info, tab,'box')
            break;
        case "puryFi-blur":
            handleContextCall(info, tab,'blur')
            break;
        case "puryFi-triangle":
            handleContextCall(info, tab,'triangle')
            break;
        case "puryFi-glitch":
            handleContextCall(info, tab,'glitch')
            break;
        case "puryFi-sticker":
            handleContextCall(info, tab,'sticker')
            break;
        case "puryFi-sobel":
            handleContextCall(info, tab,'sobel')
            break;
        case "puryFi-splatter":
            handleContextCall(info, tab,'splatter')
            break;
        case "puryFi-overlay":
            handleContextCall(info, tab,'video')
            break;
    }
});

function handleContextCall(info, tab, type){
    if(type === "video"){
        browser.tabs.sendMessage(
            tab.id,
            {
                video: true,
                single_tab: info.srcUrl === info.pageUrl,
                srcUrl: info.srcUrl,
                type: type,
            }
        )
        return;
    }
    if(info.pageUrl.startsWith('file:')){
        browser.tabs.sendMessage(
            tab.id,
            {
                local_file: true,
                reload: info.pageUrl,
                type: type,
            }
        )
    }else {
        toDataURL(info.pageUrl, function (img_data, content_type) {
            if (processableContentType(content_type, file_types, gif_configuration)) {
                //Add pageURL to the forcedRequestList and refresh the page
                context_requests.push({
                        censor_type: type,
                        url: info.pageUrl,
                        originalUrl: info.pageUrl
                    }
                );
                browser.tabs.reload({bypassCache: true});
            } else {
                // Load image from image url and message content script to replace element.
                browser.tabs.sendMessage(
                    tab.id,
                    {
                        local_file: false,
                        reload: info.srcUrl,
                        type: type,
                    }
                ).then(response => {
                    context_requests.push({
                            censor_type: type,
                            url: response.add_context_request,
                            originalUrl: response.add_context_request_original_url
                        }
                    );
                });
            }
        });
    }
}




