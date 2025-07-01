import express from "express"; 
import { data, createdataplans, getdataplans, updataplan, deletedataplan, getneworkdataplans } from '../controllers/data.js';


const router = express.Router();

router.post('/', data);

router.post('/createdataplan', createdataplans);

router.get('/getdataplan', getdataplans);

router.get('/getneworkdataplans/:id', getneworkdataplans);

router.put('/updatedataplan/:id', updataplan);

router.delete('/deletedataplan/:id', deletedataplan);




export default router;
