const axios = require('axios')
const { DateTime } = require("luxon");

//const url = 'https://www.nordpoolgroup.com/api/marketdata/page/47?currency=,,EUR,EUR'
//const page_url = 'https://www.nordpoolgroup.com/api/marketdata/page/{ID}?currency=,,EUR,EUR'
const page_url = 'https://www.nordpoolgroup.com/api/marketdata/page/{ID}?currency=,,EUR,EUR'
const queries_url = 'https://www.nordpoolgroup.com/api/marketdata/queries'
const url_template = "/en/Market-data1/Dayahead/Area-Prices/{CC}/Hourly/"

async function fetchHourlyPrices(node, mock = false) {
    let response
    
    if (mock) {
        //Do not load mock code in production
        response = require('./nordpool.mock.js')
    } else {
        // First, determine page ID from the API
        queries_response = await axios.get(queries_url)
        console.log("countryCode="+node.countryCode)
        find_url = url_template.replace("{CC}", node.countryCode)
        obj = Object.values(queries_response.data.tree).filter(v => v.url.toLowerCase() == find_url.toLowerCase())[0]
        if (!obj) {
            node.error("Country Code '" + node.countryCode + "' not found from queries API, looked for URL '" + find_url + "'");
            return null;
        }
        console.log("found page id: " + obj.id);
        response = await axios.get(page_url.replace("{ID}", obj.id));
    }
    
    let result = {
        prices: response.data.data.Rows.slice(0,24).map(row => parseFloat(row.Columns[0].Value.replace(',','.'))),
        countryPrice: response.data.data.Rows.slice(0,24).map(row => parseFloat(row.Columns[0].Value.replace(',','.'))),
        date: DateTime.fromISO(response.data.data.LatestResultDate.slice(0,10), { zone: "Europe/Oslo" }),
        timeZone: 'CET'
    };

    console.log("subtract CC: " + node.subtractCountryCode);
    console.log("additional fees: " + node.addFees);

    if (node.subtractCountryCode) {
        console.log("Subtract enabled, fees=" + node.addFees);
        find_url = url_template.replace("{CC}", node.subtractCountryCode)
        obj = Object.values(queries_response.data.tree).filter(v => v.url.toLowerCase() == find_url.toLowerCase())[0]
        if (!obj) {
            node.error("Country Code '" + node.countryCode + "' not found from queries API, looked for URL '" + find_url + "'");
            return null;
        }
        console.log("found page id: " + obj.id);
        response = await axios.get(page_url.replace("{ID}", obj.id));
        let subtractPrices = response.data.data.Rows.slice(0,24).map(row => parseFloat(row.Columns[0].Value.replace(',','.')));
        let newPrices = [];
        console.log("Old prices: " + JSON.stringify(result.prices, null, 4));
        for (const [key, value] of Object.entries(result.prices)) {
            console.log(key, value);
            let newValue = value - subtractPrices[key] + node.addFees;
            newPrices.push(newValue);
            result.prices = newPrices;
        }
        console.log("New prices: " + JSON.stringify(newPrices, null, 4));
    }
    return result;
}

module.exports = { fetchHourlyPrices }
