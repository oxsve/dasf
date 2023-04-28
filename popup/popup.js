window.onload = function() {

	$('.onoff').click(function(e){
		e.stopImmediatePropagation();
		if($(this).attr('disabled') === 'disabled'){
			return;
		}
		document.getElementById('onoff-button').toggleAttribute("check");
		document.getElementById('onoff-toggle').toggleAttribute("check");
		$('#onoff').html($(this).attr('check') === ""? 'ON' : 'OFF');
		activatePuryFi($(this).attr('check') === ""? true : false);
	});

	document.getElementById("reverse_censoring").addEventListener("click", function(){
		document.getElementById("reverse_censoring-io").toggleAttribute("check");
		document.getElementById("reverse_censoring-button").toggleAttribute("check");
		let sync = browser.storage.sync.get(['reverse_mode_configuration']);
		sync.then((res) => {
			res.reverse_mode_configuration.enabled = document.getElementById("reverse_censoring-button").hasAttribute("check") ? true : false
			browser.storage.sync.set({
				reverse_mode_configuration: res.reverse_mode_configuration
			}).then(function(){
				updateOptionsContentScript();
			});
		});
	});

	document.getElementById("blur").onclick = function (e) { 
	  browser.storage.sync.set({
		censor_type: 'blur'
	  }).then(function(){
		  updateOptionsContentScript();
	  });
	  document.getElementById("normal").classList.remove("selected");
	  document.getElementById("box").classList.remove("selected");
	  document.getElementById("blur").classList.add("selected");
	  document.getElementById("pixel").classList.remove("selected");
	  document.getElementById("black").classList.remove("selected");
	  document.getElementById("glitch").classList.remove("selected");
	  document.getElementById("triangle").classList.remove("selected");
	  document.getElementById("sticker").classList.remove("selected");
	  document.getElementById("sobel").classList.remove("selected");
	  document.getElementById("splatter").classList.remove("selected");
	};

	document.getElementById("normal").onclick = function () {
		browser.storage.sync.set({
			censor_type: 'normal'
		}).then(function(){
			updateOptionsContentScript();
		});
		document.getElementById("normal").classList.add("selected");
		document.getElementById("box").classList.remove("selected");
		document.getElementById("blur").classList.remove("selected");
		document.getElementById("pixel").classList.remove("selected");
		document.getElementById("black").classList.remove("selected");
		document.getElementById("glitch").classList.remove("selected");
		document.getElementById("triangle").classList.remove("selected");
		document.getElementById("sticker").classList.remove("selected");
		document.getElementById("sobel").classList.remove("selected");
		document.getElementById("splatter").classList.remove("selected");
	};

	document.getElementById("box").onclick = function () {
		browser.storage.sync.set({
			censor_type: 'box'
		}).then(function(){
			updateOptionsContentScript();
		});
		document.getElementById("box").classList.add("selected");
		document.getElementById("normal").classList.remove("selected");
		document.getElementById("blur").classList.remove("selected");
		document.getElementById("pixel").classList.remove("selected");
		document.getElementById("black").classList.remove("selected");
		document.getElementById("glitch").classList.remove("selected");
		document.getElementById("triangle").classList.remove("selected");
		document.getElementById("sticker").classList.remove("selected");
		document.getElementById("sobel").classList.remove("selected");
		document.getElementById("splatter").classList.remove("selected");
	};

	document.getElementById("pixel").onclick = function () { 
	  browser.storage.sync.set({
		censor_type: 'pixel'
	  }).then(function(){
		  updateOptionsContentScript();
	  });
	  document.getElementById("pixel").classList.add("selected");
	  document.getElementById("normal").classList.remove("selected");
	  document.getElementById("box").classList.remove("selected");
	  document.getElementById("blur").classList.remove("selected");
	  document.getElementById("black").classList.remove("selected");
	  document.getElementById("glitch").classList.remove("selected");
	  document.getElementById("triangle").classList.remove("selected");
	  document.getElementById("sticker").classList.remove("selected");
	  document.getElementById("sobel").classList.remove("selected");
	  document.getElementById("splatter").classList.remove("selected");
	};
	
	document.getElementById("black").onclick = function () { 
	  browser.storage.sync.set({
		censor_type: 'black'
	  }).then(function(){
		  updateOptionsContentScript();
	  });
	  document.getElementById("black").classList.add("selected");
	  document.getElementById("normal").classList.remove("selected");
	  document.getElementById("box").classList.remove("selected");
	  document.getElementById("blur").classList.remove("selected");
	  document.getElementById("pixel").classList.remove("selected");
	  document.getElementById("glitch").classList.remove("selected");
	  document.getElementById("triangle").classList.remove("selected");
	  document.getElementById("sticker").classList.remove("selected");
	  document.getElementById("sobel").classList.remove("selected");
	  document.getElementById("splatter").classList.remove("selected");
	};

	document.getElementById("glitch").onclick = function () {
		browser.storage.sync.set({
			censor_type: 'glitch'
		}).then(function(){
			updateOptionsContentScript();
		});
		document.getElementById("glitch").classList.add("selected");
		document.getElementById("black").classList.remove("selected");
		document.getElementById("normal").classList.remove("selected");
		document.getElementById("box").classList.remove("selected");
		document.getElementById("blur").classList.remove("selected");
		document.getElementById("pixel").classList.remove("selected");
		document.getElementById("triangle").classList.remove("selected");
		document.getElementById("sticker").classList.remove("selected");
		document.getElementById("sobel").classList.remove("selected");
		document.getElementById("splatter").classList.remove("selected");
	};

	document.getElementById("triangle").onclick = function () {
		browser.storage.sync.set({
			censor_type: 'triangle'
		}).then(function(){
			updateOptionsContentScript();
		});
		document.getElementById("triangle").classList.add("selected");
		document.getElementById("black").classList.remove("selected");
		document.getElementById("normal").classList.remove("selected");
		document.getElementById("box").classList.remove("selected");
		document.getElementById("blur").classList.remove("selected");
		document.getElementById("pixel").classList.remove("selected");
		document.getElementById("glitch").classList.remove("selected");
		document.getElementById("sticker").classList.remove("selected");
		document.getElementById("sobel").classList.remove("selected");
		document.getElementById("splatter").classList.remove("selected");
	};

	document.getElementById("sticker").onclick = function () {
		browser.storage.sync.set({
			censor_type: 'sticker'
		}).then(function(){
			updateOptionsContentScript();
		});
		document.getElementById("sticker").classList.add("selected");
		document.getElementById("black").classList.remove("selected");
		document.getElementById("normal").classList.remove("selected");
		document.getElementById("box").classList.remove("selected");
		document.getElementById("blur").classList.remove("selected");
		document.getElementById("pixel").classList.remove("selected");
		document.getElementById("glitch").classList.remove("selected");
		document.getElementById("triangle").classList.remove("selected");
		document.getElementById("sobel").classList.remove("selected");
		document.getElementById("splatter").classList.remove("selected");
	};

	document.getElementById("sobel").onclick = function () {
		browser.storage.sync.set({
			censor_type: 'sobel'
		}).then(function(){
			updateOptionsContentScript();
		});
		document.getElementById("sobel").classList.add("selected");
		document.getElementById("sticker").classList.remove("selected");
		document.getElementById("black").classList.remove("selected");
		document.getElementById("normal").classList.remove("selected");
		document.getElementById("box").classList.remove("selected");
		document.getElementById("blur").classList.remove("selected");
		document.getElementById("pixel").classList.remove("selected");
		document.getElementById("glitch").classList.remove("selected");
		document.getElementById("triangle").classList.remove("selected");
		document.getElementById("splatter").classList.remove("selected");
	};

	document.getElementById("splatter").onclick = function () {
		browser.storage.sync.set({
			censor_type: 'splatter'
		}).then(function(){
			updateOptionsContentScript();
		});
		document.getElementById("splatter").classList.add("selected");
		document.getElementById("sticker").classList.remove("selected");
		document.getElementById("black").classList.remove("selected");
		document.getElementById("normal").classList.remove("selected");
		document.getElementById("box").classList.remove("selected");
		document.getElementById("blur").classList.remove("selected");
		document.getElementById("pixel").classList.remove("selected");
		document.getElementById("glitch").classList.remove("selected");
		document.getElementById("triangle").classList.remove("selected");
		document.getElementById("sobel").classList.remove("selected");
	};

	$(".labelButton").on('click', function(event){
		$(this).toggleClass("selected");
		var labels = browser.storage.sync.get('labels');
		labels.then((res) => {
			labellist = res.labels || [];
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
	$("#options").click(function(){
		browser.runtime.openOptionsPage();
		$("body").hide();
	});

	$("#toggle_labels").on('click', function(event){
		$(".labelButton").toggleClass("selected");
		var labels = browser.storage.sync.get('labels');
		labels.then((res) => {
			labellist = res.labels || [];
			$(".labelButton").each(function() {
				if($(this).hasClass("selected")){
					if(labellist.indexOf(this.id) === -1){
						labellist.push(this.id)
					}
				}else{
					if(labellist.indexOf(this.id) != -1){
						labellist = removeItemAll(labellist, this.id);
					}
				}
			});
			browser.storage.sync.set({
				labels: labellist
			}).then(function(){
				updateOptionsContentScript();
			});

		});
	});

};

function removeItemAll(arr, value) {
	var i = 0;
	while (i < arr.length) {
		if (arr[i] === value) {
			arr.splice(i, 1);
		} else {
			++i;
		}
	}
	return arr;
}

function restoreOptions() {
	restoreONOFF();
	restoreCensor_Type();
	restoreLabels();
	restoreAdvanced();
	restoreLockUnlock();
	//restoreQuickSettings();
	updateQuickSettings();
}

function restoreCensor_Type() {
  var censor_type = browser.storage.sync.get('censor_type');
  censor_type.then((res) => {
  	document.getElementById("normal").classList.remove("selected");
  	document.getElementById("box").classList.remove("selected");
    document.getElementById("black").classList.remove("selected");
	document.getElementById("pixel").classList.remove("selected");
	document.getElementById("blur").classList.remove("selected");
	document.getElementById("glitch").classList.remove("selected");
	document.getElementById(""+res.censor_type).classList.add("selected");
  });

}
function restoreLabels() {
	var labels = browser.storage.sync.get('labels');
	labels.then((res) => {
		$('.labelButton').each(function(i, obj) {
			if(res.labels.includes(obj.id)){
				$(this).addClass("selected");
			}else{
				$(this).removeClass("selected");
			}
		});
	});
}
function restoreAdvanced() {
	var sync = browser.storage.sync.get(['user','reverse_mode_configuration']);
	sync.then((res) => {
		if(res.reverse_mode_configuration.enabled){
			document.getElementById("reverse_censoring-button").setAttribute("check", "true");
			document.getElementById("reverse_censoring-io").setAttribute("check", "true");
		}else{
			document.getElementById("reverse_censoring-button").removeAttribute("check");
			document.getElementById("reverse_censoring-io").removeAttribute("check");
		}

		if(res.user && res.user.permissions.permission_reverse_censoring <= res.user.patreon_tier) {
			$("#reverse_mode").show();
		}else{
			$("#reverse_mode").hide();
		}
	});
}
/*
function restoreQuickSettings(){
	let conf = browser.storage.local.get(['settings']);
	conf.then((res) => {
		$('#settings-select').append($('<option>', {
			value: '',
			text: '',
		}));
		if(res.settings){
			$('#quick-setting-container').show();
			$('#settings-select').append($('<option>', {
				value: 'default',
				text: 'Default',
			}));
			for (const setting_name in res.settings) {
				$('#settings-select').append($('<option>', {
					value: setting_name.toLowerCase(),
					text: setting_name,
				}));
			}
		}
	});
}
*/
$('#settings-select').change(function(){
	let setting_name = $('#settings-select').find(":selected").val();
	loadSettings(setting_name);
});

document.addEventListener('DOMContentLoaded', restoreOptions);

var labels = browser.storage.sync.get('labels');
labels.then((res) => {
	if(res.labels == null){
		var labels = browser.storage.sync.get('labels');
		labels.then((res) => {
			var labellist = [];
			$('.labelButton').each(function(i, obj) {
				labellist.push(obj.id)
				$(this).addClass("selected");
			});
			browser.storage.sync.set({
				labels: labellist
			}).then(function(){
				updateOptionsContentScript();
			});
		});
	}
});

var censor_type = browser.storage.sync.get('censor_type');
censor_type.then((res) => {
	if(res.censor_type == null){
		browser.storage.sync.set({
			censor_type: 'black'
		}).then(function(){
			updateOptionsContentScript();
		});
	}
});

