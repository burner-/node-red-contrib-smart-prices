const getEvents = require('./smart-prices').getEvents

module.exports = function(RED) {
    
    function smartPricesNode(config) {
        
        const node = this
        RED.nodes.createNode(node, config)

        node.on('input', function(msg) {
            
            let prices
            
            if (msg.payload.prices?.length)
                prices = msg.payload.prices
            else 
                prices = config.prices?JSON.parse(config.prices):[]
            
            const result = getEvents({
                prices: prices,
                date: msg.payload.date
            }, {
                onHours: msg.config?.onHours||parseInt(config.onHours),
                limitPrice: msg.config?.limitPrice||parseFloat(config.limitPrice),
                timeZone: msg.config?.timeZone||parseFloat(config.timeZone)
            })        
            
            msg.payload = result.events
            
            const msg2 = {
                payload: result.stats
            }
            
            node.send([msg, msg2])
        })
    }
  
    RED.nodes.registerType("smart-prices",smartPricesNode,{});
}