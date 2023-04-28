

$('#login_form').submit(function(){
    communityLogin($('#login_username').val(), $('#login_password').val());
    return false;
});

$('#logout_button').click(function(){
    communityLogout();
});

function communityLogin(username, password) {
    $("#login_form :input").prop("disabled", true);
    var sending = browser.runtime.sendMessage({
        login: true,
        username: username,
        password: password
    });
    sending.then(handleLogin, handleError);
}

function communityLogout() {
    var sending = browser.runtime.sendMessage({
        logout: true,
    });
    sending.then(function(){
        restoreLoginState();
        lockContent();
    }, handleError);

}

function handleLogin(message) {
    if(message){
        if(message.user){
            loginSuccess(message.user);
        }else{
            $("#login_form :input").prop("disabled", false);
            $("#login_message").html('Something went wrong');
        }
    }
}

function handleError(error) {
    console.log(`Error: ${error}`);
}

function loginSuccess(user) {
    $("#login_form").hide();
    $("#profile").show("slow");
    $("#profile_name").html(user.username);
    $("#profile_tier").html(user.patreon_tier_name);
    unlock(user);
}

function unlock(user){
    if(user != null && user.permissions.permission_file_type_gif <= user.patreon_tier){
        $(".patreon_gif").removeClass('patreon_locked');
        $(".patreon_gif").addClass('patreon_unlocked');
    }else{
        $(".patreon_gif .patreon_unlocked").removeClass('patreon_locked');
    }
    if(user != null && user.permissions.permission_video_overlay <= user.patreon_tier){
        $(".patreon_video_overlay").removeClass('patreon_locked');
        $(".patreon_video_overlay").addClass('patreon_unlocked');
    }else{
        $(".patreon_video_overlay .patreon_unlocked").removeClass('patreon_locked');
    }
    if(user != null && user.permissions.permission_reverse_censoring <= user.patreon_tier){
        $(".patreon_reverse_censoring").removeClass('patreon_locked');
        $(".patreon_reverse_censoring").addClass('patreon_unlocked');
    }else{
        $(".patreon_reverse_censoring .patreon_unlocked").removeClass('patreon_locked');
    }

    if(user != null && user.permissions.permission_shape_heart <= user.patreon_tier){
        $(".patreon_shape_heart").removeClass('patreon_locked');
        $(".patreon_shape_heart").addClass('patreon_unlocked');
        $(".patreon_shape_heart").removeAttr('disabled');
    }else{
        $(".patreon_shape_heart .patreon_unlocked").removeClass('patreon_locked');
    }

    if(user != null && user.permissions.permission_batch_converter <= user.patreon_tier){
        $(".patreon_batch_converter").removeClass('patreon_locked');
        $(".patreon_batch_converter").addClass('patreon_unlocked');
        $(".patreon_batch_converter").removeAttr('disabled');
    }else{
        $(".patreon_batch_converter .patreon_unlocked").removeClass('patreon_locked');
    }

    if(user != null && user.permissions.permission_batch_converter_folder <= user.patreon_tier){
        $(".patreon_batch_converter_folder").removeClass('patreon_locked');
        $(".patreon_batch_converter_folder").addClass('patreon_unlocked');
        $(".patreon_batch_converter_folder").removeAttr('disabled');
    }else{
        $(".patreon_batch_converter .patreon_unlocked").removeClass('patreon_locked');
    }

    if(user != null && user.permissions.permission_only_once_mode <= user.patreon_tier){
        $(".patreon_only_once_mode").removeClass('patreon_locked');
        $(".patreon_only_once_mode").addClass('patreon_unlocked');
        $(".patreon_only_once_mode").removeAttr('disabled');
    }

    if(user != null && user.permissions.permission_unlock_extension <= user.patreon_tier){
        $("#unlock-extension-patreon").removeAttr('disabled');
    }


}

function lockContent(){
    $(".patreon_gif").not(".patreon_nolock").addClass('patreon_locked');

    $('#gif-io').removeAttr('check');
    $('#gif-button').removeAttr('check');

    $(".patreon_video_overlay").not(".patreon_nolock").addClass('patreon_locked');
    $('#video-overlay-io').removeAttr('check');
    $('#video-overlay-button').removeAttr('check');

    $(".patreon_reverse_censoring").not(".patreon_nolock").addClass('patreon_locked');
    $('#reverse_censoring-io').removeAttr('check');
    $('#reverse_censoring-button').removeAttr('check');

    $(".patreon_shape_heart").not(".patreon_nolock").addClass('patreon_locked');
    $(".patreon_shape_heart").attr('disabled','disabled');

    $(".patreon_batch_converter").not(".patreon_nolock").addClass('patreon_locked');
    $(".patreon_batch_converter").attr('disabled','disabled');

    $(".patreon_batch_converter_folder").not(".patreon_nolock").addClass('patreon_locked');
    $(".patreon_batch_converter_folder").attr('disabled','disabled');

    $(".patreon_only_once_mode").not(".patreon_nolock").addClass('patreon_locked');
    $('#oom-io').removeAttr('check');
    $('#oom-button').removeAttr('check');
    $("#only_once_mode_customize").attr('disabled','disabled');

    $("#unlock-extension-patreon").attr('disabled','disabled');

    $(".patreon_unlocked").removeClass('patreon_unlocked');
    updateOptionsContentScript();

}