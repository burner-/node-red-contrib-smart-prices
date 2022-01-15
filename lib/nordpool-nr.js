const fetchHourlyPricesEE = require('./nordpool').fetchHourlyPricesEE
module.exports = function(RED) {
    
    function nordpoolNode(config) {

        const node = this
        RED.nodes.createNode(node,config)

        node.on('input', async function(msg) {
            const mock = msg.payload.mock || false
            const prices = await fetchHourlyPricesEE(mock) // mock data        
            msg.payload = prices
            node.send(msg)
        })
    }

    RED.nodes.registerType("nordpool",nordpoolNode,{});

}