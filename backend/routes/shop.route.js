import express from 'express';
import upload from '../middlewares/multer.js';
import { upsertShop, getShopByOwner, getAllShops, getShopByCity, getShopById } from '../controllers/shop.controller.js';
import { isAuth } from '../middlewares/isAuth.js';


const shopRouter = express.Router();

shopRouter.get("/get-all-shops", isAuth, getAllShops);
shopRouter.get('/owner', isAuth, getShopByOwner);
shopRouter.get('/city/:city', isAuth, getShopByCity);
shopRouter.get('/:id', isAuth, getShopById);

shopRouter.post('/create-edit', isAuth, upload.single('image'), upsertShop);

export default shopRouter;
