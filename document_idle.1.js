chrome.extension.sendRequest({"name": "chrome.custom.transformer.getLocalResourceContent", "path": 'template.xsl'}, 
	function(response){
		chrome.custom.transformer.transform(document, response.content, "<script>alert(\'head content');</script>", "<h1>Body Content</h1>");
	}
);
