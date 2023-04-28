$( "#sticker_collections" ).change(function() {
    $('#sticker_collection_delete').hide();
    $( "#sticker_collection_disable" ).prop( "disabled", true );
    let f = $( "#sticker_collections option:selected" ).first();
    if(f && sticker_collections){
        let found = sticker_collections.find((o) => {
            return o['_name'] === f.attr('name');
        })
        if(found) {
            $( "#sticker_collection_disable" ).html(found._enabled? 'Disable' : 'Enable');
            $( "#sticker_collection_disable" ).prop( "disabled", false );
            $('#sticker_collection').empty();
            $('#sticker_collection_add_sticker').show();
            if(!found._locked){
                $('#sticker_collection_delete').show();
            }
            found._stickers.forEach(function (sticker, idx, array) {
                let src = sticker.url;
                $('#sticker_collection').append($('<div>', {
                    class: 'sticker_entry',
                    name: sticker.name,
                    html: '<div class="sticker_entry_inner"><div class="sticker_entry_title"><b>' + capitalizeFirstLetter(sticker.name) + '</b></i></div><div class="sticker_entry_image_box"><img class="sticker_entry_image" src="' + src + '"/></div></div>',
                }));
            });
        }
    }
}).trigger( "change" );

$('#sticker_collection').on('click', '.sticker_entry', function(){
    let f = $( "#sticker_collections option:selected" ).first();
    $( "#sticker_collection_add_select_file" ).prop( "disabled", true );
    $( "#sticker_collection_add_name" ).prop( "disabled", true );
    let found_collection = sticker_collections.find((o) => {
        return o['_name'] === f.attr('name');
    });
    if(found_collection){
        let sticker_name = $(this).attr('name');
        let found_sticker = found_collection._stickers.find((o) => {
            return o['name'] === sticker_name;
        });
        if(found_sticker.locked){
            $( "#sticker_collection_add_delete" ).hide();
        }else{
            $( "#sticker_collection_add_delete" ).show();
        }
        $('#sticker_collection_add_name').val(sticker_name);
        $('#sticker_collection_add_scale').val(found_sticker.scale);
        $('#sticker_collection_add_chance').val(found_sticker.chance);
        $('#sticker_collection_add_group').val(found_sticker.groups.join(';'));
        $('.sticker_collection_add_label').prop( "checked", false );
        found_sticker.klasses.forEach(function(klass){
            $('.sticker_collection_add_label[label="'+klass.key+'"]').prop( "checked", true );
        });
        let subimg = $(this).find('img').first();
        $('#sticker_collection_add_preview_image').attr("src",subimg.attr('src'));
        $('#sticker_collection_add_save').prop( "disabled", false );
        $('#sticker_collection_add_sticker_file_input').val(null);
        $('#sticker_collection_add_sticker_modal').show();
    }

});

$('#sticker_collection_export').click(function(){
    let f = $( "#sticker_collections option:selected" ).first();
    if(f && sticker_collections){
        let found = sticker_collections.find((o) => {
            return o['_name'] === f.attr('name');
        })
        if(found){
            found._stickers.forEach(function (sticker, idx, array) {
                if(sticker.file){
                    sticker.file = null;
                }
            });
            objToJSON(found._name+".pstp", found);
        }
    }
});

$('#sticker_collection_delete').click(function(){
    let f = $( "#sticker_collections option:selected" ).first();
    if(f && sticker_collections){
        let found = sticker_collections.find((o) => {
            return o['_name'] === f.attr('name');
        })
        if(found){
            if(!found._locked){
                removeItemOnce(sticker_collections, found);
                browser.storage.local.set({
                    sticker_collections: sticker_collections,
                }).then(function(){
                    $('#sticker_collection').empty();
                    $( "#sticker_collections" ).trigger( "change" );
                    updateOptionsContentScript();
                    restoreCensorConfigs();
                });
            }else{
                alert('Cannot remove default collections');
            }
        }
    }
});

$('#sticker_collection_create_add').click(function(){
    let name = $('#sticker_collection_create_name').val();
    name = name.toLowerCase();
    $( "#sticker_collection_add_select_file" ).prop( "disabled", false );
    $( "#sticker_collection_add_name" ).prop( "disabled", false );
    if(name && sticker_collections){
        let found = sticker_collections.find((o) => {
            return o['_name'] === name;
        });
        if(!found){
            let sticker_request = browser.storage.local.get(['sticker_collections']);
            sticker_request.then((res) => {
                let collection = new StickerCollection(name,[], true, false);
                res.sticker_collections.push(collection);
                sticker_collections = res.sticker_collections;
                $('#sticker_collections').empty();
                browser.storage.local.set({
                    sticker_collections: res.sticker_collections,
                }).then(function(){
                    $( "#sticker_collections" ).trigger( "change" );
                    updateOptionsContentScript();
                });
                res.sticker_collections.forEach(function(collection, key){
                    $('#sticker_collections').append($('<option>', {
                        value: key,
                        text: capitalizeFirstLetter(collection._name),
                        name: collection._name,
                        class: ' '+(collection._enabled? 'sticker_collection_enabled': 'sticker_collection_disabled')+
                               ' '+(collection._locked? 'sticker_collection_locked': ''),
                    }));
                });
            });
        }else{
            window.alert("A collection with that name already exists!");
        }
    }else{
        window.alert("Invalid collection name!");
    }
});

$('#sticker_collection_add_sticker').click(function(){
    $( "#sticker_collection_add_select_file" ).prop( "disabled", false );
    $( "#sticker_collection_add_name" ).prop( "disabled", false );
    $( "#sticker_collection_add_delete" ).hide();
    $(" #sticker_collection_add_save" ).prop( "disabled", true );
    $( "#sticker_collection_add_sticker_file_input" ).val(null);
    $( "#sticker_collection_add_sticker_modal" ).show();
});

$( "#sticker_collection_add_save" ).click(function(){
    $( "#sticker_collection_add_preview_image" ).attr("src",'');
    $( "#sticker_collection_add_sticker_modal" ).hide();
    let files = $( "#sticker_collection_add_sticker_file_input" ).prop('files');
    let file = files[0];
    sticker_collection_add_save(file);
});

$( "#sticker_collection_add_select_file" ).click(function(){
    $('#sticker_collection_add_sticker_file_input').trigger('click');
});

$('#sticker_collection_add_sticker_file_input').on("change", function() {
    let files = $( "#sticker_collection_add_sticker_file_input" ).prop('files');
    if (files && files[0]) {
        $('#sticker_collection_add_save').prop( "disabled", false );
        $('#sticker_collection_add_name').val(files[0].name.replace(/\.[^/.]+$/, ""));
        let file = files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            $( "#sticker_collection_add_preview_image" ).attr("src",e.target.result);
        }
        reader.readAsDataURL(file);
    }
});

function sticker_collection_add_save(file){
    let f = $( "#sticker_collections option:selected" ).first();
    if(file){
        if(f && sticker_collections){
            let found = sticker_collections.find((o) => {
                return o['_name'] === f.attr('name');
            })
            if(found){
                let sticker_name = $('#sticker_collection_add_name').val();
                sticker_name = sticker_name.toLowerCase();
                if(!sticker_name){
                    window.alert("Invalid sticker name.");
                    return;
                }
                let found_sticker = found._stickers.find((o) => {
                    return o['name'] === sticker_name;
                });
                if(found_sticker){
                    window.alert("A sticker with this name already exists.");
                    return;
                }
                let imageSrc = URL.createObjectURL(file);
                let imageData = new Image();
                imageData.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = imageData.width;
                    canvas.height = imageData.height;
                    let ctx = canvas.getContext("2d");
                    ctx.drawImage(imageData, 0, 0);
                    //let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let dataurl = canvas.toDataURL("image/png");
                    let allowed_klasses = [];
                    Object.keys(klasses).forEach(e =>
                        {
                            let checked = $( ".sticker_collection_add_label[label='"+klasses[e].key+"']" ).is(':checked');
                            if(checked){
                                allowed_klasses.push(klasses[e]);
                            }
                        }
                    );
                    let sticker = {
                        name: sticker_name,
                        //file: data.data,
                        file: null,
                        url: dataurl,
                        width: canvas.width,
                        height: canvas.height,
                        klasses: allowed_klasses,
                        scale: Math.max(0.1,parseFloat($('#sticker_collection_add_scale').val())),
                        chance: Math.max(0,parseFloat($('#sticker_collection_add_chance').val())),
                        groups: $('#sticker_collection_add_group').val().split(';'),
                    };
                    found._stickers.push(sticker);
                    browser.storage.local.set({
                        sticker_collections: sticker_collections,
                    }).then(function(){
                        $( "#sticker_collections" ).trigger( "change" );
                        updateOptionsContentScript();
                    });

                }
                imageData.src = imageSrc;
            }
        }
    }else{
        let found = sticker_collections.find((o) => {
            return o['_name'] === f.attr('name');
        })
        if(found) {
            let sticker_name = $('#sticker_collection_add_name').val();
            sticker_name = sticker_name.toLowerCase();
            if (!sticker_name) {
                window.alert("Invalid sticker name.");
                return;
            }
            let found_sticker = found._stickers.find((o) => {
                return o['name'] === sticker_name;
            });
            if (found_sticker) {
                found_sticker.scale = Math.max(0.1,parseFloat($('#sticker_collection_add_scale').val()));
                found_sticker.chance = Math.max(0.1,parseFloat($('#sticker_collection_add_chance').val()));
                found_sticker.groups = $('#sticker_collection_add_group').val().split(';');
                let allowed_klasses = [];
                Object.keys(klasses).forEach(e =>
                    {
                        let checked = $( ".sticker_collection_add_label[label='"+klasses[e].key+"']" ).is(':checked');
                        if(checked){
                           allowed_klasses.push(klasses[e]);
                        }
                    }
                );
                found_sticker.klasses = allowed_klasses;
                browser.storage.local.set({
                    sticker_collections: sticker_collections,
                }).then(function(){
                    $( "#sticker_collection_add_sticker_modal" ).hide();
                    $( "#sticker_collections" ).trigger( "change" );
                    updateOptionsContentScript();
                });
            }
        }
    }
}

$('#sticker_collection_add_sticker_modal_close').click(function() {
    $( "#sticker_collection_add_preview_image" ).attr("src",'');
    $('#sticker_collection_add_sticker_modal').hide();
});

$( "#sticker_collection_add_delete" ).click(function(){
    $( "#sticker_collection_add_sticker_modal" ).hide();
    let f = $( "#sticker_collections option:selected" ).first();
    if(f && sticker_collections) {
            let found = sticker_collections.find((o) => {
                return o['_name'] === f.attr('name');
            })
            if (found) {
                let sticker_name = $('#sticker_collection_add_name').val();
                sticker_name = sticker_name.toLowerCase();
                if (!sticker_name) {
                    window.alert("Invalid sticker name.");
                    return;
                }
                let found_sticker = found._stickers.find((o) => {
                    return o['name'] === sticker_name;
                });
                if (found_sticker) {
                    removeItemOnce(found._stickers,found_sticker);
                    browser.storage.local.set({
                        sticker_collections: sticker_collections,
                    }).then(function(){
                        $( "#sticker_collection_add_sticker_modal" ).hide();
                        $( "#sticker_collections" ).trigger( "change" );
                        updateOptionsContentScript();
                    });
                }

            }
    }
});

$( "#sticker_add_toggle_labels" ).click(function() {
    $('.sticker_collection_add_label').each(function () {
        $(this).prop( "checked", !$(this).prop( "checked"));
    });
});

$( "#sticker_collection_disable" ).click(function() {
    let f = $( "#sticker_collections option:selected" ).first();
    if(f && sticker_collections) {
        let found = sticker_collections.find((o) => {
            return o['_name'] === f.attr('name');
        })
        if (found) {
            found._enabled = !found._enabled;
            browser.storage.local.set({
                sticker_collections: sticker_collections,
            }).then(function(){
                $( "#sticker_collection_disable" ).html(found._enabled? 'Disable' : 'Enable');
                $( "#sticker_collection_disable" ).prop( "disabled", true );
                if(found._enabled){
                    f.addClass('sticker_collection_enabled');
                    f.removeClass('sticker_collection_disabled');
                }else{
                    f.addClass('sticker_collection_disabled');
                    f.removeClass('sticker_collection_enabled');
                }
                $('#sticker_collection').empty();
                updateOptionsContentScript();
                //restoreCensorConfigs();
            });
        }
    }
});


$( "#sticker_draw_mode" ).change(function() {
    if($(this).val() == 2){
        $( "#sticker_groups" ).show();
    }else{
        $( "#sticker_groups" ).hide();
    }
});

$( "#sticker_collection_import" ).click(function() {
    $('#sticker_collection_import_file_input').trigger('click');
});

$('#sticker_collection_import_file_input').on("change", function() {
    let files = $( this ).prop('files');
    if (files && files[0]) {
        let reader = new FileReader();
        reader.onload = function(event) {
            let jsonObj = JSON.parse(event.target.result);
            if( '_enabled' in jsonObj &&
                '_locked' in jsonObj && jsonObj._locked == false &&
                '_name' in jsonObj && jsonObj._name.length > 0 &&
                '_stickers' in jsonObj
            ){
                let found = sticker_collections.find((o) => {
                    return o['_name'] === jsonObj._name;
                });
                if(found){
                    alert('A collection with that name already exists.');
                    return;
                }
                let promises = [];
                jsonObj._stickers.forEach(function (sticker, idx, array) {
                    let p = new Promise((resolve, reject) => {
                        // Legacy Support
                        if(sticker.file != null) {
                            if (!sticker.url) {
                                sticker.url = sticker.file;
                            }
                        }
                        // Legacy Support End
                        if( 'name' in sticker && sticker.name.length > 0 &&
                            'file' in sticker &&
                            'klasses' in sticker &&
                            'scale' in sticker &&
                            'chance' in sticker &&
                            'groups' in sticker
                        ){
                            let new_sticker = {
                                name: sticker.name,
                                //file: sticker.file,
                                file: null,
                                url: sticker.url,
                                width: sticker.width,
                                height: sticker.height,
                                klasses: sticker.klasses,
                                scale: sticker.scale,
                                locked: false,
                                chance: sticker.chance,
                                groups: sticker.groups,
                            };

                            if(sticker.url != null) {
                                let imageData = new Image();
                                imageData.onload = function () {
                                    const canvas = document.createElement('canvas');
                                    canvas.width = imageData.width;
                                    canvas.height = imageData.height;
                                    if (canvas.width <= 0 || canvas.height <= 0) {
                                        reject();
                                    }
                                    let ctx = canvas.getContext("2d");
                                    ctx.drawImage(imageData, 0, 0);
                                    jsonObj._stickers[idx] = new_sticker;
                                    resolve();
                                }
                                imageData.src = sticker.url;

                            }
                        }else{
                            reject("Sticker "+sticker.name+" corrupted");
                        }

                    });
                    promises.push(p);
                });
                Promise.all(promises).then((values) => {
                    sticker_collections.push(jsonObj);
                    browser.storage.local.set({
                        sticker_collections: sticker_collections,
                    }).then(function(){
                        $( "#sticker_collections" ).trigger( "change" );
                        updateOptionsContentScript();
                        restoreCensorConfigs();
                    });
                }).catch(function(err) {
                    alert(err);
                });;

            }else{
                log('Corrupted Collection','_enabled' in jsonObj,'_locked' in jsonObj && jsonObj._locked == false, '_name' in jsonObj && jsonObj._name.length > 0,'_stickers' in jsonObj);
                alert('Corrupted Collection');
            }

        }
        reader.readAsText(files[0]);
    }

});

$('#sticker_reset').click(function() {
    if (window.confirm("Warning: This will delete all non default stickers and reset all default stickers.")) {
        let clearStorage = browser.storage.local.remove('sticker_collections');
        clearStorage.then(e => {
            reloadStickers();
            window.location.reload();
        });
    }
});

function reloadStickers(){
    return browser.runtime.sendMessage({
        reset_stickers: true
    });
}