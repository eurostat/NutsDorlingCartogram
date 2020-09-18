// function to create a twitter URL by the given parameter.

function generateURL(text, url, hashtags, via, related) {
    //
    let returnURL = 'https://twitter.com/intent/tweet'
    returnURL += '?hashtags=' + hashtags.join(',')
    // returnURL += '&original_referer='+original_referer;
    returnURL += '&text=' + encodeURIComponent(text)
    if (via) {
        returnURL += '&via=' + via
    }
    returnURL += '&url=' + encodeURI(url)
    // related is an Array of objects containing name and description.
    if (related !== undefined && related.length > 0) {
        let relatedString = ''
        related.forEach(relatedEntry => {
            let relatedEntryString = relatedEntry.name + ',' + relatedEntry.description
            relatedString += encodeURIComponent(relatedEntryString)
        })
        returnURL += '&related=' + relatedString
    }
    return returnURL
}

export {
    generateURL
}