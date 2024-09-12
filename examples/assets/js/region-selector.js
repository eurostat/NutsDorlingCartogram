// REGION SELECTOR LOGIC USING SLIMSELECT

// set default regions
let regionOpts = []
var slim

function buildSlimSelect(nutsLevel) {
    d3.json(`../assets/json/regions_labels_2021_nuts${nutsLevel}_eu_efta.json`).then((d) => {
        for (let region in d) {
            if (!region.includes('ZZ')) {
                regionOpts.push({ value: region, text: d[region].label + ' (' + region + ')' })
            }
        }

        slim = new SlimSelect({
            select: '#dorling-region-select',
            //allowDeselect: true,
            searchPlaceholder: 'Search',
            placeholder: 'Select a region',
            data: regionOpts,
            onChange: function (info) {
                let nutsCode = info.value
                if (nutsCode) {
                    dorling.highlightRegion(nutsCode)
                }
            },
        })
        slim.setSelected()
    })
}

// update on nuts level change
function updateRegionSelect(nutsLevel) {
    // get regions from json
    let regionOpts = []
    d3.json(`../assets/json/regions_labels_2021_nuts${nutsLevel}_eu_efta.json`).then((d) => {
        for (let region in d) {
            if (!region.includes('ZZ')) {
                regionOpts.push({ value: region, text: d[region].label + ' (' + region + ')' })
            }
        }

        slim.setData(regionOpts)
        slim.setSelected()
    })
}
