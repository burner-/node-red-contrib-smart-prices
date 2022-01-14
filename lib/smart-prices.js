const { DateTime } = require("luxon");

function getEvents(data, options) {

    let {
        onHours = 12,
        limitPrice,
        timeZone
    } = options
    
    startDate = data.date?data.date.isLuxonDateTime?data.date:DateTime.fromJSDate(data.date):DateTime.now().startOf("day")

    const periodAverage = period => period.reduce((sum, i) => sum + i.price, 0)/period.length

    const eventsAverage = events => {
        let period = events.reduce((s, i) => [...s,...(i.period)], [])
        return periodAverage(period)
    }

    const updateEvent = (event, period) => { // mutable :*
        event.avgPrice = periodAverage(period)
        event.period = period
    }

    limitPrice = limitPrice||[...data.prices].sort((a,b) => a>b?1:-1)[onHours]

    let lastAction = null
    let events = []
    let period = []
    let lastEvent = null
    let localDateTime = timeZone?startDate.setZone(timeZone):startDate

    data.prices.forEach((el, i) => {
        
        const action = (el>=limitPrice)?'OFF':'ON'
        const dt = localDateTime.plus({ hours: i})

        if (!(action == lastAction)) {


            let event = {
                datetime: dt,
                cron: dt.toFormat('0 0 h d M * y'),
                action,
                period: []
            }
            
            if (lastEvent) 
                updateEvent(lastEvent, period)

            events.push(event)
            lastEvent = event
            period = []
        }

        period.push({
            hour: dt.hour,
            price: el
        })
        
        lastAction = action
    });

    updateEvent(lastEvent, period)
  
    return {
        date:localDateTime,
        events,
        stats: {
            limitPrice,
            avgPrice: eventsAverage(events),
            avgOnPrice: eventsAverage(events.filter(i => i.action == 'ON')),
            avgOffPrice: eventsAverage(events.filter(i => i.action == 'OFF')),
        }
    }
}

module.exports = { getEvents }