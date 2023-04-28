$('.word_wallToggle').click(function(e){
    e.stopImmediatePropagation();
    let conf = browser.storage.sync.get(['word_wall_configuration']);
    conf.then((res) => {
        res.word_wall_configuration.enabled = $(this).attr('check') ? true : false
        browser.storage.sync.set({
            word_wall_configuration: res.word_wall_configuration
        }).then(function(){
            updateOptionsContentScript();
        });
    });
});

$('#word_wall_words').change(function(e) {
    e.stopImmediatePropagation();
    let conf = browser.storage.sync.get(['word_wall_configuration']);
    conf.then((res) => {
        res.word_wall_configuration.text =  $(this).val().split('\n').filter(item => item.length !== 0);
        browser.storage.sync.set({
            word_wall_configuration: res.word_wall_configuration
        }).then(function(){
            updateOptionsContentScript();
        });
    });
});