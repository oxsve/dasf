let queue = [];
let workingOnPromise = false;

class Queue {

    static enqueue(promise, tabId, originUrl, url, img, img_dimension) {
        return new Promise((resolve, reject) => {
            queue.push({
                tabId,
                originUrl,
                url,
                img,
                img_dimension,
                promise,
                resolve,
                reject,
            });
            if(!workingOnPromise){
                setTimeout(function(){
                    queue.sort( compareCensorRequest );
                    Queue.dequeue();
                }, 100);
            }else{
                queue.sort( compareCensorRequest );
                this.dequeue();
            }
        });
    }

    static dequeue() {
        if (workingOnPromise) {
            return false;
        }
        const item = queue.shift();
        if (!item) {
            return false;
        }
        log("processing next Request: tabID: " +item.tabId +" -> "+ item.url + " -> dim:" + item.img_dimension)
        try {
            workingOnPromise = true;
            item.promise()
                .then((value) => {
                    workingOnPromise = false;
                    item.resolve(value);
                    this.dequeue();
                })
                .catch(err => {
                    workingOnPromise = false;
                    item.reject(err);
                    this.dequeue();
                })
        } catch (err) {
            workingOnPromise = false;
            item.reject(err);
            this.dequeue();
        }
        return true;
    }
}