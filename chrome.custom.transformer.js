if(!chrome.custom) chrome.custom = {};

(function(){

XSLTProcessor.prototype.setParameterMap = function(namespace, parameterMap){
	for (var key in parameterMap)
		if(typeof parameterMap[key] == "string")
			this.setParameter(namespace, key, parameterMap[key]);
};

String.prototype.toDOM = function(){
	return new DOMParser().parseFromString(this, "text/xml");
};

chrome.custom.transformer = {
	"isBackgroundPage" : function(targetWindow){
		var w = targetWindow;
		if(w == null) w = window;
		
		var result = false;
		try{
			var b = chrome.extension.getBackgroundPage();
			result = (b === w);
		}catch(e){
			//Consume error
		}
		return result;
	},
	
	// 
	// Should only be called from a Background Page
	//
	"getLocalResourceContentInternal" : function(url, completeCallback) {
		
		//Localize the url
		url = chrome.extension.getURL(url);
	
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
		  	completeCallback(xhr.responseText, xhr.readyState, xhr.status);
		  }
		}
		xhr.send();
		
		return true;
	},
	
	"getLocalResourceContent" : function(url, completeCallback) {
		if(!this.isBackgroundPage()){
			//Call into background page and execute this method again.
			chrome.extension.sendRequest(
				{"name": "chrome.custom.transformer.getLocalResourceContent", "path": url}, 
				completeCallback
				);
			return true;
		}
		
		return this.getLocalResourceContentInternal(url, completeCallback);
	},
	
	// 
	// template.xsl
	// Embedded XSL Document to remove a dependency on another file.
	//
	"defaultXslDocumentContent" : '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:libxslt="http://xmlsoft.org/XSLT/namespace"><xsl:output method="html" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" indent="no"/><xsl:param name="head"/><xsl:param name="body"/><xsl:template match="/"><html xmlns="http://www.w3.org/1999/xhtml"><head><xsl:value-of select="$head" disable-output-escaping="yes"/></head><body><xsl:value-of select="$body" disable-output-escaping="yes"/></body></html></xsl:template></xsl:stylesheet>',
	
	"transformInternal" : function(targetDocument, contentMap, xslDocument){
		var processor = new XSLTProcessor();
		processor.importStylesheet(xslDocument);
		processor.setParameterMap(null, contentMap);

		var serializer = new XMLSerializer();
		var outStr = serializer.serializeToString(processor.transformToDocument(targetDocument).documentElement);

		var replacedRootNode = targetDocument.createElement('hairyTurnip');
		while (targetDocument.documentElement.firstChild) {
			replacedRootNode.appendChild(targetDocument.documentElement.firstChild);
		}

	
		var iframe = targetDocument.createElementNS('http://www.w3.org/1999/xhtml', 'iframe');
		iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(outStr);
		targetDocument.documentElement.insertBefore(iframe, targetDocument.documentElement.firstChild);

		var style = targetDocument.createElementNS("http://www.w3.org/1999/xhtml", "style");
		style.setAttribute("type", "text/css");
		var css = 'iframe {position:absolute; top:0; left:0; width: 100%; height:100%; border: none; display: block; background-color:#FFF; z-index:2;}';
		var text = targetDocument.createTextNode(css);
		style.appendChild(text);
		targetDocument.documentElement.insertBefore(style, targetDocument.documentElement.firstChild);
		
		return true;
	},
	
	"transform" : function(targetDocument, content, xsl){
		var contentMap = content;
		if(typeof contentMap == "function")
			contentMap = contentMap(targetDocument);
		// This check is not in an else statement to allow for post-processing of the content function call
		if(typeof contentMap == "string")
			contentMap = {"body": contentMap};
			
		var xslDocument = xsl;
		if(xslDocument == null) xslDocument = this.defaultXslDocumentContent;
		if(typeof xslDocument == "string")
			xslDocument = xslDocument.toDOM();
		
		return this.transformInternal(targetDocument, contentMap, xslDocument);
	},
	
	"handleRequest" : function(request, sender, sendResponse){
		if(request.name == "chrome.custom.transformer.getLocalResourceContent")
			chrome.custom.transformer.getLocalResourceContent(
				request.path, 
				function(content){ sendResponse( {"content": content}); }
				);
	},

	// 
	// Should only be called from a Background Page
	//	
	"init" : function(){
		if(!this.isBackgroundPage()) return;
		
		//Add any Request Listeners
		chrome.extension.onRequest.addListener(chrome.custom.transformer.handleRequest);
	}
};

//Background Page Initializer
if(chrome.custom.transformer.isBackgroundPage()){
	chrome.custom.transformer.init();
}

})();
