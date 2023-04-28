function paintCensorRequest(marvinImage, processedRequest, configuration, cache = {}) {
    const labels = processedRequest.labels;
    const valid_detections = processedRequest.valid_detections;
    const classes = processedRequest.classes;
    const scores = processedRequest.scores;
    const boxes = processedRequest.boxes;
    const censor_type = processedRequest.censortype;

    const image_processor = new ImageProcessor(marvinImage, configuration);
    paintImageProcessor(marvinImage, image_processor, labels, valid_detections, classes, boxes, scores, censor_type, configuration.clustering_configuration, cache)
}

function paintCensor(marvinImage, censor_type, labels, valid_detections, classes, scores, boxes, configuration, cache = {}) {
    const image_processor = new ImageProcessor(marvinImage, configuration);
    paintImageProcessor(marvinImage, image_processor, labels, valid_detections, classes, boxes, scores, censor_type, configuration.clustering_configuration, cache)
}

function paintImageProcessor(marvinImage, image_processor, labels, valid_detections, classes, boxes, scores, censor_type, clustering_configuration, cache){
    log(
        "valid detections", valid_detections,
        "classes", classes,
        "boxes", boxes,
        "scores", scores
    );
    const censor_effect = parse_effect_from_name(censor_type);
    let config = [null,
        image_processor.pixel_configuration,
        image_processor.blur_configuration,
        image_processor.bar_configuration,
        image_processor.triangle_configuration,
        null,
        image_processor.glitch_configuration,
        image_processor.sticker_configuration,
        image_processor.sobel_configuration,
        image_processor.splatter_configuration,
    ][censor_effect.index];
    let naturalWidth = marvinImage.canvas.width;
    let naturalHeight = marvinImage.canvas.height;

    let cdetections = valid_detections[0];
    let cboxes = [];
    let crectangles = [];
    let cclasses = [];
    let translatedclasses = [];
    let cscores = [];
    cache.valid_detections = valid_detections[0];
    for (let i = 0; i < valid_detections[0]; i++) {
        let translated = parse_klass_from_index(classes[i]);
        // Skip if user is not interested.
        if (!labels.includes(translated.key)) continue;
        translatedclasses.push(translated);
        let [x1, y1, x2, y2] = boxes.slice(i * 4, (i + 1) * 4);
        x1 *= naturalWidth;
        x2 *= naturalWidth;
        y1 *= naturalHeight;
        y2 *= naturalHeight;
        cboxes.push([Math.ceil(x1), Math.ceil(y1), Math.ceil(x2), Math.ceil(y2)]);
        let x = Math.ceil(x1);
        let y = Math.ceil(y1);
        let w = Math.ceil(x2 - x1);
        let h = Math.ceil(y2 - y1);
        crectangles.push(new Rectangle(x, y, w, h));
        cclasses.push(classes[i]);
        cscores.push(scores[i]);
    }
    if (clustering_configuration && clustering_configuration.enabled) {
        [cboxes, crectangles, cdetections, cclasses, translatedclasses, cscores] = intersection(cboxes, crectangles,
            cdetections,
            cclasses,
            translatedclasses,
            cscores,
            config,
            clustering_configuration.mode == 1);
    }
    //let cache = {box_count: cboxes.length};
    image_processor.prepareEffect(censor_effect, cache);
    cache.box_count = cboxes.length;
    for (let i = 0; i < cboxes.length; i++) {
        // Get the klass object that matches this detected ID
        let klass = translatedclasses[i];
        // Fix score.
        const score = cscores[i].toFixed(2);
        // Stow it in a rectangle
        //const detection_region = new Rectangle(x, y, w, h);
        const detection_region = crectangles[i];
        // Apply the effect

        image_processor.applyEffect(klass, score, detection_region, censor_effect, cache);
    }
    image_processor.finalize(censor_effect, cache);
}

function intersection(cboxes, crectangles, cdetections, cclasses, translatedclasses, cscores, config, same_types = false) {
    for (let i = 0; i < cboxes.length; ++i) {
        let [ix1, iy1, ix2, iy2] = cboxes[i];
        for (let j = i + 1; j < cboxes.length; ++j) {
            let [jx1, jy1, jx2, jy2] = cboxes[j];
            let current = new Rectangle(ix1, iy1, ix2-ix1, iy2-iy1);
            if(config){
                current.scale(config._scale, config._scale);
            }
            let ix1sc = current.x;
            let iy1sc = current.y;
            let ix2sc = current.x + current.w;
            let iy2sc = current.y + current.h;
            let next = new Rectangle(jx1, jy1, jx2-jx1, jy2-jy1);
            if(config) {
                next.scale(config._scale, config._scale);
            }
            let jx1sc = next.x;
            let jy1sc = next.y;
            let jx2sc = next.x + next.w;
            let jy2sc = next.y + next.h;
            if ((!same_types || cclasses[i] == cclasses[j]) &&
                //intersects( ix1, iy1, ix2, iy2, jx1, jy1, jx2, jy2)
                intersects( ix1sc, iy1sc, ix2sc, iy2sc, jx1sc, jy1sc, jx2sc, jy2sc)
            ) {
                //make a new box, remove the merged ones and restart
                let newbox = merge(ix1, iy1, ix2, iy2,
                    jx1, jy1, jx2, jy2);
                let nboxes = cboxes.slice(0);
                nboxes.splice(i, 1)
                nboxes.splice(j - 1, 1);
                nboxes.push(newbox);

                let nrectangles = crectangles.slice(0);
                nrectangles.splice(i, 1)
                nrectangles.splice(j - 1, 1);
                let x = Math.ceil(newbox[0]);
                let y = Math.ceil(newbox[1]);
                let w = Math.ceil(newbox[2] - newbox[0]);
                let h = Math.ceil(newbox[3] - newbox[1]);
                nrectangles.push(new Rectangle(x, y, w, h));

                let ndetections = cdetections - 1;
                let nclasses = cclasses.slice(0);
                nclasses.splice(i, 1)
                nclasses.splice(j - 1, 1);
                nclasses.push(cclasses[i] == cclasses[j] ? cclasses[i] : -1);
                let ntranslatedclasses = translatedclasses.slice(0);
                ntranslatedclasses.splice(i, 1)
                ntranslatedclasses.splice(j - 1, 1);
                ntranslatedclasses.push(
                    {
                        key: (translatedclasses[i].key === translatedclasses[j].key ? translatedclasses[i].key : null),
                        name: (translatedclasses[i].name === translatedclasses[j].name ? translatedclasses[i].name : translatedclasses[i].name + " & " + translatedclasses[j].name),
                        index: (translatedclasses[i].index === translatedclasses[j].index ? translatedclasses[i].index : -1),
                        nude: translatedclasses[i].nude || translatedclasses[j].nude,
                        erotic: translatedclasses[i].erotic || translatedclasses[j].erotic
                    });
                let nscores = cscores.slice(0);
                nscores.splice(i, 1)
                nscores.splice(j - 1, 1);
                nscores.push((cscores[i] + cscores[j]) / 2);
                return intersection(nboxes, nrectangles, ndetections, nclasses, ntranslatedclasses, nscores, config, same_types);

            }
        }
    }
    return [cboxes, crectangles, cdetections, cclasses, translatedclasses, cscores];
}

function merge(ix1, iy1, ix2, iy2,
               jx1, jy1, jx2, jy2) {
    return [Math.min(ix1, jx1),
        Math.min(iy1, jy1),
        Math.max(ix2, jx2),
        Math.max(iy2, jy2)
    ];
}

function intersects(ix1, iy1, ix2, iy2,
                    jx1, jy1, jx2, jy2) {
    return !(jx1 > ix2
        || jx2 < ix1
        || jy1 > iy2
        || jy2 < iy1
    );
}

