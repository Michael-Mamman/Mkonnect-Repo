import express from "express";  
import { createUser, getUsers, getSingleUser, deleteUser, updateUser } from '../controllers/users.js';

const router = express.Router();

// create user route
router.post("/", createUser);

// get all users route
router.get("/", getUsers);

// get single user route 
router.get("/:id", getSingleUser);

// delete user route
router.delete("/:id", deleteUser);

// update user route
router.put("/:phoneNumber", updateUser);

export default router;
