// dbConnect.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { Database, Resource } from '@adminjs/mongoose';
import AdminJS from 'adminjs';
import logger from './controllers/logs.js';
AdminJS.registerAdapter({ Database, Resource });


const env = process.env.NODE_ENV
const MONGODB_URI = process.env.uri
const MONGODB_URI_mongo_local = process.env.mongo_local

let MONGODB;
if(process.env.NODE_ENV === 'production'){
    MONGODB = MONGODB_URI
}else{
    MONGODB = MONGODB_URI_mongo_local
}


export const connectToDatabase = async () => {
  try {
    const db = await mongoose.connect(MONGODB);
    mongoose.set('strictQuery', false);
    logger.info('Connected to MongoDB');
    return "db";
  } catch (error) {
    logger.error(`Error connecting to MongoDB:${error.stack}`);
  }
};
