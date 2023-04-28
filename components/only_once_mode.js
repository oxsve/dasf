
let OOMTrees = [];

let OOMTreeSizeMax = 5000;

function initiateOOMTrees(){
    OOMTrees = [];
    let local_request = browser.storage.local.get(only_once_mode_storage_manager.trees);
    local_request.then((res) => {
        log("Storage Manager", only_once_mode_storage_manager)
        //for (const tree_reference of only_once_mode_storage_manager.trees) {
        for (let i = 0; i < only_once_mode_storage_manager.trees.length; i++){
            let tree_reference = only_once_mode_storage_manager.trees[i];
            if(res.hasOwnProperty(tree_reference)){
                let compressed = res[tree_reference];
                let decompressed = LZString.decompress(compressed);
                const obj = JSON.parse(decompressed);
                OOMTrees.push(obj);
            }else{
                log("Corrupted oom data storage!", tree_reference);
                only_once_mode_storage_manager.trees.splice(i, 1);
                log("Removed from references", i, tree_reference);
            }
        }
    });
}

function createNewOOMTree(){
    return new Promise((resolve) => {
        let only_once_mode_tree = new OnlyOnceModeTree();
        let current_length = OOMTrees.length;
        let tree_reference = "only_once_mode_tree_"+current_length;
        OOMTrees.push(only_once_mode_tree);
        only_once_mode_storage_manager.trees.push("only_once_mode_tree_"+current_length);
        browser.storage.local.set({
            only_once_mode_storage_manager: only_once_mode_storage_manager,
        }).then(() => {
            let storage_tree = {};
            let json = JSON.stringify(only_once_mode_tree)
            let compressed = LZString.compress(json);
            storage_tree[tree_reference] = compressed;
            browser.storage.local.set(storage_tree).then(() => {
                resolve([only_once_mode_tree, tree_reference]);
            });
        });
    });
}

function getCurrentOOMTree(){
    if(OOMTrees.length == 0){
        return createNewOOMTree();
    }else{
        const last = OOMTrees[OOMTrees.length - 1];
        if(last.count >= OOMTreeSizeMax){
            return createNewOOMTree();
        }else{
            return new Promise((resolve) => {
                resolve([last, only_once_mode_storage_manager.trees[OOMTrees.length - 1]]);
            });
        }
    }
}

function searchOOMTrees(hash){
    let t0 = performance.now();
    let data = {
        hash: hash,
        score: 0,
        date: null,
        known: '',
        unknown: '',
        times_viewed: 0,
        classes: {},
    };
    let i = 0;
    for (const tree of OOMTrees) {
        let new_data = searchOOMTree(hash, tree);
        if(new_data.score >= 64){
            let t1 = performance.now();
            log("search tree! time " + (t1 - t0) + " millisseconds.");
            return new_data;
        }else if(new_data.score >= data.score){
             data = new_data;
        }
    }
    let t1 = performance.now();
    log("search tree! time " + (t1 - t0) + " millisseconds.");
    return data;
}

function searchOOMTree(hash, tree){
    const arr = hash.split('');
    let sub_tree = tree.tree;
    let max_depth = null;
    let date = null;
    let times_viewed = 0;
    let existing = '';
    let newlyadded = '';
    let depth = 0;
    let class_indexes = {};
    for (depth = 0; depth < arr.length; depth++) {
        let b = parseInt(arr[depth]);
        if(sub_tree && sub_tree.hasOwnProperty(b)){
            // We are moving through known pattern here still,
            // we enter the next room and check the next door.
            sub_tree = sub_tree[b];
            existing += b;
        }else if(sub_tree){
            // The first time we do encounter a non filled room we flag our depth
            newlyadded += b;
            if(max_depth == null){
                max_depth = depth;
            }
            break;
        }
    }
    if(max_depth == null){
        max_depth = hash.length;
        date = sub_tree.d;
        times_viewed = sub_tree.c++;
        class_indexes = sub_tree.i;
    }
    return {
        hash: hash,
        score: max_depth,
        date: date,
        known: existing,
        unknown: newlyadded,
        times_viewed: times_viewed,
        classes: class_indexes,
    };
}

function storeOOMTree(hash, class_indexes = [], store = true){
    return new Promise((resolve) => {
        let p = getCurrentOOMTree();
        p.then(([tree, tree_reference]) => {
            const arr = hash.split('');
            let sub_tree = tree.tree;
            let max_depth = null;
            let date = null;
            let times_viewed = 0;
            let existing = '';
            let newlyadded = '';
            let depth = 0;
            for (depth = 0; depth < arr.length; depth++) {
                let b = parseInt(arr[depth]);
                if(sub_tree && sub_tree.hasOwnProperty(b)){
                    // We are moving through known pattern here still,
                    // we enter the next room and check the next door.
                    sub_tree = sub_tree[b];
                    existing += b;
                }else if(sub_tree){
                    // The first time we do encounter a non filled room we flag our depth
                    newlyadded += b;
                    if(max_depth == null){
                        max_depth = depth;
                    }
                    if(store) {
                        sub_tree[b] = {};
                        sub_tree = sub_tree[b];
                    }else{
                        break;
                    }
                }
            }
            if(max_depth == null){
                max_depth = hash.length;
                date = sub_tree.d;
                times_viewed = sub_tree.c;//incremented already in search ++;
                class_indexes = sub_tree.i;
            }else if(store){
                if(only_once_mode_configuration.timer){
                    date = randomDate(  new Date(Date.now()+only_once_mode_configuration.timer_min_duration),
                                        new Date(Date.now()+only_once_mode_configuration.timer_max_duration)).getTime();
                }else{
                    date = Date.now();
                }
                sub_tree['d'] = date;
                sub_tree['c'] = times_viewed;
                sub_tree['i'] = class_indexes;
                tree.count++;
            }
            if(store){
                let t0 = performance.now();
                let storage_tree = {};
                let json = JSON.stringify(tree)

                let compressed = LZString.compress(json);
                let t1 = performance.now();
                log("compressed tree! time " + (t1 - t0) + " millisseconds.");
                storage_tree[tree_reference] = compressed;
                browser.storage.local.set(storage_tree).then(e => {
                    let t1 = performance.now();
                    log("Saved tree! time " + (t1 - t0) + " millisseconds.");
                    resolve({
                        hash: hash,
                        score: max_depth,
                        date: date,
                        known: existing,
                        unknown: newlyadded,
                        times_viewed: times_viewed,
                        classes: class_indexes,
                    });
                });
            }else{
                resolve({
                    hash: hash,
                    score: max_depth,
                    date: date,
                    known: existing,
                    unknown: newlyadded,
                    times_viewed: times_viewed,
                    classes: class_indexes,
                });
            }
        });
        });
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


async function generateTestData() {
    let n = 1000;
    for (let i = 0; i < n; i++) {
        let rnd = createBinaryString(Math.floor(Math.random() * 999999999));
        await storeOOMTree(rnd, {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10});
    }
}

function createBinaryString(nMask) {
    // nMask must be between -2147483648 and 2147483647
    if (nMask > 2**31-1)
        throw "number too large. number shouldn't be > 2**31-1"; //added
    if (nMask < -1*(2**31))
        throw "number too far negative, number shouldn't be < -(2**31)" //added
    for (var nFlag = 0, nShifted = nMask, sMask = ''; nFlag < 32;
         nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
    //sMask=sMask.replace(/\B(?=(.{8})+(?!.))/g, " ") // added
    return sMask;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
