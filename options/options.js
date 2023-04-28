
function activatePuryFi(active) {
    browser.storage.sync.set({
        active: active
    }).then(function(){
        updateOptionsContentScript();
    });
}


function updateOptionsContentScript(){
    return browser.runtime.sendMessage({
        options: true
    });
}

function initializeOptions(){
    return browser.runtime.sendMessage({
        initialize_options: true
    });
}

function resetOptions(leave_out = []){
    return browser.runtime.sendMessage({
        reset_options: true,
        reset_options_leave_out: leave_out,
    });
}



function checkLockState(lock_configuration){
    let tmsp_now = lock_configuration.duration_timestamp;
    if(tmsp_now) {
        let now = new Date().getTime();
        let distance = (tmsp_now+lock_configuration.duration)-now;
        if (distance <= 0) {
            lock_configuration.password = null;
            lock_configuration.token = null;
            lock_configuration.duration_timestamp = null;
            lock_configuration.duration = null;
            lock_configuration.enabled = false;
            browser.storage.sync.set({
                lock_configuration: lock_configuration,
            })
        }
    }
    return lock_configuration;
}

function restoreONOFF() {
    let onoff = browser.storage.sync.get(['active','lock_configuration']);
    onoff.then((res) => {
        if(res.active){
            $('.onoff').attr('check', res.active);
        }else{
            $('.onoff').removeAttr('check');
        }
        $('#onoff').html(res.active? 'ON' : 'OFF');
    });
}

function restoreLockUnlock(){
    let o = browser.storage.sync.get(['lock_configuration']);
    o.then((res) => {
        let full_menu = $('#login_form').length;
        res.lock_configuration = checkLockState(res.lock_configuration);
        if (res.lock_configuration.enabled) {
            $('#lock-token').html(res.lock_configuration.token);
            $('.locked-inactive').show();
            $('.unlocked-show').hide();
            if (res.lock_configuration.password != null) {
                $('#locked-inactive-password').show();
            }
            if (res.lock_configuration.duration_timestamp != null) {
                if (full_menu) {
                    startTimer(res.lock_configuration.duration_timestamp, res.lock_configuration.duration);
                    $('#lock-timer-plus-container').show();
                }
                $('#locked-inactive-timer').show();
            }
            $('#onoff-toggle').attr('disabled', true);
            $('#onoff-button').prop('disabled', true);
            if (full_menu) {
                hideLockOptions(res.lock_configuration);
            } else {
                hideLockPopup(res.lock_configuration, res.lock_configuration.locked_options);
            }
            setTimeout(function() {
                $('.locked-icon').show();
            }, 20);
        } else {
            if($('#lock-timer-check').is(':checked')){
                $('#lock-timer-check').trigger('change');
            }
            $('.unlocked-show').show();
            $('.locked-inactive').hide();
            setTimeout(function() {
                $('.locked-icon').hide();
            }, 20);
            $('#locked-inactive-password').hide();
            $('#locked-inactive-timer').hide();
            if (full_menu) {
                showLockOptions();
            } else {
                showLockPopup();
            }
        }
        if(full_menu){
            if(res.lock_configuration.timer_plus) {
                $('.timer-plus-toggle').attr('check', true);
            }
            for (const [key, value] of Object.entries( res.lock_configuration.timer_plus_data)) {
                $('.timer-plus-label[label="'+klasses[key].key+'"]').val(value);
            }
            $('#lock-timer-plus-box-size-show').prop( "checked", res.lock_configuration.timer_plus_weight_box);
            $('#lock-timer-plus-box-size').val(res.lock_configuration.timer_plus_weight_box_size);
            if(!res.lock_configuration.timer_plus_weight_box){
                //$('#lock-timer-plus-box-size-show').prop( "checked", false );
                //$('#lock-timer-plus-box-size').val(0);
                $('#lock-timer-plus-box-size').hide();
                $('label[for="lock-timer-plus-box-size"]').hide();
            }

        }
    });
}

function hideLockOptions(lock_configuration){
    $('#menu-entry-general').remove();
    $('#menu-entry-filetypes').remove();
    $('#menu-entry-censoring').remove();
    $('#menu-entry-oom').remove();
    $('#wblist-container').remove();
    $('#wblist-locked-container').show();
    if(lock_configuration.locked_options.includes('video')){
        $('#menu-entry-video').remove();
    }
    $('#restore-default').remove();
}

function hideLockPopup(lock_configuration){
    $('#normal').hide();
    $('#body-labels-container').hide();
    if(lock_configuration.locked_options.includes('censor_type')){
        $('#censor-types-container').hide();
    }
    $('#reverse_mode').hide();
    if(lock_configuration.duration){
        $('#timer-container').show();
        startTimer(lock_configuration.duration_timestamp, lock_configuration.duration);
    }
}

function showLockOptions(){
    /*
    $('#menu-entry-general').show();
    $('#menu-entry-filetypes').show();
    $('#menu-entry-censoring').show();
    $('#menu-entry-oom').show();
    $('#menu-entry-whitelist').show();
    $('#restore-default').show();
    */
    //$('#wblist-locked-container').show();
}

function showLockPopup(){
    var sync = browser.storage.sync.get(['user']);
    sync.then((res) => {
        $('#normal').show();
        $('#body-labels-container').show();
        $('#censor-types-container').show();
        if(res.user && res.user.permissions.permission_reverse_censoring <= res.user.patreon_tier) {
            $('#reverse_mode').show();
        }
    });
}

let lock_timer_interval = null;

function startTimer(stmp, dur){
    if(lock_timer_interval){
        clearInterval(lock_timer_interval);
    }
    let f = function() {
        let now = new Date().getTime();
        let distance = (stmp+dur)-now;
        if (distance > 0) {
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);
            $('#locked-days').html(days);
            $('#locked-hours').html(hours);
            $('#locked-minutes').html(minutes);
            $('#locked-seconds').html(seconds);
        } else {
            if(lock_timer_interval)clearInterval(lock_timer_interval);
            unlockExtension();
        }
    };
    f();
    lock_timer_interval = setInterval(f, 1000);
}