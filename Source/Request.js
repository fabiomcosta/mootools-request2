/*
---

name: Request

description: Powerful all purpose Request Class. Uses XMLHTTPRequest.

license: MIT-style license.

requires: [Object, Element, Chain, Events, Options, Browser]

provides: Request

...
*/

(function(global, document){


var Request = global.Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: nil,
		onComplete: nil,
		onCancel: nil,
		onSuccess: nil,
		onFailure: nil,
		onException: nil,*/
		isSuccess: function(){
			return ((this.status >= 200) && (this.status < 300));
		},
		url: location.href,
		data: '',
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		},
		async: true,
		method: 'post',
		link: 'ignore',
		urlEncoded: true,
		encoding: 'utf-8',
		evalScripts: false,
		noCache: false,
		
		filter: '>', // children elements
		appendData: '',
		timeout: false,
		type: null // 'script' or 'json' or 'xml' or 'html' or falsy value for autodetection
	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.setOptions(options);
		var requestType = this.$constructor;
		this.headers = this.options.headers;
		this.headers.Accept = requestType.acceptHeaders[this.options.type || '*/*'];
		this.responseProcessor = requestType.responseProcessors[this.options.type];
	},

	onStateChange: function(){
		if (this.xhr.readyState != 4 || !this.running) return;
		this.running = false;
		this.status = 0;
		Function.attempt(function(){
			this.status = this.xhr.status;
		}.bind(this));
		this.xhr.onreadystatechange = function(){};
		if (this.options.isSuccess.call(this, this.status)){
			this.response = {text: (this.xhr.responseText || ''), xml: this.xhr.responseXML};
			this.success(this.response.text, this.response.xml);
		} else {
			this.response = {text: null, xml: null};
			this.failure();
		}
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
	},

	onSuccess: function(){
		this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
	},

	failure: function(){
		this.onFailure();
	},

	onFailure: function(){
		this.fireEvent('complete').fireEvent('failure', this.xhr);
	},

	setHeader: function(name, value){
		this.headers[name] = value;
		return this;
	},

	getHeader: function(name){
		return Function.attempt(function(){
			return this.xhr.getResponseHeader(name);
		}.bind(this));
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	send: function(options){
		if (!this.check(options)) return this;

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

		// whats this?
		//if (this.options.format){
		//	var format = 'format=' + this.options.format;
		//	data = (data) ? format + '&' + data : format;
		//}

		//if (this.options.emulation && !['get', 'post'].contains(method)){
		// why the emulation option?
		if (!['get', 'post'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers['Content-Type'] = 'application/x-www-form-urlencoded' + encoding;
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
		var exception = this.$constructor.exception.SET_REQUEST_HEADER;
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
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.xhr.abort();
		this.xhr.onreadystatechange = function(){};
		this.xhr = new Browser.Request();
		this.fireEvent('cancel');
		return this;
	}

}).extend({

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
	},

	responseProcessors: {},
	contentTypes: {},
	acceptHeaders: {},
	
	defineResponseProcessor: function(type, contentTypes, responseProcessor){
		contentTypes = Array.from(contentTypes);
		for (var i = contentTypes.length; i--;) this.contentTypes[contentTypes[i]] = type;
		this.acceptHeaders[type] = contentTypes.join(', ');
		this.responseProcessors[type] = responseProcessor;
		return this;
	}
	
}).defineResponseProcessor('json', ['application/json', 'text/javascript'], function(text){


	var secure = this.options.secure;
	var json = this.response.json = Function.attempt(function(){
		return JSON.decode(text, secure);
	});
	if (json == null){
		// TODO, use a try catch to get the error message from the parsed JSON to give a better feedback
		var exception = this.$constructor.exception.JSON_PARSING;
		this.fireEvent('exception', [exception.status, exception.message]);
	}
	this.onSuccess(json, text);


}).defineResponseProcessor('xml', ['text/xml', 'application/xml'], function(text, xml){


	if (xml){
		var root = xml.documentElement, parseError = xml.parseError;
		var errorMsg = (root && root.nodeName == 'parsererror') ? root.textContent :
			(parseError && parseError.reason) ? parseError.reason : '';
		if (!root || errorMsg){
			var exception = this.$constructor.exception.XML_PARSING;
			this.fireEvent('exception', [exception.status, exception.message.substitute([errorMsg])]);
			xml = null;
		}
	}
	this.onSuccess(xml, text);


}).defineResponseProcessor('html', ['text/html'], function(text){
	
	
	var options = this.options, response = this.response;

	response.html = text.stripScripts(function(script){
		response.javascript = script;
	}); 

	var match = response.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	if (match) response.html = match[1];
	
	// TODO, should work with table and option responses (tbody, td, tr, option ....)
	var temp = new Element('div').set('html', response.html);
	response.tree = temp.getElements(options.filter);

	if (options.evalScripts) Browser.exec(response.javascript);

	this.onSuccess(response.tree, response.html, response.javascript);

	
}).defineResponseProcessor('script', ['text/javascript', 'application/javascript'], function(text){
	
	// no need for evalResponse anymore
	Browser.exec(text);
	this.onSuccess(text);
	
});


})(window || this, document);