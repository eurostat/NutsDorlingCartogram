//rounds both positive and negative float to nearest n
function roundToNearest(v, nearest) {
    return (v >= 0 || -1) * Math.round(Math.abs(v) / nearest) * nearest
}

function roundToOneDecimal(n) {
    return Math.round(n * 10) / 10
}

function getCountryNamesIndex() {
    return {
        BE: 'Belgium',
        BG: 'Bulgaria',
        CZ: 'Czechia',
        DK: 'Denmark',
        DE: 'Germany',
        EE: 'Estonia',
        IE: 'Ireland',
        EL: 'Greece',
        ES: 'Spain',
        FR: 'France',
        HR: 'Croatia',
        IT: 'Italy',
        CY: 'Cyprus',
        LV: 'Latvia',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        HU: 'Hungary',
        MT: 'Malta',
        NL: 'Netherlands',
        AT: 'Austria',
        PL: 'Poland',
        PT: 'Portugal',
        RO: 'Romania',
        SI: 'Slovenia',
        SK: 'Slovakia',
        FI: 'Finland',
        SE: 'Sweden',
        IS: 'Iceland',
        LI: 'Liechtenstein',
        NO: 'Norway',
        CH: 'Switzerland',
        ME: 'Montenegro',
        MK: 'North Macedonia',
        AL: 'Albania',
        RS: 'Serbia',
        TR: 'Turkey',
        BA: 'Bosnia and Herzegovina',
        XK: 'Kosovo',
        UK: 'United Kingdom',
    }
}

/**
 * @description Retrieve a URL parameter
 * @param {*} paramName
 * @return {*}
 */
function getURLParamValue(paramName) {
    var url = window.location.search.substring(1) //get rid of "?" in querystring
    var qArray = url.split('&') //get key-value pairs
    for (var i = 0; i < qArray.length; i++) {
        var pArr = qArray[i].split('=') //split key and value
        if (pArr[0] == paramName) {
            pArr[1] = decodeURI(pArr[1])
            return pArr[1] //return value
        }
    }
}

export { roundToNearest, roundToOneDecimal, getCountryNamesIndex, getURLParamValue }
