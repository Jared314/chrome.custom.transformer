<xsl:stylesheet version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:libxslt="http://xmlsoft.org/XSLT/namespace">
	<xsl:output method="html" encoding="utf-8" 
		doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" 
		doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" 
		indent="no"/>
	
	<xsl:param name="head"/>
	<xsl:param name="body"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
			<xsl:value-of select="$head" disable-output-escaping="yes"/>
		</head>
		<body>
			<xsl:value-of select="$body" disable-output-escaping="yes"/>
		</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
