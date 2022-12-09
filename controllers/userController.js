// En este caso quiero exportar TODAS las funciones de este modulo y lo hago asi
// asi que no uso module.exports, sino que uso el exports Object
// exports.getAllUsers
// exports.createUser 
// exports.getUser
// exports.updateUser 
// exports.deleteUser 
// y esto sera importado en UserRoutes.js

///////////////////////////////////////////////////////////////////
// Lecture-130 Logging in Users
///////////////////////////////////////////////////////////////////

const multer = require ('multer');

///////////////////////////////////////////////////////////////////
// Lecture-202 Resizing Images
///////////////////////////////////////////////////////////////////
const sharp = require ('sharp');
const cloudinary = require('../Utils/cloudinary');


const User = require('../models/userModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require ('../Utils/appError');
const factory = require ('./handlerFactory');

/*
Como paso final NO quiero poner a los Users inactivos en /Get All Users
Y para esto puedo usar Query Middleware, osea un query que se ejecuta ANTES del 
query que quiero ejecutar
El Query Middleware esta en userModel.js
		userSchema.pre(/^find/, function (next) {

*/
// exports.getAllUsers = catchAsync (async (req, res, next) => { 
//   const allUsers = await User.find();

//   // SEND RESPONSE
//   res.status(200).json({
//       status: 'success',
//       // requestedAt: req.requestTime,
//       results: allUsers.length,
//       data: {
//         allUsers
//       }
//   });
// });

// exports.getUser = (req, res) => {
//     res.status(500).json( {
//       status: 'error',
//       message: 'This route is not yet defined.'
//   });
// }

exports.createUser = (req, res) => {
  res.status(500).json( {
    status: 'error',
		message: 'This route is not defined! Please use /signup instead'
  });
}

// exports.updateUser = (req, res) => {
//   res.status(500).json( {
//     status: 'error',
//     message: 'This route is not yet defined.'
//   });
// }

// exports.deleteUser = (req, res) => {
//   res.status(500).json( {
//     status: 'error',
//     message: 'This route is not yet defined.'
//   });
// }

///////////////////////////////////////////////////////////////////
// Lecture-161 Building Handling Factory Functions: Delete
///////////////////////////////////////////////////////////////////
exports.deleteUser = factory.deleteOne(User);

///////////////////////////////////////////////////////////////////
// Lecture-140 Deleting the Current User
///////////////////////////////////////////////////////////////////
exports.deleteMe = catchAsync( async (req, res, next) => {
	await User.findByIdAndUpdate( req.user.id, { active: false } );
	
	res.status(204).json({
		status: 'success',
		data: null
	});
	
});


///////////////////////////////////////////////////////////////////
// Lecture-139 Updating the Current User: Data
///////////////////////////////////////////////////////////////////

/*

En esta leccion un User que esta loggeado podra manipular su informacion

Ya que estamos empezando con la implementacion de actualizar la informacion del User 
nos alejamos de la Authentication, asi que ya no usare authController.js ahora usare 
userController.js

En userRouter.js

Todo esto es seguro porque el ID del User que va a ser actualizado viene de request.user, 
el cual fue configurado por authController.protect Middleware, el cual obtuvo el 
Id del User del JSON Web Token, y ya que nadie puede cambiar el Id que esta dentro 
de ese JSON Web Token sin conocer JWT_SECRET entonces sabemos que el Id del User 
esta seguro

router.patch('/updateMe', authController.protect, userController.updateMe);


// En userController.js

Para actualizar el User que esta actualmente loggeado, mas adelante implementare 
exports.updateUser pero es para un admin para que actualice la informacion del User

*/
const filterObj = (objBody, ...allowedFields) => {

	const newObj = {};

	// una de las formas mas facil de hacer un loop a un OBJETO en Javascript
	// esto es un loop a un Objeto NO a un Array
	// Object.keys(objBody) y esto regresa un Array conteniendo los Key names y con eso
	// ya puedo hacerle un forEach porque regresa un Array

	Object.keys(objBody).forEach(current => {

		if (allowedFields.includes(current)) {
			// si el current element existe en allowedFields lo agrego a un Objeto
			// recuerda que current es key: value, NO es un index
			newObj[current] = objBody[current];
		}
	})

	return newObj;
}

exports.updateMe = catchAsync( async (req, res, next) => {
	// Por ahora el User solo puede actualizar su name y su email address
	// Es una costumbre que actualizar el password de un User se hace en un lugar y la informacion de su cuenta en otro lado

	// console.log('req.file', req.file);
	// console.log(req.body);

	// 1. Create error if the user POSTs password data
	if (req.body.password || req.body.confirmPassword) {
		// 400 Bad Request
		return next (new AppError ('This route is not for password updates. Please use /updateMyPassword', 400));
	}

	// Podría ejecutar user.save(), como en actualizar el password, obtener al user, 
  // actualizar las properties y luego grabar el Document en la BD. Pero el problema 
  // con eso es que hay algunos fields que son required y que no estamos actualizando y 
  // debido a eso obtendria un error, y hare una prueba mas abajo

	// a este metodo le mando que busco a un User en base a su id, y le especifico
	// los fields que quiero que actualize y ademas unas opcioes
	// { new: true } significa que me regrese el nuevo Objeto User ya actualizado en vez 
  // del viejo en el segundo parametro le puse x y no req.body porque no quiero 
  // actualizar todo lo que esta en el req.body, porque digamos que el User pone 
  // el Role y un User normal podria hacerse admin y no quiero eso
	// Por el momento solo voy a permitir que se actualice name y email

	// entonces creo una funcion que filtre los datos de req.body, como primer parametro
	// es el mismo req.body, y ademas unos argumentos mas, uno por cada uno de los fields que
	// quiero mantener en el Object
	// 2. Filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email');


	///////////////////////////////////////////////////////////////////
	// Lecture-201 Saving Image Name to Database
	///////////////////////////////////////////////////////////////////

	// Con esto voy a subir el nombre de la foto a MongoDB para actualizar
	// el User Document
	// el req.file viene de cuando haga el request, por ejemplo en POSTMAN lo puse ahi 
	if (req.file){
		filteredBody.photo = req.file.filename;
	}

	// 3. Update the User Document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser
		}
	});

/*
Prueba de que NO me permita actualizar el Password

Voy a hacer una prueba en POSTMAN. Primero hago un /SignUp y creo un nuevo User 

{
	“name”: “ventas”
	“email: “ventas@hotmail.com”
	“password”: “ventas123”,
	“confirmPassword”: “ventas123”
}

y me regresa el token y claro tambien me loggea
{
SUCCESS
}


luego intento hacer PATCH /updateMe intentando actualizar el password, me debe 
mandar mensaje de error

Primero voy a Authorization -> Bearer Token -> {{jwt}} (la environment Variable)

En el Body -> raw -> JSON
{
	“password”: “nuevopass”,
	“confirmPassword: “nuevopass”,
	“name”: “Abdel Yussuf”
}

*/

/*

Prueba de que me marca ERROR si intento ejecutar user.save() para grabar actualizaciones 
de User
	const user = await User.findById(req.user.id);
	user.name = ‘Jonas’;
	await user.save();

Voy a POSTMAN si no estoy loggeado hago /Login y luego voy a /updateMe

{
	“name”: “ventas”
}

y me regresa 
{
PLEASE CONFIRM YOUR PASSWORD
}

Esto es porque confirmPassword es un required field, pero no lo agregue, asi que el 
metodo .save() no es la mejor opcion en este caso, asi que la solucion es 
ejecutar .findByIdAndUpdate, no habia podido usar este metodo por las razones que 
ya dijo Jonas, pero como no estamos actualizando passwords ahora si la puedo usar 
porque es para actualizar informacion NO sensible como name y email

*/

/*
Ahora voy a POSTMAN a probar que si grabe solo fields name y email, si no estoy 
loggeado hago 
/ Login a un User normal y luego /updateMe

{
	“name”: “Juan”,
	“role”: “admin”
}

y me regresa 
{
	SUCCESS
}

La proxima leccion es que Un User pueda borrarse a si mismo si ya noq uiere ser parte 
de la App

*/

});


///////////////////////////////////////////////////////////////////
// Lecture-140 Deleting the Current User
///////////////////////////////////////////////////////////////////


/*
Permitir que un User pueda borrar su propia cuenta
Cuando un User decide borrar su cuenta, no la borramos de la BD, sino que la dejamos 
inactiva. Para que el usuario pueda reactivar su cuenta o si queremos tener acceso a 
su cuenta en el futuro

Primero necesito agregar una nueva property en el userSchema

En userRoutes.js

// AUnque NO hago un delete a la BD, pero como el User ya no estara disponible esta bien 
si le pongo HTTP Delete
router.delete(‘/deleteMe’, authController.protect, userController.deleteMe);

En userModel.js

active: {
	type: Boolean,
	default: true,
	select: false
}

Ahora para borrar al User lo unico que tengo que hacer poner active a false

En userController.js

exports.deleteMe = catchAsync( async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false } );
	
	res.status(200).json({
		status: ‘success’,
		data: null
	});
	
});
*/


/*
Voy a POSTMAN y creo un nuevo request llamado /deleteMe, con un HTTP de DELETE
Le agrego {{jwt}} en Authorization -> Bearer Token

/Get All Users ya funciona asi que puedo ver a cual elegir para borrar
           {
                "role": "user",
                "_id": "62b921770c4c38fb5c61fe06",
                "name": "Erik",
                "email": "ventas@hotmail.com",
                "__v": 0,
                "id": "62b921770c4c38fb5c61fe06"
            }

Para probarlo necesito estar loggeado asi que le hago /Login luego ya /deleteMe
{
	“name”: “Erik”,
	“password”: “newpass123”
}

Y me regresa un status 204
{
    "status": "success",
    "data": null
}

Voy a Compass y compruebo que el field active: false al User que borre, osea 
aun EXISTE en la BD pero esta inactivo
Asi es el Document ahi esta con
	name: Erik
	email: ventas@hotmail.com
	active: false

Como paso final NO quiero poner a los Users inactivos en /Get All Users, porque este API
Y para esto puedo usar Query Middleware, osea un query que se ejecuta ANTES del query 
que quiero ejecutar

En userModel.js


Recuerda que uso una regular function para tener acceso al this keyword , osea que 
apunta al Current Query, osea que si voy a ejecutar exports.getAllUsers, veo que ahi tengo un find query
  	const allUsers = await User.find(} );


Tambien recuerda que uso una regular expresion para indicar que quiero NO solo find 
sino tambien cualquier query que empiece con find como find and Update, find and Delete, 
etc

userSchema.pre(/^find/, function (next) {
	// esta linea no funciono porque agregué active al Schema despues de que empece a 
	// crear Users, asi que mucho no tienen el field active, asi que la opcion es la 
	// siguiente linea despues de esta
	// this.find ( { active: true  } );
	this.find ( { active: { $ne: false}  } );

	next();
});

Ahora lo pruebo en POSTMAN voy a Get All Users

{
	Y ya me regresa SOLO los Users que NO tengan active: false
}

*/


///////////////////////////////////////////////////////////////////
// Lecture-162 Factory Functions: Update and Create
///////////////////////////////////////////////////////////////////

exports.updateUser = factory.updateOne(User);

///////////////////////////////////////////////////////////////////
// Lecture-163 Factory Functions: Readings
///////////////////////////////////////////////////////////////////

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);



///////////////////////////////////////////////////////////////////
// Lecture-164 Adding a /me Endpoint
///////////////////////////////////////////////////////////////////

/*

Es una buena practica implementar un Endpoint /me en toda API, osea un endpoint 
donde el user puede obtener su propia informacion , es algo muy similiar a los 
endpointd deleteme y updateme 

En userController.js
*/

// Voy a usar un pequeño Middleware para usar el ID del User actualmente loggeado 
// y no tener que mandarlo en el Query String

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;

	next();
}

/*
En userRoutes.js

router.get(‘/me’, authController.protect, userController.getMe, userController.getUser);

Voy a POSTMAN a probar, creo en el folder Users el API /getme
 
	GET {{URL}}api/v1/users/me

Necesito Authorization Bearer Token {{jwt}} 

y me regresa
{
    "status": "success",
    "data": {
        "data": {
            "role": "user",
            "_id": "62b4c0843a618b358b8fcee2",
            "name": "abdelito",
            "email": "hello@hotmail.com",
            "__v": 0,
            "passwordChangedAt": "2022-06-28T03:47:25.243Z",
            "id": "62b4c0843a618b358b8fcee2"
        }
    }
}

*/



///////////////////////////////////////////////////////////////////
// Lecture-200 Configuring Multer
///////////////////////////////////////////////////////////////////

/*

Voy a configurar Multer para mis necesidades. Primero le dare a las imagenes un mejor 
nombre y segundo solo voy a permitir a imagenes a ser subidas al server

Para empezar voy a mover todo lo relaciones a Multer a userController.js


En userController.js

const multer = require (‘multer’);

*/


// Para configurar Multer a mis necesidades quiero crear un Multer storage y un Multer 
// filter
// Tengo la opcion de guardar el archivo en memoria osea en un buffer y que pueda ser 
// usado despues por otros procesos y eso lo hare despues o tambien fisicamente en el 
// server (file system)

// const multerStorage = multer.diskStorage ({
// 	// el destino aqui es mas complejo que antes, aqui es un callback function, que 
// 	// tiene acceso al current request, al current uploaded file y al callback function, 
// 	// y esta function es como la next () function en Express, pero la llamo cb aqui  
// 	// para usar un nombre diferente, porque no tiene que ver con Express, pero es 
// 	// similar de que puedo pasar errores y otras cosas

// 	destination: (req, file, cb) => { 
// 		// para definir el destination necesito llamar al callback function, cb y el 
// 		// primer argumento es un error si es que hubiera y si no , solo manda null, 
// 		// el segundo argumento es el destino

// 		// documentation: multer github
// 		cb (null, 'public/img/users');
// 	},
// 	filename: ( req, file, cb) => {
// 		// quiero que el archivo tenga un nombre unico: user-userId-currentTimestamp.ext(jpeg)
// 		// primero extraigo el nombre del archivo del archivo que subi
// 		// y como hago eso?
// 		// con req.file, el cual viene en el parametro file
// 		// en mimetype tengo la extension

// 		// asi obtengo la extension
// 		const ext = file.mimetype.split('/')[1];

// 		cb (null, `user-${req.user.id}-${Date.now()}.${ext}`);
// 	}

// });

///////////////////////////////////////////////////////////////////
// Lecture-202 Resizing Images
///////////////////////////////////////////////////////////////////
// entonces la imagen sera guardada como un buffer y asi la usare en el 
// procesamiento de imagenes, por eso comentarize 
// 		const multerStorage = multer.diskStorage ({
// 				...

const multerStorage = multer.memoryStorage();

// Ahora voy a crear el Multer filter que tambien es un callback function similiar 
// al anterior y aqui la meta es probar si el archivo subido es una imagen, de ser asi 
// paso true al call back function, de lo contrario false junto con un error, si 
// en tu App quieres subir otra cosa como archivos CSV lo puedes hacer

const multerFilter = (req, file, cb) => {

	// uso el mimetype
	if (file.mimetype.startsWith('image')) {
		cb (null, true);
	}
	else {
		cb ( new AppError ('Not an image! Please upload only', 400), false);
	}	
}

// Ahora creo el upload
// const upload = multer( { dest: ‘public/img/users’ });

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});

///////////////////////////////////////////////////////////////////
// Hago el upload de la foto a Cloudinary, ahora los procesos de resize
// los hago en Cloudinary, ya no es necesario usar el sharp package
// Convierto la imagen a webP
// Le pongo nombre a la imagen osea a imageCover 
///////////////////////////////////////////////////////////////////
exports.uploadImageToCloudinary = catchAsync( async (req, res, next) => {

	if (!req.file) {
		return next();
	}

	// uploadRes tiene los detalles de la imagen, width, height, url
	// subo la imagen a Cloudinary

	// Hago la conversión a base64 para poder subir la imagen a Cloudinary
	const imageBase64 = req.file.buffer.toString('base64');
	const uploadStr = `data:${req.file.mimetype};base64,${imageBase64}`;

	const uploadRes = await cloudinary.uploader.upload (uploadStr,
		{
			upload_preset: 'onlineElJuanjoUsers'
		}
	);

	// Actualizo el nombre de imageCover en la Collection Clients
	// En el Middleware que sigue donde se actualiza toda la informacion del Cliente
	// se actualizara el imageCover
	if (uploadRes) {
		req.file.filename = uploadRes.secure_url;
	}

	next();
});

// MIDDLEWARE!!!! muy sencillo
exports.uploadUserPhoto = upload.single('photo');


/*
En userRoutes.js

router.patch('/updateMe', userController.uploadUserPhoto, userController.updateMe);


Ahora para probar primero borro la imagen que subi en la leccion anterior en 
public/img/users

Voy a POSTMAN, me loggeo con leo@example.como

Ahora actualizo
		{{URL}}api/v1/users/updateMe

En vez de usar Body -> raw, voy a usar Body -> form data, porque esta es la manera en 
que puedo enviar multi-part Form data


	Key: “name”
	Value:  “Leo J. Gillespie”
	Key: “photo”
	Value: (En lugar de texto especifico File): Y aqui me aparece una ventana para 
	seleccionar el archivo que quiero subir: natours -> dev-data -> img -> leo.jpg

Me regresa

{
    "status": "success",
    "data": {
        "user": {
            "role": "guide",
            "_id": "5c8a1f292f8fb814b56fa184",
            "name": "Leo J. Gillespie",
            "email": "leo@example.com",
            "photo": "user-5.jpg",
            "__v": 0,
            "id": "5c8a1f292f8fb814b56fa184"
        }
    }
}

En la console veo el filename es correcto como lo programe
{
  fieldname: 'photo',
  originalname: 'leo.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'public/img/users',
  filename: 'user-5c8a1f292f8fb814b56fa184-1658527257367.jpeg',
  path: 'public/img/users/user-5c8a1f292f8fb814b56fa184-1658527257367.jpeg',
  size: 207078
}
[Object: null prototype] { name: 'Leo J. Gillespie' }


Ahora para probar que no pueda subir imagenes voy a intentar subir otro tipo de acrchivo

En POSTMAN

Ahora actualizo
		{{URL}}api/v1/users/updateMe

En vez de usar Body -> raw, voy a usar Body -> form data, porque esta es la manera 
en que puedo enviar multi-part Form data


	Key: “name”
	Value:  “Leo J. Gillespie”
	Key: “photo”
	Value: (En lugar de texto especifico File): Y aqui me aparece una ventana para 
	seleccionar el archivo que quiero subir: natours -> dev-data -> data -> reviews.json

Me regresa

{
    "status": "fail",
    "error": {
        "statusCode": 400,
        "status": "fail",
        "isOperational": true,
        "storageErrors": []
    },
    "message": "Not an image! Please upload only",
    "stack": "Error: Not an image! Please upload only\n    at multerFilter (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/userController.js:511:8)\n    at wrappedFileFilter (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/multer/index.js:44:7)\n    at Multipart.<anonymous> (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/multer/lib/make-middleware.js:107:7)\n    at Multipart.emit (node:events:527:28)\n    at HeaderParser.cb (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/busboy/lib/types/multipart.js:358:14)\n    at HeaderParser.push (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/busboy/lib/types/multipart.js:162:20)\n    at SBMH.ssCb [as _cb] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/busboy/lib/types/multipart.js:394:37)\n    at feed (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/streamsearch/lib/sbmh.js:200:10)\n    at SBMH.push (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/streamsearch/lib/sbmh.js:104:16)\n    at Multipart._write (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/busboy/lib/types/multipart.js:567:19)\n    at writeOrBuffer (node:internal/streams/writable:389:12)\n    at _write (node:internal/streams/writable:330:10)\n    at Multipart.Writable.write (node:internal/streams/writable:334:10)\n    at IncomingMessage.ondata (node:internal/streams/readable:754:22)\n    at IncomingMessage.emit (node:events:527:28)\n    at addChunk (node:internal/streams/readable:315:12)"
}

Aun falta ligar al User a la nueva imagen, porque en la BD aun tengo el nombre del 
archivo anterior, lo hare en la proxima leccion

*/



///////////////////////////////////////////////////////////////////
// Lecture-201 Saving Image Name to Database
///////////////////////////////////////////////////////////////////


/*


Vamos a grabar el nombre verdadero de la imagen subida al User Document correspondiente

En userController.js

en exports.updateMe

Los datos que son actualizados en la BD son tomados de filteredBody


exports.updateMe = catchAsync( async (req, res, next) => {

	const filteredBody = filterObj(req.body, 'name', 'email');

	if (req.file)
		filteredBody.photo = req.file.filename;


Voy a POSTMAN a probar, me loggeo primero con leo@example.com

Ahora actualizo
		{{URL}}api/v1/users/updateMe

En vez de usar Body -> raw, voy a usar Body -> form data, porque esta es la manera en 
que puedo enviar multi-part Form data


	Key: “name”
	Value:  “Leo J. Gillespie”
	Key: “photo”
	Value: (En lugar de texto especifico File): Y aqui me aparece una ventana para 
		seleccionar el archivo que quiero subir: natours -> dev-data -> img -> leo.jpg

Me regresa

{
    "status": "success",
    "data": {
        "user": {
            "role": "guide",
            "_id": "5c8a1f292f8fb814b56fa184",
            "name": "Leo J. Gillespie",
            "email": "leo@example.com",
            "photo": "user-5c8a1f292f8fb814b56fa184-1658542114909.jpeg",
            "__v": 0,
            "id": "5c8a1f292f8fb814b56fa184"
        }
    }
}

Ahora me envia el nombre correcto y actualizado!! en la photo


Ahora un pequeño detalle, que pasa cuando creo un nuevo User, no tendra foto al inicio, 
corrijamos eso

Por default hay una imagen en /public/img/users/default.jpg


En userModel.js

en userSchema, pongo un default a photo

	photo: {
		type: String,
		default: ‘default.jpg’
	}

Ahora en POSTMAN creo un nuevo user en /Sign up

luego elijo Body -> Raw -> JSON
Y escribo el objeto que tiene los datos del User Nuevo
{
    "name": “Monica”,
    "email": “monica@example.com",
    "password": “pass1234”,
    "confirmpassword": “pass1234”
}

Y me regresa
{
EXITO
}

Ahora me loggeo con este User monica pero desde Chrome, voy a
	127.0.0.1:8000/me

me sale el avatar, no la foto de Monica

Me regreso a POSTMAN y voy a dar /updateMe como Monica


	Key: “photo”
	Value: (En lugar de texto especifico File): Y aqui me aparece una ventana para 
	seleccionar el archivo que quiero subir: natours -> dev-data -> img -> monica.jpg

{
    "status": "success",
    "data": {
        "user": {
            "photo": "user-62db5a196d1e02b11bdc9d31-1658542726472.jpeg",
            "role": "user",
            "_id": "62db5a196d1e02b11bdc9d31",
            "name": "Monica",
            "email": "monica@example.com",
            "__v": 0,
            "id": "62db5a196d1e02b11bdc9d31"
        }
    }
}

Me regreso a Chrome en 127.0.0.1:8000/me

Me sale la foto de Monica

Ahora que pasa si el User carga una imagen super pesada? 10,000 X 10,000 pixels o una 
imagen que no sea cuadrada, entonces necesito cambiar el tamaño de la imagen y 
formatear la imagen para que se ajuste a mis necesidades , lo vere en la proxima leccion


*/



///////////////////////////////////////////////////////////////////
// Lecture-202 Resizing Images
///////////////////////////////////////////////////////////////////

/*


Procesar imagenes y manipularlas usando NodeJS, voy modificar el tamaño y convertir 
imagenes

Estoy asumiendo que las imagenes son cuadradas para despues mostrarlas como circulos 
y esto solo funciona si otiginalmente son cuadrados, asi que debo asegurarme que la 
foto sea cuadrada haciendo yo mismo cuadrados

Voy a agregar otro Middleware que se ocupara de cambiar el tamaño antes del .updateMe

En userController.js

const sharp = require (’sharp’);
*/

exports.resizeUserPhoto = catchAsync( async (req, res, next) => {
	
	// si no se mando una foto en el request me brinco al proximo Middleware
	if (!req.file) {
		return next();
	}

	// este paso es necesario aqui porque en .updateMe uso req.file.filename
	req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

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
				.toFormat('jpeg')
				.jpeg( {quality: 90 } )
				.toFile(`public/img/users/${req.file.filename}`);

	next();
});

/*
Comentarizo .diskStorage

// const multerStorage = multer.diskStorage ({

//	destination: (req, file, cb) => { 
//		cb (null, ‘public/img/users’);
//	},
//	filename: ( req, file, cb) => {
//		const ext = file.mimetype.split(‘/‘)[1];
//		cb (null, `user-${req.user.id}-${Date.now()}.${ext}`);
//	}
// });

// entonces la imagen sera guardada como un buffer y asi la usare en el procesamiento de imagenes
const multerStorage = multer.memoryStorage();

En userRoutes.js

router.patch('/updateMe', userController.uploadUserPhoto, 
													userController.resizeUserPhoto, 
													userController.updateMe);

Voy a POSTMAN a probarlo , ahora el User que quiero actualizar es Aarav que tiene una 
imagen rectangular que tiene un tamaño de 1000 X 1500 y despues comparare la nueva 
foto ya con el cambio de tamaño

Me loggeo como Aarav

{
	“email”: “aarav@example.com”,
	“password”: {{password}}

}

y me regresa

{
EXITO
}

Me voy a Chrome me loggeo como Aarav y voy a la account
	127.0.0.1:8000/me

Voy a POSTMAN a actualizarlo en /updateMe

		{{URL}}api/v1/users/updateMe

En vez de usar Body -> raw, voy a usar Body -> form data, porque esta es la manera 
en que puedo enviar multi-part Form data



	Key: “photo”
	Value: (En lugar de texto especifico File): Y aqui me aparece una ventana para 
	seleccionar el archivo que quiero subir: natours -> dev-data -> img -> aarav.jpg

Me regresa

{
    "status": "success",
    "data": {
        "user": {
            "photo": "user-5c8a21f22f8fb814b56fa18a-1658553560879.jpeg",
            "role": "lead-guide",
            "_id": "5c8a21f22f8fb814b56fa18a",
            "name": "Aarav Lynn",
            "email": "aarav@example.com",
            "__v": 0,
            "id": "5c8a21f22f8fb814b56fa18a"
        }
    }
}

Checo la imagen en VS Code en /public/img/users/

Tiene tamaño de 500 x 500

Me voy a Chrome me loggeo como Aarav y voy a la account
	127.0.0.1:8000/me

Y cambio la IMAGEN!

En la proxima leccion hare esto pero en la pagina
*/