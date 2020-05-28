const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = createLogger({
	format: combine(
	    timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
	    format.splat(),
    	format.simple(),
    	myFormat
	),
	transports: [
		new transports.Console({colorize : true}),
		new transports.File({ filename: 'log/MontaApartment.log', maxsize: 27485760}),
		new transports.File({ filename: 'log/MontaApartmentError.log', level: 'error', maxsize: 52428800}),
	]
});

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new transports.Console({
//     format: format.json()
//   }));
// }

module.exports = logger;
