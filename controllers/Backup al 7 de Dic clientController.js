const multer = require ('multer');
const sharp = require ('sharp');
const cloudinary = require('../Utils/cloudinary')

const Client = require('../models/clientModel');
// const APIFeatures = require('../Utils/apiFeatures')
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const factory = require('./handlerFactory');


// // __dirname en este caso es /routes
// const clientsInfo = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/clients-simple.json`)) 

///////////////////////////////////////////////////////////////////
// Making The API Better: Aliasing
///////////////////////////////////////////////////////////////////
// exports.aliasTopClients = (req, res, next) => {
// 	req.query.limit = '5';
// 	req.query.sort  = '-ratingsAverage,price';
// 	req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
// 	next(); 
// }

///////////////////////////////////////////////////////////////////
// Lecture-162 Factory Functions: Update and Create
///////////////////////////////////////////////////////////////////
exports.updateClient = factory.updateOne(Client);
exports.deleteClient = factory.deleteOne(Client);
exports.createClient = factory.createOne(Client);
exports.getClient = factory.getOne(Client);
exports.getAllClients = factory.getAll(Client);


///////////////////////////////////////////////////////////////////
// Lecture-204 Uploading Multiple Images: Clients
///////////////////////////////////////////////////////////////////

/*

Vamos a subir multiples fotos al mismo tiempo y tambien como procesar multiples 
imagenes al mismo tiempo

Vamos a usar imagenes de Clients

Que tipo de imagenes quiero? y cuantas? vamos al clientModel.js

	en imageCover solo necesito una imagen
	y tengo el images field que sera un Array y por lo general deben ser 3 imagenes, 
  porque esa la cantidad que muestro en el client detail page

La forma en que voy a subir y cargar estas imagenes es similar a lo que hice con los
 Users

VOy a copiar una parte del codigo de userController.js

Lo pego en

clientController.js


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



// Ahora creo el Middleware usando upload

// en userController.js use upload.single(‘photo’) porque solo tenia un field con un 
// archivo que queria subir, ‘photo’ es el nombre del field, pero aqui tengo multiples
// archivos y en uno de ellos subo un solo archivo y en el otro 3 imagenes, asi que uso 
// upload.fields y le paso un Array y cada uno de sus elementos es un Object en donde 
// especifico el field name

// Recuerda que name: ‘imageCover’ viene del clientSchema en clientModel.js
// maxCount: 1 significa que solo puedo tener un field llamado imageCover


// exports.uploadClientImages = upload.fields([
// 	{
// 		name: 'imageCover',
// 		maxCount: 1
// 	},
// 	{
// 		name: 'images',
// 		maxCount: 3
// 	}
// ]);

///////////////////////////////////////////////////////////////////
// Me encargo de subir una sola foto proveniente de req.body.photo
// se llama photo porque asi lo escogi desde el Client.jsx del Client
// o bien de NewClient.jsx
///////////////////////////////////////////////////////////////////
exports.uploadClientPhoto = upload.single('photo');


///////////////////////////////////////////////////////////////////
// Aqui me encargo de actualizar el slug, lo tengo que hacer aparte de
// exports.updateClient = factory.updateOne(Client)
// porque necesito usar findById y luego .save para ejeutar el metodo del slug
// si lo hago con findByIdAndUpdate el .save NO se ejecuta
///////////////////////////////////////////////////////////////////
exports.updateSlugClient = catchAsync( async (req, res, next) => {

	// const client = await Client.findOne( { sku: req.body.sku } );
	const client = await Client.findById( { _id: req.body._id } );

	// console.log("req.body", req.body)

	if (!client) {
		return next (new AppError ('El Cliente no existe' ,400));
	}

	// Si no hubo error entonces cambio el slug
	client.businessName = req.body.businessName;
	// console.log("client.businessName", client.businessName)
	// actualizo el Producto

	// Recuuerda que uso save y NO findOneAndUpdate porque con save puedo ejecitar 
	// validaciones y PRE save middlewares, por ejemplo donde se encriptan los passwords
	await client.save();

	next();
});

/*
En caso que no tuviera el imageCover y solo tuviera un field que aceptara multiples imagenes, lo pude hacer asi:
// upload.single(‘image’); esto produce req.file
// upload.array(‘images’, 5); esto produce req.files
// upload.fields() produce req.files

Voy a replicar este query en POSTMAN pero primero voy a crear un Client y lo hare 

En COMPASS duplicando uno de los clients, solo le cambio el

nombre;	The Mountain Biker
duration: 5
maxGroupSize: 10
slug: the-mountain-biker
borro el imageCover, osea borro el field y tambien el images field, createdAt tambien 
lo borro

y lo hice en Compass porque necesito tener las locations, summary y description para 
que se pinte correctamente en el website

Copip el ID del nuevo Client

Ahora vuelvo a POSTMAN me loggeo como Admin

{
	“email”: “admin@natours.io”
	“password”: “{{password}}”
}

me regresa
{
EXITO
}

Ahora en /updateClient
	{{URL}}api/v1/clients/updateClient/62bcf38c7ad48180a92eb0ed

Ahora voy a subir las imagenes segun como multer espera, 1 imageCover y 3 images
En Body -> form-data ->

{
	“Key”: “imageCover” (FILE)
	“Value”: /dev-data/img/new-client-1.jpg

	“Key”: “images” (FILE)
	“Value”: /dev-data/img/new-client-2.jpg

	“Key”: “images” (FILE)
	“Value”: /dev-data/img/new-client-3.jpg

	“Key”: “images” (FILE)
	“Value”: /dev-data/img/new-client-4.jpg

	Esta ultima foto tiene que ser procesada porque esta como portrait y yo las uso en 
  landscape eso lo hago en codigo con multer

	“Key”: “price”
	“Value”: 997
}

Hasta este momento no he implementado la logica porque hasta este punto no los estaria 
subiendo al file system osea al server, solo los tengo en memoria

Asi que creo un nuevo Middleware que va a procesaer las imagenes

En clientController.js
*/


// exports.resizeClientImages = (req, res, next) => {

// 	// si tengo multiples archivos hago esto, req.files y no req.file
// 	console.log('req.files[imageCover][0]:', req.files);
// 	next();
// }



/*
En clientRoutes.js

Solo voy a permitir subir imagenes en clientUpdate y no en createClient para mantenerlo 
simple

router
  .route(‘/:’id)
  .patch(authController.protect, authController.restrictTo (‘admin’, ‘lead-guide’), 
clientController.uploadClientImages,
clientController.resizeClientImages,
clientController.updateClient);

AHORA regreso a POSTMAN y ya puedo darle SEND

Me regresa {
 EXITO ME ACTUALIZO EL price pero aun NO las fotos
}

Pero no va a guardar estas imagenes en el server todavia, ni en la BD tampoco, solo 
en la Console


En Console

 imageCover: [
    {
      fieldname: 'imageCover',
      originalname: 'new-client-1.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 1857218 more bytes>,
      size: 1857268
    }
  ],
  images: [
    {
      fieldname: 'images',
      originalname: 'new-client-2.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 2321585 more bytes>,
      size: 2321635
    },
    {
      fieldname: 'images',
      originalname: 'new-client-3.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 884177 more bytes>,
      size: 884227
    },
    {
      fieldname: 'images',
      originalname: 'new-client-4.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 2927337 more bytes>,
      size: 2927387
    }
  ]
}

Es importante notar que includo el imageCover es un Array no solo images

*/



///////////////////////////////////////////////////////////////////
// Lecture-205 Processing Multiple Images
///////////////////////////////////////////////////////////////////

/*

En esta leccion vamos a procesar las imagenes 

Pero antes hay algo que arreglar en el userController.js

En userController.js

exports.resizeUserPhoto = catchAsync( async (req, res, next) => {
	
	// si no se mando una foto en el request me brinco al proximo Middleware
	if (!req.file) {
		return next();
	}

	// TENGO QUE PONER AWAIT, porque esto regresa una Promise y tiene sentido porque todos
	// los metodos de sharp toman tiempo y suceden por debajo del agua, osea es asincrono y
	// obvio NO DEBEN bloquear el Event Loop
	// EL PROBLEMA es que estoy mandando llamar 
	// el next function mas abajo, osea el proximo Middleware SIN esperar que estas operaciones
	// terminen y eso NO es una buena idea
	await sharp( req.file.buffer).resize(500, 500).toFormat(‘jpeg’).jpeg( {quality: 90 }).toFile(`public/img/users/${req.file.filename}`);

	next();
}); 


Ahora hare algo similar con las client Images, asi que copiare ese codigo de sharp

En clientController.js

*/

///////////////////////////////////////////////////////////////////
// Hago el upload de la foto a Cloudinary, ahora los procesos de resize
// los hago en Cloudinary, ya no es necesario usar el sharp package
// Convierto la imagen a webP
// Guardo la imagen en el Web Server (File System)
// Le pongo nombre a la imagen osea a imageCover 
///////////////////////////////////////////////////////////////////
exports.uploadImageToCloudinary = catchAsync( async (req, res, next) => {

	if (req.body.imageCover) {

		// uploadRes tiene los detalles de la imagen, width, height, url
		// subo la imagen a Cloudinary
		const uploadRes = await cloudinary.uploader.upload (req.body.imageCover,
			{
				upload_preset: 'onlineElJuanjoClients'
			});

		// Actualizo el nombre de imageCover en la Collection Clients
		// En el Middleware que sigue donde se actualiza toda la informacion del Cliente
		// se actualizara el imageCover
		// req.body.imageCover = req.file.filename;
		if (uploadRes)
			req.body.imageCover = uploadRes.secure_url;
	}
	
	next();
});

///////////////////////////////////////////////////////////////////
// Hago el resize de la foto al File System de donde guardo las páginas
// Este método YA NO lo uso porque descubri que me borraba algunas fotos
// cuando actualizaba las paginas en el servidor ya sea en Heroku o render.com
// y como tuve que usar ahora Cloudinary, ahora uso otro codigo para guardar
// las fotos, Aun asi dejo este codigo como referencia porque sirve
// Convierto la imagen a webP
// Guardo la imagen en el Web Server (File System)
// Le pongo nombre a la imagen osea a imageCover 
///////////////////////////////////////////////////////////////////
exports.resizeClientImagesAndUploadToFileSystem = catchAsync( async (req, res, next) => {

	// si tengo multiples archivos hago esto, req.files y no req.file
	// console.log('req.file', req.file);
	// console.log('req.files', req.files);
	// console.log('req.body', req.body);
	// console.log('req.params',req.params);
	
	if (!req.file) {
		return next();
	}

	// req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
	// req.file.filename = `client-${Date.now()}.jpeg`;
	req.file.filename = `client-${Date.now()}.webp`;

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
	// 			.toFile(`client/public/img/clients/${req.file.filename}`);
	// console.log("filename", req.file.filename)

	await sharp( req.file.buffer)
				.resize(500, 500)
				.toFormat('webp')
				.webp( {quality: 30 })
				.toFile(`./public/img/clients/${req.file.filename}`);
				
	// Actualizo el nombre de imageCover en la Collection Products
	// En el Middleware que sigue donde se actualiza toda la informacion del Producte
	// se actualizara el imageCover
	req.body.imageCover = req.file.filename;

	
	next();
});

///////////////////////////////////////////////////////////////////
// Making The API Better: Aliasing
///////////////////////////////////////////////////////////////////
exports.aliasClientByBusinessName = (req, res, next) => {
	
	req.query = {
		businessName: {
			regex: `(?i)${req.params.byBusinessName}`
		},
		sort: 'businessName'
	}
	next(); 
}