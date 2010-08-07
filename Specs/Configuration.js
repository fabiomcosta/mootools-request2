(function(context){

var Configuration = context.Configuration = {};

Configuration.name = 'Request for Mootools 2',

Configuration.presets = [
	{
		version: '2',
		path: '../',
		specs: ['2client']
	}
];

Configuration.sets = {

	'2client': [
		'Request/Request'
	]

};

Configuration.source = {

	'2': {
		'client': [
			'Mootools-1.3dev', 'Elements.From', 'Request',
		]
	}

};

})(typeof exports != 'undefined' ? exports : this);
