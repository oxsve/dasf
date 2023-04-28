

function requestContentType(url, callback, onerror) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('HEAD', url);
    xhttp.onreadystatechange = function () {
        if (this.readyState == this.DONE) {
            let content_type_header = this.getResponseHeader("Content-Type");
            callback(content_type_header);
        }else if(xhttp.status == 403){
            onerror(xhttp.status);
        }
    }
    xhttp.send();
}

function toDataURL(url, callback) {
    let xhr1 = new XMLHttpRequest();
    let ct = "";
    function hand () {
        ct = this.getResponseHeader('content-type');
    }
    xhr1.onreadystatechange = hand;
    xhr1.onload = function() {

        //if (xhr1.status == 200) {
            let reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result, ct);
            }
            reader.readAsArrayBuffer(xhr1.response);
        //}
        /*else if(xhr1.status == 403){
            onerror(xhr1.status);
        }
        */
    };
    xhr1.open('GET', url);
    xhr1.responseType = 'blob';
    xhr1.send();
}

function processableContentType(content_type, file_types, gif_configuration){
    if(content_type === "image/png" && file_types.includes('png')){
        return true;
    }
    if(content_type === "image/jpg" && file_types.includes('jpg')){
        return true;
    }
    if(content_type === "image/jpeg" && file_types.includes('jpg')){
        return true;
    }
    if(content_type === "image/webp" && file_types.includes('webp')){
        return true;
    }
    if(content_type === "image/bmp" && file_types.includes('bmp')){
        return true;
    }
    if(content_type === "image/avif" && file_types.includes('avif')){
        return true;
    }
    if(content_type === "image/gif" && (file_types.includes('gif') || (gif_configuration != null && gif_configuration._thumbnails))){
        return true;
    }
    if(content_type === "video/webm" && file_types.includes('webm')){
        return false;
    }
    return false;
}

function checkMime(file, callback, file_types = null, gif_configuration = null){
    let fileReader = new FileReader();
    fileReader.onloadend = function(e) {
        let arr = (new Uint8Array(e.target.result)).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
            header += arr[i].toString(16);
        }
        // Check the file signature against known types
        checkMimeHeader(header, callback, e.target.result, file_types, gif_configuration);

    };
    fileReader.readAsArrayBuffer(file);
}

function checkMimeHeader(header, callback, byteArr = null, file_types = [], gif_configuration = null){
    let type = 'unknown';
    let ext = '';
    switch (header) {
        case '89504e47':
            type = 'image/png';
            ext = 'png';
            callback(type, ext, header, file_types.includes(ext));
            return;
            break;
        case '47494638':
            type = 'image/gif';
            ext = 'gif';
            callback(type, ext, header, file_types.includes(ext) || (gif_configuration != null && gif_configuration._thumbnails));
            return;
            break;
        case '52494646':
            //let arrAvif = (new Uint8Array(byteArr)).subarray(8, 12); // WebP
            let cache = {};
            try { // Does not work on local files
                let arrWebp = (new Uint8Array(byteArr)).subarray(30, 34);
                let animWebp = '';
                for (let i = 0; i < arrWebp.length; i++) {
                    animWebp += arrWebp[i].toString(16);
                }
                if (animWebp === '414e494d') {
                    cache['ANIM'] = true;
                } else {
                    cache['ANIM'] = false;
                }
            }catch (err) {
                console.log(err)
            }
            type = 'image/webp';
            ext = 'webp';
            callback(type, ext, header, file_types.includes(ext), cache);
            return;
            break;
        case 'ffd8ffe0':
            type = 'image/jpeg';
            ext = 'jpg';
            callback(type, ext, header, file_types.includes(ext));
            return;
            break;
        case 'ffd8ffe1':
            type = 'image/jpeg';
            ext = 'jpg';
            callback(type, ext, header, file_types.includes(ext));
            return;
            break;
        case 'ffd8ffe2':
            type = 'image/jpeg';
            ext = 'jpg';
            callback(type, ext, header, file_types.includes(ext));
            return;
            break;
        case 'ffd8ffe3':
            type = 'image/jpeg';
            ext = 'jpg';
            callback(type, ext, header, file_types.includes(ext));
            return;
            break;
        case 'ffd8ffdb':
            type = 'image/jpeg';
            ext = 'jpg';
            callback(type, ext, header, file_types.includes(ext));
            return;
            break;
        case 'ffd8ffee':
            type = 'image/jpeg';
            ext = 'jpg';
            callback(type, ext, header, file_types.includes(ext));
            return;
            break;
        case '00020':
            if(byteArr != null) {
                let arrAvif = (new Uint8Array(byteArr)).subarray(8, 12);
                let headerAvif = '';
                for (let i = 0; i < arrAvif.length; i++) {
                    headerAvif += arrAvif[i].toString(16);
                }
                if(headerAvif === '61766966') {
                    type = 'image/avif';
                    ext = 'avif';
                    callback(type, ext, header, file_types.includes(ext));
                    return;
                    break;
                }
            }
        case '1a45dfa3':
            type = 'video/webm';
            ext = 'webm';
            //callback(type, ext, header, true);
            //return;
            break;
        case '25504446':
            type = 'application/pdf';
            ext = 'pdf';
            break;


    }
    if(header.startsWith("424d")){
        type = 'image/bmp';
        ext = 'bmp';
        callback(type, ext, header, file_types.includes(ext));
        return;
    }
    callback(type, ext, header, false);
}