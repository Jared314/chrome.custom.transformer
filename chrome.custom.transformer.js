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

	// 
	// Should only be called from a Background Page
	//
	"getLocalResourceContent" : function(url, completeCallback) {
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
	},
	
	// 
	// template.xsl
	// Embedded XSL Document to remove a dependency on another file.
	//
	"defaultXslDocumentContent" : '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:libxslt="http://xmlsoft.org/XSLT/namespace"><xsl:output method="html" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" indent="no"/><xsl:param name="head"/><xsl:param name="body"/><xsl:template match="/"><html xmlns="http://www.w3.org/1999/xhtml"><head><xsl:value-of select="$head" disable-output-escaping="yes"/></head><body><xsl:value-of select="$body" disable-output-escaping="yes"/></body></html></xsl:template></xsl:stylesheet>',
	
	"transform" : function(targetDocument, content, xsl){
		var contentMap = content;
		if(typeof contentMap == "string")
			contentMap = {"body": contentMap};

		var xslDocument = xsl;
		if(xslDocument == null) xslDocument = chrome.custom.transformer.defaultXslDocumentContent;
		if(typeof xslDocument == "string")
			xslDocument = xslDocument.toDOM();
		
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
		//Add any Request Listeners
		chrome.extension.onRequest.addListener(chrome.custom.transformer.handleRequest);
	}
};

})();
