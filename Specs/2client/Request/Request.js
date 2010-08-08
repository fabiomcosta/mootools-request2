/*
Script: Request.js
	Public Specs for Request.js 1.3|2.0

License:
	Mit-style license.
*/

describe('Request', function(){

	beforeEach(function(){
		this.spy = jasmine.createSpy();
	});

	it('should call an ajax request with the url of the page and throw no error if no url is defined', function(){
		
		var request = this.request = new Request({
			onComplete: this.spy
		});
		expect(function(){
			request.send({data: {
				'__response': '<root><node>value</node></root>', '__type': 'xml'
			}});
		}).not.toThrow('Component returned failure code: 0x80070057 (NS_ERROR_ILLEGAL_VALUE) [nsIXMLHttpRequest.open]');
		
	});

	it('should create an ajax request with the response forced to be of type text', function(){
		
		var responseText = 'response';
		
		runs(function(){
			this.request = new Request({
				type: 'text',
				url: '../Helpers/request.php',
				onComplete: this.spy
			}).send({data: {
				'__response': responseText, '__type': 'text'
			}});
		});
		
		waitsFor(800, function(){
			return this.spy.wasCalled;
		});
		
		runs(function(){
			expect(this.spy).toHaveBeenCalledWith(responseText, this.request.response.xml);
		});
		
	});
	
	
	
	
	describe('html type', function(){
	
		it('should create an ajax request and detect the correct type of the response (html)', function(){

			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					onComplete: this.spy
				}).send({data: {
					'__response': '<body><div></div></body>', '__type': 'html'
				}});
			});

			waitsFor(800, function(){
				return this.spy.wasCalled;
			});

			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.tree, response.html, response.javascript);
			});

		});
		
		
		it('should create an ajax request and correctly generate the tree response from a tr', function(){

			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					onComplete: this.spy
				}).send({data: {
					'__response': '<tr><td>text</td></tr>', '__type': 'html'
				}});
			});

			waitsFor(800, function(){
				return this.spy.wasCalled;
			});

			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.tree, response.html, response.javascript);
				
				var tr = response.tree[0], td = tr.firstChild;
				expect(tr.tagName).toEqual('TR');
				expect(td.tagName).toEqual('TD');
				expect(td.innerHTML).toEqual('text');
			});

		});
		
		it('should create an ajax request and correctly generate the tree response from options', function(){

			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					onComplete: this.spy
				}).send({data: {
					'__response': '<option>1</option><option>2</option><option>3</option>', '__type': 'html'
				}});
			});

			waitsFor(800, function(){
				return this.spy.wasCalled;
			});

			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.tree, response.html, response.javascript);
				
				expect(response.tree.length).toEqual(3);
				var option = response.tree[0];
				expect(option.tagName).toEqual('OPTION');
				expect(option.innerHTML).toEqual('1');
			});

		});
		
	});
	
	
	
	
	describe('json type', function(){
	
		it('should create an ajax request and detect the correct type of the response (json)', function(){

			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					onComplete: this.spy
				}).send({data: {
					'__response': '{"some": "json"}', '__type': 'json'
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				expect(this.spy).toHaveBeenCalledWith({'some': 'json'}, '{"some": "json"}');
			});
		
		});
	
		it('should return a json object independently of the mime type of the response', function(){
		
			var responseText = '{"json": "obj"}';
		
			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					type: 'json',
					onComplete: this.spy
				}).send({data: {
					'__response': responseText, '__type': 'xml'
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.json, responseText);
			});
		
		});
	
		it('should fire an exception event because the json is invalid', function(){
		
			this.exception = jasmine.createSpy();
			var responseText = "{invalid: json}"; // invalid json object
		
			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					onComplete: this.spy,
					onException: this.exception
				}).send({data: {
					'__response': responseText, '__type': 'json'
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.json, responseText);
				expect(response.json).toEqual(null);
				expect(this.exception).toHaveBeenCalled();
			});
		
		});
		
	});
	
	
	
	
	describe('script type', function(){
		
		it('should create an ajax request and detect the correct type of the response (script)', function(){

			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					onComplete: this.spy
				}).send({data: {
					'__response': 'var __global__var__ = 10;', '__type': 'script'
				}});
			});

			waitsFor(800, function(){
				return this.spy.wasCalled;
			});

			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith('var __global__var__ = 10;');
				expect(__global__var__).toEqual(10);
			});

		});
		
	});
	
	
	
	
	describe('xml type', function(){
	
		it('should create an ajax request and detect the correct type of the response (xml)', function(){
		
			var responseText = '<root><node>value</node></root>';
		
			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					onComplete: this.spy
				}).send({data: {
					'__response': responseText, '__type': 'xml'
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.xml, responseText);
			});
		
		});
	
		it('should return a xml document independently of the mime type of the response, twice to test parseXML', function(){
		
			var responseText = '<root><node>value</node></root>';
		
			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					type: 'xml',
					onComplete: this.spy
				}).send({data: {
					'__response': responseText, '__type': 'json'
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.xml, responseText);
				expect(response.xml.documentElement.nodeName).toEqual('root');
			
				responseText = '<root1><node>value</node></root1>';
				this.request.send({data: {
					'__response': responseText, '__type': 'html'
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.callCount == 2;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.xml, responseText);
				expect(response.xml.documentElement.nodeName).toEqual('root1');
			});
		
		});
	
		it('should fire an exception event because the xml is invalid', function(){
		
			this.exception = jasmine.createSpy();
			var responseText = '<root><node>value</node></root><root1></root1>'; // invalid xml (2 root nodes)
		
			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					onComplete: this.spy,
					onException: this.exception
				}).send({data: {
					'__response': responseText, '__type': 'xml'
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(response.xml, responseText);
				expect(response.xml).toEqual(null);
				expect(this.exception).toHaveBeenCalled();
			});
		
		});
	
	});
	
	
	
	
	describe('link option', function(){
	
		it('should create an ajax request and chain the other calls', function(){
		
			var responseText = 'response chain';
			
			runs(function(){
				var self = this;
				this.request = new Request({
					url: '../Helpers/request.php',
					link: 'chain',
					onComplete: this.spy,
					onSuccess: this.spy
				}).send({data: {
					'__type': 'text', '__response': responseText
				}}).send({data: {
					'__type': 'text', '__response': responseText + 1
				}}).chain(this.spy);
			});
		
			waitsFor(800, function(){
				return this.spy.callCount == 5;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy.calls[0].args).toEqual([responseText, null]); // first complete call
				expect(this.spy.calls[1].args).toEqual([responseText, null]); // first success call
				expect(this.spy.calls[2].args).toEqual([responseText + 1, null]); // second complete call
				expect(this.spy.calls[3].args).toEqual([responseText + 1, null]); // second success call
				expect(this.spy).toHaveBeenCalledWith(); // chained call
				expect(response.text).toEqual(responseText + 1);
			});
		
		});

		it('should create an ajax request canceling the current runing one', function(){
		
			var responseText = 'response';
		
			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					link: 'cancel',
					onComplete: this.spy
				}).send({data: {
					'__sleep': 0.2, '__type': 'text', '__response': responseText
				}}).send({data: {
					'__sleep': 0.2, '__type': 'text', '__response': responseText + 1
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(responseText + 1, null);
			});
		
		});
		
		it('should create an ajax request ignoring the others that are called while theres one running', function(){
		
			var responseText = 'response';
		
			runs(function(){
				this.request = new Request({
					url: '../Helpers/request.php',
					link: 'ignore',
					onComplete: this.spy
				}).send({data: {
					'__sleep': 0.2, '__type': 'text', '__response': responseText
				}}).send({data: {
					'__sleep': 0.2, '__type': 'text', '__response': responseText + 1
				}});
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				var response = this.request.response;
				expect(this.spy).toHaveBeenCalledWith(responseText, null);
			});
		
		});
		
	});
	
	
	
	
	describe('data option', function(){
		
		it('should send the data from a form element', function(){
			
			var form = new Element('form', {
				'action': '',
				'html': '<input name="input" value="input-value" /><input name="__type" value="text" />'
			});
			
			runs(function(){
				this.request = new Request({
					method: 'post',
					url: '../Helpers/request.php',
					data: form,
					onComplete: this.spy
				}).send();
			});
		
			waitsFor(800, function(){
				return this.spy.wasCalled;
			});
		
			runs(function(){
				expect(this.spy).toHaveBeenCalledWith('{"method":"post","post":{"input":"input-value"}}', null);
			});
			
		});
		
	});
	

});