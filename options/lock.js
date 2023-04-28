
$('#lock-togglePassword').click(function(){
    const type = $('#lock-password').attr('type') === 'password' ? 'text' : 'password';
    $('#lock-password').attr('type', type);
    $('#lock-confirm-password').attr('type', type);
    if(type == 'text'){
        $(this).children().first().removeClass('fa-eye');
        $(this).children().first().addClass('fa-eye-slash');
    }else{
        $(this).children().first().removeClass('fa-eye-slash');
        $(this).children().first().addClass('fa-eye');
    }
});

$('.lock-match-password').on('input',function(){
    checkLockSettings();
});

$('#unlock-password-info').click(function(){
    $('#unlock-info').toggle();
    $('#unlock-info-secret').hide();
});
$('#unlock-password-info').bind("contextmenu",function(e){
    return false;
});
$('#unlock-password-info').contextmenu(function() {
    $('#unlock-info-secret').toggle();
    $('#unlock-info').hide();
});

$('#lock-show-advanced').click(function(){
    $('#lock-advanced').toggle();
    $(this).find('.toggle-div').html($('#lock-advanced').is(':visible')?"-":"+");
});

$('#lock-timer-plus').click(function(){
    let c = browser.storage.sync.get(['lock_configuration']);
    c.then((res) => {
        if(res.lock_configuration.duration != null){
            $('#lock-timer-plus-increase-container').toggle();
        }else{
            $('#lock-timer-plus-advanced').toggle();
        }
        $(this).find('.toggle-div').html($('#lock-timer-plus-advanced').is(':visible') || $('#lock-timer-plus-increase-container').is(':visible')?"-":"+");
    });
});

$('#lock-password-check').on('change',function(){
    if($(this).is(":checked")){
        $('#lock-password-container').show();
    } else {
        $('#lock-password-container').hide();
    }
    $("#lock-p").hide();
    $("#lock-t").hide();
    $("#lock-pt").hide();
    if($('#lock-timer-check').is(":checked") && $('#lock-password-check').is(":checked")){
        $("#lock-pt").show();
    }else if($('#lock-timer-check').is(":checked")){
        $("#lock-t").show();
    }else{
        $("#lock-p").show();
    }
    if(!$('#lock-timer-check').is(":checked") && !$('#lock-password-check').is(":checked")){
        $('#lock-timer-check').prop( "checked", true );
        $('#lock-timer-check').trigger("change");
    }
    checkLockSettings();
});

$('#lock-timer-check').on('change',function(){

    if($(this).is(":checked")){
        $('#lock-timer-container').show();
        $('#lock-timer-plus-container').show();
        $('#timer-tr-container').css({"border-bottom-width": "0px"});
    } else {
        $('#lock-timer-container').hide();
        $('#lock-timer-plus-container').hide();
        $('#timer-tr-container').css({"border-bottom-width": "1px"});
    }
    $("#lock-p").hide();
    $("#lock-t").hide();
    $("#lock-pt").hide();
    if($('#lock-timer-check').is(":checked") && $('#lock-password-check').is(":checked")){
        $("#lock-pt").show();
    }else if($('#lock-timer-check').is(":checked")){
        $("#lock-t").show();
    }else{
        $("#lock-p").show();
    }
    if(!$('#lock-timer-check').is(":checked") && !$('#lock-password-check').is(":checked")){
        $('#lock-password-check').prop( "checked", true );
        $('#lock-password-check').trigger("change");
    }
    checkLockSettings();
});

$('.lock-timer-input').on('keyup keypress blur change',function(){
    checkLockSettings();
});

function checkLockSettings(){
    let allow = false;
    let d = $('#lock-timer-days').val() > 0?$('#lock-timer-days').val()*24*60*60:0;
    let h = $('#lock-timer-hours').val() > 0?$('#lock-timer-hours').val()*60*60:0;
    let m = $('#lock-timer-minutes').val() > 0?$('#lock-timer-minutes').val()*60:0;
    let sum = (d+h+m)*1000;
    if($('#lock-timer-check').is(":checked") && $('#lock-password-check').is(":checked")){
        if(sum > 0 && $('#lock-password').val() != '' && $('#lock-password').val() === $('#lock-confirm-password').val()){
            allow = true;
        }
    }else if($('#lock-timer-check').is(":checked")){
        if(sum > 0){
            allow = true;
        }
    }else{
        if($('#lock-password').val() != '' && $('#lock-password').val() === $('#lock-confirm-password').val()){
            allow = true;
        }
    }
    if(allow){
        $('#lock-button').prop('disabled', false);
    }else{
        $('#lock-button').prop('disabled', true);
    }
}

let security_token = null;

$('#unlock-token').on('input',function(){
    let unlock_token = $(this).val();
    if(security_token == null){
        let c = browser.storage.sync.get(['lock_configuration']);
        c.then((res) => {
            security_token = res.lock_configuration.token;
            if(checkUnlockToken(unlock_token,security_token)){
                unlockExtension();
            }
        });
    }else{
        if(checkUnlockToken(unlock_token,security_token)){
            unlockExtension();
        }
    }
});
$('#unlock-extension-patreon').click(function(){
    let user_req = browser.storage.sync.get(['user']);
    user_req.then((res) => {
        if (res.user != null && res.user.permissions.permission_unlock_extension <= res.user.patreon_tier) {
            unlockExtension();
        }
    });
});

/*
$('.lock-timer-input').hover(function() {
        $( this ).focus();
});
*/
$('.lock-timer-input').on("keypress keyup blur",function (event) {
    $(this).val($(this).val().replace(/[^\d].+/, ""));
    if ((event.which < 48 || event.which > 57)) {
        event.preventDefault();
    }
});

function checkUnlockToken(unlock_token, security_token){
    let u = parseInt(unlock_token);
    let s = parseInt(security_token);
    if((""+unlock_token).length == (""+security_token).length &&
        validateUnlockToken(u,s) //&&
        //(u+s) % 2 == 0
    ){
        $('#unlock-token').removeClass('unlock-token-invalid');
        return true;
    }else{
        $('#unlock-token').removeClass('unlock-token-invalid').addClass('unlock-token-invalid');
        return false;
    }
}

function validateUnlockToken(unlock_token, security_token){
    // loop through each digit and check if the modolu is equal to the modolu of its position 0 1 0 1 ...
    let u = ""+unlock_token;
    let s = ""+security_token;
    for (let i = 0; i < s.length; i++) {
        let cs = s.charAt(i);
        let cu = u.charAt(i);
        let ns = parseInt(cs);
        let nu = parseInt(cu);
        if(((ns+nu)%10)%2 != i%2){
            return false;
        }
    }
    return true;
}

function generateUnlockToken(security_token){
    let s = ""+security_token;
    let r = "";
    for (let i = 0; i < s.length; i++) {
        let ung = [1,3,5,7,9].sort(function() {return 0.5 - Math.random()})
        let ger = [2,4,6,8].sort(function() {return 0.5 - Math.random()});
        let c = s.charAt(i);
        let n = parseInt(c);
        let goal = i%2;
        let p = ung[0];
        if(goal == 0){
            if(n%2 == 0){
                p = ger[0];
            }
        }else{
            if(n%2 == 1){
                p = ger[0];
            }
        }
        let d = p;
        r += d;
    }
    return r;
}

$('#unlock-button').click(function(){
    let pwd = $('#unlock-password').val();
    unlockExtension(pwd);
});

function unlockExtension(pwd = null){
    let c = browser.storage.sync.get(['lock_configuration']);
    c.then((res) => {
        if(pwd == null || pwd === res.lock_configuration.password){
            res.lock_configuration.enabled = false;
            res.lock_configuration.password = null;
            res.lock_configuration.token = null;
            res.lock_configuration.duration = null;
            res.lock_configuration.locked_options = [];
            browser.storage.sync.set({
                lock_configuration: res.lock_configuration,
            }).then(function(){
                updateOptionsContentScript();
                window.location.reload();
            });
        }else{
            alert("Wrong password!");
        }
    });
}

$('#lock-button').click(function(){
    let pwd = $('#lock-password').val();
    if(!$('#lock-password-check').is(":checked")){
        pwd = null;
    }
    let d = $('#lock-timer-days').val() > 0?$('#lock-timer-days').val()*24*60*60:0;
    let h = $('#lock-timer-hours').val() > 0?$('#lock-timer-hours').val()*60*60:0;
    let m = $('#lock-timer-minutes').val() > 0?$('#lock-timer-minutes').val()*60:0;
    let sum = (d+h+m)*1000;
    if(!$('#lock-timer-check').is(":checked")){
        sum = null;
    }
    if(pwd == null && sum == null){
        return;
    }
    let c = browser.storage.sync.get(['lock_configuration']);
    c.then((res) => {
        res.lock_configuration.enabled = true;
        res.lock_configuration.password = pwd;
        res.lock_configuration.token = generateSecurityToken(res.lock_configuration.password);
        res.lock_configuration.duration = Number.isInteger(sum) && sum != null && sum > 0? sum : null;
        res.lock_configuration.duration_timestamp = Number.isInteger(sum) && sum != null && sum > 0? Date.now() : null;
        if($('#lock-option-censor-type').is(":checked")){
            res.lock_configuration.locked_options.push('censor_type');
        }
        if($('#lock-option-video').is(":checked")){
            res.lock_configuration.locked_options.push('video');
        }
        res.lock_configuration.timer_plus = $('.timer-plus-toggle').attr('check')? true : false;
        res.lock_configuration.timer_plus_weight_box = $('#lock-timer-plus-box-size-show').is(":checked")? true : false;
        res.lock_configuration.timer_plus_weight_box_size = parseInt($('#lock-timer-plus-box-size').val());
        $('.timer-plus-label').each(function() {
            let key = $( this ).attr("label");
            let r = Object.values(klasses).find((e) => e.key == key);
            let label = Object.keys(klasses).find(k=>klasses[k].key === key);
            if(r){
                res.lock_configuration.timer_plus_data[label] = parseInt($( this ).val());
            }
        });
        security_token = res.lock_configuration.token;
        browser.storage.sync.set({
                lock_configuration: res.lock_configuration,
            }).then(function(){
                updateOptionsContentScript();
                window.location.reload();
            });
    })
});

$('#lock-timer-plus-box-size-show').change(function(e) {
    if($(this).is(":checked")){
        $('#lock-timer-plus-box-size').show();
        $('label[for="lock-timer-plus-box-size"]').show();
    }else{
        $('#lock-timer-plus-box-size').hide();
        $('label[for="lock-timer-plus-box-size"]').hide();
        //$('#lock-timer-plus-box-size').val(0);
    }
});

$('.timer-plus-toggle').click(function(e){
    e.stopImmediatePropagation();
});

$('#lock-timer-plus-increase-format').change(function(e) {
    let format = $('#lock-timer-plus-increase-format').val();
    switch (format) {
        case 's':
            $("#lock-timer-plus-increase-input").attr({
                "max" : 100000,
            });
            break;
        case 'm':
            $("#lock-timer-plus-increase-input").attr({
                "max" : 10000,
            });
            break;
        case 'h':
            $("#lock-timer-plus-increase-input").attr({
                "max" : 1000,
            });
            break;
        case 'd':
            $("#lock-timer-plus-increase-input").attr({
                "max" : 100,
            });
            break;
    }
});

$('#lock-timer-plus-increase').click(function(e){
    let ms = Math.max(0,$('#lock-timer-plus-increase-input').val());
    let format = $('#lock-timer-plus-increase-format').val();
    if( ms == 0){
       return;
    }
    let c = browser.storage.sync.get(['lock_configuration']);
    c.then((res) => {
        switch (format) {
            case 's':
                ms = ms*1000;
                break;
            case 'm':
                ms = ms*1000*60;
                break;
            case 'h':
                ms = ms*1000*60*60;
                break;
            case 'd':
                ms = ms*1000*60*60*24;
                break;
        }
        $('#lock-timer-plus-increase-input').val(0);
        res.lock_configuration.duration += ms;
        browser.storage.sync.set({
            lock_configuration: res.lock_configuration,
        }).then(function(){
            window.location.reload();
        });
    });
});

function generateSecurityToken(pass){
    let i = performance.now();
    if(pass == null){
        pass = i+"";
    }
    return hashFnv32a(pass, false, i);
}

/**
 * Calculate a 32 bit FNV-1a hash
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
function hashFnv32a(str, asString, seed) {
    let i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}

