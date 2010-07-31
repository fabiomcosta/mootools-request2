/*
---

name: Request.Type

description: Extends the basic Request Class with additional methods for interacting with any type of response.

license: MIT-style license.

requires: [Element, Request]

provides: Request.Type

...
*/

Request = new Class({
	Extends: Request,
	send: function(options){
		if (!this.check(options)) return this;

		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.running = true;

		var type = typeOf(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = Object.append({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = String(options.url), method = options.method.toLowerCase();

		switch (typeOf(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Object.toQueryString(data);
		}

		if (this.options.format){
			var format = 'format=' + this.options.format;
			data = (data) ? format + '&' + data : format;
		}

		//if (this.options.emulation && !['get', 'post'].contains(method)){
		// why the emulation option?
		if (!['get', 'post'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
		}

		if (this.options.noCache){
			var noCache = 'noCache=' + new Date().getTime();
			data = (data) ? noCache + '&' + data : noCache;
		}

		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		if (data && method == 'get'){
			url = url + (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		this.xhr.open(method.toUpperCase(), url, this.options.async);

		this.xhr.onreadystatechange = this.onStateChange.bind(this);

		// firing an exception with a meaninful error message
		var exception = Request.exception.SET_REQUEST_HEADER;
		Object.each(this.headers, function(value, key){
			try {
				this.xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [exception.status, exception.message.substitue([key, value])]);
			}
		}, this);

		this.fireEvent('request');
		this.xhr.send(data);
		if (!this.options.async) this.onStateChange();
		return this;
	}
});

Request.extend({
	exception: {
		SET_REQUEST_HEADER: {
			status: 1,
			message: 'Error while setting the Request Header {0} => {1}'
		},
		XML_PARSING: {
			status: 2,
			message: 'Error while parsing the XML response: {0}'
		},
		JSON_PARSING: {
			status: 3,
			message: 'Error while parsing the JSON response'
		}
	}
});

Request.Type = new Class({

	Extends: Request,
/*
	onRequest: nil,
	onComplete: nil,
	onCancel: nil,
	onSuccess: nil,
	onFailure: nil,
	onException: nil,
	url: '',
	data: '',
	headers: {
		'X-Requested-With': 'XMLHttpRequest'
	},
	async: true,
	format: false,
	method: 'post',
	link: 'ignore',
	isSuccess: null,
	emulation: true,
	urlEncoded: true,
	encoding: 'utf-8',
	evalScripts: false,
	evalResponse: false,
	noCache: false
*/

	options: {
		type: null // 'javascript' or 'json' or 'xml' or 'html' or falsy value for autodetection
	},
	
	initialize: function(options){
		this.parent(options);
		var requestType = this.$constructor;
		this.headers.Accept = requestType.contentTypes[this.options.type || '*/*'];
		this.responseProcessor = requestType.responseProcessors[this.options.type];
	},
	
	success: function(text, xml){
		var requestType = this.$constructor, responseProcessor = this.responseProcessor;
		if (!responseProcessor){
			responseProcessor = requestType.responseProcessors[requestType.contentTypes[this.getHeader('Content-Type')]];
		} 
		if (responseProcessor){
			responseProcessor.call(this, text, xml);
		} else {
			this.onSuccess(text, xml);
		}
	}
	
}).extend({
	
	responseProcessors: {},
	contentTypes: {},
	acceptHeaders: {},
	
	addResponseProcessor: function(type, contentTypes, responseProcessor){
		contentTypes = Array.from(contentTypes);
		for (var i = contentTypes.length; i--;) this.contentTypes[contentTypes[i]] = type;
		this.acceptHeaders[type] = contentTypes.join(', ');
		this.responseProcessors[type] = responseProcessor;
		return this;
	}
	
});

Request.Type.addResponseProcessor('json', ['application/json', 'text/javascript'], function(text){


	var secure = this.options.secure;
	var json = this.response.json = Function.attempt(function(){
		return JSON.decode(text, secure);
	});
	if (json == null){
		var exception = Request.exception.JSON_PARSING;
		this.fireEvent('exception', [exception.status, exception.message]);
	}
	this.onSuccess(json, text);


}).addResponseProcessor('xml', ['text/xml', 'application/xml'], function(text, xml){


	if (xml){
		var root = xml.documentElement, parseError = xml.parseError;
		var errorMsg = (root && root.nodeName == 'parsererror') ? root.textContent :
			(parseError && parseError.reason) ? parseError.reason : '';
		if (!root || errorMsg){
			var exception = Request.exception.XML_PARSING;
			this.fireEvent('exception', [exception.status, exception.message.substitute([errorMsg])]);
			xml = null;
		}
	}
	this.onSuccess(xml, text);


}).addResponseProcessor('html', ['text/html'], function(text){
	
	
	var options = this.options, response = this.response;

	response.html = text.stripScripts(function(script){
		response.javascript = script;
	}); 

	var match = response.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	if (match) response.html = match[1];
	
	var temp = new Element('div').set('html', response.html);
	response.tree = temp.childNodes;
	response.elements = temp.getElements('*');

	if (options.filter) response.tree = response.elements.filter(options.filter);
	if (options.update) document.id(options.update).empty().set('html', response.html);
	else if (options.append) document.id(options.append).adopt(temp.getChildren());
	if (options.evalScripts) Browser.exec(response.javascript);

	this.onSuccess(response.tree, response.elements, response.html, response.javascript);

	
}).addResponseProcessor('script', ['text/javascript', 'application/javascript'], function(text){
	
	// no need for evalResponse anymore
	Browser.exec(text);
	this.onSuccess(text);
	
});

