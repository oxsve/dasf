class ProcessedCensorRequest {

    constructor(url, imgdata, naturalWidth, naturalHeight, content_type, boxes, scores, classes, valid_detections, censortype, labels) {
        this._url = url;
        this._imgdata = imgdata;
        this._naturalWidth = naturalWidth;
        this._naturalHeight = naturalHeight;
        this._content_type = content_type;
        this._boxes = boxes;
        this._scores = scores;
        this._classes = classes;
        this._valid_detections = valid_detections;
        this._censortype = censortype;
        this._labels = labels;
        this._load_from_cache = false;
        this._lock_censortype = false;
    }

    get load_from_cache() {
        return this._load_from_cache;
    }

    set load_from_cache(value) {
        this._load_from_cache = value;
    }

    get url() {
        return this._url;
    }

    set url(value) {
        this._url = value;
    }

    get imgdata() {
        return this._imgdata;
    }

    set imgdata(value) {
        this._imgdata = value;
    }

    get naturalWidth() {
        return this._naturalWidth;
    }

    set naturalWidth(value) {
        this._naturalWidth = value;
    }

    get naturalHeight() {
        return this._naturalHeight;
    }

    set naturalHeight(value) {
        this._naturalHeight = value;
    }

    get content_type() {
        return this._content_type;
    }

    set content_type(value) {
        this._content_type = value;
    }

    get boxes() {
        return this._boxes;
    }

    set boxes(value) {
        this._boxes = value;
    }

    get scores() {
        return this._scores;
    }

    set scores(value) {
        this._scores = value;
    }

    get classes() {
        return this._classes;
    }

    set classes(value) {
        this._classes = value;
    }

    get valid_detections() {
        return this._valid_detections;
    }

    set valid_detections(value) {
        this._valid_detections = value;
    }

    get censortype() {
        return this._censortype;
    }

    set censortype(value) {
        this._censortype = value;
    }

    get labels() {
        return this._labels;
    }

    set labels(value) {
        this._labels = value;
    }


    get lock_censortype() {
        return this._lock_censortype;
    }

    set lock_censortype(value) {
        this._lock_censortype = value;
    }
}