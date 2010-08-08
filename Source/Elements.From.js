/*
---

script: Elements.From.js

description: Returns a collection of elements from a string of html.

license: MIT-style license

requires: [Element]

provides: [Elements.from]

...
*/

(function(){
	
	var reFirstTag = /\s*<([^\s>]+)/;
	var divContainer = new Element('div');
	var translations = {
		option: [1, '<select multiple="multiple">', '</select>'],
		tbody: [1, '<table>', '</table>'],
		tr: [2, '<table><tbody>', '</tbody></table>'],
		td: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.th = translations.td;
	translations.optgroup = translations.option;
	translations.thead = translations.tfoot = translations.tbody;
	
	Elements.extend('from', function(text, excludeScripts, filter){
		if (excludeScripts === false) text = text.stripScripts();
	
		var match = text.match(reFirstTag),
			firstTagTranslation = translations[match ? match[1].toLowerCase() : ''],
			container = divContainer;

		if (firstTagTranslation){
			container.set('html', firstTagTranslation[1] + text + firstTagTranslation[2]);
			for (var i = firstTagTranslation[0]; i--;) container = container.firstChild;
			container = $(container);
		} else {
			container.set('html', text);
		}
	
		return container.getElements(filter || '>');
	});

})();