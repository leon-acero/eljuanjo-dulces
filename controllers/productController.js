const multer = require ('multer');
const sharp = require ('sharp');

const Product = require('../models/productModel');
// const APIFeatures = require('../Utils/apiFeatures')
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const factory = require('./handlerFactory');


// // __dirname en este caso es /routes
// const productsInfo = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/products-simple.json`)) 

///////////////////////////////////////////////////////////////////
// Making The API Better: Aliasing
///////////////////////////////////////////////////////////////////
exports.aliasTopProducts = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort  = '-ratingsAverage,price';
	req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
	next(); 
}

///////////////////////////////////////////////////////////////////
// Lecture-162 Factory Functions: Update and Create
///////////////////////////////////////////////////////////////////
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.createProduct = factory.createOne(Product);
exports.getProduct = factory.getOne(Product);
exports.getAllProducts = factory.getAll(Product);


///////////////////////////////////////////////////////////////////
// Lecture-204 Uploading Multiple Images: Products
///////////////////////////////////////////////////////////////////

/*

Vamos a subir multiples fotos al mismo tiempo y tambien como procesar multiples 
imagenes al mismo tiempo

Vamos a usar imagenes de Products

Que tipo de imagenes quiero? y cuantas? vamos al productModel.js

	en imageCover solo necesito una imagen
	y tengo el images field que sera un Array y por lo general deben ser 3 imagenes, 
  porque esa la cantidad que muestro en el product detail page

La forma en que voy a subir y cargar estas imagenes es similar a lo que hice con los
 Users

VOy a copiar una parte del codigo de userController.js

Lo pego en

productController.js


const multer = require ('multer');
const sharp = require ('sharp');
*/

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {

	// uso el mimetype
	if (file.mimetype.startsWith('image')) {
		cb (null, true);
	}
	else {
		cb ( new AppError ('Not an image! Please upload only', 400), false);
	}	
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});

exports.uploadProductPhoto = upload.single('photo');


exports.resizeProductImages = catchAsync( async (req, res, next) => {

	// si tengo multiples archivos hago esto, req.files y no req.file
	// console.log('req.file', req.file);
	// console.log('req.files', req.files);
	// console.log('req.body', req.body);
	// console.log('req.params',req.params);

	if (!req.file) {
		return next();
	}

	// req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
	req.file.filename = `product-${Date.now()}.jpeg`;

	// Si hago el Photo resizing uso el sharp package, desde la terminal
	//	npm i sharp
	// sharp es una libreria muy facil de usar para procesar imagenes

	// Cuando se hace procesamiento de imagenes como en este caso, kusto despues de subir
	// un archivo siempre es mejor NO grabar el archivo en el server, sino mejor 
	// tenerlo en memoria asi que necesito cambiar el multerStorage

	// llamar la sharp function de esta manera creara un object  sobre el cual puedo 
	// encadenar multiples metodos para poder hacer el procesamiento de imagenes
	// .resize aqui especifico with y height, esto le hara un crop a la imagen
	// documentation github sharp o mejor su website 
	// sharp.pixelplumbing.com -> Resizing images
	// .toFormat convertir imagenes siempre a .jpeg
	// .jpeg para definir la calidad del jpeg, osea comprimirlo
	// .toFile ahora si quiero escribir la imagen como archivo en el server, 
	// aqui necesito el path completo del archivo
	await sharp( req.file.buffer)
				.resize(500, 500)
				// .toFormat('jpeg')
				.jpeg( {quality: 90, lossless: true } )
				.toFile(`client/public/img/products/${req.file.filename}`);

	// Actualizo el nombre de imageCover en la Collection Products
	// En el Middleware que sigue donde se actualiza toda la informacion del Producte
	// se actualizara el imageCover
	req.body.imageCover = req.file.filename;
	
	next();
});
