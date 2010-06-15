<xsl:stylesheet version="1.0"
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 xmlns:libxslt="http://xmlsoft.org/XSLT/namespace">
    <xsl:output method="html" encoding="utf-8"
     doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
     doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"
     indent="no"/>
    <xsl:param name="eleColor" select="'purple'"/>
    <xsl:param name="attColor" select="'black'"/>
    <xsl:param name="attValColor" select="'blue'"/>
    <xsl:param name="textColor" select="'#484848'"/>
    <xsl:param name="cmtColor" select="'green'"/>
    <xsl:param name="piColor" select="'#FFA500'"/>
    <xsl:param name="nsColor" select="'gray'"/>
    <xsl:param name="collapseColor" select="'lime'"/>
    <xsl:param name="symbolColor" select="'black'"/>
    <xsl:param name="hoverColor" select="'#EEE'"/>
    <xsl:param name="backgroundColor" select="'white'"/>
    <xsl:param name="fontFamily" select="'monospace'"/>
    <xsl:param name="fontSize" select="'13px'"/>
    <xsl:param name="lineWrap" select="'1em'"/>
    <xsl:param name="namespaceRoot" select="'no'"/>
    <xsl:param name="displayTooltip" select="'no'"/>
    <xsl:variable name="quot">&quot;</xsl:variable>
    <xsl:variable name="colon">:</xsl:variable>
    <xsl:variable name="empty"></xsl:variable>
    <xsl:variable name="apos">&apos;</xsl:variable>
    <xsl:template match="/">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                <style>
                    html,body{margin:0em <xsl:value-of select="$lineWrap"/> 1em 0em;padding:0px;background-color:<xsl:value-of select="$backgroundColor"/>;}
					#tree{
						color:<xsl:value-of select="$symbolColor"/>;
						font-size:<xsl:value-of select="$fontSize"/>;
						font-family:<xsl:value-of select="$fontFamily"/>;
						padding-left:1em;word-wrap:break-word;
					}
					.e{margin:2px 0px 5px;}
					.e                    
                    .e{margin-left:20px;}
					.c,div.inline
					*,div.inline{display:inline}
					div.inline
					*,div.inline{margin:0;border-left:none}
					.nm{color:<xsl:value-of select="$eleColor"/>;font-weight:bold}
					.an{color:<xsl:value-of select="$attColor"/>;}
					.av{color:<xsl:value-of select="$attValColor"/>;}
					.ns{color:<xsl:value-of select="$nsColor"/>;}
					.cmt{color:<xsl:value-of select="$cmtColor"/>;font-style:italic}
					.t{white-space:pre;color:<xsl:value-of select="$textColor"/>;font-weight:bold;}
					.pi{color:<xsl:value-of select="$piColor"/>;}
					.closed{background:<xsl:value-of select="$collapseColor"/>;}
					a{vertical-align:top;margin-left:1em;text-decoration:none;color:blue;}
					a:visited{color:blue;}
                </style>
            </head>
            <body>
                <div id="tree">
                    <xsl:apply-templates select="processing-instruction()"/>
                    <xsl:apply-templates select="node()[not(self::processing-instruction())]"/>
                </div>
            </body>
        </html>
    </xsl:template>
    <xsl:variable name="allNamespaces">
    	<xsl:if test="$namespaceRoot = 'yes'">
    		<xsl:choose>
    			<xsl:when test="function-available('libxslt:node-set')">
			    	<ns>
				    	<xsl:for-each select="//namespace::*">
				    		<xsl:if test=". != 'http://www.w3.org/XML/1998/namespace'">
					    		<n p="{name(.)}"><xsl:value-of select="."/></n>
				    		</xsl:if>
				    	</xsl:for-each>
				    </ns>
    			</xsl:when>
    			<xsl:otherwise>
			    	<xsl:for-each select="//namespace::*">
			    		<xsl:if test=". != 'http://www.w3.org/XML/1998/namespace'">
				    		<xsl:text> xmlns</xsl:text>
				    		<xsl:choose>
				    			<xsl:when test="name(.) = ''">
				    				<xsl:value-of select="concat('=',$quot,.,$quot)"/>
				    			</xsl:when>
				    			<xsl:otherwise>
				    				<xsl:value-of select="concat(':',name(.),'=',$quot,.,$quot)"/>
				    			</xsl:otherwise>
				    		</xsl:choose>
				    		<xsl:text>!|!</xsl:text>
			    		</xsl:if>
			    	</xsl:for-each>
    			</xsl:otherwise>
    		</xsl:choose>
    	</xsl:if>
    </xsl:variable>
	<xsl:variable name="uniqueNamespaces">
   		<xsl:choose>
   			<xsl:when test="function-available('libxslt:node-set')">
				<xsl:for-each select="libxslt:node-set($allNamespaces)/ns/n[not(text() = following::n)]">
		    		<xsl:choose>
		    			<xsl:when test="@p = ''">
		    				<xsl:value-of select="concat(' xmlns=',$quot,.,$quot)"/>
		    			</xsl:when>
		    			<xsl:otherwise>
		    				<xsl:value-of select="concat(' xmlns:',@p,'=',$quot,.,$quot)"/>
		    			</xsl:otherwise>
		    		</xsl:choose>
				</xsl:for-each>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="findUniqueNamespaces">
					<xsl:with-param name="namespaceList" select="$allNamespaces"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
    
    <xsl:template match="*">
        <xsl:variable name="xpath"><xsl:call-template name="xpath"/></xsl:variable>
        <div class="e">
        	<xsl:choose>
        		<xsl:when test="$displayTooltip = 'no'"> 
        			<span class="x" title="{$xpath}"/>
        		</xsl:when>
        		<xsl:otherwise>
        			<xsl:attribute name="title"><xsl:value-of select="$xpath"/></xsl:attribute>
        		</xsl:otherwise>
        	</xsl:choose>
            <xsl:variable name="prefix">
                <xsl:if test="contains(name(.), $colon)">
                    <xsl:value-of select="substring-before(name(.), $colon)"/>
                </xsl:if>
            </xsl:variable>
            <xsl:variable name="tag">
                <span class="nm">
	                <xsl:if test="normalize-space($prefix) !=$empty"><xsl:value-of select="$prefix"/><xsl:text>:</xsl:text></xsl:if>
                    <xsl:value-of select="local-name(.)"/>
                </span>
            </xsl:variable>
            <span>
                <xsl:attribute name="class">
                	<!-- node -->
                    <xsl:text>n n</xsl:text>
                    <xsl:choose>
                        <xsl:when test="node()">
                        	<!-- start -->
                            <xsl:text>s</xsl:text>
                        </xsl:when>
                        <xsl:otherwise>
                        	<!-- self close -->
                            <xsl:text>sc</xsl:text>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:attribute>
                <xsl:text>&lt;</xsl:text>
                <xsl:copy-of select="$tag"/>
                <xsl:apply-templates select="@*"/>
                <xsl:choose>
                	<xsl:when test="$namespaceRoot = 'yes'">
                		<xsl:if test="$xpath = concat('/',name(/*))">
							<span class="ns">
								<xsl:value-of select="$uniqueNamespaces"/>						
							</span>
						</xsl:if>
                	</xsl:when>
                	<xsl:otherwise>
		                <xsl:if test="namespace-uri(.) and namespace-uri(.) != namespace-uri(..)">
		                    <span class="ns">
		                        <xsl:text> xmlns</xsl:text>
		                        <xsl:if test="normalize-space($prefix) != $empty">
		                            <xsl:value-of select="concat($colon,$prefix)"/>
		                        </xsl:if>
		                        <xsl:text>=</xsl:text>
		                        <xsl:value-of select="concat($quot,namespace-uri(.),$quot)"/>
		                    </span>
		                </xsl:if>
                	</xsl:otherwise>
                </xsl:choose>
                <xsl:if test="not(node())">
                    <xsl:text>/</xsl:text>
                </xsl:if>
                <xsl:text>&gt;</xsl:text>
            </span>
            <xsl:if test="node()">
                <div class="c">
                    <xsl:apply-templates/>
                </div>
                <!-- node and node-end -->
                <span class="n ne">
                    <xsl:text>&lt;</xsl:text>
                    <xsl:text>/</xsl:text>
                    <xsl:copy-of select="$tag"/>
                    <xsl:text>&gt;</xsl:text>
                </span>
            </xsl:if>
        </div>
    </xsl:template>
    <xsl:template match="@*">
        <xsl:text> </xsl:text>
        <span class="an">
            <xsl:value-of select="name(.)"/>
        </span>
        <xsl:text>=</xsl:text>
        <span class="av">
            <xsl:value-of select="concat($quot, ., $quot)"/>
        </span>
        <xsl:if test="$namespaceRoot = 'no' and namespace-uri(.) and namespace-uri(.) != namespace-uri(..)">
    	    <xsl:variable name="prefix">
				<xsl:if test="contains(name(.), $colon)">
               		<xsl:value-of select="substring-before(name(.), $colon)"/>
				</xsl:if>
	        </xsl:variable>
            <span class="ns">
                <xsl:text> xmlns</xsl:text>
                <xsl:if test="normalize-space($prefix) != $empty">
                    <xsl:value-of select="concat($colon,$prefix)"/>
                </xsl:if>
                <xsl:text>=</xsl:text>
                <xsl:value-of select="concat($quot,namespace-uri(.),$quot)"/>
            </span>
        </xsl:if>
    </xsl:template>
    <xsl:template match="text()">
        <xsl:if test="normalize-space(.)">
    		<span class="t">
				<xsl:value-of select="."/>
    		</span>
        </xsl:if>
    </xsl:template>
    <xsl:template match="comment()">
        <div class="cmt">
            <xsl:text>&lt;!--</xsl:text>
            <xsl:value-of select="."/>
            <xsl:text>--&gt;</xsl:text>
        </div>
    </xsl:template>
    <xsl:template match="processing-instruction()">
        <div class="pi">
            <xsl:text>&lt;?</xsl:text>
            <xsl:value-of select="name(.)"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="."/>
            <xsl:text>?&gt;</xsl:text>
        </div>
    </xsl:template>
    <xsl:template name="xpath">
        <xsl:for-each select="ancestor-or-self::*">
            <xsl:text>/</xsl:text>
            <xsl:value-of select="name()"/>
        </xsl:for-each>
    </xsl:template>
	<xsl:template name="findUniqueNamespaces">
		<xsl:param name="namespaceList"/>
		<xsl:param name="uniqueList"/>
		<xsl:choose>
			<xsl:when test="contains($namespaceList,'!|!')">
				<xsl:variable name="namespaceDeclaration" select="substring-before($namespaceList,'!|!')"/>
				<xsl:variable name="list">
					<xsl:if test="contains($uniqueList,$namespaceDeclaration) = false()">
						<xsl:text> </xsl:text>
						<xsl:value-of select="$namespaceDeclaration"/>
					</xsl:if>
				</xsl:variable>
				<xsl:call-template name="findUniqueNamespaces">
					<xsl:with-param name="namespaceList" select="substring-after($namespaceList,'!|!')"/>
					<xsl:with-param name="uniqueList" select="concat($uniqueList,$list)"/>
				</xsl:call-template>
			</xsl:when>		
			<xsl:otherwise>
				<xsl:value-of select="$uniqueList"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>
