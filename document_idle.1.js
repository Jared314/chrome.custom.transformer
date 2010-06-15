/*
 * Replace Example
 */

//
//	Simplest example
//		Passing a string as the content parameter will pass the string as the iframe overlay contents.
//
//chrome.custom.transformer.replace(document, "<html><body><h1>Replace Content</h1></body></html>");


//
//	Using a content callback
//		The callback's response, a string, is subject to the same behavior as explicitly passing a string.
//
//chrome.custom.transformer.replace(document, function(targetDocument){ return "<html><body><h1>Replace Callback Content</h1></body></html>"; });



/*
 * Transform Examples
 */
 
//
//	Simplest example
//		Passing a string as the contents parameter will pass the string contents to the XSL document with the "body" key.
//
//chrome.custom.transformer.transform(document, "<h1>Transform Body Content</h1>");


//
//	Using a content map
//		The content map key names must match the parameters of the XSL document.
//		At the time of writing, the default embedded XSL document accepts "head" and "body".
//
//chrome.custom.transformer.transform(document, {"head" : "<script>alert(\'Transform Head Map Content');</script>", "body" : "<h1>Transform Body Map Content</h1>"});


//
//	Using a content callback
//		The callback's response is subject to the same behavior as explicitly passing a string or a map.
//
//chrome.custom.transformer.transform(document, function(targetDocument){ return {"body": "<h1>Transform Body Callback Content</h1>"}; });


//
//	Using a custom XSL file embedded in the extension
//		The getLocalResourceContent method *requires* a Background Page and the inclusion of chrome.custom.transformer.js in said Background Page.
//
/*
chrome.custom.transformer.getLocalResourceContent("optional_template.xsl", 
	function(response){
		chrome.custom.transformer.transform(document, {"body" : "<h1>Transform Body Custom XSL File Content</h1>"}, response.content);
	});
*/
