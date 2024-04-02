import { Router } from "express";
import * as  productController from "../controllers/ProductController.js";
import { passportCall, authorization } from "../dirname.js";
import { addLogger } from "../config/logger_CUSTOM.js";

const router = Router();

// Middleware de logger
router.use(addLogger);

// Rutas
// Ruta para obtener TODOS los productos desde la BD
router.get('/products', passportCall('jwt'), authorization(['ADMIN','PREMIUM']), (req, res) => {
      productController.getAllProducts(req, res);
      req.logger.info('Obteniendo todos los productos')
});


// Ruta para eliminar un producto del carrito ("/cart/:productId")
router.delete('/:productId', passportCall('jwt'), authorization(['ADMIN','PREMIUM']), (req, res) => {
    req.logger.info(`Eliminando producto ID ${req.params.productId}`);
    productController.deleteProduct(req, res);
});

// Ruta para agregar un nuevo producto
router.post('/', passportCall('jwt'), authorization(['ADMIN','PREMIUM']), (req, res) => {
    req.logger.info('Agregando un nuevo producto');
    productController.addProduct(req, res);
});

// Ruta para obtener todos los productos con filtros y paginación
router.get('/', (req, res) => {
    req.logger.info('Obteniendo todos los productos con filtros y paginación');
    productController.getProducts(req, res);
});



export default router;
