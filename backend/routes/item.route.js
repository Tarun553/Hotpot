import express from 'express';
import { editItem,addItem, getItemById } from '../controllers/items.controller.js';
import { isAuth } from '../middlewares/isAuth.js';
import upload from '../middlewares/multer.js';

const itemRouter = express.Router();


import { deleteItem } from '../controllers/items.controller.js';

itemRouter.post('/add-item', isAuth, upload.single('image'), addItem);
itemRouter.put('/edit-item/:itemId', isAuth, upload.single('image'), editItem);
itemRouter.delete('/delete-item/:itemId', isAuth, deleteItem);
itemRouter.get('/:id', isAuth, getItemById);

export default itemRouter;
