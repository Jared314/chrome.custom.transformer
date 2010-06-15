if(!chrome.custom) chrome.custom = {};

(function(){

XSLTProcessor.prototype.setParameterMap = function(namespace, parameterMap){
	for (var key in parameterMap)
		if(typeof parameterMap[key] == "string")
			this.setParameter(namespace, key, parameterMap[key]);
};

Document.prototype.insertIFrameOverlay = function(url){
	//Create IFrame
	var iframe = this.createElementNS('http://www.w3.org/1999/xhtml', 'iframe');
	iframe.src = url;
	iframe.style.position = "absolute";
	iframe.style.top = "0px";
	iframe.style.left = "0px";
	iframe.style.width = "100%";
	iframe.style.height = "100%";
	iframe.style.border = "none";
	iframe.style.display = "block";
	iframe.style.backgroundColor = "#FFF";
	iframe.style.zIndex = "250";

	//Insert IFrame
	this.documentElement.insertBefore(iframe, this.documentElement.firstChild);
	
	return iframe;
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
	
	"replaceInternal" : function(targetDocument, content){
		//Insert IFrame Overlay
		if(targetDocument.insertIFrameOverlay)
			return targetDocument.insertIFrameOverlay('data:text/html;charset=utf-8,' + encodeURIComponent(content));
			
		return false;
	},	

	"replace" : function(targetDocument, content){
		//Check & Convert content
		var newContent = content;
		if(typeof newContent == "function")
			newContent = newContent(targetDocument);
		
		return this.replaceInternal(targetDocument, newContent);
	},	

	// 
	// template.xsl
	// Embedded XSL Document to remove a dependency on another file.
	//
	"defaultXslDocumentContent" : '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:libxslt="http://xmlsoft.org/XSLT/namespace"><xsl:output method="html" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" indent="no"/><xsl:param name="head"/><xsl:param name="body"/><xsl:template match="/"><html xmlns="http://www.w3.org/1999/xhtml"><head><xsl:value-of select="$head" disable-output-escaping="yes"/></head><body><xsl:value-of select="$body" disable-output-escaping="yes"/></body></html></xsl:template></xsl:stylesheet>',
	
	"transformInternal" : function(targetDocument, parameterMap, xslDocument){
		var processor = new XSLTProcessor();
		processor.importStylesheet(xslDocument);
		processor.setParameterMap(null, parameterMap);
		var d = processor.transformToDocument(targetDocument);
		
		var serializer = new XMLSerializer();
		return serializer.serializeToString(d.documentElement);
	},
	
	"transform" : function(currentDocument, parameters, xsl, targetDocument){
		//Check & Convert parameters
		var parameterMap = parameters;
		if(typeof parameterMap == "function")
			parameterMap = parameterMap(targetDocument);
		// This check is not in an else statement to allow for post-processing of the content function call
		if(typeof parameterMap == "string")
			parameterMap = {"body": parameterMap};

		//Check & Convert xsl			
		var xslDocument = xsl;
		if(xslDocument == null) xslDocument = this.defaultXslDocumentContent;
		if(typeof xslDocument == "string")
			xslDocument = xslDocument.toDOM();

		//Check & Convert targetDocument		
		var targetD = targetDocument;
		if(targetD == null) targetD = "<html/>".toDOM();
		
		//Transform Content
		var transformedContent = this.transformInternal(targetD, parameterMap, xslDocument);

		//Insert IFrame Overlay
		return this.replace(currentDocument, transformedContent);
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
