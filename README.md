# node-red-contrib-smart-prices

Node-red node to generate on/off events based on hourly electricity prices. 

## Configuration

## Inputs

### msg.payload.prices

Array of hourly electricity prices, staring from 00:00

### msg.payload.date

Date (JS date object) for hourly prices. Default to today if not set

### msg.config

```
msg.config = {
    onHours: 6,     // minimum hours to be ON. Automatic calculation for limitPrice. Ignored when limitPrice is set.
    limitPrice: 22  // minimum price for OFF event
}
```

## Outputs

ON / OFF messages on output 1
Stats on output 2

