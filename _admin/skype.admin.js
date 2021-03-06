var timers = {};
jQuery(document).ready(function(){
	jQuery( "#sortable" ).sortable({
		placeholder: "ui-state-highlight"
	});
	jQuery( "#sortable" ).disableSelection();

	jQuery("#skype_cancel").click(function(e){
		e.preventDefault();
		window.location.reload();
	});

	jQuery("#skype_settings #skype_save").click(function(e){
		e.preventDefault();
		var find = "table tbody";
		var set_name = e.target.className.split(" ")[1];
		var _data = {};
		switch(set_name){
			case '_attr':
				_data[set_name] = {};
				break;
			case '_prio':
				find = "#sortable";
			case '_rules':
			default:
				_data[set_name] = [];
				break;
		}
		var form = jQuery("form#skype_settings "+find);
		jQuery.each(jQuery(form)[0].children, function(a, b){
			var value = false, name = false;
			field = b.children[1].children[0];
			if(field.type === 'text' && field.value.length < 1){
				value = "false";
			}
			if(field.type === 'checkbox'){
				value = (field.checked) ? '1' : '0';
			}
			if(field.tagName.toLowerCase() === 'select'){
				value = field.options[field.selectedIndex].value;
			}
			switch(set_name){
				case '_attr':
					name = (name) ? name : field.name;
					break;
				case '_rules':
				case '_prio':
				default:
					name = a;
					break;
			}
			value = (value) ? value : field.value;
			_data[set_name][name] = value;
			name = value = null;
		});
		// console.log(_data);
		do_ajax(_data);
	});
});

function do_ajax(values){
	jQuery.ajax({
		type:"POST",
		url:"/wp-content/plugins/WPSkypeStatus/_admin/skype.ajax.php",
		data:{skype_set:null, data:values},
		error:function(req, status, err){
			// console.log(status+": ", req);
			show_message("An error ("+err+") occurred when trying to save your changes.", "error", false);
		},
		success:function(data, status, req){
			data = JSON.parse(data);
			var _message = "Settings saved with %d rows updated.", _type = "updated";
			for(var i = 0; i < data.length; i++){
				if(data[i] === false || data[i] === 'false'){
					// console.log(status+": ", req);
					_message = "An error occurred while trying to update the database.";
					_type = "error";
				} else {
					_message = _message.replace('%d', data[i]);
				}
				show_message(_message, _type);
			}
			_message = _type = null;
		}
	});
}

function show_message(message, type, close){
	close = (typeof close === "undefined");
	type = (type.toLowerCase() === 'updated' || type.toLowerCase() === 'error') ? type : "updated";
	_id = "message_"+Math.floor((Math.random()*100000)+1);
	while(jQuery(_id).length > 0){
		_id = "message_"+Math.floor((Math.random()*100000)+1);
	}
	jQuery("#ajax-response").append("<div id='"+_id+"' class='"+type+" fade'><p>"+message+"</p></div>");
	if(close){
		timers[_id] = setTimeout(function(){
			close_message(_id);
		}, 5000);
	}
}

function close_message(id){
	jQuery("#"+id).hide(
		400,
		function(){
			jQuery("#"+id).remove();
			clearTimeout(timers[id]);
			delete timers[id];
		}
	);
}