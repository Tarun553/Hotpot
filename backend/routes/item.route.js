import express from 'express';
import { editItem,addItem, getItemById, getItemByCategory } from '../controllers/items.controller.js';
import { isAuth } from '../middlewares/isAuth.js';
import upload from '../middlewares/multer.js';
import { deleteItem, getAllItems } from '../controllers/items.controller.js';

const itemRouter = express.Router();


itemRouter.get('/get-all-items', isAuth, getAllItems);
itemRouter.post('/add-item', isAuth, upload.single('image'), addItem);
itemRouter.get('/category/:category', isAuth, getItemByCategory);
itemRouter.put('/edit-item/:itemId', isAuth, upload.single('image'), editItem);
itemRouter.delete('/delete-item/:itemId', isAuth, deleteItem);
itemRouter.get('/:id', isAuth, getItemById);

export default itemRouter;
