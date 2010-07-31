(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Request.Type for Mootools 2',

Configuration.presets = [
	{
		version: '2',
		path: '../',
		specs: ['2client']
	}
];

Configuration.sets = {

	'2client': [
		'Request/Request.Type',
	]

};

Configuration.source = {

	'2': {
		'client': [
			'Mootools-1.3dev', 'Request.Type',
		]
	}

};

})(typeof exports != 'undefined' ? exports : this);
