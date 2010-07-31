/*
Script: Request.Type.js
	Public Specs for Request.Type.js 1.3|2.0

License:
	MIT-style license.
*/

describe('Request', function(){

	it('should create an ajax request', function(){

		runs(function(){
			this.onComplete = jasmine.createSpy();
			this.request = new Request({
				url: '../Helpers/request.php',
				onComplete: this.onComplete
			}).send({data: {
				'__response': 'response'
			}});
		});
		
		waitsFor(800, function(){
			return this.onComplete.wasCalled;
		});
		
		runs(function(){
			expect(this.onComplete).toHaveBeenCalledWith('response', null);
		});
		
	});

});