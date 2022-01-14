const axios = require('axios')
const { DateTime } = require("luxon");

const mockdata = require('./nordpool.mock.js')
const url = 'https://www.nordpoolgroup.com/api/marketdata/page/47?currency=,,EUR,EUR'
 
async function fetchHourlyPricesEE(mock = false) {
    let response
    
    if (mock)
        response = mockdata
    else
        response = await axios.get(url)
    
    let result = {
        prices: response.data.data.Rows.slice(0,24).map(row => parseFloat(row.Columns[0].Value.replace(',','.'))),
        date: DateTime.fromISO(response.data.data.LatestResultDate.slice(0,10), { zone: "Europe/Oslo" }),
        timeZone: 'CET'
    }
    
    return result
}

module.exports = { fetchHourlyPricesEE }
