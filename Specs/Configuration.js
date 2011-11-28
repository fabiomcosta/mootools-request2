(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Request for Mootools 1.5';

Configuration.defaultPresets = {
	browser: 'core-1.4',
	nodejs: 'core-1.4',
	jstd: 'core-1.4'
};

Configuration.presets = {
	'core-1.4': {
		sets: ['core-1.4'],
		source: ['core-1.4']
	}
};

Configuration.sets = {
	'core-1.4': {
		path: '2client/',
		files: [
			'Request/Request'
		]
	}
};

Configuration.source = {
	'core-1.4': {
		'path': '../Source/',
		'files': [
			'Mootools-1.3dev', 'Elements.From', 'Request',
		]
	}
};

})(typeof exports != 'undefined' ? exports : this);
