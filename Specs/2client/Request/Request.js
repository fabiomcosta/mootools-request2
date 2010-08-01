/*
Script: Request.js
	Public Specs for Request.js 1.3|2.0

License:
	MIT-style license.
*/

describe('Request', function(){

	beforeEach(function(){
		this.spy = jasmine.createSpy();
	});

	it('should create an ajax request with the response forced to be of type text', function(){

		runs(function(){
			this.request = new Request({
				type: 'text',
				url: '../Helpers/request.php',
				onComplete: this.spy
			}).send({data: {
				'__response': 'response', '__type': 'text'
			}});
		});
		
		waitsFor(800, function(){
			return this.spy.wasCalled;
		});
		
		runs(function(){
			expect(this.spy).toHaveBeenCalledWith('response', null);
		});
		
	});
	
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