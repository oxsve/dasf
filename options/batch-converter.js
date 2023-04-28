let batch_files = null;

let batch_file_info = {
    'png':  0,
    'jpeg': 0,
    'bmp':  0,
    'webp': 0,
    'avif': 0,
    'gif':  0,
}
let batch_file_size = 0;
let batch_files_filtered = [];

let batch_processing_time_start = 0;
let batch_processing_time_total = 0;

let batch_process_ongoing = false;
let batch_process_interrupt = false;

logger.callbacks.push(batch_converter_log);

$( ".batch_converter-file-selector" ).change(function(event) {
    let options = browser.storage.sync.get(['user','file_types',]);
    options.then((res) => {
        //if(!(res.user != null && res.user.permissions.permission_batch_converter <= res.user.patreon_tier)){
        //    return;
        //}
        let fileList = event.target.files;
        $( "#batch_converter_file_count" ).html(fileList.length);
        batch_files = Array.from(fileList);
        batch_file_info = {
            png:  0,
            jpeg: 0,
            bmp:  0,
            webp: 0,
            avif:  0,
            gif:  0,
        }
        batch_file_size = 0;
        batch_files_filtered = [];
        let i = 0;
        batch_files.forEach(function(file, index){
            //let t0 = performance.now();
            if(file['type'].split('/')[0] === 'image') {
                file.arrayBuffer().then(buffer => {
                    let arr = new Uint8Array(buffer).subarray(0, 4);
                    let header = '';
                    for (let i = 0; i < arr.length; i++) {
                        header += arr[i].toString(16);
                    }
                    checkMimeHeader(header, function (type, ext, header, cont) {
                        let full_type = type;
                        //Repair short content types
                        if (res.file_types.includes(type)) {
                            full_type = 'image/' + type;
                        }
                        switch (type) {
                            case 'image/png':
                                batch_file_info.png++;
                                break;
                            case 'image/jpg':
                                batch_file_info.jpeg++;
                                break;
                            case 'image/jpeg':
                                batch_file_info.jpeg++;
                                break;
                            case 'image/bmp':
                                batch_file_info.bmp++;
                                break;
                            case 'image/webp':
                                batch_file_info.webp++;
                                break;
                            case 'image/avif':
                                batch_file_info.avif++;
                                break;
                            case 'image/gif':
                                batch_file_info.gif++;
                                break;
                        }
                        if (cont && processableContentType(full_type, res.file_types, res.gif_configuration)) {
                            batch_files_filtered.push({
                                file: file,
                                full_type: full_type,
                                ext: ext,
                            });
                        }
                        if (cont || ['png', 'jpg', 'jpeg', 'bmp', 'webp', 'avif', 'gif'].includes(ext)) {
                            batch_file_size += file.size;
                            i++;
                            $("#batch_converter_png_count").html(batch_file_info.png);
                            $("#batch_converter_jpg_count").html(batch_file_info.jpeg);
                            $("#batch_converter_bmp_count").html(batch_file_info.bmp);
                            $("#batch_converter_webp_count").html(batch_file_info.webp);
                            $("#batch_converter_avif_count").html(batch_file_info.avif);
                            $("#batch_converter_gif_count").html(batch_file_info.gif);
                            $("#batch_converter_total_images_count").html(batch_files_filtered.length);
                            $("#batch_converter_total_file_size").html(formatBytes(batch_file_size));
                        }
                    }, buffer, res.file_types,res.gif_configuration);
                });
            }
        });
    });
});

$("#batch_converter_start-label").click(function () {
    if(batch_files_filtered.length == 0){
        return;
    }
    if(!batch_process_ongoing){
        batch_process_ongoing = true;
        $( "#batch_converter_start-label" ).html("Stop");
        $( ".batch_converter-file-selector" ).prop('disabled', true);
        batch_converter_log_clear();
        let options = browser.storage.sync.get(['user','file_types','gif_configuration']);
        options.then(async (res) => {
            if(!(res.user != null && res.user.permissions.permission_batch_converter <= res.user.patreon_tier)){
                logger.log('info', 'Feature is for Patreons only currently.');
            }
            batch_processing_time_start = performance.now();
            let zip = new JSZip();
            let progress_bar = document.getElementById("batch_converter_progress_bar");
            progress_bar.style.width = "0%";
            $("#batch_converter_progress_text").html("0%");
            $( "#batch_converter_batch_size" ).html(batch_files_filtered.length);
            $( "#batch_converter_batch_info" ).show();
            batch_processing_time_total = performance.now();
            let i = 0;
            if(batch_files_filtered.length > i){
                let tempCanvas = document.createElement('canvas');
                let image = new Image();
                for  (const elem of batch_files_filtered) {
                        if (batch_process_interrupt) {
                            break;
                        }
                        await convert_element(batch_files_filtered, i, res, function(index, file, blob, type){
                            let t1 = performance.now();
                            let t_single = t1 - batch_processing_time_total;
                            batch_processing_time_total = t1;
                            progress_bar.style.width = (index/batch_files_filtered.length)*100 + "%";
                            $("#batch_converter_progress_text").html(Math.ceil((index/batch_files_filtered.length)*100) + "%");
                            logger.log('info', 'Converted ' + file.name + ' in ' + (t_single) + ' milliseconds');
                            $( "#batch_converter_current_index" ).html(index);
                            let average_time = ((batch_processing_time_total-batch_processing_time_start)/(index));
                            let est_dur = average_time*batch_files_filtered.length;
                            let est_left = average_time*(batch_files_filtered.length-index);
                            $( "#batch_converter_estimated_time" ).html(msToTime(est_dur));
                            $( "#batch_converter_estimated_time_left" ).html(msToTime(est_left));
                            $( "#batch_converter_estimated_time_average" ).html(msToTime(average_time));
                            if(file.webkitRelativePath){
                                zip.file(file.webkitRelativePath, blob, {base64: true});
                            }else{
                                zip.file(file.name, blob, {base64: true});
                            }
                        }, tempCanvas, image);
                        i++;
                };
                $("#batch_converter_progress_text").html("- Generating Zip File -");
                batch_converter_store_zip(zip, function (){
                    $("#batch_converter_progress_text").html("- Done -");
                    $( "#batch_converter_start-label" ).html("Start");
                    $( ".batch_converter-file-selector" ).prop('disabled', false);
                    batch_process_ongoing = false;
                    batch_process_interrupt = false;
                });
            }
        });
    }else{
        batch_process_interrupt = true;
        logger.log('info', 'Batch processing interrupted: Finishing current index.');
    }
});
/*
let myPort = browser.runtime.connect({name:"port-from-cs"});


Old code fo the AI requests (non paint request) TODO: check if faster than messages
let batch_callback = function (response){};

myPort.onMessage.addListener(function(response) {
    batch_callback(response);
});
*/

function convert_element(batch, index, config, progress, tempCanvas, image){
    return new Promise((resolve, reject) => {
        let i = index;
        let elem = batch[index];
        let file = elem.file;
        let full_type = elem.full_type;
        let ext = elem.ext;
        logger.log('info', 'Processing now '+file.name);
        try {
            image.onload = function () {
                try{
                        let request_payload = {};
                        if (full_type === "image/gif" && !config.gif_configuration._thumbnails) {
                            request_payload = {
                                gif_request: true,
                                batch_converter: true,
                                blob: file,
                                content_type_header: full_type,
                                ext: ext,
                            }
                        }else{
                            request_payload = {
                                paint_request: true,
                                batch_converter: true,
                                blob: file,
                                content_type_header: full_type,
                                ext: ext,
                            };
                        }
                        let paint_request = browser.runtime.sendMessage(request_payload);
                        paint_request.then(paint_response => {
                            i++;
                            URL.revokeObjectURL(file_url);
                            progress(i, file, paint_response.blob, full_type);
                            resolve();
                        });
                }catch (e){
                    logger.log('error', ''+e);
                    URL.revokeObjectURL(file_url);
                    reject();
                }
            }
            let file_url = URL.createObjectURL(file);
            image.src = file_url;
        }catch (e){
            logger.log('error', ''+e);
            reject();
        }
    });
}

function batch_converter_store_zip(zip, callback) {
    logger.log('info', 'DONE in '+(batch_processing_time_total-batch_processing_time_start)+' milliseconds.');
    logger.log('info', 'Packing...');
    let t0 = performance.now();
    zip.generateAsync({
        type: "blob",
        compression: "STORE",
    }).then(function (content) {
        let t1 = performance.now();
        logger.log('info', 'Zip generated in ' + (t1 - t0) + ' millisseconds.');
        downloadBlob(content,'zip');
        callback();
    });

}

function batch_converter_log(type, time_stamp, message){
    if(Array.isArray(message) && message.length == 1){
        message = message[0];
    }
    let console = document.getElementById("batch_converter_console");
    let newLine = document.createElement("li");
    const hms = time_stamp.getHours() + ':' + time_stamp.getMinutes() + ':' + time_stamp.getSeconds();
    let content = document.createTextNode(hms+' - '+((typeof message === 'string') ? message : JSON.stringify(message, null, 4)));
    newLine.appendChild(content);
    console.appendChild(newLine);
    $("#batch_converter_console").scrollTop($("#batch_converter_console")[0].scrollHeight);
}

function batch_converter_log_clear(){
    $("#batch_converter_console").empty();
}