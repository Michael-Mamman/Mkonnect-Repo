import { createLogger, transports, format } from 'winston';
import 'winston-mongodb';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV
const MONGODB_URI = process.env.uri
const MONGODB_URI_mongo_local = process.env.mongo_local

let MONGODB;
if(process.env.NODE_ENV === 'production'){
    MONGODB = MONGODB_URI
}else{
    MONGODB = MONGODB_URI_mongo_local
}


const logger = createLogger({
    transports: [

        new transports.MongoDB({
            level: 'info',
            db: MONGODB,
            options: {
                useUnifiedTopology: true
            },
            collection: 'info_logs',
            format: format.combine(format.timestamp(), format.json())        
        }),

        new transports.MongoDB({
            level: 'error',
            db: MONGODB,
            options: {
                useUnifiedTopology: true
            },
            collection: 'error_logs',
            format: format.combine(format.timestamp(), format.json())
        }),

        new transports.Console({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.prettyPrint()
              )
        }),

        new transports.Console({
            level: 'error',
            format: format.combine(
                format.timestamp(),
                format.prettyPrint()
              )
        })
    ]
})

export default logger;