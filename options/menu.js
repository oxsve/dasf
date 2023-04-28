document.addEventListener('DOMContentLoaded', restoreOptions);

let sticker_collections = null;

function restoreOptions() {
	$('#version').html(browser.runtime.getManifest().version);
	restoreONOFF();
	restoreLoginState();

	restoreLockUnlock();

	restoreLabels();
	restoreFiletypes();
	restoreCensorOptions();
	restoreCensorConfigs();
	restoreDebug();
	restoreAdvanced();
	restoreVideo();
	restoreWhiteBlackList();
	updateQuickSettings();
	updateHelp();
	updateStatistics();
	startUpdateInterval();
	restoreView();

}

function restoreLabels() {
	let labels = browser.storage.sync.get('labels');
	labels.then((res) => {
		$('.labelButton').each(function(i, obj) {
			if(res.labels.includes(obj.id)){
				$(this).addClass("selected");
				$('button[label='+$(this).attr('id')+']').attr('check', true);
				$('button[label='+$(this).attr('id')+']').parent().attr('check', true);
			}else{
				$(this).removeClass("selected");
				$('button[label='+$(this).attr('id')+']').removeAttr('check');
				$('button[label='+$(this).attr('id')+']').parent().removeAttr('check');
			}
		});
	});
}

function restoreFiletypes() {
	let file_types = browser.storage.sync.get('file_types');
	file_types.then((res) => {
		$('.filetypeToggle').each(function(i, obj) {
			if(res.file_types.includes($(this).attr('label'))){
				$(this).attr('check', true);
			}else{
				$(this).removeAttr('check');
			}
		});
	});
}

function restoreCensorOptions() {
	let censor_type = browser.storage.sync.get(['censor_type']);
	censor_type.then((res) => {
		$('.censormodeToggle').each(function(i, obj) {
			if(res.censor_type.includes($(this).attr('label'))){
				$(this).attr('check', true);
				$("#"+$(this).attr('label')).addClass("selected");
			}else{
				$(this).removeAttr('check');
			}
		});
	});
}

function restoreLoginState(){
	let user_req = browser.storage.sync.get(['user', 'username', 'password']);
	user_req.then((res) => {
		if(res.user){
			loginSuccess(res.user);
		}else{
			if(res.username){
				$("#profile_name").html(res.username);
				$("#profile_tier").html(res.password || '');
			}
			$("#login_form :input").prop("disabled", false);
			$("#login_form").show("slow");
			$("#profile").hide();
		}
	});
}

function restoreDebug() {
	let debug = browser.storage.sync.get('debug');
	debug.then((res) => {
		$('.debugToggle').each(function(i, obj) {
			if(res.debug){
				$(this).attr('check', true);
				$('#'+$(this).attr('label')).addClass("selected");
			}else{
				$(this).removeAttr('check');
				$('#'+$(this).attr('label')).removeClass("selected");
			}

		});
	});
	browser.storage.sync.getBytesInUse(null).then(store => {
		$('#storage-synced-size').text(formatBytes(store));
	});
	browser.storage.local.get(null).then(res => {
		let bs = 0;
		let ss = 0;
		let ooms = 0;
		let oomcount = 0;
		let oomtreecount = 0;
		res.sticker_collections.forEach(function (collection, key) {
			collection._stickers.forEach(function (sticker, name) {
				if (sticker.file) {
					console.error(sticker.name, sticker.file.length)
				}
				bs += new Blob([sticker.url]).size
			});
		});
		$('#storage-local-size').text(formatBytes(bs));
		ss = bs;
		if(res.only_once_mode_storage_manager && res.only_once_mode_storage_manager.trees){
			let local_request = browser.storage.local.get(res.only_once_mode_storage_manager.trees);
			local_request.then((local) => {
				oomtreecount = res.only_once_mode_storage_manager.trees.length;
				for (const tree_reference of res.only_once_mode_storage_manager.trees) {
					if(local.hasOwnProperty(tree_reference)) {
						let compressed = local[tree_reference];
						let decompressed = LZString.decompress(compressed);
						const obj = JSON.parse(decompressed);
						oomcount += obj.count;
						ooms += decompressed.length;
					}else{
						console.error("Corrupted oom data storage!", tree_reference);
					}
				}
				$('#storage-local-oom-size').text("OOM: "+formatBytes(ooms) + " | "+oomtreecount+" container | " +oomcount + " images");
			});

		}
		$('#storage-local-sticker-size').text("Sticker: "+formatBytes(ss));

	});
}

function countLeaves(obj) {
	return Object.values(obj).reduce((count,v) => count += (typeof(v) === 'object') ? countLeaves(v): 1, 0);
}

function restoreCensorConfigs() {
	let censor_type = browser.storage.sync.get(['bar_configuration','blur_configuration','pixel_configuration',
		'glitch_configuration','triangle_configuration','sticker_configuration', 'sobel_configuration', 'splatter_configuration',
		'gif_configuration','png_configuration', 'jpg_configuration', 'bmp_configuration', 'webp_configuration', 'avif_configuration',
		'reverse_mode_configuration','word_wall_configuration','clustering_configuration','only_once_mode_configuration']);
	censor_type.then((res) => {
		$('#bar_colorpicker').attr('value', (res.bar_configuration._color));
		$('#bar_scale').val(res.bar_configuration._scale);
		$('#bar_shape').val(res.bar_configuration._shape);
		$('#bar_feathering').val(res.bar_configuration._feathering);

		$('#blur_scale').val(res.blur_configuration._scale);
		$('#blur_feathering').val(res.blur_configuration._feathering);
		$('#blur_strength').val(res.blur_configuration._blur_strength);
		$('#blur_shape').val(res.blur_configuration._shape);
		$('#blur_grayscale').prop('checked', res.blur_configuration._grayscale != 0);

		$('#pixel_geometry').val(res.pixel_configuration._geometry);
		$('#pixel_scale').val(res.pixel_configuration._scale);
		$('#pixel_feathering').val(res.pixel_configuration._feathering);
		$('#pixel_distance').val(res.pixel_configuration._distance);
		$('#pixel_size').val(res.pixel_configuration._pixel_size);
		$('#pixel_size_mode').val(res.pixel_configuration._pixel_size_mode);
		$('#pixel_shape').val(res.pixel_configuration._shape);
		$('#pixel_grayscale').prop('checked', res.pixel_configuration._grayscale != 0);
		if($('#pixel_size_mode').val() == 0){
			$('#pixel_size_suffix').val('%');
		}else{
			$('#pixel_size_suffix').val('px');
		}

		$('#glitch_scale').val(res.glitch_configuration._scale);
		$('#glitch_intensity_color').val(res.glitch_configuration.glitch_types[0].intensity_color);
		$('#glitch_intensity_shift').val(res.glitch_configuration.glitch_types[0].intensity_shift);
		$('#glitch_horizontal_shift').prop('checked', res.glitch_configuration.glitch_types[0].shift_horizontal);
		$('#glitch_vertical_shift').prop('checked', res.glitch_configuration.glitch_types[0].shift_vertical);

		$('#glitch_multiple_panels_layers').val(res.glitch_configuration.glitch_types[1].number_of_layers);
		$('#glitch_multiple_panels_min_scale').val(res.glitch_configuration.glitch_types[1].min_scale);
		$('#glitch_multiple_panels_max_scale').val(res.glitch_configuration.glitch_types[1].max_scale);
		$('#glitch_multiple_panels_scatter').val(res.glitch_configuration.glitch_types[1].scatter);
		$('#glitch_multiple_panels_splitter').val(res.glitch_configuration.glitch_types[1].split_chance);
		$('#glitch_multiple_panels_border').prop('checked', res.glitch_configuration.glitch_types[1].border ? true : false);

		res.glitch_configuration.glitch_types[1].gradients.forEach(function (item, i) {
			$($('.glitch_multiple_panels_gradient_stop_color')[i]).val(item.color);
			$($('.glitch_multiple_panels_gradient_stop_position')[i]).val(item.offset);
		});

		$('#glitch_type').val(res.glitch_configuration.glitch_type);
		updateGlitchTypeUI();

		$('#triangle_scale').val(res.triangle_configuration._scale);
		$('#triangle_shape').val(res.triangle_configuration._shape);
		$('#triangle_feathering').val(res.triangle_configuration._feathering);
		$('#triangle_accuracy').val(res.triangle_configuration.accuracy);
		$('#triangle_blur').val(res.triangle_configuration.blur);
		$('#triangle_threshold').val(res.triangle_configuration.threshold);
		if(res.triangle_configuration.vertexMode){
			$('#triangle_vertex_mode_dynamic').prop('checked', true);
			$('.triangle_vertex_count_static').hide();
			$('.triangle_vertex_count_dynamic').show();
		}else{
			$('#triangle_vertex_mode_static').prop('checked', true);
			$('.triangle_vertex_count_dynamic').hide();
			$('.triangle_vertex_count_static').show();
		}
		$('#triangle_vertex_count_static').val(res.triangle_configuration.vertexCount);
		$('#triangle_vertex_count_dynamic').val(res.triangle_configuration.vertexPercentage);
		if(res.triangle_configuration.fill === true){
			$('#triangle_fill_on').prop('checked', true);
		}else if(res.triangle_configuration.fill === false){
			$('#triangle_fill_off').prop('checked', true);
		}else{
			$('#triangle_fill_color').prop('checked', true);
		}
		$('#triangle_fill_colorpicker').attr('value', (res.triangle_configuration.fillColor));

		if(res.triangle_configuration.stroke === true){
			$('#triangle_stroke_on').prop('checked', true);
		}else if(res.triangle_configuration.stroke === false){
			$('#triangle_stroke_off').prop('checked', true);
		}else{
			$('#triangle_stroke_color').prop('checked', true);
		}
		$('#triangle_stroke_colorpicker').attr('value', (res.triangle_configuration.strokeColor));
		$('#triangle_stroke_width').val(res.triangle_configuration.strokeWidth);

		$('#triangle_gradient').prop('checked', res.triangle_configuration.gradients);
		$('#triangle_gradient_stops').val(res.triangle_configuration.gradientStops);
		$('#triangle_line_join').val(res.triangle_configuration.lineJoin);
		$('#triangle_transparent_color').prop('checked', res.triangle_configuration.transparentColor);

		$('#sticker_scale').val(res.sticker_configuration._scale);
		$('#sticker_draw_mode').val(res.sticker_configuration._draw_mode);
		if(res.sticker_configuration._draw_mode == 2){
			$( "#sticker_groups" ).show();
		}else{
			$( "#sticker_groups" ).hide();
		}
		$('#sticker_groups').val(res.sticker_configuration._groups.join(';'));
		$('#sticker_consistency').prop('checked', res.sticker_configuration._consistency);

		$('#sobel_scale').val(res.sobel_configuration._scale);
		$('#sobel_shape').val(res.sobel_configuration._shape);
		$('#sobel_feathering').val(res.sobel_configuration._feathering);
		if(res.sobel_configuration._color_inverted){
			$('.sobel_color_invertedToggle').attr('check', true);
		}else{
			$('.sobel_color_invertedToggle').removeAttr('check');
		}

		$('#splatter_scale').val(res.splatter_configuration._scale);
		$('#splatter_size').val(res.splatter_configuration._splatter_size);
		$('#splatter_amount').val(res.splatter_configuration._splatter_amount);
		$('#splatter_sub_size').val(res.splatter_configuration._splatter_sub_size);
		$('#splatter_sub_amount').val(res.splatter_configuration._splatter_sub_amount);
		$('#splatter_iterations').val(res.splatter_configuration._splatter_iterations);
		$('#splatter_transparency').val(res.splatter_configuration._splatter_transparency);
		$('#splatter_centering').val(res.splatter_configuration._splatter_centering);

		$('#gif_memory_mode').val(res.gif_configuration._memory_method);
		if(res.gif_configuration._thumbnails){
			$('#gif_thumb').attr('check', true);
			$('#gif_thumb_button').attr('check', true);
		}else{
			$('#gif_thumb').removeAttr('check');
			$('#gif_thumb_button').removeAttr('check');
		}
		$('#png_min_file_size').val(res.png_configuration._filesize_min/1000);
		$('#png_max_file_size').val(res.png_configuration._filesize_max/1000);
		$('#png_min_width').val(res.png_configuration._width_min);
		$('#png_max_width').val(res.png_configuration._width_max);
		$('#png_min_height').val(res.png_configuration._height_min);
		$('#png_max_height').val(res.png_configuration._height_max);
		$('input[type="radio"][name="png_file_output"][value="'+res.png_configuration._file_output_type+'"]').prop('checked', true);

		$('#jpg_min_file_size').val(res.jpg_configuration._filesize_min/1000);
		$('#jpg_max_file_size').val(res.jpg_configuration._filesize_max/1000);
		$('#jpg_min_width').val(res.jpg_configuration._width_min);
		$('#jpg_max_width').val(res.jpg_configuration._width_max);
		$('#jpg_min_height').val(res.jpg_configuration._height_min);
		$('#jpg_max_height').val(res.jpg_configuration._height_max);
		$('input[type="radio"][name="jpg_file_output"][value="'+res.jpg_configuration._file_output_type+'"]').prop('checked', true);


		$('#bmp_min_file_size').val(res.bmp_configuration._filesize_min/1000);
		$('#bmp_max_file_size').val(res.bmp_configuration._filesize_max/1000);
		$('#bmp_min_width').val(res.bmp_configuration._width_min);
		$('#bmp_max_width').val(res.bmp_configuration._width_max);
		$('#bmp_min_height').val(res.bmp_configuration._height_min);
		$('#bmp_max_height').val(res.bmp_configuration._height_max);
		$('input[type="radio"][name="bmp_file_output"][value="'+res.bmp_configuration._file_output_type+'"]').prop('checked', true);

		$('#avif_min_file_size').val(res.avif_configuration._filesize_min/1000);
		$('#avif_max_file_size').val(res.avif_configuration._filesize_max/1000);
		$('#avif_min_width').val(res.avif_configuration._width_min);
		$('#avif_max_width').val(res.avif_configuration._width_max);
		$('#avif_min_height').val(res.avif_configuration._height_min);
		$('#avif_max_height').val(res.avif_configuration._height_max);
		$('input[type="radio"][name="avif_file_output"][value="'+res.avif_configuration._file_output_type+'"]').prop('checked', true);

		$('#webp_min_file_size').val(res.webp_configuration._filesize_min/1000);
		$('#webp_max_file_size').val(res.webp_configuration._filesize_max/1000);
		$('#webp_min_width').val(res.webp_configuration._width_min);
		$('#webp_max_width').val(res.webp_configuration._width_max);
		$('#webp_min_height').val(res.webp_configuration._height_min);
		$('#webp_max_height').val(res.webp_configuration._height_max);
		$('input[type="radio"][name="webp_file_output"][value="'+res.webp_configuration._file_output_type+'"]').prop('checked', true);

		$('#gif_min_file_size').val(res.gif_configuration._filesize_min/1000);
		$('#gif_max_file_size').val(res.gif_configuration._filesize_max/1000);
		$('#gif_min_width').val(res.gif_configuration._width_min);
		$('#gif_max_width').val(res.gif_configuration._width_max);
		$('#gif_min_height').val(res.gif_configuration._height_min);
		$('#gif_max_height').val(res.gif_configuration._height_max);
		$('#gif_max_frame_count').val(res.gif_configuration._frame_count_max);
		$('#gif_thumbnail_fallback').prop('checked', res.gif_configuration._thumbnail_fallback);

		if(res.reverse_mode_configuration.enabled){
			$('.reverseToggle').attr('check', true);
		}else{
			$('.reverseToggle').removeAttr('check');
		}
		if(res.reverse_mode_configuration.process_no_result){
			$('#reverse_censoring_process_no_results').prop('checked', true);
		}else{
			$('#reverse_censoring_process_no_results').prop('checked', false);
		}
		if(res.reverse_mode_configuration.process_no_result_censor_selection == 1){
			$('#reverse_censoring_process_no_results_current_selection').prop('checked', true);
		}else if(res.reverse_mode_configuration.process_no_result_censor_selection == 0){
			$('#reverse_censoring_process_no_results_global_selection').prop('checked', true);
		}else{
			$('#reverse_censoring_process_no_results').prop('checked', true);
		}


		if(res.word_wall_configuration.enabled){
			$('.word_wallToggle').attr('check', true);
		}else{
			$('.word_wallToggle').removeAttr('check');
		}
		if(res.word_wall_configuration.text){
			$('#word_wall_words').val(res.word_wall_configuration.text.join('\n'));
		}
		if(res.word_wall_configuration.text_mode == 0){
			$('#word_wall_text_mode_random').prop('checked', true);
		}else if(res.word_wall_configuration.text_mode == 1){
			$('#word_wall_text_mode_random_combine').prop('checked', true);
		}else{
			$('#word_wall_text_mode_combine').prop('checked', true);
		}
		if(res.word_wall_configuration.font_size){
			$('#word_wall_font_size').val(res.word_wall_configuration.font_size);
		}
		if(res.word_wall_configuration.distance_horizontal){
			$('#word_wall_distance_horizontal').val(res.word_wall_configuration.distance_horizontal);
		}
		if(res.word_wall_configuration.distance_vertical){
			$('#word_wall_distance_vertical').val(res.word_wall_configuration.distance_vertical);
		}
		if(res.word_wall_configuration.offset){
			$('#word_wall_offset').val(res.word_wall_configuration.offset);
		}

		if(res.only_once_mode_configuration.enabled){
			$('.oomToggle').attr('check', true);
		}else{
			$('.oomToggle').removeAttr('check');
		}

		if(res.only_once_mode_configuration.precision){
			$('#only_once_mode_precision').val(res.only_once_mode_configuration.precision);
		}
		if(res.only_once_mode_configuration.message){
			$('#only_once_mode_message').val(res.only_once_mode_configuration.message);
		}
		if(res.only_once_mode_configuration.date_time_format){
			$('#only_once_mode_date_time_format').val(res.only_once_mode_configuration.date_time_format);
		}else{
			$('#only_once_mode_date_time_format').val("");
		}
		if(res.only_once_mode_configuration.mode){
			$('.oomModeRadio').prop("checked", false);
			$('.oomModeRadio[value="'+res.only_once_mode_configuration.mode+'"]').prop("checked", true);
			$('#'+$('.oomModeRadio[value="'+res.only_once_mode_configuration.mode+'"]').attr('toggle')).show();
		}
		if(res.only_once_mode_configuration.timer) {
			$('#only_once_mode_timer').prop("checked", res.only_once_mode_configuration.timer);
			$('.only_once_mode_timer_advanced').show();
		}
		if(res.only_once_mode_configuration.timer_autorefresh) {
			$('#only_once_mode_timer_refresh').prop("checked", res.only_once_mode_configuration.timer_autorefresh);
			$('#only_once_mode_timer_refresh_animations').show();
		}
		if(res.only_once_mode_configuration.timer_animation) {
			if(res.only_once_mode_configuration.timer_animation == 1){
				$('#only_once_mode_timer_animation_progressbar').prop("checked", true);
			}else if(res.only_once_mode_configuration.timer_animation == 2){
				$('#only_once_mode_timer_animation_black').prop("checked", true);
			}else{
				$('#only_once_mode_timer_animation_blur').prop("checked", true);
			}
		}
		if(res.only_once_mode_configuration.timer_min_duration){
			let dur = res.only_once_mode_configuration.timer_min_duration;
			let obj = msToDMHSObject(dur);
			$('#oom-min-timer-days').val(obj.days);
			$('#oom-min-timer-hours').val(obj.hours);
			$('#oom-min-timer-minutes').val(obj.minutes);
			$('#oom-min-timer-seconds').val(obj.seconds);
		}
		if(res.only_once_mode_configuration.timer_max_duration){
			let dur = res.only_once_mode_configuration.timer_max_duration;
			let obj = msToDMHSObject(dur);
			$('#oom-max-timer-days').val(obj.days);
			$('#oom-max-timer-hours').val(obj.hours);
			$('#oom-max-timer-minutes').val(obj.minutes);
			$('#oom-max-timer-seconds').val(obj.seconds);
		}


		if(res.only_once_mode_configuration.width_min){
			$('#only_once_mode_min_width').val(res.only_once_mode_configuration.width_min);
		}
		if(res.only_once_mode_configuration.height_min){
			$('#only_once_mode_min_height').val(res.only_once_mode_configuration.height_min);
		}
		if(res.only_once_mode_configuration.trigger){
			$('.oom-label').each(function() {
					let key = $(this).attr("label");
					let r = Object.values(klasses).find((e) => e.key == key);
					if(res.only_once_mode_configuration.trigger.includes(r.index)){
						$(this).prop("checked", true);
					}
			});
		}
		if(res.only_once_mode_configuration.display_classes){
			$('#only_once_mode_display_classes').prop("checked", true);
		}
		if(res.only_once_mode_configuration.mode_configuration[1].transparency){
			$('#only_once_mode_mode_see_trough_advanced_transparency').val(res.only_once_mode_configuration.mode_configuration[1].transparency*100);
		}
		if(res.only_once_mode_configuration.mode_configuration[2].distance){
			$('#only_once_mode_mode_border_advanced_distance').val(res.only_once_mode_configuration.mode_configuration[2].distance*10);
		}
		if(res.only_once_mode_configuration.mode_configuration[2].radius){
			$('#only_once_mode_mode_border_advanced_radius').val(res.only_once_mode_configuration.mode_configuration[2].radius);
		}
		if(res.only_once_mode_configuration.mode_configuration[3].blur){
			$('#only_once_mode_mode_thumbnail_advanced_blur').val(res.only_once_mode_configuration.mode_configuration[3].blur*100);
		}
		if(res.only_once_mode_configuration.mode_configuration[4].strength){
			$('#only_once_mode_mode_grid_advanced_strength').val(res.only_once_mode_configuration.mode_configuration[4].strength);
		}
		if( res.only_once_mode_configuration.mode_configuration[4].color_1 &&
			res.only_once_mode_configuration.mode_configuration[4].color_2){
			$('#only_once_mode_mode_grid_advanced_color_1').val(res.only_once_mode_configuration.mode_configuration[4].color_1);
			$('#only_once_mode_mode_grid_advanced_color_2').val(res.only_once_mode_configuration.mode_configuration[4].color_2);
		}
		if(res.only_once_mode_configuration.mode_configuration[5].blur){
			$('#only_once_mode_mode_blur_advanced_blur').val(res.only_once_mode_configuration.mode_configuration[5].blur*100);
		}
		if(res.only_once_mode_configuration.mode_configuration[6].allow_faces){
			$('#only_once_mode_mode_box_tease_advanced_allow_faces').prop("checked", true);
		}
		$('.clusteringToggle').each(function(i, obj) {
			if(res.clustering_configuration.enabled){
				$(this).attr('check', true);
			}else{
				$(this).removeAttr('check');
			}
		});


		$('#clustering_mode').val(res.clustering_configuration.mode);

		$('.file_max_min').trigger('paste');
		$('.zero_look_disabled').trigger('paste');

	});
	let sticker_request = browser.storage.local.get(['sticker_collections']);
	sticker_request.then((res) => {
			sticker_collections = res.sticker_collections;
			//cacheStickerCollections(sticker_collections, null);
			$('#sticker_collections').empty();
			res.sticker_collections.forEach(function (collection, key) {
				$('#sticker_collections').append($('<option>', {
					value: key,
					text: capitalizeFirstLetter(collection._name),
					name: collection._name,
					class: ' ' + (collection._enabled ? 'sticker_collection_enabled' : 'sticker_collection_disabled') +
						' ' + (collection._locked ? 'sticker_collection_locked' : ''),
				}));
			});
	});

}

function restoreVideo() {
	let advanced = browser.storage.sync.get(['video_overlay']);
	advanced.then((res) => {
		if(res.video_overlay){
			$('.video_overlay').attr('check', true);
		}else{
			$('.video_overlay').removeAttr('check');
		}
	});
}

function restoreAdvanced() {
	let advanced = browser.storage.sync.get(['prescale', 'base64_scanner']);
	advanced.then((res) => {
		if(res.prescale){
			$('.prescale').attr('check', true);
		}else{
			$('.prescale').removeAttr('check');
		}
		if(res.base64_scanner){
			$('.base64_support').attr('check', true);
		}else{
			$('.base64_support').removeAttr('check');
		}
	});
}

function restoreWhiteBlackList() {
	let whiteblacklist = browser.storage.sync.get(['whiteblacklist_configuration']);
	whiteblacklist.then((res) => {
		if(res.whiteblacklist_configuration.mode == 0){
			$("#radio-nolist").prop("checked", true);
			$('#whitelist-container').hide();
			$('#blacklist-container').hide();
		}else if(res.whiteblacklist_configuration.mode == 1){
			$("#radio-whitelist").prop("checked", true);
			$('#whitelist-container').show();
			$('#blacklist-container').hide();
		}else{
			$("#radio-blacklist").prop("checked", true);
			$('#whitelist-container').hide();
			$('#blacklist-container').show();
		}
		$('#whitelist').val(res.whiteblacklist_configuration.white_list.join('\n'));
		$('#blacklist').val(res.whiteblacklist_configuration.black_list.join('\n'));
		$('#blacklist_locked').val(res.whiteblacklist_configuration.black_list.join('\n'));
	});
}

function restoreView() {
	let option_page_view = browser.storage.sync.get(['option_page_view','only_once_mode_configuration']);
	option_page_view.then((res) => {
		if(res.option_page_view){
			$('.tab[content='+res.option_page_view+']').click();
		}
		if(res.only_once_mode_configuration.mode){
			let elem = $('.oomModeRadio[value="'+res.only_once_mode_configuration.mode+'"]');
			oomShowAdvancedSubOptions(elem);
		}
	});
}

function updateHelp() {
	let cache = browser.storage.sync.get('do_cache');
	cache.then((res) => {
		$('.do_cacheToggle').each(function(i, obj) {
			if(res.do_cache){
				$(this).attr('check', true);
			}else{
				$(this).removeAttr('check');
			}
		});
	});
	let sending = browser.runtime.sendMessage({
		getdata: true,
	});
	sending.then(function(message){
		$('#ts-backend').html(message.tsbackend);
		$('#ts-tensors').html(message.tstensors);

		$('#ts-numBytes').html(bytesToSize(message.tsnumBytes));
		$('#ts-numBytesInGPU').html(bytesToSize(message.tsnumBytesInGPU));
		$('#ts-numDataBuffers').html(message.tsnumDataBuffers);
		$('#ts-unreliable').html(message.tsunreliable? 'False' : 'True');
		$('#ts-reasons').html(message.tsreasons);


		$('#cached-count').html(message.cache.size);

		let mem = 0;
		message.cache.forEach(function(value, key, map){
			 mem += value._imgdata.size+roughSizeOfObject(value);
		});
		mem = formatBytes(mem);
		$('#cached-size').html(mem);
	}, handleError);
}

function updateStatistics(){
	let sending = browser.runtime.sendMessage({
		syncstatictics: true,
	});
	sending.then((t) => {
		let cache = browser.storage.sync.get(['statistics','statistics_enabled']);
		cache.then((res) => {
			if(res.statistics_enabled){
				$('.statistics_enabled').attr('check', true);
			}else{
				$('.statistics_enabled').removeAttr('check');
			}
			$('#statistics-total').html(res.statistics.images.total);
			$('#statistics-total-positive').html(res.statistics.images.total_positive);
			if(res.statistics.images.total_average_duration){
				$('#statistics-total-average-duration').html(res.statistics.images.total_average_duration.toFixed(2)+' ms');
			}else{
				$('#statistics-total-average-duration').html('-');
			}
			if(res.statistics.images.total_average_ai_duration){
				$('#statistics-total-average-ai-duration').html(res.statistics.images.total_average_ai_duration.toFixed(2)+' ms');
			}else{
				$('#statistics-total-average-ai-duration').html('-');
			}
			if(res.statistics.images.total_average_paint_duration){
				$('#statistics-total-average-paint-duration').html(res.statistics.images.total_average_paint_duration.toFixed(2)+' ms');
			}else{
				$('#statistics-total-average-paint-duration').html('-');
			}
			$('#statistics-image-type-jpeg').html(res.statistics.images.type.jpeg);
			$('#statistics-image-type-png').html(res.statistics.images.type.png);
			$('#statistics-image-type-bmp').html(res.statistics.images.type.bmp);
			$('#statistics-image-type-webp').html(res.statistics.images.type.webp);
			$('#statistics-image-type-avif').html(res.statistics.images.type.avif);

			// GIF
			$('#statistics-image-type-gif').html(res.statistics.images.type.gif.full);
			$('#statistics-image-type-gif-thumb').html(res.statistics.images.type.gif.thumbnails);
			if(res.statistics.images.type.gif.total_average_frames){
				$('#statistics-image-type-gif-average-frame-count').html(res.statistics.images.type.gif.total_average_frames.toFixed(2));
			}else{
				$('#statistics-image-type-gif-average-frame-count').html('-');
			}
			if(res.statistics.images.type.gif.total_average_duration){
				$('#statistics-image-type-gif-average-duration').html(res.statistics.images.type.gif.total_average_duration.toFixed(2)+' ms');
			}else{
				$('#statistics-image-type-gif-average-duration').html('-');
			}

			$('#statistics-video-total').html(res.statistics.videos.total);
			$('#statistics-video-frames').html(res.statistics.videos.frames);
			$('#statistics-local-files-total').html(res.statistics.local_files.total);
			$('#statistics-batch-converter-total').html(res.statistics.batch_converter.total);

			$('#statistics-klasses').empty();
			let total = 0;
			for (const entry in res.statistics.klasses.label) {
				total += res.statistics.klasses.label[entry].total;
			}
			for (const entry in res.statistics.klasses.label) {
				if(entry === 'NONE'){
					continue;
				}
				let total_entry = res.statistics.klasses.label[entry].total;
				let average = total_entry > 0 ? (100/total*total_entry).toFixed(2)+"%": '-';
				$('#statistics-klasses').append('<tr>' +
					'<td>'+klasses[entry].name+'</td>' +
					'<td>'+total_entry+'</td>' +
					'<td>'+average+'</td>' +
					'</tr>');

			}

		});
	});
}

let updateInterval;

function startUpdateInterval(){
	let lockd = null;
	let dur = null;
	updateInterval = window.setInterval(function(){
		// Check if extension got disabled
		let o = browser.storage.sync.get(['lock_configuration']);
		o.then((res) => {
			if(res.lock_configuration) {
				if (lockd === null) {
					lockd = res.lock_configuration.enabled;
					dur = res.lock_configuration.duration;
				} else if (lockd != res.lock_configuration.enabled || dur != res.lock_configuration.duration) {
					restoreLockUnlock();
				}
			}
		});
	}, 1000);
}

$('#refresh-cache').click(function(){
	updateHelp();
});

$('#refresh-statistics').click(function(){
	updateStatistics();
});

$('#reset-statistics').click(function(){

	let sending = browser.runtime.sendMessage({
		resetstatistics: true
	});
	sending.then(function(message){
		updateStatistics();
	});
});

$('#clear-cache').click(function(){
	let sending = browser.runtime.sendMessage({
		clearcache: true
	});
	sending.then(function(message){
		updateHelp();
	});
});

$('#pixel_geometry').change(function(){
	if($('#pixel_size_mode').val() == 1){
		if($('#pixel_geometry').val() == 1 || $('#pixel_geometry').val() == 2){
			if($('#pixel_size').val() < 5){
				$('#pixel_size').val(20);
			}
		}
	}
});

$('#pixel_size_mode').change(function(){
	if($('#pixel_size_mode').val() == 1){
		if($('#pixel_geometry').val() == 1 || $('#pixel_geometry').val() == 2){
			if($('#pixel_size').val() < 5){
				$('#pixel_size').val(20);
			}
		}
	}
});

$('.triangle_vertex_mode').change(function(){
	if($('#triangle_vertex_mode_dynamic').is(':checked')){
		$('.triangle_vertex_count_static').hide();
		$('.triangle_vertex_count_dynamic').show();
	}else{
		$('.triangle_vertex_count_dynamic').hide();
		$('.triangle_vertex_count_static').show();
	}
});

$('#glitch_type').change(function(){
	updateGlitchTypeUI();
});

function updateGlitchTypeUI(){
	$('.glitch_chromatic_aberration').hide();
	$('.glitch_multiple_panels').hide();
	if($('#glitch_type').val() == 0){
		$('.glitch_chromatic_aberration').show();
	}else if($('#glitch_type').val() == 1){
		$('.glitch_multiple_panels').show();
	}
	const table_body = $(".glitch_multiple_panels_gradient_stop_color").first().parents("tbody").first();
	previewGlitchMultiplePanelsPreset(table_body);
}

$('.file_max_min').on("change keyup paste", function(evt) {
	let trnslt = bytesToSize(this.value*1000);
	if(this.value == 0 && $(this).hasClass("max_file")){
		trnslt = "<b style='font-size: 120%'>∞</b>";
	}
	let linked = $(this).attr("link");
	$('.file_size_translated[link="'+linked+'"]').html(" = "+trnslt);
});

$('.zero_look_disabled').on("change keyup paste", function(evt) {
	if(this.value == 0){
		$(this).addClass( "look_disabled" );
	}else{
		$(this).removeClass( "look_disabled" );
	}
});

$('.save_config').change(function(e){
	save_config();
});

function save_config(){
	let conf = browser.storage.sync.get(['bar_configuration','blur_configuration','pixel_configuration',
		'gif_configuration','png_configuration', 'jpg_configuration', 'bmp_configuration', 'webp_configuration', 'avif_configuration',
		'glitch_configuration', 'triangle_configuration', 'sticker_configuration', 'sobel_configuration', 'splatter_configuration',
		'word_wall_configuration',
		'whiteblacklist_configuration','clustering_configuration','only_once_mode_configuration']);
	conf.then((res) => {
		res.bar_configuration._color = $('#bar_colorpicker').val();
		res.bar_configuration._scale = Math.max(0.1,parseFloat($('#bar_scale').val()));
		res.bar_configuration._shape = Math.max(0,parseInt($('#bar_shape').val()));
		res.bar_configuration._feathering = Math.max(0,parseFloat($('#bar_feathering').val()));

		res.blur_configuration._scale = Math.max(0.1,parseFloat($('#blur_scale').val()));
		res.blur_configuration._feathering = Math.max(0,parseFloat($('#blur_feathering').val()));
		res.blur_configuration._blur_strength = Math.max(2,parseInt($('#blur_strength').val()));
		res.blur_configuration._shape = Math.max(0,parseInt($('#blur_shape').val()));
		res.blur_configuration._grayscale = $('#blur_grayscale').is(':checked') ? 1 : 0;

		res.pixel_configuration._geometry = $('#pixel_geometry').val();
		res.pixel_configuration._scale = Math.max(0.1,parseFloat($('#pixel_scale').val()));
		res.pixel_configuration._feathering = Math.max(0,parseFloat($('#pixel_feathering').val()));
		res.pixel_configuration._distance = Math.max(0,parseInt($('#pixel_distance').val()));
		res.pixel_configuration._pixel_size = Math.max(1,parseInt($('#pixel_size').val()));
		if($('#pixel_size_mode').val() == 0){
			$('#pixel_size_suffix').html('%');
		}else{
			$('#pixel_size_suffix').html('px');
		}
		res.pixel_configuration._pixel_size_mode = Math.max(0,parseInt($('#pixel_size_mode').val()));
		res.pixel_configuration._shape =   Math.max(0,parseInt($('#pixel_shape').val()));
		res.pixel_configuration._grayscale = $('#pixel_grayscale').is(':checked') ? 1 : 0;

		res.glitch_configuration._scale =  Math.max(0.1,parseFloat($('#glitch_scale').val()));
		res.glitch_configuration._feathering = Math.max(0,parseFloat($('#glitch_feathering').val()));
		res.glitch_configuration.glitch_types[0].intensity_color = Math.max(0,parseInt($('#glitch_intensity_color').val()));
		res.glitch_configuration.glitch_types[0].intensity_shift = Math.max(0,parseInt($('#glitch_intensity_shift').val()));
		res.glitch_configuration.glitch_types[0].shift_horizontal = $('#glitch_horizontal_shift').is(':checked');
		res.glitch_configuration.glitch_types[0].shift_vertical = $('#glitch_vertical_shift').is(':checked');

		res.glitch_configuration.glitch_types[1].number_of_layers = Math.min(40, Math.max(0,parseInt($('#glitch_multiple_panels_layers').val())));
		res.glitch_configuration.glitch_types[1].min_scale = Math.min(1.0, Math.max(0.5 ,parseFloat($('#glitch_multiple_panels_min_scale').val())));
		res.glitch_configuration.glitch_types[1].max_scale = Math.min(2.0, Math.max(1.0 ,parseFloat($('#glitch_multiple_panels_max_scale').val())));
		res.glitch_configuration.glitch_types[1].scatter = Math.min(0.5, Math.max(0.0 ,parseFloat($('#glitch_multiple_panels_scatter').val())));
		res.glitch_configuration.glitch_types[1].split_chance = Math.min(1.0, Math.max(0.0 ,parseFloat($('#glitch_multiple_panels_splitter').val())));
		res.glitch_configuration.glitch_types[1].border = $('#glitch_multiple_panels_border').is(':checked') ? true : false;
		let gl_mp_offset = [];
		$('.glitch_multiple_panels_gradient_stop_color').each(function(i) {
			if($(this).val()){
				let c = xolor($(this).val());
				let offset = parseFloat($($('.glitch_multiple_panels_gradient_stop_position')[i]).val());
				if(isNaN(offset)){
					offset = i/4;
					$($('.glitch_multiple_panels_gradient_stop_position')[i]).val(offset);
				}
				if(!isNaN(c.a) && !isNaN(c.r) && !isNaN(c.g) && !isNaN(c.b) && !isNaN(offset)){
					let color = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
					gl_mp_offset.push({"offset": offset, "color": color});
				}
			}
		});
		res.glitch_configuration.glitch_types[1].gradients = gl_mp_offset;

		res.glitch_configuration.glitch_type = Math.max(0,parseInt($('#glitch_type').val()));

		res.sticker_configuration._scale =  Math.max(0.1,parseFloat($('#sticker_scale').val()));
		res.sticker_configuration._draw_mode =  Math.max(0,parseInt($('#sticker_draw_mode').val()));
		res.sticker_configuration._groups =  $('#sticker_groups').val().split(';');
		res.sticker_configuration._consistency = $('#sticker_consistency').is(':checked');

		res.png_configuration._height_max = Math.max(0,parseInt($('#png_max_height').val()? $('#png_max_height').val() : 0));
		res.png_configuration._height_min = Math.max(0,parseInt($('#png_min_height').val()? $('#png_min_height').val() : 0));
		res.png_configuration._width_max = Math.max(0,parseInt($('#png_max_width').val()? $('#png_max_width').val() : 0));
		res.png_configuration._width_min = Math.max(0,parseInt($('#png_min_width').val()? $('#png_min_width').val() : 0));
		res.png_configuration._filesize_max = Math.max(0,parseInt($('#png_max_file_size').val()? $('#png_max_file_size').val()*1000 : 0));
		res.png_configuration._filesize_min = Math.max(0,parseInt($('#png_min_file_size').val()? $('#png_min_file_size').val()*1000 : 0));
		res.png_configuration._file_output_type = document.querySelector('input[name="png_file_output"]:checked').value;

		res.jpg_configuration._height_max = Math.max(0,parseInt($('#jpg_max_height').val()? $('#jpg_max_height').val() : 0));
		res.jpg_configuration._height_min = Math.max(0,parseInt($('#jpg_min_height').val()? $('#jpg_min_height').val() : 0));
		res.jpg_configuration._width_max = Math.max(0,parseInt($('#jpg_max_width').val()? $('#jpg_max_width').val() : 0));
		res.jpg_configuration._width_min = Math.max(0,parseInt($('#jpg_min_width').val()? $('#jpg_min_width').val() : 0));
		res.jpg_configuration._filesize_max = Math.max(0,parseInt($('#jpg_max_file_size').val()? $('#jpg_max_file_size').val()*1000 : 0));
		res.jpg_configuration._filesize_min = Math.max(0,parseInt($('#jpg_min_file_size').val()? $('#jpg_min_file_size').val()*1000 : 0));
		res.jpg_configuration._file_output_type = document.querySelector('input[name="jpg_file_output"]:checked').value;

		res.bmp_configuration._height_max = Math.max(0,parseInt($('#bmp_max_height').val()? $('#bmp_max_height').val() : 0));
		res.bmp_configuration._height_min = Math.max(0,parseInt($('#bmp_min_height').val()? $('#bmp_min_height').val() : 0));
		res.bmp_configuration._width_max = Math.max(0,parseInt($('#bmp_max_width').val()? $('#bmp_max_width').val() : 0));
		res.bmp_configuration._width_min = Math.max(0,parseInt($('#bmp_min_width').val()? $('#bmp_min_width').val() : 0));
		res.bmp_configuration._filesize_max = Math.max(0,parseInt($('#bmp_max_file_size').val()? $('#bmp_max_file_size').val()*1000 : 0));
		res.bmp_configuration._filesize_min = Math.max(0,parseInt($('#bmp_min_file_size').val()? $('#bmp_min_file_size').val()*1000 : 0));
		res.bmp_configuration._file_output_type = document.querySelector('input[name="bmp_file_output"]:checked').value;

		res.webp_configuration._height_max = Math.max(0,parseInt($('#webp_max_height').val()? $('#webp_max_height').val() : 0));
		res.webp_configuration._height_min = Math.max(0,parseInt($('#webp_min_height').val()? $('#webp_min_height').val() : 0));
		res.webp_configuration._width_max = Math.max(0,parseInt($('#webp_max_width').val()? $('#webp_max_width').val() : 0));
		res.webp_configuration._width_min = Math.max(0,parseInt($('#webp_min_width').val()? $('#webp_min_width').val() : 0));
		res.webp_configuration._filesize_max = Math.max(0,parseInt($('#webp_max_file_size').val()? $('#webp_max_file_size').val()*1000 : 0));
		res.webp_configuration._filesize_min = Math.max(0,parseInt($('#webp_min_file_size').val()? $('#webp_min_file_size').val()*1000 : 0));
		res.webp_configuration._file_output_type = document.querySelector('input[name="webp_file_output"]:checked').value;


		res.avif_configuration._height_max = Math.max(0,parseInt($('#avif_max_height').val()? $('#avif_max_height').val() : 0));
		res.avif_configuration._height_min = Math.max(0,parseInt($('#avif_min_height').val()? $('#avif_min_height').val() : 0));
		res.avif_configuration._width_max = Math.max(0,parseInt($('#avif_max_width').val()? $('#avif_max_width').val() : 0));
		res.avif_configuration._width_min = Math.max(0,parseInt($('#avif_min_width').val()? $('#avif_min_width').val() : 0));
		res.avif_configuration._filesize_max = Math.max(0,parseInt($('#avif_max_file_size').val()? $('#avif_max_file_size').val()*1000 : 0));
		res.avif_configuration._filesize_min = Math.max(0,parseInt($('#avif_min_file_size').val()? $('#avif_min_file_size').val()*1000 : 0));
		res.avif_configuration._file_output_type = document.querySelector('input[name="avif_file_output"]:checked').value;

		res.gif_configuration._height_max = Math.max(0,parseInt($('#gif_max_height').val()? $('#gif_max_height').val() : 0));
		res.gif_configuration._height_min = Math.max(0,parseInt($('#gif_min_height').val()? $('#gif_min_height').val() : 0));
		res.gif_configuration._width_max = Math.max(0,parseInt($('#gif_max_width').val()? $('#gif_max_width').val() : 0));
		res.gif_configuration._width_min = Math.max(0,parseInt($('#gif_min_width').val()? $('#gif_min_width').val() : 0));
		res.gif_configuration._filesize_max = Math.max(0,parseInt($('#gif_max_file_size').val()? $('#gif_max_file_size').val()*1000 : 0));
		res.gif_configuration._filesize_min = Math.max(0,parseInt($('#gif_min_file_size').val()? $('#gif_min_file_size').val()*1000 : 0));
		res.gif_configuration._frame_count_max = Math.max(0,parseInt($('#gif_max_frame_count').val()? $('#gif_max_frame_count').val() : 0));
		res.gif_configuration._thumbnail_fallback = $('#gif_thumbnail_fallback').is(':checked');
		res.gif_configuration._memory_method = Math.max(0,parseInt($('#gif_memory_mode').val()));

		res.triangle_configuration._scale =   Math.max(0.1,parseFloat($('#triangle_scale').val()));
		res.triangle_configuration._shape =   Math.max(0,parseInt($('#triangle_shape').val()));
		res.triangle_configuration._feathering = Math.max(0,parseFloat($('#triangle_feathering').val()));

		res.triangle_configuration.accuracy = Math.min(1,Math.max(0,parseFloat($('#triangle_accuracy').val())));
		res.triangle_configuration.blur = Math.max(0,parseInt($('#triangle_blur').val()));
		res.triangle_configuration.threshold = Math.min(100,Math.max(0,parseInt($('#triangle_threshold').val())));

		res.triangle_configuration.vertexMode = $('#triangle_vertex_mode_dynamic').is(':checked')? true : false;
		res.triangle_configuration.vertexCount =  Math.min(50000,Math.max(0,parseInt($('#triangle_vertex_count_static').val())));
		res.triangle_configuration.vertexPercentage = Math.min(1000,Math.max(0,parseInt($('#triangle_vertex_count_dynamic').val())));

		res.triangle_configuration.fill = $('#triangle_fill_on').is(':checked')? true :
			$('#triangle_fill_off').is(':checked')? false :
				$('#triangle_fill_colorpicker').val();
		res.triangle_configuration.fillColor = $('#triangle_fill_colorpicker').val();
		res.triangle_configuration.stroke = $('#triangle_stroke_on').is(':checked')? true :
			$('#triangle_stroke_off').is(':checked')? false :
				$('#triangle_stroke_colorpicker').val();
		res.triangle_configuration.strokeColor = $('#triangle_stroke_colorpicker').val();
		res.triangle_configuration.strokeWidth = Math.max(0,parseFloat($('#triangle_stroke_width').val()));

		res.triangle_configuration.gradients = $('#triangle_gradient').is(':checked')? true : false;
		res.triangle_configuration.gradientStops = Math.min(100,Math.max(2,parseInt($('#triangle_gradient_stops').val())));
		res.triangle_configuration.lineJoin = $('#triangle_line_join').val();
		res.triangle_configuration.transparentColor = $('#triangle_transparent_color').is(':checked');

		res.sobel_configuration._color =  $('#sobel_colorpicker').val();
		res.sobel_configuration._scale =   Math.max(0.1,parseFloat($('#sobel_scale').val()));
		res.sobel_configuration._shape =   Math.max(0,parseInt($('#sobel_shape').val()));
		res.sobel_configuration._feathering = Math.max(0,parseFloat($('#sobel_feathering').val()));
		res.sobel_configuration._color_inverted = $('.sobel_color_invertedToggle').first().attr('check')? true : false;

		res.splatter_configuration._scale =   Math.max(0.1,parseFloat($('#splatter_scale').val()));

		res.splatter_configuration._splatter_size =   Math.max(0.001,parseFloat($('#splatter_size').val()));
		res.splatter_configuration._splatter_amount =   Math.max(0,parseFloat($('#splatter_amount').val()));
		res.splatter_configuration._splatter_sub_size =   Math.max(0.001,parseFloat($('#splatter_sub_size').val()));
		res.splatter_configuration._splatter_sub_amount =   Math.max(0,parseFloat($('#splatter_sub_amount').val()));
		res.splatter_configuration._splatter_iterations =   Math.min(4,Math.max(0,parseFloat($('#splatter_iterations').val())));
		res.splatter_configuration._splatter_transparency =   Math.min(1.0,Math.max(0.0,parseFloat($('#splatter_transparency').val())));
		res.splatter_configuration._splatter_centering =   Math.min(12,Math.max(0,parseFloat($('#splatter_centering').val())));
		let scp = $('#splatter_color_scheme').val().replace(/\r\n/g,"\n").split("\n");
		let splatter_color_schemes = [];
		scp.forEach(function (s){
			s = s.trim();
			if(s){
				let c = xolor(s);
				if(!isNaN(c.a) && !isNaN(c.r) && !isNaN(c.g) && !isNaN(c.b)){
					let color = "rgba(" + c.r + "," + c.g + "," + c.b + "," + res.splatter_configuration._splatter_transparency + ")";
					splatter_color_schemes.push(color);
				}
			}
		});
		res.splatter_configuration._splatter_color_scheme = splatter_color_schemes;

		res.whiteblacklist_configuration.mode = $("input:radio[name='wblist']:checked").val();
		let white_list = [];
		$.each($('#whitelist').val().split(/\n/), function(i, line){
			if(line){
				white_list.push(line);
			}
		});
		res.whiteblacklist_configuration.white_list = white_list;

		res.clustering_configuration.mode = Math.max(0,$('#clustering_mode').val());

		let black_list = [];
		$.each($('#blacklist').val().split(/\n/), function(i, line){
			if(line){
				black_list.push(line);
			}
		});
		res.whiteblacklist_configuration.black_list = black_list;
		//todo: max min
		res.word_wall_configuration.text_mode = parseInt($("input:radio[name='word_wall_text_mode']:checked").val());
		res.word_wall_configuration.font_size = parseFloat($('#word_wall_font_size').val());
		res.word_wall_configuration.distance_horizontal = parseInt($('#word_wall_distance_horizontal').val());
		res.word_wall_configuration.distance_vertical = parseFloat($('#word_wall_distance_vertical').val());
		res.word_wall_configuration.offset = parseFloat($('#word_wall_offset').val());

		res.only_once_mode_configuration.precision = Math.min(64,Math.max(58,$('#only_once_mode_precision').val()));
		res.only_once_mode_configuration.message = $('#only_once_mode_message').val();
		res.only_once_mode_configuration.date_time_format = $('#only_once_mode_date_time_format').val()? $('#only_once_mode_date_time_format').val() : "";
		res.only_once_mode_configuration.mode = parseInt($('.oomModeRadio').filter(":checked").val());

		res.only_once_mode_configuration.timer = $('#only_once_mode_timer').is(':checked')? true : false;
		res.only_once_mode_configuration.timer_autorefresh = $('#only_once_mode_timer_refresh').is(':checked')? true : false;

		res.only_once_mode_configuration.timer_animation = $('#only_once_mode_timer_animation_progressbar').is(':checked')? 1 :
			($('#only_once_mode_timer_animation_black').is(':checked')? 2 :
				($('#only_once_mode_timer_animation_blur').is(':checked')? 3 : 0
				));

		res.only_once_mode_configuration.mode_configuration[1].transparency =  Math.min(0.08,Math.max(0.01,$('#only_once_mode_mode_see_trough_advanced_transparency').val()/100));

		res.only_once_mode_configuration.mode_configuration[2].distance =  Math.min(0.2,Math.max(0.01,$('#only_once_mode_mode_border_advanced_distance').val()/100));
		res.only_once_mode_configuration.mode_configuration[2].radius =  Math.min(300,Math.max(0,$('#only_once_mode_mode_border_advanced_radius').val()));

		res.only_once_mode_configuration.mode_configuration[3].blur =  Math.min(0.1,Math.max(0.0,$('#only_once_mode_mode_thumbnail_advanced_blur').val()/100));

		res.only_once_mode_configuration.mode_configuration[4].strength =  Math.min(1,Math.max(0.1,$('#only_once_mode_mode_grid_advanced_strength').val()));
		let grid_color_1 = $('#only_once_mode_mode_grid_advanced_color_1').val();
		grid_color_1 = grid_color_1.trim();
		if(grid_color_1) {
			let c = xolor(grid_color_1);
			if(!isNaN(c.a) && !isNaN(c.r) && !isNaN(c.g) && !isNaN(c.b)){
				let color = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
				res.only_once_mode_configuration.mode_configuration[4].color_1 = color;
			}
		}
		let grid_color_2 = $('#only_once_mode_mode_grid_advanced_color_2').val();
		grid_color_2 = grid_color_2.trim();
		if(grid_color_2) {
			let c = xolor(grid_color_2);
			if(!isNaN(c.a) && !isNaN(c.r) && !isNaN(c.g) && !isNaN(c.b)){
				let color = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";
				res.only_once_mode_configuration.mode_configuration[4].color_2 = color;
			}
		}

		res.only_once_mode_configuration.mode_configuration[5].blur =  Math.min(0.2,Math.max(0.01,$('#only_once_mode_mode_blur_advanced_blur').val()/100));
		res.only_once_mode_configuration.mode_configuration[6].allow_faces = $('#only_once_mode_mode_box_tease_advanced_allow_faces').is(':checked')? true : false;


		if(!res.only_once_mode_configuration.mode){
			res.only_once_mode_configuration.mode = 0;
		}
		res.only_once_mode_configuration.width_min = Math.max(0,$('#only_once_mode_min_width').val());
		res.only_once_mode_configuration.height_min = Math.max(0,$('#only_once_mode_min_height').val());
		let triggers = [];
		$('.oom-label').each(function() {
			if($(this).is(':checked')) {
				let key = $(this).attr("label");
				let r = Object.values(klasses).find((e) => e.key == key);
				triggers.push(r.index);
			}
		});
		res.only_once_mode_configuration.trigger = triggers;
		res.only_once_mode_configuration.display_classes = $('#only_once_mode_display_classes').is(':checked')? true : false;

		browser.storage.sync.set({
			bar_configuration: res.bar_configuration,
			blur_configuration: res.blur_configuration,
			pixel_configuration: res.pixel_configuration,
			glitch_configuration: res.glitch_configuration,
			triangle_configuration: res.triangle_configuration,
			sticker_configuration: res.sticker_configuration,
			sobel_configuration: res.sobel_configuration,
			splatter_configuration: res.splatter_configuration,
			gif_configuration: res.gif_configuration,
			png_configuration: res.png_configuration,
			jpg_configuration: res.jpg_configuration,
			bmp_configuration: res.bmp_configuration,
			avif_configuration: res.avif_configuration,
			webp_configuration: res.webp_configuration,
			whiteblacklist_configuration: res.whiteblacklist_configuration,
			word_wall_configuration: res.word_wall_configuration,
			clustering_configuration: res.clustering_configuration,
			only_once_mode_configuration: res.only_once_mode_configuration,
		}).then(function(){
			updateOptionsContentScript();
		});

	});
}

$(':radio[hide]').click(function(){
	$('.'+$(this).attr('hide')).hide();
});

$('button[toggle]').click(function(){
	$('#'+$(this).attr('toggle')).toggle();
	$('.'+$(this).attr('toggle')).toggle();
});
$('input[toggle]').click(function(){
	$('#'+$(this).attr('toggle')).toggle();
	$('.'+$(this).attr('toggle')).toggle();
});
$(':radio[toggle]').click(function(){
	$('#'+$(this).attr('toggle')).show();
	$('.'+$(this).attr('toggle')).show();
});



$('#radio-nolist[toggle]').click(function(){
	if($(this).is(':checked')){
		$('#whitelist-container').hide();
		$('#blacklist-container').hide();
	}
});
$('#radio-whitelist[toggle]').click(function(){
	if($(this).is(':checked')){
		$('#whitelist-container').show();
		$('#blacklist-container').hide();
	}
});
$('#radio-blacklist[toggle]').click(function(){
	if($(this).is(':checked')){
		$('#whitelist-container').hide();
		$('#blacklist-container').show();
	}
});

$('.tab').click(function(){
	let id = $(this).attr('id');
	if(id != 'gallery_viewer'){
		$('.tab').removeClass('tab-selected');
		$(this).addClass('tab-selected');
		$('.content').removeClass('content-displayed');
		$('#'+$(this).attr('content')).addClass('content-displayed');
		browser.storage.sync.set({
			option_page_view: $(this).attr('content'),
		});
	}
});

$('.sobel_color_invertedToggle').click(function(e){
	e.stopImmediatePropagation();
	$('.sobel_color_invertedToggle').toggleAttr('check', true);
	$('.save_config').first().trigger('change');
});

$('io-toggle').click(function(e){
	if($(this).attr('disabled') === 'disabled'){
		return;
	}
	$(this).toggleAttr('check', true);
	$(this).children().toggleAttr('check', true);
});

$('io-toggle button').click(function(e){
	if($(this).attr('disabled') === 'disabled'){
		return;
	}
	$(this).toggleAttr('check', true);
	$(this).parent().toggleAttr('check', true);
});

$('.onoff').click(function(e){
	e.stopImmediatePropagation();
	if($(this).attr('disabled') === 'disabled'){
		return;
	}
	$('#onoff').html($(this).attr('check')? 'ON' : 'OFF');
	activatePuryFi($(this).attr('check')? true : false);
});

$('.labelToggle').click(function(e){
	e.stopImmediatePropagation();
	$('#'+$(this).attr('label')).toggleClass("selected", $(this).attr('check'));
	let labels = browser.storage.sync.get('labels');
	labels.then((res) => {
		let labellist = res.labels || [];
		if($(this).attr('check')){
			if(labellist.indexOf($(this).attr('label')) === -1){
				labellist.push($(this).attr('label'))
			}
		}else{
			if(labellist.indexOf($(this).attr('label')) != -1){
				labellist = removeItemAll(labellist, $(this).attr('label'));
			}
		}
		browser.storage.sync.set({
			labels: labellist
		}).then(function(){
			updateOptionsContentScript();
		});
	});
});

$('.overlayToggle').click(function(e){
	e.stopImmediatePropagation();
	browser.storage.sync.set({
		video_overlay: $(this).attr('check')  ? true : false
	}).then(function(){
		updateOptionsContentScript();
	});
});

$('.base64Toggle').click(function(e){
	e.stopImmediatePropagation();
	browser.storage.sync.set({
		base64_scanner: $(this).attr('check')  ? true : false
	}).then(function(){
		updateOptionsContentScript();
	});
});

$('.statisticsToggle').click(function(e){
	e.stopImmediatePropagation();
	browser.storage.sync.set({
		statistics_enabled: $(this).attr('check')  ? true : false
	}).then(function(){
		updateOptionsContentScript();
	});
});

$('.prescale').click(function(e){
	e.stopImmediatePropagation();
	browser.storage.sync.set({
		prescale: $(this).attr('check')  ? true : false
	}).then(function(){
		updateOptionsContentScript();
	});
});

$('.clusteringToggle').click(function(e){
	e.stopImmediatePropagation();
	let conf = browser.storage.sync.get(['clustering_configuration']);
	conf.then((res) => {
		res.clustering_configuration.enabled = $(this).attr('check') ? true : false
		browser.storage.sync.set({
			clustering_configuration: res.clustering_configuration
		}).then(function(){
			updateOptionsContentScript();
		});
	});
});

$('.filetypeToggle').click(function(e){
	e.stopImmediatePropagation();
	let file_types = browser.storage.sync.get(['file_types','gif_configuration']);
	file_types.then((res) => {
		let file_typeslist = res.file_types || [];

		if($(this).attr('check')){
			if(file_typeslist.indexOf($(this).attr('label')) === -1){
				file_typeslist.push($(this).attr('label'))
			}
		}else{
			if(file_typeslist.indexOf($(this).attr('label')) != -1){
				file_typeslist = removeItemAll(file_typeslist, $(this).attr('label'));
			}
		}
		if($('#gif-io').attr('check') && $("#gif_thumb").attr('check')){
			$('#gif_thumb').removeAttr('check');
			$('#gif_thumb_button').removeAttr('check');
			res.gif_configuration._thumbnails = false;
		}
		browser.storage.sync.set({
			file_types: file_typeslist,
			gif_configuration: res.gif_configuration,
		}).then(function(){
			updateOptionsContentScript();
		});
	});
});

$('#batch_converter').click(function(e){
	let file_types = browser.storage.sync.get(['file_types','gif_configuration']);
	file_types.then((res) => {
		let file_typeslist = res.file_types || [];
		$('#batch_converter_png').addClass('filetype-inactive');
		$('#batch_converter_jpg').addClass('filetype-inactive');
		$('#batch_converter_bmp').addClass('filetype-inactive');
		$('#batch_converter_webp').addClass('filetype-inactive');
		$('#batch_converter_gif').addClass('filetype-inactive');
		file_typeslist.forEach(function(type){
			$('#batch_converter_'+type).removeClass('filetype-inactive');
		});
		if(res.gif_configuration._thumbnails){
			$('#batch_converter_gif').removeClass('filetype-inactive');
		}
	});
});

$('.censormodeToggle').click(function(e){
	e.stopImmediatePropagation();
	/*
	$('button[label=normal]').removeAttr('check');
	$('button[label=normal]').parent().removeAttr('check');
	$('button[label=box]').removeAttr('check');
	$('button[label=box]').parent().removeAttr('check');
	$('button[label=black]').removeAttr('check');
	$('button[label=black]').parent().removeAttr('check');
	$('button[label=pixel]').removeAttr('check');
	$('button[label=pixel]').parent().removeAttr('check');
	$('button[label=blur]').removeAttr('check');
	$('button[label=blur]').parent().removeAttr('check');
	$('button[label=glitch]').removeAttr('check');
	$('button[label=glitch]').parent().removeAttr('check');
	$('button[label=triangle]').removeAttr('check');
	$('button[label=triangle]').parent().removeAttr('check');
	$('button[label=sticker]').removeAttr('check');
	$('button[label=sticker]').parent().removeAttr('check');
	document.getElementById("normal").classList.remove("selected");
	document.getElementById("box").classList.remove("selected");
	document.getElementById("black").classList.remove("selected");
	document.getElementById("pixel").classList.remove("selected");
	document.getElementById("blur").classList.remove("selected");
	document.getElementById("glitch").classList.remove("selected");
	document.getElementById("triangle").classList.remove("selected");
	document.getElementById("sticker").classList.remove("selected");
	*/
	$('.censormodeToggle').removeAttr('check');
	$('.typeButton').removeClass("selected");

	$("#"+$(this).attr('label')).addClass("selected");
	$('button[label='+$(this).attr('label')+']').attr('check', true);
	$('button[label='+$(this).attr('label')+']').parent().attr('check', true);
	let censor_type = browser.storage.sync.get('censor_type');
	censor_type.then((res) => {
		let censor_type = res.censor_type || 'black';
		if($(this).attr('check')){
			censor_type = $(this).attr('label');
		}
		browser.storage.sync.set({
			censor_type: censor_type
		}).then(function(){
			updateOptionsContentScript();
		});
	});
});


$('.debugToggle').click(function(e){
	e.stopImmediatePropagation();
	$('#'+$(this).attr('label')).toggleClass("selected", $(this).attr('check'));
	let debug = browser.storage.sync.get('debug');
	debug.then((res) => {
		let debugging = res.debug || false;
		browser.storage.sync.set({
			debug: ($(this).attr('check')? true : false)
		}).then(function(){
			updateOptionsContentScript();
		});
	});
});

$('.configToggle').click(function(e){
	e.stopImmediatePropagation();
	$('#'+$(this).attr('label')).toggleClass("selected", $(this).attr('check'));
	let conf = browser.storage.sync.get(['gif_configuration','file_types']);
	conf.then((res) => {

		res.gif_configuration._thumbnails = $('#gif_thumb').attr('check')? true : false;
		if(res.gif_configuration._thumbnails){
			$('#gif-io').removeAttr('check');
			$('#gif-button').removeAttr('check');
			//$('.filetypeToggle').click();
			let file_typeslist = res.file_types || [];
			file_typeslist = removeItemAll(file_typeslist, 'gif');
			res.file_types = file_typeslist;
		}

		browser.storage.sync.set({
			gif_configuration: res.gif_configuration,
			file_types: res.file_types,
		}).then(function(){
			updateOptionsContentScript();
			if(res.gif_configuration._thumbnails) {
				//restoreFiletypes();
			}
		});

	});
});

$('.do_cacheToggle').click(function(e){
	e.stopImmediatePropagation();
	$('#'+$(this).attr('label')).toggleClass("selected", $(this).attr('check'));
	let censor = browser.storage.sync.get('do_cache');
	censor.then((res) => {
		browser.storage.sync.set({
			do_cache:  ($(this).attr('check')? true : false)
		}).then(function(){
			updateOptionsContentScript();
		});
	});
});

// jquery toggle whole attribute
$.fn.toggleAttr = function(attr, val) {
	var test = $(this).attr(attr);
	if ( test ) {
		// if attrib exists with ANY value, still remove it
		$(this).removeAttr(attr);
	} else {
		$(this).attr(attr, val);
	}
	return this;
};

// jquery toggle just the attribute value
$.fn.toggleAttrVal = function(attr, val1, val2) {
	var test = $(this).attr(attr);
	if ( test === val1) {
		$(this).attr(attr, val2);
		return this;
	}
	if ( test === val2) {
		$(this).attr(attr, val1);
		return this;
	}
	// default to val1 if neither
	$(this).attr(attr, val1);
	return this;
};

$(".labelButton").on('click', function(event){
	$(this).toggleClass("selected");
	if($(this).hasClass("selected")){
		$('button[label='+$(this).attr('id')+']').attr('check', true);
		$('button[label='+$(this).attr('id')+']').parent().attr('check', true);
	}else{
		$('button[label='+$(this).attr('id')+']').removeAttr('check');
		$('button[label='+$(this).attr('id')+']').parent().removeAttr('check');
	}
	let labels = browser.storage.sync.get('labels');
	labels.then((res) => {
		let labellist = res.labels || [];
		if($(this).hasClass("selected")){
			if(labellist.indexOf(this.id) === -1){
				labellist.push(this.id)
			}
		}else{
			if(labellist.indexOf(this.id) != -1){
				labellist = removeItemAll(labellist, this.id);
			}
		}
		browser.storage.sync.set({
			labels: labellist
		}).then(function(){
			updateOptionsContentScript();
		});
	});
});

$(".typeButton").on('click', function(event){
	if(!$(this).hasClass("selected")){
		$('.censormodeToggle').removeAttr('check');
		$('.typeButton').removeClass("selected");
		$(this).addClass("selected");

		$('button[label='+$(this).attr('id')+']').attr('check', true);
		$('button[label='+$(this).attr('id')+']').parent().attr('check', true);
		let censor_type = browser.storage.sync.get('censor_type');
		censor_type.then((res) => {
			censor_type = $(this).attr('id');
			browser.storage.sync.set({
				censor_type: censor_type
			}).then(function(){
				updateOptionsContentScript();
			});
		});

	}
});

$('.iconButton').click(function(){
	let icon_configuration = browser.storage.sync.get('icon_configuration');
	icon_configuration.then((res) => {
		let r = res.icon_configuration;
		if(this.value === 'classic'){
			r = {
				"16": '/icons/icon_16.png',
				"32": '/icons/icon_32.png',
				"64": '/icons/icon_64.png',
			};
		}else if(this.value === 'minimalistic'){
			r = {
				"16": '/icons/icon_16_minimalistic.png',
				"32": '/icons/icon_32_minimalistic.png',
				"64": '/icons/icon_64_minimalistic.png',
			};
		}
		else if(this.value === 'eye'){
			r = {
				"16": '/icons/icon_16_eye.png',
				"32": '/icons/icon_32_eye.png',
				"64": '/icons/icon_64_eye.png',
			};
		}
		browser.storage.sync.set({
			icon_configuration: r
		}).then(function(){
			updateOptionsContentScript();
		});

	});

});

$(".debugButton").on('click', function(event){
	if(!$(this).hasClass("selected")){
		$(this).addClass("selected");
		$('.debugToggle').attr('check', true);
	}else{
		$(this).removeClass("selected");
		$('.debugToggle').removeAttr('check');
	}
	let debug = browser.storage.sync.get('debug');
	debug.then((res) => {
		let debugging = res.debug || false;
		browser.storage.sync.set({
			debug: $(this).hasClass("selected")
		}).then(function(){
			updateOptionsContentScript();
		});
	});
});

$("#blacklist-locked-add").on('click', function(event){
	let whiteblacklist = browser.storage.sync.get(['whiteblacklist_configuration']);
	whiteblacklist.then((res) => {
		let val = $("#blacklist-locked-input").val();
		let black_list = res.whiteblacklist_configuration.black_list;
		black_list.push(val);
		res.whiteblacklist_configuration.black_list = black_list;
		browser.storage.sync.set({
			whiteblacklist_configuration: res.whiteblacklist_configuration,
		}).then(function(){
			$('#blacklist_locked').val(res.whiteblacklist_configuration.black_list.join('\n'));
		});
	});
});


$('#restore_default_settings-button').click(function() {
	if (window.confirm("Warning: This will reset all configurations to its default parameters.")) {
		let clearStorage = browser.storage.sync.clear();
		clearStorage.then(e => {
			resetOptions();
			window.location.reload();
		});
	}
});

$('input').on('change keyup paste', function() {
	let _this = $(this);
	let min = parseInt(_this.attr('min'));
	let max = parseInt(_this.attr('max'));
	if(_this.attr("min")) {
			let val = parseInt(_this.val());
			if (val < min) {
				_this.val(min);
			}
	}
	if(_this.attr("max")) {
		let val = parseInt(_this.val());
		if (val > max) {
			_this.val(max);
		}
	}
});

