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
//	Using a custom XSL file embedded in the extension
//
/*
chrome.extension.sendRequest({"name": "chrome.custom.transformer.getLocalResourceContent", "path": 'template.xsl'}, 
	function(response){
		chrome.custom.transformer.transform(document, {"body" : "<h1>Body Content</h1>"}, response.content);
	});
*/

