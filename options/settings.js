let skip_settings = ['active','settings', 'saved_settings', 'username', 'user', 'password', 'statistics','statistics_enabled',
    'option_page_view','lock_configuration','debug'];

let settings_translation = {
    'Do cache': 'Cache',
    'Pixel': 'Mode: Pixel',
    'Bar': 'Mode: Bar',
    'Blur': 'Mode: Blur',
    'Sobel': 'Mode: Sobel',
    'Glitch': 'Mode: Glitch',
    'Splatter': 'Mode: Splatter',
    'Triangle': 'Mode: Triangle',
    'Sticker': 'Mode: Sticker',

    'Whiteblacklist': 'Whitelist & Blacklist',

    'Png': 'File Settings: PNG',
    'Jpg': 'File Settings: JPEG',
    'Bmp': 'File Settings: BMP',
    'Gif': 'File Settings: GIF',
    'Avif': 'File Settings: AVIF',
    'Webp': 'File Settings: WebP',
};

function updateQuickSettings() {
    $('#settings-select option').remove();
    $('#settings-advanced').empty();
    let full_menu = $('#login_form').length;
    let conf = browser.storage.local.get(['settings']);
    conf.then((res) => {
        let full_menu = $('#login_form').length;
        if(res.settings && Object.keys(res.settings).length >= 1 && !full_menu) {
            $('#quick-setting-container').show();
            $('#settings-select').append($('<option>', {
                value: '',
                text: '',
            }));
        }
        $('#settings-select').append($('<option>', {
            value: 'default',
            text: 'Default',
        }));
        if(res.settings){
            for (const setting_name in res.settings) {
                $('#settings-select').append($('<option>', {
                    value: setting_name.toLowerCase(),
                    text: setting_name,
                }));
            }
        }
    });
    let c = browser.storage.sync.get(null);
    c.then((res) => {
        for (const property in res) {
            if (!skip_settings.includes(property)) {
                let name = capitalizeFirstLetter(property.replaceAll('_',' ').replaceAll(" configuration",''));
                if(settings_translation[name]){
                    name = settings_translation[name];
                }
                $('<li/>').append($('<input>', {
                    type: 'checkbox',
                    "checked":"checked",
                    id: property,
                })).append($('<label>', {
                    for: property,
                    text: name,
                })).appendTo('#settings-advanced');
            }
        }
        if(full_menu) {
            let ul = document.getElementById("settings-advanced");
            Array.from(ul.getElementsByTagName("LI"))
                .sort((a, b) => a.textContent.localeCompare(b.textContent))
                .forEach(li => ul.appendChild(li));
        }
    });
}

function loadSettings(setting_name){
    if(setting_name.toLowerCase() === ''){
        return;
    }
    let full_menu = $('#login_form').length;
    if(setting_name.toLowerCase() === 'default'){
        resetOptions(skip_settings).then(function (){
                restoreOptions();
        });
        return;
    }
    let s = browser.storage.local.get(['settings']);
    s.then((set) => {
        if (setting_name) {
            let keys = Object.keys(set.settings);
            for (const key of keys) {
                if(setting_name.toLowerCase() === key.toLowerCase()) {
                    let setting = {};
                    for (const property in set.settings[key]) {
                        if (!skip_settings.includes(property)) {
                            setting[property] = set.settings[key][property];
                        }
                    }
                    browser.storage.sync.set(setting).then(function () {
                        if (full_menu) {
                            $('#settings-name').val("");
                            $('#settings-info-box').html("[Setting <b style='color: #191919;'>" + setting_name + "</b> loaded]");
                        } else {

                        }
                        restoreOptions();
                        updateOptionsContentScript();
                    });
                    break;
                }
            }
        }
    });
}

$('#settings-delete').click(function(){
    let c = browser.storage.local.get(['settings']);
    c.then((res) => {
        let setting_name = $('#settings-select').find(":selected").val();
        if(setting_name.toLowerCase() === 'default'){
            window.alert("This setting can't be deleted!")
            return;
        }
        if(setting_name){
            let keys = Object.keys(res.settings);
            for (const key of keys) {
                if(setting_name.toLowerCase() === key.toLowerCase() && window.confirm("Do you really want to delete this setting: " + setting_name + " ?")) {
                    delete res.settings[key];
                    browser.storage.local.set({
                        settings: res.settings,
                    });
                    $('#settings-name').val("");
                    $('#settings-info-box').html("[Setting <b style='color: #191919;'>"+setting_name+"</b> deleted]");
                    updateQuickSettings();
                    break;
                }
            }
        }
    });
});

$('#settings-load').click(function(){
    let setting_name = $('#settings-select').find(":selected").val();
    loadSettings(setting_name);
});

$('#settings-save').click(function(){
    let take = [];
    $('#settings-advanced').find("input").each(function (i, elem){
        if($(elem).is(':checked')){
            take.push($(elem).attr("id"));
        }
    });
    let c = browser.storage.sync.get(null);
    c.then((res) => {
        let s = browser.storage.local.get(['settings']);
        s.then((set) => {
            let settings = set['settings'] ? set['settings'] : {};
            let setting_name = $('#settings-name').val() ? $('#settings-name').val() : 'settings-' + performance.now();
            if(setting_name.length > 20){
                window.alert("Setting name too long!")
                return;
            }
            if(setting_name.length < 1){
                window.alert("Setting name too short!")
                return;
            }
            if(setting_name.toLowerCase() === 'default'){
                window.alert("This setting name can't be used!")
                return;
            }
            let setting_exists = false;
            let settings_key = null;
            if(set.settings != null) {
                let keys = Object.keys(set.settings);
                for (const key of keys) {
                    if (setting_name.toLowerCase() === key.toLowerCase()) {
                        setting_exists = true;
                        settings_key = key;
                        break;
                    }
                }
            }
            if(settings_key != null) {
                if(window.confirm("A setting with that name already exists! Do you want to overwrite it?")) {
                    delete set.settings[settings_key];
                }else{
                   return;
                }
            }
            let setting = {};
            for (const property in res) {
                if (!skip_settings.includes(property) && take.includes(property)) {
                    setting[property] = res[property];
                }
            }
            settings[setting_name] = setting;
            browser.storage.local.set({
                settings: settings,
            });
            $('#settings-name').val("");
            $('#settings-info-box').html("[Setting <b style='color: #191919;'>"+setting_name+"</b> added]");
            updateQuickSettings();
        });
    });
});

$('#splatter_color_preset').change(function(){
    $('#splatter_color_scheme').val($( this ).val().replaceAll(';',"\n"));
    save_config();
});