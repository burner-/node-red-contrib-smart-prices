const fetchHourlyPrices = require('./nordpool').fetchHourlyPrices
module.exports = function(RED) {
    
    function nordpoolNode(config) {
        const node = this
        console.log("config=" + JSON.stringify(config, null, 4))
        RED.nodes.createNode(node,config)
        node.countryCode = config.countryCode
        node.subtractCountryCode = config.subtractCountryCode
        node.addFees = config.addFees

        node.on('input', async function(msg) {
            const mock = msg.payload.mock || false
            const prices = await fetchHourlyPrices(node, mock)
            if (!prices) {
                return
            }
            msg.payload = prices
            node.send(msg)
        })
    }

    RED.nodes.registerType("nordpool",nordpoolNode,{});

}
