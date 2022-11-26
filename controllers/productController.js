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

///////////////////////////////////////////////////////////////////
// Guardo la foto osea imageCover en Memoria ya que antes de guardarla
// en el disco duro del Web Server (File System) voy a darle
// un Resize, a convertirlo a webP y a comprimir la foto para que
// ocupe el menor espacio posible
///////////////////////////////////////////////////////////////////
const multerStorage = multer.memoryStorage();

///////////////////////////////////////////////////////////////////
// Me aseguro de solo aceptar archivos para imageCover que sean imagenes
// de cualquier tipo, el usuario puede seleccionar cualquier tipo de imagen
// de todos modos lo convertire a webP
// Si el archivo no es imagen mando error
///////////////////////////////////////////////////////////////////
const multerFilter = (req, file, cb) => {

	// uso el mimetype
	if (file.mimetype.startsWith('image')) {
		cb (null, true);
	}
	else {
		cb ( new AppError ('Not an image! Please upload only', 400), false);
	}	
}

///////////////////////////////////////////////////////////////////
// Defino como usare a multer, mandando llamar a multerStorage
// y multerFilter
///////////////////////////////////////////////////////////////////
const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});


///////////////////////////////////////////////////////////////////
// Me encargo de subir una sola foto proveniente de req.body.photo
// se llama photo porque asi lo escogi desde el product.jsx del Client
// o bien de NewProduct.jsx
///////////////////////////////////////////////////////////////////
exports.uploadProductPhoto = upload.single('photo');


///////////////////////////////////////////////////////////////////
// Aqui me encargo de actualizar el slug, lo tengo que hacer aparte de
// exports.updateProduct = factory.updateOne(Product)
// porque necesito usar findById y luego .save para ejeutar el metodo del slug
// si lo hago con findByIdAndUpdate el .save NO se ejecuta
///////////////////////////////////////////////////////////////////
exports.updateSlugProduct = catchAsync( async (req, res, next) => {

	// const product = await Product.findOne( { sku: req.body.sku } );
	const product = await Product.findById( { _id: req.body._id } );

	// console.log("req.body", req.body)

	if (!product) {
		return next (new AppError ('El Producto no existe' ,400));
	}

	// Si no hubo error entonces cambio el slug
	product.productName = req.body.productName;
	// console.log("product.productName", product.productName)
	// actualizo el Producto

	// Recuuerda que uso save y NO findOneAndUpdate porque con save puedo ejecitar 
	// validaciones y PRE save middlewares, por ejemplo donde se encriptan los passwords
	await product.save();

	next();
});


///////////////////////////////////////////////////////////////////
// Hago el resize de la foto
// Convierto la imagen a webP
// Guardo la imagen en el Web Server (File System)
// Le pongo nombre a la imagen osea a imageCover 
///////////////////////////////////////////////////////////////////
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
	// req.file.filename = `product-${Date.now()}.jpeg`;
	req.file.filename = `product-${Date.now()}.webp`;

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
	// await sharp( req.file.buffer)
	// 			.resize(500, 500)
	// 			// .toFormat('jpeg')
	// 			.jpeg( {quality: 90, lossless: true } )
	// 			.toFile(`client/public/img/products/${req.file.filename}`);

	await sharp( req.file.buffer)
				.resize(700, 700)
				.toFormat('webp')
				.webp( {quality: 30 } )
				.toFile(`./public/img/products/${req.file.filename}`);	
				// .toFile(`client/public/img/products/${req.file.filename}`);	

	// Actualizo el nombre de imageCover en la Collection Products
	// En el Middleware que sigue donde se actualiza toda la informacion del Producte
	// se actualizara el imageCover
	req.body.imageCover = req.file.filename;
	
	next();
});
