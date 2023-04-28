$('.reverseToggle').click(function(e){
    e.stopImmediatePropagation();
    let conf = browser.storage.sync.get(['reverse_mode_configuration']);
    conf.then((res) => {
        res.reverse_mode_configuration.enabled = $(this).attr('check') ? true : false
        browser.storage.sync.set({
            reverse_mode_configuration: res.reverse_mode_configuration
        }).then(function(){
            updateOptionsContentScript();
        });
    });
});

$('#reverse_censoring_process_no_results').change(function(e) {
    e.stopImmediatePropagation();
    let conf = browser.storage.sync.get(['reverse_mode_configuration']);
    conf.then((res) => {
        res.reverse_mode_configuration.process_no_result = $(this).is(':checked') ? true : false;
        browser.storage.sync.set({
            reverse_mode_configuration: res.reverse_mode_configuration
        }).then(function(){
            updateOptionsContentScript();
        });
    });
});

$('input[name="reverse_censoring_process_no_results_image_definition"]').change(function(e) {
    e.stopImmediatePropagation();
    let conf = browser.storage.sync.get(['reverse_mode_configuration']);
    conf.then((res) => {
        res.reverse_mode_configuration.process_no_result_censor_selection =  $('#reverse_censoring_process_no_results_current_selection').is(':checked') ? 1 :
                                                                            ($('#reverse_censoring_process_no_results_global_selection').is(':checked')? 0 : 2);
        browser.storage.sync.set({
            reverse_mode_configuration: res.reverse_mode_configuration
        }).then(function(){
            updateOptionsContentScript();
        });
    });
});