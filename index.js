import AdminJS from 'adminjs';
import { buildAuthenticatedRouter } from '@adminjs/express';
import express, { response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import usersRoutes from './routes/users.js';
import flowRoute from './routes/flow.js';
import flowTest from './routes/flowTest.js';
import chatbotRoutes from './routes/chatbot.js';
import dataRoutes from './routes/data.js';
import airtimeRoute from './routes/airtime.js'
import wallet from './routes/wallet.js';
import adminRoute from './routes/admin.js';
import pp from './routes/pp.js';
import provider from './admin/auth-provider.js';
import options from './admin/options.js';
import Login from './admin/login.js';
import { connectToDatabase } from './db.js';
import logger from './controllers/logs.js';
import { startCronJob, startScheduler } from './controllers/schedule/cron.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import status from './models/status.js';
// import {} from './controllers/utils/jobs.js';
import { isSecure } from './controllers/middleware/isSecure.js';
import { flowSetup } from './controllers/flows/flowSetup.js';
import { fetchMeterValidation, test } from './controllers/utils/utils.js';
import power from './models/power.js';
dotenv.config();

const app = express();
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Set up Helmet middleware with custom CSP configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  })
);

app.use(
  express.json({
    // store the raw request body to use it for signature verification
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf?.toString(encoding || "utf8");
    },
  }),
);
const PORT = process.env.PORT;

try {
    const admin = new AdminJS(options);
    
    
    const router = buildAuthenticatedRouter(admin, {
    cookiePassword: process.env.COOKIE_SECRET,
    cookieName: 'adminjs',
    provider,
  }, null, {
    secret: process.env.COOKIE_SECRET,
    saveUninitialized: true,
    resave: true,
  });

  app.use(admin.options.rootPath, router);
  if (process.env.NODE_ENV === 'production') {
    await admin.initialize();
  }
  else {
      admin.watch();
  }
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use("/flow", flowRoute)
  app.use("/flowTest", flowTest)
  app.use("/login", Login);
  app.use('/users', isSecure, usersRoutes);
  app.use('/chatbot', chatbotRoutes);
  app.use('/data', isSecure, dataRoutes);
  app.use('/airtime', isSecure, airtimeRoute);
  app.use('/wallet', wallet);
  app.use('/send', adminRoute);
  app.use('/privacy-policy', pp);
  
  app.use(express.static(path.join(__dirname, 'public'))); 
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
  app.use('/admin/resources/uploads/', express.static(path.join(__dirname, 'uploads'))); 
  app.use('/testonnngvhvhvh', async (req, res) => {
    let plan = await test(req, res);
    res.send(plan);
  });
  app.use(function(req, res) {
    res.status(400);
    return res.send(`<H1>404 Error: Resource not found</H1>`);
  });

} catch (error) {
  logger.error(`Error setting up the server:${error.stack}`);
}

const startServer = async () => {
    try {
      const db = await connectToDatabase();
      startCronJob()
      app.listen(PORT || 3000, ()=> {
        logger.info(`Node API app is running on port 3000`)
    });
  } 
    catch (error) {
      logger.error(`Error starting the server:${error.stack}`);

    }
  };
  
  startServer();


