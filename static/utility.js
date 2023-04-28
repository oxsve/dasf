function roughSizeOfObject( object ) {
    var objectList = [];
    var stack = [ object ];
    var bytes = 0;
    while ( stack.length ) {
        var value = stack.pop();
        if ( typeof value === 'boolean' ) {
            bytes += 4;
        } else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        } else if ( typeof value === 'number' ) {
            bytes += 8;
        } else if (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        ) {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + " Sec";
    else if (minutes < 60) return minutes + " Min";
    else if (hours < 24) return hours + " Hrs";
    else return days + " Days"
}

function msToDMHSObject(ms) {
    let days = Math.floor(ms / (1000 * 60 * 60 * 24));
    let hours = Math.floor(ms % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    let minutes = Math.floor(ms % (1000 * 60 * 60) / (1000 * 60));
    let seconds = Math.floor(ms % (1000 * 60) / 1000);
    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
    };
}

function downloadBlob(blob, ext = '', name = null) {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = URL.createObjectURL(blob);
    // Create a link element
    const link = document.createElement("a");
    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    if(name){
        link.download = name+"."+ext;
    }else{
        //link.download = blobUrl.substring(21, 27)+"."+ext;
        link.download = blobUrl.substring(blobUrl.length-12)+"."+ext;
    }
    // Append link to the body
    document.body.appendChild(link);
    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );
    // Remove link from body
    document.body.removeChild(link);
    delay(5000).then(() => {
        URL.revokeObjectURL(blobUrl);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function imagedata_to_src(width, height, buffer) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    let imageData = ctx.createImageData(width, height);
    imageData.data.set(buffer);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

function objToJSON(filename, dataObjToWrite) {
    const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: "text/json" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");
    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    link.dispatchEvent(evt);
    link.remove()
};

function removeItemAll(arr, value) {
    let i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

function bytesToSize(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
    //return Math.round(bytes / Math.pow(1000, i), 2) + ' ' + sizes[i];
    return (bytes / Math.pow(1000, i)) + ' ' + sizes[i];
}

function removeItemOnce(arr, value) {
    let index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

function compareVersions(a_components, b_components) {

    if (a_components === b_components) {
        return 0;
    }

    let partsNumberA = a_components.split(".");
    let partsNumberB = b_components.split(".");

    for (let i = 0; i < partsNumberA.length; i++) {

        let valueA = parseInt(partsNumberA[i]);
        let valueB = parseInt(partsNumberB[i]);

        // A bigger than B
        if (valueA > valueB || isNaN(valueB)) {
            return 1;
        }

        // B bigger than A
        if (valueA < valueB) {
            return -1;
        }
    }
}