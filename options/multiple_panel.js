$(".glitch_multiple_panels_gradient_configuration").on("change", "input", function (e) {
    const table_body = $(this).parents("tbody").first();
    $('#glitch_multiple_panels_preview').html('');
    previewGlitchMultiplePanelsPreset(table_body);
});

function previewGlitchMultiplePanelsPreset(table_body){
    let stops = "";
    let i = 0;
    table_body.children("tr").each((index, element) => {
        const stop_color_element = $(element).find(".glitch_multiple_panels_gradient_stop_color").first();
        const stop_position_element = $(element).find(".glitch_multiple_panels_gradient_stop_position").first();
        const color = stop_color_element.val();
        const position = Math.floor(100 * Number(stop_position_element.val()));
        if(color){
            i++;
            stops += `, ${color} ${position}%`;
        }
    });
    if(i == 1){
        stops += stops;
    }

    const background_gradient_value = `radial-gradient(circle at top left${stops})`;
    $("#glitch_multiple_panels_preview").css({
        "background": background_gradient_value,
    });
}

let glitch_multiple_panels_preset_index = 0;

let glitch_multiple_panels_presets = [
    [
        {"offset": 0.0, "color": "#000000D7"},
    ],
    [
        {"offset": 0.1, "color": "#63A3FF5F"},
        {"offset": 0.3, "color": "#B6DCFFCF"},
        {"offset": 0.7, "color": "#B6DCFFCF"},
        {"offset": 1.0, "color": "#72BEFF5F"},
    ],
    [
        {"offset": 0.05, "color": "#E2F7F49E6"},
        {"offset": 0.25, "color": "#96E0DAB3"},
        {"offset": 0.55, "color": "#EACCF8B3"},
        {"offset": 0.85, "color": "#937EF3CD"},
    ],
    [
        {"offset": 0.00, "color": "#D2D4557F"},
        {"offset": 0.35, "color": "#4AF42ECD"},
        {"offset": 0.65, "color": "#D2D455CD"},
        {"offset": 1.00, "color": "#4AF42EE6"},
    ],
];

let glitch_multiple_panels_preset_names = [
   'Smoke', 'Mirrors', 'Cotton Candy', 'Green Grass'
];

let glitch_multiple_panels_preset_border = [
    false, true, false, false
];

$('#glitch_multiple_panels_preset_previous').click(function(){
    glitch_multiple_panels_preset_index = glitch_multiple_panels_preset_index-1;
    if(glitch_multiple_panels_preset_index < 0){
        glitch_multiple_panels_preset_index = glitch_multiple_panels_presets.length-1;
    }
    loadGlitchMultiplePanelsPreset(glitch_multiple_panels_preset_index);
});

$('#glitch_multiple_panels_preset_next').click(function(){
    glitch_multiple_panels_preset_index = (glitch_multiple_panels_preset_index+1) % glitch_multiple_panels_presets.length;
    loadGlitchMultiplePanelsPreset(glitch_multiple_panels_preset_index);
});

function loadGlitchMultiplePanelsPreset(index){
    $('.glitch_multiple_panels_gradient_stop_color').val('');
    $('.glitch_multiple_panels_gradient_stop_position').val('');
    $('#glitch_multiple_panels_preview').html(glitch_multiple_panels_preset_names[index]);
    $('#glitch_multiple_panels_border').prop('checked', glitch_multiple_panels_preset_border[index]);
    glitch_multiple_panels_presets[index].forEach(function (item, i) {
        $($('.glitch_multiple_panels_gradient_stop_color')[i]).val(item.color);
        $($('.glitch_multiple_panels_gradient_stop_position')[i]).val(item.offset);
    });
    const table_body = $(".glitch_multiple_panels_gradient_stop_color").first().parents("tbody").first();
    previewGlitchMultiplePanelsPreset(table_body);
    save_config();
}