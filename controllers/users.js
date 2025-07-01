import AdminUser from '../models/admin.js';
import User from '../models/users.js';
import logger from './logs.js';


// create user controller
export const createUser = async (req, res) => {
    try {
      let d = {
        fullName: req.body.fullName,
        balance: req.body.balance,
      }
      // const auser = await AdminUser.create({
      //   "email": "michaelyak66@gmail.com",
      //   "password": "12345",
      //   "number": "2347030034134"
      // },
      // {
      //   "email": "test@gmail.com",
      //   "password": "12345",
      //   "number": "2348085814196"
      // }
      // );
        const user = await User.findOneAndUpdate(
            { phoneNumber: req.body.phoneNumber },
            d,
            { new: true});
        res.status(201).json(user);
    } catch (error) {
      logger.error(`error creating user: ${error.stack}`);
        if (error.name === 'MongoServerError' && error.code === 11000) {
            // Duplicate key error (E11000)
            const duplicateField = Object.keys(error.keyValue)[0];
            res.status(400).json({
              message: `Already Exist: User with ${duplicateField} '${error.keyValue[duplicateField]}' already exists.`,
              status: false
            });
          } else {
            // Handle other errors
            res.status(500).json({message: error.message, status: false}); 
          }
        }
}

// get user controller
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
      logger.error(`error getting users: ${error.stack}`);
        res.status(500).json({message: error.message, status: false});
    }
}

// get single user controller
export const getSingleUser = async  (req, res) => {
    const {id} = req.params;
    try {
        const user = await User.findById({_id: id});
        if(!user){
            return res.status(404).json({message: `cannot find User with ID ${id}`, status: false})
        }
        res.status(200).json(user);

    } catch (error) {
      logger.error(`error getting single user: ${error.stack}`);
        if (error.name === 'CastError') {
            // Handle CastError (invalid ObjectId)
            return res.status(404).json({message: `cannot find User with ID ${id}`, status: false})
        } else {
          res.status(500).json({ message: error.message, status: false });
        }
      }
}

// delete user controller
export const deleteUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).json({message: `cannot find User with ID ${id}`, status: false})
        }
        res.status(200).json({message: `User with ID ${id} has been deleted`, status: false});
        
    } catch (error) {
      logger.error(`error deleting user: ${error.stack}`);
        res.status(500).json({message: error.message, status: false})

    }
}

export const updateUser = async (req, res) => {
    const { phoneNumber } = req.params;
    try {
      const user = await User.findOneAndUpdate({ phoneNumber }, req.body, { new: true });
  
      if (!user) {
        return res.status(404).json({ message: `Cannot find User with phone number ${phoneNumber}`, status: false });
      }
  
      res.status(200).json(user);
    } catch (error) {
      logger.error(`error updating user: ${error.stack}`);
      if (error.name === 'CastError') {
        // Handle CastError (invalid ObjectId)
        res.status(404).json({ message: `User with phone number ${phoneNumber} not found`, status: false });
      } else {
        res.status(500).json({ message: error.message, status: false });
      }
    }
  };
  