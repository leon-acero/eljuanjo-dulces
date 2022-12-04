const AppError = require('../Utils/appError');


// ///////////////////////////////////////////////////////////////////
// // Better Errors and Refactoring
// ///////////////////////////////////////////////////////////////////

// /*
// Por ultimo quiero exportar este Middleware que esta en app.js porque mas adelante 
// voy a crear unas functions para manejar diferentes tipos de errores, asi que quiero 
// todas estas funciones en el mismo archivo, y se puede decir que estas funciones son 
// Handlers, que tambien son llamados Controllers en el contexto de la arquitectura MVC , 
// asi que voy a crear un archivo Error Controller el folder Controller, y lo voy a hacer 
// aunque no exista un Resource para este Controller que llamare: errorController.js

// Cuando lo importe le pondre el nombre de : globalErrorHandler

// */


// module.exports = (err, req, res, next) => { 
//   // console.log(err.stack);

// 	// voy a definir un estatus de error default porque habra errores que nos 
//   // llegaran sin estatus
// 	// si esta definido el codigo de error se lo dejo de lo contrario le asigno de 
//   // default 500 (Internal Server Error)

//   console.log('err.statusCode', err.statusCode);
// 	err.statusCode = err.statusCode || 500;
// 	// de igual forma defino el status
// 	err.status = err.status || 'errorcin';

// 	// y como se crea err.message?
// 	res.status(err.statusCode).json({
// 		status: err.status,
// 		message: err.message		
// 	});
// }



///////////////////////////////////////////////////////////////////
// Errors During Development vs Production
///////////////////////////////////////////////////////////////////

/*
Vamos a implementar logica para mandar errores para el ambiente de desarrollo y 
produccion
Si vamos al errorController.js mandamos el mismo error a todo el mundo sin 
importar si estoy en desarrollo o produccion, pero la idea es que en Produccion 
quiero mandar muy poca informacion sobre errores al cliente segun sea posible, 
pero en Desarrollo quiero tener tanta informacion como sea posible y aunque 
puedo mandarlo a la console.log prefiero mandarlo a POSTMAN

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message		
	});

asi que
	if (process.env.NODE_ENV === ‘development’) {
		sendErrorDev (err, res);

	}
	else if (process.env.NODE_ENV === ‘production’) {
		sendErrorProd (err, res);
	}

y lo anterior se ve bien, pero messy asi que lo exportare a sus propias funciones y 
tambien porque añadire mas codigo 

const sendErrorDev = (err, res) => {
		res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack	
		});
}

const sendErrorProd = (err, res) => {
		res.status(err.statusCode).json({
		status: err.status,
		message: err.message		
		});
}


Muy bien eso fue facil ahora hablemos de Operational Errors de nuevo y para eso vamos a la AppError Class y recordamos que todos los errores que generamos les pongo isOperational = true, y solo para produccion quiero mandar mensajes Operaciones al Client. Pero si tengo Programming Errors o un error desconocido por ejemplo de un 3rd party package NO quiero mandar mensajes de error al client en Produccion, y para eso uso la propiedad isOperational en nuestro Error Controller

Asi que de nuevo en errorController.js

	const sendErrorProd = (err, res) => {

		// Operational, trusted error: send message to the client
		if (err.isOperational) {

			res.status(err.statusCode).json({
			status: err.status,
			message: err.message		
			});
		}
		// Programming or other unknown error: don’t leak error detail
		else {
			// 1. Log to the console
			console.error(‘ERROR!’, err);

			// 2. Send generic message
			res.status(500).json ({
				status: ‘error’,
				message: ‘Something went very wrong’
			});
		}
	}

Ahora bien existen librerias en npm para loggear errores en vez de usar este 
simple console.error, pero en esta simple App sera suficiente asi como esta lo 
hara visible en los logs en la Hosting Platform que usaras. 
Por ejemplo vamos a usar Heroku para implementar la App y cuando ocurra un error 
asi sera loggeado a la console en la Heroku platform y tendre acceso a estos logs 
y asi podre rasterarlos y corregirlos. Esta si es algo sofisticado y de uso real 
error handling mechanism

AHORA para que esto funcione hay algo MUY IMPORTANTE que necesito hacer, ya que 
puede haber errores que vengan de Mongoose, MongoDB que NO marcamos como Operational, 
y en este caso seran manejados con el mensaje generico, por ejemplo un 
Validation Error , porque es un error que viene de MongoDB y no de nuestra 
propia AppError Class, pero necesito marcar esos errores como Operational  
y hay dos o 3 erroes mas que necesito marcar como Operational y eso lo hare 
mas adelante

Hice Pruebas en POSTMAN deleteTour de un Id que NO existe y me mando
{
    "status": "fail",
    "error": {
        "statusCode": 404,
        "status": "fail",
        "isOperational": true
    },
    "message": "No tour found with that Id",
    "stack": "Error: No tour found with that Id\n    
    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/tourController.js:4408:17\n    
    at processTicksAndRejections (node:internal/process/task_queues:96:5)"
}

*/

/*
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
  status: err.status,
  error: err,
  message: err.message,
  stack: err.stack	
  });
}
*/

/*
const sendErrorProd = (err, res) => {

  // Operational, trusted error: send message to the client
  if (err.isOperational) {

    res.status(err.statusCode).json({
    status: err.status,
    message: err.message		
    });
  }
  // Programming or other unknown error: don’t leak error detail
  else {
    // 1. Log to the console
    console.error('ERROR!', err);

    // 2. Send generic message
    res.status(500).json ({
      status: 'error',
      message: 'Something went very wrong'
    });
  }
}
*/

// module.exports = (err, req, res, next) => { 
//   // console.log(err.stack);

// 	// voy a definir un estatus de error default porque habra errores que nos 
//   // llegaran sin estatus
// 	// si esta definido el codigo de error se lo dejo de lo contrario le asigno de 
//   // default 500 (Internal Server Error)

//   // console.log('err.statusCode', err.statusCode);
// 	err.statusCode = err.statusCode || 500;
// 	// de igual forma defino el status
// 	err.status = err.status || 'errorcin';

// 	// y como se crea err.message?
// 	if (process.env.NODE_ENV === 'development') {
// 		sendErrorDev (err, res);

// 	}
// 	else if (process.env.NODE_ENV === 'production') {
// 		sendErrorProd (err, res);
// 	}
// }



///////////////////////////////////////////////////////////////////
//Handling Invalid Database IDs
///////////////////////////////////////////////////////////////////

/*

Hay 3 tipos de errores que pueden crearse en Mongoose que necesito marcarlos 
como Operational Errors para mandar errores con significado al client en el 
ambiente de Produccion

1. El primer es mandar una id invalida desde POSTMAN por ejemlo en getTour
	127.0.0.1:8000/api/v1/tours/querty

Y como resutado manda
{
    "status": "errorcin",
    "error": {
        "stringValue": "\"querty\"",
        "valueType": "string",
        "kind": "ObjectId",
        "value": "querty",
        "path": "_id",
        "reason": {},
        "name": "CastError",
        "message": "Cast to ObjectId failed for value \"querty\" (type string) at path \"_id\" for model \"Tour\""
    },
    "message": "Cast to ObjectId failed for value \"querty\" (type string) at path \"_id\" for model \"Tour\"",
    "stack": "CastError: Cast to ObjectId failed for value \"querty\" (type string) at path \"_id\" for model \"Tour\"\n    
            at model.Query.exec (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/query.js:4498:21)\n    
            at model.Query.Query.then (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/query.js:4592:15)"
}

Lo que quiero cambiar a algo mas entendible para el cliente, asi que necesito 
marcar este error como Operational y crear un mensaje mas entendible, pero veamos 
primero los otros dos errores de Mongoose


2. El otro error es al crear un Nuevo tour con un nombre duplicado desde POSTMAN

{"name":"The Forest Hiker", "duration":5, "maxGroupSize":25, "difficulty":"easy", 
"ratingsAverage":4.7, "ratingsQuantity":37, "price":397, 
"summary":"Breathtaking hike through the Canadian Banff National Park",
"description":"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","imageCover":"tour-1-cover.jpg", "images":["tour-1-1.jpg","tour-1-2.jpg","tour-1-3.jpg"], "startDates":["2021-04-25,10:00","2021-07-20,10:00","2021-10-05,10:00"]}

Y como resultado manda

{
    "status": "errorcin",
    "error": {
        "driver": true,
        "name": "MongoError",
        "index": 0,
        "code": 11000,
        "keyPattern": {
            "name": 1
        },
        "keyValue": {
            "name": "The Forest Hiker"
        },
        "statusCode": 500,
        "status": "errorcin"
    },
    "message": "E11000 duplicate key error collection: natours.tours index: name_1 
        dup key: { name: \"The Forest Hiker\" }",
    "stack": "MongoError: E11000 duplicate key error collection: natours.tours index: name_1 dup key: { name: \"The Forest Hiker\" }\n    
        at Function.create (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/core/error.js:59:12)\n    
        at toError (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/utils.js:130:22)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/operations/common_functions.js:258:39\n    at handler (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/core/sdam/topology.js:961:24)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/cmap/connection_pool.js:352:13\n    at handleOperationResult (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/core/sdam/server.js:567:5)\n    at MessageStream.messageHandler (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/cmap/connection.js:308:5)\n    at MessageStream.emit (node:events:527:28)\n    at processIncomingData (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/cmap/message_stream.js:144:12)\n    at MessageStream._write (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/cmap/message_stream.js:42:5)\n    at writeOrBuffer (node:internal/streams/writable:389:12)\n    at _write (node:internal/streams/writable:330:10)\n    at MessageStream.Writable.write (node:internal/streams/writable:334:10)\n    at TLSSocket.ondata (node:internal/streams/readable:754:22)\n    at TLSSocket.emit (node:events:527:28)\n    at addChunk (node:internal/streams/readable:315:12)"
}



3. El tercer error es al dar Update a un tour, por ejemplo poner ratingsAverage a 6 y difficulty un valor no valido como “whatever” desde POSTMAN
{
    "ratingsAverage": 6,
    "difficulty": "whatever"
}

Y como resultado manda
{
    "status": "errorcin",
    "error": {
        "errors": {
            "difficulty": {
                "name": "ValidatorError",
                "message": "Difficulty is either: easy, medium or difficult.",
                "properties": {
                    "message": "Difficulty is either: easy, medium or difficult.",
                    "type": "enum",
                    "enumValues": [
                        "easy",
                        "medium",
                        "difficult"
                    ],
                    "path": "difficulty",
                    "value": "whatever"
                },
                "kind": "enum",
                "path": "difficulty",
                "value": "whatever"
            },
            "ratingsAverage": {
                "name": "ValidatorError",
                "message": "Rating must be below 5.0",
                "properties": {
                    "message": "Rating must be below 5.0",
                    "type": "max",
                    "max": 5,
                    "path": "ratingsAverage",
                    "value": 6
                },
                "kind": "max",
                "path": "ratingsAverage",
                "value": 6
            }
        },
        "_message": "Validation failed",
        "statusCode": 500,
        "status": "errorcin",
        "name": "ValidationError",
        "message": "Validation failed: difficulty: Difficulty is either: easy, medium or difficult., ratingsAverage: Rating must be below 5.0"
    },
    "message": "Validation failed: difficulty: Difficulty is either: easy, medium or difficult., ratingsAverage: Rating must be below 5.0",
    "stack": "ValidationError: Validation failed: difficulty: Difficulty is either: easy, medium or difficult., ratingsAverage: Rating must be below 5.0\n    at _done (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/helpers/updateValidators.js:236:19)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/helpers/updateValidators.js:212:11\n    at schemaPath.doValidate.updateValidator (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/helpers/updateValidators.js:170:13)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/schematype.js:1273:9\n    at processTicksAndRejections (node:internal/process/task_queues:78:11)"
}


Estos son los 3 errores que marcare como Operational, empezando con el primer error 
vamos a errorController.js y solo en el ambiente de Production que es donde 
quiero ocultar demasiada informacion que el client no entenderá

const AppError = require(‘../Utils/appError’);

const handleCastErrorDB = error => {
	// si regresamos a ver el error Object vemos que tiene dos propiedades una es path que es el nombre del field que esta en el formato equivocado, y value es el valor incorrecto que se capturó

	const message = `Invalid ${error.path}: ${error.value}`;

	// 400 es Bad Request
	return new AppError (message, 400);
}

module.exports = (err, req, res, next) => { 
  // console.log(err.stack);

	// voy a definir un estatus de error default porque habra errores que nos 
  // llegaran sin estatus
	// si esta definido el codigo de error se lo dejo de lo contrario le asigno de 
  // default 500 (Internal Server Error)

  // console.log('err.statusCode', err.statusCode);
	err.statusCode = err.statusCode || 500;
	// de igual forma defino el status
	err.status = err.status || 'errorcin';

	// y como se crea err.message?
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev (err, res);

	}
	else if (process.env.NODE_ENV === 'production') {
		// necesito crear una HardCopy de err porque la voy a usar para crear el nuevo error que mandare ya con isOperational = true y de nuevo uso Destructuring
		let error = { ... err };
		
		// este es el manejo de errores para lo que manda Mongoose y que hasta ahora no manejo
		//le paso como argumento el err que Mongoose Creo
		if (error.name === ‘CastError’)
			error = handleCastErrorDB (error);

		sendErrorProd (error, res);
	}
}


Y asi es como transformo el Error de Mongoose en un Operational Error creado por mi

Para probarlo necesito cambiar el ambiente a Production, asi que voy a package.json 
corto el proceso de la terminal en caso que este ejecutandose y en la terminal pongo
	npm run start:prod

Ya que estoy en Production voy a POSTMAN e intento darle getTour con un id que
NO exista 

127.0.0.1:8000/api/v1/tours/wwwww

y me regresa
{
    "status": "fail",
    "message": "Invalid _id: wwwww”
}

*/

const handleCastErrorDB = error => {
	// si regresamos a ver el error Object vemos que tiene dos propiedades una 
  // es path que es el nombre del field que esta en el formato equivocado, 
  // y value es el valor incorrecto que se capturó

	const message = `Inválido ${error.path}: ${error.value}`;

	// 400 es Bad Request
	return new AppError (message, 400);
}


// module.exports = (err, req, res, next) => { 

//   // console.log(err.stack);

// 	// voy a definir un estatus de error default porque habra errores que nos 
//   // llegaran sin estatus
// 	// si esta definido el codigo de error se lo dejo de lo contrario le asigno de 
//   // default 500 (Internal Server Error)

//   // console.log('err.statusCode', err.statusCode);
// 	err.statusCode = err.statusCode || 500;
// 	// de igual forma defino el status
// 	err.status = err.status || 'errorcin';

// 	// y como se crea err.message?
// 	if (process.env.NODE_ENV === 'development') {
// 		sendErrorDev (err, res);

// 	}
// 	else if (process.env.NODE_ENV === 'production') {
// 		// necesito crear una HardCopy de err porque la voy a usar para crear el 
//     // nuevo error que mandare ya con isOperational = true y de nuevo uso Destructuring
// 		// let error = { ...err };
// 		let error = Object.assign(err);

// 		// este es el manejo de errores para lo que manda Mongoose y que hasta ahora 
//     // no manejo
// 		//le paso como argumento el err que Mongoose Creo
// 		if (error.constructor.name === 'CastError')
// 			error = handleCastErrorDB (error);

// 		sendErrorProd (error, res);
// 	}
// }


///////////////////////////////////////////////////////////////////
// Handling Duplicate Database Fields
///////////////////////////////////////////////////////////////////

/*

Estando en errorController.js

Ahora corregire el error que aparece cuando trato de agregar duplicate fields que 
deben ser unicos. Este es el error #2 de Mongoose que voy a arreglar

Este error no tiene un name que signifique algo para el client y esto es porque No 
es un error causado por Mongoose sino por el MongoDB driver. Para identificar el 
error usare el code: 11000

Ahora para poner el nombre del field valur que tuvo el error, en este caso duplicado 
en POSTMAN me sale la informacion necesaria 

errmsg ahi dice E11000 duplicate key error collection: natours.tours index: 
    name_1 dup_key: { : \“The Forest Hiker”\ } sin embargo a mi no me sale este errmsg

a mi me sale message y ahi viene el mismo error
Ademas me sale en keyValue: { name: The Forest Hiker }

Me di cuenta que aunque NO me sale err.errmsg EN POSTMAN, SI lo puedo usar, 
o tambien err.message es lo mismo

Y Jonas lo que va a hacer es usar regular Expressions para sacar The Forest Hiker 
de este string y mostrarlo como el origen del error para el Client

En Google busco: regular expression match text between quotes

Ahora voy a POSTMAN y pruebo intento crear un tour createTour con el mismo name 
que otro que ya exista y me regresa

{
    "status": "fail",
    "message": "Duplicate field value: \"The Forest Hiker\". Please use another value."
}

*/

const handleDuplicateFieldsDB = error => {
	// aqui pongo la regular expression que busque en Google

  // las siguientes tres lineas funcionan
  // console.log("handleDuplicateFieldsDB. error.errmsg", error.errmsg);
  // console.log("handleDuplicateFieldsDB. error.message", error.message);
  // console.log("handleDuplicateFieldsDB. Object.values(error.keyValue)[0]", Object.values(error.keyValue)[0]);

	// const invalidValue = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	let invalidValue = "";

  if (error.errmsg.match(/(["'])(\\?.)*?\1/) !== null) {
    // Obtiene el dato que hay entre comillas
	  invalidValue = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  }
  else {
    // Obtiene el dato que hay entre curly braces
    // incluye los curly braces
    invalidValue = error.errmsg.match(/{(.*?)}/)[0];
    // Sin incluir los curly braces
    //  invalidValue = error.errmsg.match(/[^{}]+(?=})/g)[0];
  }
  
	// const invalidValue = error.message.match(/(["'])(\\?.)*?\1/)[0];
	// const invalidValue = Object.values(error.keyValue)[0];
	// console.log(invalidValue);

	const message = `El dato capturado ya existe: ${invalidValue}. Por favor usa un valor único.`;

  // 400 es Bad Request
  return new AppError(message, 400);
}

// module.exports = (err, req, res, next) => { 

//   // console.log(err.stack);

// 	// voy a definir un estatus de error default porque habra errores que nos 
//   // llegaran sin estatus
// 	// si esta definido el codigo de error se lo dejo de lo contrario le asigno de 
//   // default 500 (Internal Server Error)

//   // console.log('err.statusCode', err.statusCode);
// 	err.statusCode = err.statusCode || 500;
// 	// de igual forma defino el status
// 	err.status = err.status || 'errorcin';

// 	// y como se crea err.message?
// 	if (process.env.NODE_ENV === 'development') {
// 		sendErrorDev (err, res);

// 	}
// 	else if (process.env.NODE_ENV === 'production') {
// 		// necesito crear una HardCopy de err porque la voy a usar para crear el 
//     // nuevo error que mandare ya con isOperational = true y de nuevo uso Destructuring
// 		// let error = { ...err };
// 		let error = Object.assign(err);

// 		// este es el manejo de errores para lo que manda Mongoose y que hasta ahora 
//     // no manejo
// 		//le paso como argumento el err que Mongoose Creo
// 		if (error.constructor.name === 'CastError')
// 			error = handleCastErrorDB (error);

// 		else if(error.code === 11000)
// 			error = handleDuplicateFieldsDB (error);

// 		sendErrorProd (error, res);
// 	}
// }


///////////////////////////////////////////////////////////////////
// Handling Mongoose Validation Errors
///////////////////////////////////////////////////////////////////

/*

Ahora manejare los errores de Validacion de Mongoose

Ahora el tercer error que manda Mongoose cuando intente actuaiizar un Tour y mando 
un mensaje de error que quiero personalizar. Recuerda que en Produccion manda hasta 
este momento un mensaje generico y es lo que quiero corregir ya que NO se marcó 
como Operational

Como se puede ver en la lista de errores, tengo un objeto llamado error y dentro otro 
objeto errors y este contiene los nombres de los fields donde hay errores y el 
mensaje de error que quiero mostrar es el que defini en el Schema de Mongoose

Voy al errorController.js

*/

// En ES6 si solo voy a usar una linea NO tengo que poner {} ni return
// en este caso esto seria return new AppError('Invalid token. Please log in again', 401);
const handleJWTError = () => new AppError('Token inválido. Vuelve a iniciar sesión', 401);

const handleJWTExpiredError = () => new AppError('El token ha expirado. Vuelve a iniciar sesión!', 401);

const handleMongooseServerSelectionError = () => new AppError('Error al conectarse. Primero revisa tu conexión a Internet: Tu Wi-Fi o si tienes saldo, o una conexión lenta pueden ser los problemas, si estas en un lugar con mala recepción de red. O bien problemas con el servidor y/o la Base de Datos.', 400);

const handleValidationErrorDB = error => {
	
  // como error.errors es un Object y NO un array USO Object.values
  // para iterar los valores de un Object
  const errorMessages = Object.values(error.errors).map(current => current.message);
  const message = `El dato capturado es inválido ${errorMessages.join(' ')}`;

	return new AppError (message, 400);
}

/*
module.exports = (err, req, res, next) => { 

  // console.log(err.stack);

	// voy a definir un estatus de error default porque habra errores que nos 
  // llegaran sin estatus
	// si esta definido el codigo de error se lo dejo de lo contrario le asigno de 
  // default 500 (Internal Server Error)

  // console.log('err.statusCode', err.statusCode);
	err.statusCode = err.statusCode || 500;
	// de igual forma defino el status
	err.status = err.status || 'errorcin';

	// y como se crea err.message?
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev (err, res);

	}
	else if (process.env.NODE_ENV === 'production') {
		// necesito crear una HardCopy de err porque la voy a usar para crear el 
    // nuevo error que mandare ya con isOperational = true y de nuevo uso Destructuring
		// let error = { ...err };
		let error = Object.assign(err);

		// este es el manejo de errores para lo que manda Mongoose y que hasta ahora 
    // no manejo
		//le paso como argumento el err que Mongoose Creo
		if (error.constructor.name === 'CastError')
			error = handleCastErrorDB (error);

		if(error.code === 11000)
			error = handleDuplicateFieldsDB (error);

		if(error.constructor.name === 'ValidationError')
			error = handleValidationErrorDB (error);

    ///////////////////////////////////////////////////////////////////
		// Lecture-131 Protecting Tour Routes Part 2
		///////////////////////////////////////////////////////////////////
    if(error.constructor.name === 'JsonWebTokenError')
			error = handleJWTError ();

    if(error.constructor.name === 'TokenExpiredError')
      error = handleJWTExpiredError ();

		sendErrorProd (error, res);
	}
}
*/


///////////////////////////////////////////////////////////////////
// Lecture-193 Rendering Error Pages
///////////////////////////////////////////////////////////////////

/*


Vamos a pintar unas bonitas paginas de Error para el User

Primero creamos un error. Entr al detalle de un Tour, por ejemplo en Chrome
	http://127.0.0.1:8000/tour/the-forest-hikerrrr

Me regresa

{"status":"errorcin","error":{"statusCode":500,"status":"errorcin"},

"message":"Cannot read properties of null (reading 'name')","stack":"TypeError: Cannot read properties of null (reading 'name')\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/viewController.js:63:18\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"}

Me manda este mensaje como lo haria en POSTMAN

Primero necesito corregir este error en particular

EN viewController.js

exports.getTour = catchAsync( async (req, res, next) => {

	// 1. Get the data for the requested tour (including reviews and guides)
	const tour = await Tour
				.findOne( { slug:  req.params.slug })
				.populate({
					path: 'reviews',
					select: 'review rating user'
				});

	if (!tour) {
		return next(new AppError ('There is no Tour with that name', 404));
	}

En errorController.js

Tengo dos functions que mandan los errores al Client
	sendErrorDev
	sendErrorProd: y aqui distingo entre isOperational: true errors y errores desconocidos

Para el Website usare la misma estrategia, la pintada de un pagina de Error a cada una 
de esas functions y lo que hare es probar si el URL empieza con /api, en ese caso 
mandare este error:

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
  status: err.status,
  error: err,
  message: err.message,
  stack: err.stack	
  });
}

Pero si el URL NO empieza con /api significa que quiero pintar una pagina de Error en un 
Website
*/

const sendErrorDev = (err, req, res) => {
  // A) API
  // originalUrl es el URL completo pero sin el Host, se ve igual que el route
	if (req.originalUrl.startsWith('/api')) {
		res.status(err.statusCode).json({
  			status: err.status,
  			error: err,
  			message: err.message,
  			stack: err.stack	
  		});
	}
	else {
		// B) RENDERED WEBSITE
		// ‘error’ sera un template que tengo disponible en 
    // /dev-data/templates/errorTemplate.pug
    console.error('💥 ERROR!', err);

    // console.log("err.statusCode", err.statusCode);
    // console.log("err.status", err.status);
    // console.log("err", err);
    // console.log("err.message", err.message);
    // console.log("err.stack", err.stack);

		// res.status(err.statusCode).render('error.pug', {
		// 	title: 'Something went wrong!', 
		// 	msg: err.message
		// });
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack	
    });
	}
}


const sendErrorProd = (err, req, res) => {
  
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to the client
    if (err.isOperational) {

      res.status(err.statusCode).json({
      status: err.status,
      message: err.message		
      });
    }
    // Programming or other unknown error: don’t leak error detail
    else {
      // 1. Log to the console
      console.error('💥 ERROR!', err);


      // 2. Send generic message
      res.status(500).json ({
        status: 'error',
        message: 'Something went very wrong 1'
      });
    }
  }
  else {
    // B) RENDERED WEBSITE
    // Operational, trusted error: send message to the client
    if (err.isOperational) {

      // res.status(err.statusCode).render('error.pug', {
      //   title: 'Something went wrong!', 
      //   msg: err.message
      // });
      console.error('💥 ERRORRR!', err);


      res.status(500).json ({
        status: 'error',
        message: 'Something went very wrong 2',
        theError: err
      });
    }
    // Programming or other unknown error: don’t leak error detail
    else {
      // 1. Log to the console
      console.error('💥 ERROR!', err);


      // 2. Send generic message
      // res.status(err.statusCode).render('error.pug', {
      //   title: 'Something went wrong!', 
      //   msg: 'Please try again later'
      // });
      res.status(500).json ({
        status: 'error',
        message: 'Something went very wrong 3',
        theError: err
      });
    }
  }
}


module.exports = (err, req, res, next) => { 


  // console.log("errorcin", err);
  // console.log("errorcin.stack", err.stack);

	// voy a definir un estatus de error default porque habra errores que nos 
  // llegaran sin estatus
	// si esta definido el codigo de error se lo dejo de lo contrario le asigno de 
  // default 500 (Internal Server Error)

  // console.log('errorcin.statusCode', err.statusCode);

	err.statusCode = err.statusCode || 500;
	// de igual forma defino el status
	err.status = err.status || 'errorcin';

  // uso este if si quiero ver el mensaje que se manda en production tambien
  // en development
  // if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {

	// y como se crea err.message?
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev (err, req, res);
	}
	else if (process.env.NODE_ENV === 'production') {
		// necesito crear una HardCopy de err porque la voy a usar para crear el 
    // nuevo error que mandare ya con isOperational = true y de nuevo uso Destructuring
		// let error = { ...err };
		let error = Object.assign(err);

    // if (error.MongooseServerSelectionError)

		// este es el manejo de errores para lo que manda Mongoose y que hasta ahora 
    // no manejo
		//le paso como argumento el err que Mongoose Creo
		if (error.constructor.name === 'CastError')
			error = handleCastErrorDB (error);

		if(error.code === 11000)
			error = handleDuplicateFieldsDB (error);

		if(error.constructor.name === 'ValidationError')
			error = handleValidationErrorDB (error);

    ///////////////////////////////////////////////////////////////////
		// Lecture-131 Protecting Tour Routes Part 2
		///////////////////////////////////////////////////////////////////
    if(error.constructor.name === 'JsonWebTokenError')
			error = handleJWTError ();

    if(error.constructor.name === 'TokenExpiredError')
      error = handleJWTExpiredError ();
    
    if(error.constructor.name === 'MongooseServerSelectionError')
      error = handleMongooseServerSelectionError ();

		sendErrorProd (error, req, res);
	}

  
}

/*
Ahora creo un view en el folder de /views para el template Error, este archivo se llamara error.pug

En error.pug

extends base

block content 
  main.main
    .error
      .error__title
        h2.heading-secondary.heading-secondary--error Uh oh! Something went wrong!   
        h2.error__emoji 😢 🤯
      .error__msg= msg

*/