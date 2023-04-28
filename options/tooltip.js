$( function() {
    $( document ).tooltip({
        track: true,
        items: "*[tooltip]",
        content: function () {
            return getToolTipText($(this).attr('tooltip'));
        },
        position: {
            my: "center bottom-20",
            at: "center top",
            using: function( position, feedback ) {
                $( this ).css( position );
            }
        },
    });

    function getToolTipText(tooltip){
        switch (tooltip) {
            case 'reverse-mode':
                return "<h3>Reverse Mode:</h3>" +
                    "<div class='ui-tooltip-scontent'>" +
                        "Censors everything in the image,<br> <b>except</b> the detected areas." +
                    "</div>" +
                    "<div class='ui-tooltip-support'>" +
                        "Supported censor modes:" +
                        "<ul>" +
                        "<li>Black Bar</li>" +
                        "<li>Pixel</li>" +
                        "<li>Blur</li>" +
                        "<li>Triangle</li>" +
                        "<li>Sobel</li>" +
                        "<li>Splatter</li>" +
                        "</ul>" +
                        "Also works with:" +
                        "<ul>" +
                        "<li>GIF</li>" +
                        "<li>Video Overlay</li>" +
                        "</ul>" +
                    "</div>";
            case 'oom-mode':
                return "<h3>Only Once Mode (OOM):</h3>" +
                    "<div class='ui-tooltip-scontent'>" +
                    "While OOM is active, images can only be viewed once and will then be permanently blocked.<br>" +
                    "OOM identifies images using <b>perceptual image hashes</b>, meaning the same image (and similar variants) will be blocked within any URL in the web!<br><br>" +
                    "<b>Timer Mode:</b><br>" +
                    "You can optionally define a duration after which the image becomes blocked instead.<br>" +
                    "</div>" +
                    "<div class='ui-tooltip-support'>" +
                    "Only Once Mode works with:" +
                    "<ul>" +
                    "<li>PNG</li>" +
                    "<li>JPG</li>" +
                    "<li>BMP</li>" +
                    "<li>WebP</li>" +
                    "<li>AVIF</li>" +
                    "</ul>" +
                    "</div>";
            case 'word-selection':
                return  "<h3>Word Wall draw modes:</h3>" +
                        "<div class='ui-tooltip-scontent'>" +
                        "Defines how words are choosen or being put together for each image:" +
                        "<ul>" +
                        "<li>Random: One word is choosen randomly per image.</li>" +
                        "<li>Random Combine: A random selection is put together. </li>" +
                        "<li>Combine: All words are put together in order.</li>" +
                        "</ul>" +
                        "</div>";
                        "</div>";
            case 'word-wall':
                return "<h3>Word Wall</h3>" +
                    "<div class='ui-tooltip-scontent'>" +
                    "Punches out words from the all censored areas.<br>" +
                    "<div style='width:100%;height:50px;background-color: #16a085; color: #111111; overflow: hidden;white-space: nowrap;'><b>" +
                    "pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi<br>" +
                    "ry.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi<br>" +
                    "pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi pury.fi<br>" +
                    "</b></div>" +
                    "<br>" +
                    "</div>" +
                    "<div class='ui-tooltip-support'>" +
                    "Recommended modes:" +
                    "<ul>" +
                    "<li>Black Mode</li>" +
                    "<li>Blur</li>" +
                    "<li>Sobel</li>" +
                    "</ul>" +
                    "Recommended options:" +
                    "<ul>" +
                    "<li>Feathring</li>" +
                    "<li>Increased scale</li>" +
                    "<li>Shape: Circle</li>" +
                    "</ul>" +
                    "</div>";
        }
        return '';
    }

} );