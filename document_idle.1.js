//
//	Simplest example
//		Passing a string as the contents parameter will pass the string contents to the XSL document with the "body" key.
//
chrome.custom.transformer.transform(document, "<h1>Body Content</h1>");



//
//	Using a content map
//		The content map key names must match the parameters of the XSL document.
//		At the time of writing, the default embedded XSL document accepts "head" and "body".
//
//chrome.custom.transformer.transform(document, {"head" : "<script>alert(\'head content');</script>", "body" : "<h1>Body Content</h1>"});



//
//	Using a content callback
//		The callback's response is subject to the same behavior as explicitly passing a string or a map.
//
//chrome.custom.transformer.transform(document, function(targetDocument){ return {"body": "<h1>Body Callback Content</h1>"}; });



//
//	Using a custom XSL file embedded in the extension
//
/*
chrome.extension.sendRequest({"name": "chrome.custom.transformer.getLocalResourceContent", "path": 'optional_template.xsl'}, 
	function(response){
		chrome.custom.transformer.transform(document, {"body" : "<h1>Body Content</h1>"}, response.content);
	});
*/

