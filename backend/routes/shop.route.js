import express from 'express';
import upload from '../middlewares/multer.js';
import { upsertShop, getShopByOwner, getAllShops } from '../controllers/shop.controller.js';
import { isAuth } from '../middlewares/isAuth.js';


const shopRouter = express.Router();

shopRouter.get("/get-all-shops", isAuth, getAllShops);
shopRouter.post('/create-edit', isAuth, upload.single('image'), upsertShop);
shopRouter.get('/owner', isAuth, getShopByOwner);

export default shopRouter;
