MooTools Request proposal for moo2
==================================

NOTE: THIS IS JUST A PROPOSAL, DOESN'T MEAN IT WILL BE IN MOOTOOLS 2.0.

This is a proposal for a simpler to use Request Class for [MooTools.net](http://mootools.net "MooTools").

The idea is to create a class and add response processors to it.
Each response type will have an associated response processor.
The response type is associated with the mimetype of the response. Each response type will be associated with as much mimetypes as needed.
The developer will be able to force a type, bypassing the mimetype check.
It should throw an error event that should get any error that happens with the requests.
It should be as simple and flexible, which means less options and more event/hooks.

Advantages
==========

* The developer will be able to control how the response is processed by the mimetype of the response. With the same code he will be able to send xml, json, text or html responses, and act differently for each of these types;
* It will be possible to define the type of request/response on the simplified methods (send and load for instance).

Todo
====

* implement the timeout functionality
* implement the appendData option on the send method
* improve the extensibility of the url generation (generate on a separate method, other than send)