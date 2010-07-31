/*
---

name: Request.Type

description: Extends the basic Request Class with additional methods for interacting with any type of response.

license: MIT-style license.

requires: [Element, Request]

provides: Request.Type

...
*/

Request.Type = new Class({

	Extends: Request,

	options: {
		type: 'text'
	}

});