let debug = false;

function log(...args) {
    if(debug){
        console.trace();
        console.log(...args);
    }
}

let logger = {
    info : [],
    error: [],

    log: function (type, ...args){
        if(!logger.type){
            logger.type = [];
        }
        let time_stamp = new Date();
        logger.type.push({timestamp: time_stamp, message: args});
        this.callbacks.forEach(function (callback){
            callback(type, time_stamp, args);
        })
    },
    callbacks: [],
}