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

var baseMethods = {'get': 1, 'post': 1};

var Request = global.Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: ,
		onComplete: ,
		onCancel: ,
		onSuccess: ,
		onFailure: ,
		onException: ,*/
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
		encoding: 'UTF-8',


		// this option shoudnt be a boolean because sometimes you need the scripts to be evaluated after
		// you do some manipulation with the response.tree of response.html. The evaluation can be done
		// 'after' or 'before' the onsuccess event. true will evaluate before for compatibility
		// or maybe this options should just be remove for simplicity.
		evalScripts: false,

		noCache: false,

		filter: '>', // children elements
		appendData: '', // TODO
		timeout: false, // TODO
		type: null // 'script' or 'json' or 'xml' or 'html' or falsy value for autodetection

	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.setOptions(options);
		this.headers = this.options.headers;
	},

	onStateChange: function(){
		if (this.xhr.readyState != 4 || !this.running) return;
		this.running = false;
		try {
			this.status = this.xhr.status;
		} catch(e){
			this.status = 0;
		}
		this.xhr.onreadystatechange = null;
		if (this.options.isSuccess.call(this, this.status)){
			this.response = {text: (this.xhr.responseText || ''), xml: this.xhr.responseXML};
			this.success(this.response.text, this.response.xml);
		} else {
			this.response = {text: null, xml: null};
			this.failure();
		}
	},

	success: function(text, xml){
		var requestClass = this.$constructor, responseProcessor = this.responseProcessor;
		responseProcessor = requestClass.responseProcessors[this.options.type || requestClass.contentTypes[this.getHeader('Content-Type')]];

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
		try {
			return this.xhr.getResponseHeader(name);
		} catch(e){};
		return null;
	},

	check: function(options){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, options)); return false;
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
		var data = options.data, url = '' + options.url, method = options.method.toLowerCase();

		switch (typeOf(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': data = Object.toQueryString(data);
		}

		// whats this?
		//if (this.options.format){
		//	var format = 'format=' + this.options.format;
		//	data = (data) ? format + '&' + data : format;
		//}

		//if (this.options.emulation && !['get', 'post'].contains(method)){
		// why the emulation option?
		//if (!baseMethods[method]){
		//	var _method = '_method=' + method;
		//	data = (data) ? _method + '&' + data : _method;
		//	method = 'post';
		//}

		if (this.options.urlEncoded && method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.setHeader('Content-Type', 'application/x-www-form-urlencoded' + encoding);
		}

		if (this.options.noCache){
			var noCache = 'noCache=' + new Date().getTime();
			data = (data) ? noCache + '&' + data : noCache;
		}

		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		// http://www.w3.org/TR/XMLHttpRequest/#the-send-method
		if (data && (method == 'get' || method == 'head')){
			url = url + (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		this.setHeader('Accept', this.$constructor.acceptHeaders[this.options.type] || '*/*');

		return this.openRequest(method, url, data);
	},

	openRequest: function(method, url, data){
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
		this.xhr.onreadystatechange = null;
		this.xhr = new Browser.Request();
		this.fireEvent('cancel');
		return this;
	},

	parseXML: (function(){

		if (global.DOMParser){
			var domParser = new DOMParser();
			return function(text){
				return domParser.parseFromString(text, 'text/xml');
			};
		}

		var xml = Function.attempt(function(){
			return new ActiveXObject('MSXML2.DOMDocument');
		}, function(){
			return new ActiveXObject('Microsoft.XMLDOM');
		});
		if (xml) xml.async = 'false';

		return function(text){
			if (xml){
				xml.loadXML(text);
				return xml;
			}
			return null;
		};
	})()

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
			message: 'Error while parsing the JSON response: {0}'
		}
	},

	responseProcessors: {},
	contentTypes: {},
	acceptHeaders: {},

	defineResponseType: function(type, options){
		contentTypes = Array.from(options.contentTypes);
		for (var i = contentTypes.length; i--;) this.contentTypes[contentTypes[i]] = type;
		this.acceptHeaders[type] = contentTypes.join(', ') + ', */*';
		this.responseProcessors[type] = options.processor;
		return this;
	}

}).defineResponseType('json', {

	contentTypes: 'application/json',
	processor: function(text){

		var secure = this.options.secure, json;
		try {
			json = this.response.json = JSON.decode(text, secure);
		} catch (e){
			var exception = this.$constructor.exception.JSON_PARSING;
			this.fireEvent('exception', [exception.status, exception.message.substitute([e || ''])]);
		}
		this.onSuccess(json, text);

	}

}).defineResponseType('xml', {

	contentTypes: ['text/xml', 'application/xml'],
	processor: function(text, xml){

		var root = xml && xml.documentElement;
		if (!xml || !root){
			xml = this.parseXML(text);
			root = xml && xml.documentElement;
		}

		if (xml){
			var parseError = xml.parseError;
			var firstChild = root && root.firstChild;
			var errorMsg = (root && root.nodeName == 'parsererror' || firstChild && firstChild.nodeName == 'parsererror') ? root.textContent :
				(parseError && parseError.reason) ? parseError.reason : '';
			if (!root || errorMsg){
				var exception = this.$constructor.exception.XML_PARSING;
				this.fireEvent('exception', [exception.status, exception.message.substitute([errorMsg])]);
				xml = null;
			}
		}

		this.response.xml = xml;
		this.onSuccess(xml, text);

	}

}).defineResponseType('html', {

	contentTypes: ['text/html', 'application/html'],
	processor: function(text){

		var options = this.options, response = this.response;

		response.html = text.stripScripts(function(script){
			response.javascript = script;
		});

		var match = response.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		if (match) response.html = match[1];

		response.tree = Elements.from(response.html, true, options.filter);

		var evalScripts = options.evalScripts;
		if (evalScripts === true || evalScripts == 'before') Browser.exec(response.javascript);

		this.onSuccess(response.tree, response.html, response.javascript);

		if (evalScripts == 'after') Browser.exec(response.javascript);

	}

}).defineResponseType('script', {

	contentTypes: ['text/javascript', 'application/javascript', 'application/x-javascript'],
	processor: function(text){

		// no need for evalResponse anymore
		Browser.exec(text);
		this.onSuccess(text);

	}

});


})(window || this, document);
