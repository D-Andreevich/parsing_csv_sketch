import winston from "winston";

//mock
// export const logger = {
//     info: function (...args) {
//     },
//
//     error: function (...args) {
//         console.error(...args);
//     }
// }

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({format: winston.format.simple()}),
        new winston.transports.File({filename: 'logs/error.log', level: 'error'}),
        new winston.transports.File({filename: 'logs/combined.log'})
    ]
});
