if(!chrome.custom) chrome.custom = {};

(function(){

chrome.custom.transformer = {

	"domFromString" : function(value){
		return new DOMParser().parseFromString(value, "text/xml");
	},

	// 
	// Should only be called from a Background Page
	//
	"getLocalResourceContent" : function(url, completeCallback) {
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

	"transform": function(targetDocument, xsl, headContent, bodyContent){
		var xslDocument = xsl;
		if(typeof xslDocument == "string"){
			xslDocument = this.domFromString(xslDocument);
		}

		var processor = new XSLTProcessor();
		processor.importStylesheet(xslDocument);
		processor.setParameter(null, "headContent", headContent);	
		processor.setParameter(null, "bodyContent", bodyContent);

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
		chrome.extension.onRequest.addListener(chrome.custom.transformer.handleRequest);
	}
};

})();
