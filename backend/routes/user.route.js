import { getCurrentUser, updateUserLocation } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import  express  from 'express';

const UserRouter = express.Router()

UserRouter.get("/current", isAuth, getCurrentUser);
UserRouter.put("/update-location", isAuth, updateUserLocation);
export default UserRouter
