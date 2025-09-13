import { getCurrentUser } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";
import  express  from 'express';

const UserRouter = express.Router()

UserRouter.get("/current", isAuth, getCurrentUser);

export default UserRouter
