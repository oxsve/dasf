$("#toggle_oom_labels").on('click', function(event){
    $(".oom-label").each(function() {
        $(this).prop("checked", !$(this).prop("checked"));
    });
    save_config();
    updateOptionsContentScript();
});

$('.oomToggle').click(function(e){
    e.stopImmediatePropagation();
    let conf = browser.storage.sync.get(['only_once_mode_configuration']);
    conf.then((res) => {
        res.only_once_mode_configuration.enabled = $(this).attr('check') ? true : false
        browser.storage.sync.set({
            only_once_mode_configuration: res.only_once_mode_configuration
        }).then(function(){
            updateOptionsContentScript();
        });
    });
});

$('#only_once_mode_reset').click(function() {
    if (window.confirm("Warning: This will clear all Only Once Mode data from your local storage.")) {
        let p = reloadOOMTree();
        p.then(e => {
            window.location.reload();
        });
    }
});
$('.oomGridEntry input').click(function() {
    oomShowAdvancedSubOptions($(this));
});

function oomShowAdvancedSubOptions(elem){
    $('.oomGridEntry .vl').hide();
    if($("#only_once_mode_mode_advanced div").children(':visible').length != 0) {
        $("#only_once_mode_mode_advanced").css({ "border-top": "2px solid"});
        elem.parent().children('.vl').show();
    }else{
        $("#only_once_mode_mode_advanced").css({ "border-top": "0px solid"});
    }
}
$('#only_once_mode_mode_grid_advanced_color_preset').change(function(){
    if($(this).val() == 0){
        //$("#only_once_mode_mode_grid_advanced_color_custom").show();
    }else{
        //$("#only_once_mode_mode_grid_advanced_color_custom").hide();
        $("#only_once_mode_mode_grid_advanced_color_1").val($(this).val().split(';')[0]);
        $("#only_once_mode_mode_grid_advanced_color_2").val($(this).val().split(';')[1]);
        save_config();
    }
});

$('.oom-timer-input').on("keypress keyup blur",function (event) {
    $(this).val($(this).val().replace(/[^\d].+/, ""));
    if ((event.which < 48 || event.which > 57)) {
        event.preventDefault();
    }
});
$('#oom-min-timer-container .oom-timer-input').change(function(){
    let conf = browser.storage.sync.get(['only_once_mode_configuration']);
    conf.then((res) => {
        let d = $('#oom-min-timer-days').val() > 0?$('#oom-min-timer-days').val()*24*60*60*1000:0;
        let h = $('#oom-min-timer-hours').val() > 0?$('#oom-min-timer-hours').val()*60*60*1000:0;
        let m = $('#oom-min-timer-minutes').val() > 0?$('#oom-min-timer-minutes').val()*60*1000:0;
        let s = $('#oom-min-timer-seconds').val() > 0?$('#oom-min-timer-seconds').val()*1000:0;
        let sum = (d+h+m+s);
        res.only_once_mode_configuration.timer_min_duration = sum;
        browser.storage.sync.set({
            only_once_mode_configuration: res.only_once_mode_configuration
        }).then(function(){
            updateOptionsContentScript();
        });
    });
});

$('#oom-max-timer-container .oom-timer-input').change(function(){
    let conf = browser.storage.sync.get(['only_once_mode_configuration']);
    conf.then((res) => {
        let d = $('#oom-max-timer-days').val() > 0?$('#oom-max-timer-days').val()*24*60*60*1000:0;
        let h = $('#oom-max-timer-hours').val() > 0?$('#oom-max-timer-hours').val()*60*60*1000:0;
        let m = $('#oom-max-timer-minutes').val() > 0?$('#oom-max-timer-minutes').val()*60*1000:0;
        let s = $('#oom-max-timer-seconds').val() > 0?$('#oom-max-timer-seconds').val()*1000:0;
        let sum = (d+h+m+s);
        res.only_once_mode_configuration.timer_max_duration = sum;
        browser.storage.sync.set({
            only_once_mode_configuration: res.only_once_mode_configuration
        }).then(function(){
            updateOptionsContentScript();
        });
    });
});


/*
$('#only_once_mode_test').click(function() {
    browser.runtime.sendMessage({
        oom_test: true
    });
});
*/
function reloadOOMTree(){
    return browser.runtime.sendMessage({
        reset_oom_tree: true
    });
}