import express from 'express';
import { editItem,addItem } from '../controllers/items.controller.js';
import { isAuth } from '../middlewares/isAuth.js';
import upload from '../middlewares/multer.js';

const itemRouter = express.Router();

itemRouter.post('/add-item', isAuth, upload.single('image'), addItem);
itemRouter.put('/edit-item/:itemId', isAuth, upload.single('image'), editItem);

export default itemRouter;
