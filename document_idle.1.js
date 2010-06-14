chrome.extension.sendRequest({"name": "chrome.custom.transformer.getLocalResourceContent", "path": 'template.xsl'}, 
	function(response){
		chrome.custom.transformer.transform(document, response.content, "<!-- head -->", "<h1>Body2</h1>");
	}
);
