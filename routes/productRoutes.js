// Esta es una SubAplicacion

const express = require('express');
const productController = require('../controllers/productController');

// una alternativa es usar Destructuring
// const {getAllProducts, createProduct, getProduct, updateProduct, deleteProduct} = require('../controllers/productController');

// como convencion cambiare el nombre de productRouter a router
const router = express.Router();

const authController = require('../controllers/authController');

///////////////////////////////////////////////////////////////////
// Lecture-158 Implementing Simple Nested Routes
///////////////////////////////////////////////////////////////////
// const reviewController = require ('../controllers/reviewController');

///////////////////////////////////////////////////////////////////
// Lecture-159 Nested Routes with Express
///////////////////////////////////////////////////////////////////
// const reviewRouter = require ('./reviewRoutes');

// router.use('/:productId/reviews', reviewRouter);

///////////////////////////////////////////////////////////////////
// Lecture-216 Finishing the Bookings API
///////////////////////////////////////////////////////////////////

// const bookingRouter = require ('./bookingRoutes');

// router.use('/:productId/bookings', bookingRouter);

/*
Ahora falta una pieza en el rompecabezas porque el bookingRouter no tiene acceso 
al productId parameter, asi que debo darle acceso

En bookingRoutes.js

aqui es donde entra la magia de mergeParams

const router = express.Router( { mergeParams: true } );

		POST /products/7872333233/reviews
		POST /reviews
*/


/////////////////////////////////////////////////////////////////////
// Lecture-64 Param Middleware
// primero especifico el parametro que quiero buscar
// luego el middleware function, que como sabemos necesita tres paramteros
// req, res y next, PERO en un Param Middleware, existe un 4to parametro
// y es el valor del parametro en cuestion, osea id
// recuerda que el ORDEN del codigo refreente a Middleware es muy importante
// aqui primero se ejecuta este codigo luego, el que sigue mas abajo
// este Middleware solo se ejecuta si pase un URL con id

// ve a productController.js para ver mas sobre
// param Middleware

// router.param('id', (req, res, next, value) => {
//   console.log(`Product id is: ${value}`);
//   next();
// });

// aqui compruebo que la id que se pasa por el URL desde el cliente sea Valido
// si no corto el proceso
// Ya eliminé este metodo checkID YA NO es necesario
// router.param('id', productController.checkID);


///////////////////////////////////////////////////////////////////
// Lecture-95 Making The API Better: Aliasing
///////////////////////////////////////////////////////////////////

// Otra funcionalidad que le puedo agregar a una API es un alias Route a un 
// request que sea muy popular, por ejemplo podria proporcionar un Route para 
// los 5 products  de mejor rating y mas baratos, pruebalo en POSTMAN

	// 127.0.0.1:8000/api/v1/products?limit=5&sort=-ratingsAverage,price

// Digamos que es una busqueda MUY popular y quiero proveer un Route que es 
// simple y facil de memorizar para el usuario, asi que voy a productRoutes.js en 
// el folder Routes y voy a crear un nuevo ROute


// voy a usar un Middleware para que me ayude a obtener los products de mejor 
// rating y mas baratos, aun usare el metodo getAllProducts que YA uso para 
// otras busquedas, pero con el Middleware lo voy a personalizar para esta 
// busqueda en especial, lo que el Middleware me va a ayudar es a manipular 
// el Query Object
// router
//   .route('/top-5-cheap')
//   .get(productController.aliasTopProducts, productController.getAllProducts);

///////////////////////////////////////////////////////////////////
// Lecture-102 Aggregation Pipeline: Matching and Grouping
///////////////////////////////////////////////////////////////////
// router
//   .route('/product-stats')
//   .get(productController.getProductsStats);

///////////////////////////////////////////////////////////////////
// Lecture-102 Aggregation Pipeline: Unwinding and Projecting
///////////////////////////////////////////////////////////////////

// Mi intencion es hacer el calculo por año asi que le paso un
// URL parametro
// router
//   .route('/monthly-plan/:year')
// //   .get(productController.getMonthlyPlan);
// 	///////////////////////////////////////////////////////////////////
// 	// Lecture-165 Adding Missing Authentication and Authorization
// 	///////////////////////////////////////////////////////////////////
// 	.get(authController.protect, 
// 					authController.restrictTo ('admin', 'lead-guide', 'guide'), 
// 					productController.getMonthlyPlan);  


///////////////////////////////////////////////////////////////////
// Lecture-171 Geospatial Queries: Finding Products Within Radius
///////////////////////////////////////////////////////////////////

// router
//     .route('/products-within/:distance/center/:latlng/unit/:unit')
//     .get(productController.getProductsWithin);




///////////////////////////////////////////////////////////////////
// Lecture-172 Geospatial Aggregation: Calculating Distances
///////////////////////////////////////////////////////////////////

// necesito la latitud y longitud donde el usuario esta actualmente y la unit
// en esta ocasion No necesito la distance porque no voy a buscar en cierto radio
// voy a calcular la distancia desde cierto punto a todos los products
// router
//     .route('/distances/:latlng/unit/:unit')
//     .get(productController.getDistances);    


///////////////////////////////////////////////////////////////////
// Lecture-165 Adding Missing Authentication and Authorization
///////////////////////////////////////////////////////////////////
router
  .route('/')
  .get( authController.protect, 
        authController.restrictTo ('admin', 'vendedor'),
        productController.getAllProducts)
  .post(authController.protect, 
        authController.restrictTo ('admin'), 
        productController.uploadProductPhoto,
	  productController.resizeProductImages,
        productController.createProduct);


router
  .route('/:id')
  .get( authController.protect, 
        authController.restrictTo ('admin'),
        productController.getProduct)

	///////////////////////////////////////////////////////////////////
	// Lecture-204 Uploading Multiple Images: Products
	///////////////////////////////////////////////////////////////////
	.patch(authController.protect, 
             authController.restrictTo ('admin'),
             productController.uploadProductPhoto,
             productController.resizeProductImages,
             productController.updateSlugProduct,
             productController.updateProduct)
  ///////////////////////////////////////////////////////////////////
  // Lecture-134 Authorization: User Roles And Permissions
  ///////////////////////////////////////////////////////////////////
  .delete(authController.protect, 
          authController.restrictTo('admin'),
          productController.deleteProduct);


// ahora exporto el router para impotarlo en app.js
// cuando solo tengo una cosa que exportar hago asi
module.exports = router;