function generateEmbedContent(sourceURL, lang) {

    $('#embed-content').html('<pre class="pre-scrollable"><code>&lt;iframe frameborder="0" height="600px" scrolling="no" width="100%" src="' + sourceURL + '"&gt;&lt;/iframe&gt;</code></pre>')

}



export {

    generateEmbedContent

}