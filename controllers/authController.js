///////////////////////////////////////////////////////////////////
// Creating New Users
///////////////////////////////////////////////////////////////////

/*
Vamos a crear usuarios, loggearlos, actualizas passwords en el 
Authentication Controller, todo lo que tiene que ver con Authentication No va 
a estar en el userController.js, asi que voy al folders Controllers y al archivo 
authController.js y esto va a tener sentido cuando empiece a usr las funciones 
que voy a poner aqui

const User = require(‘../models/userModel’);
const catchAsync = require('../Utils/catchAsync');


Ahora voy a crrear y exportar al primer Controller y se va a llamar signup, 
NO lo voy a llamar createUser, como hice en el Tour Controller, le pongo signup 
porque tiene mas sentido en el contexto de Authentication, va a ser un 
async function porque voy a hacer operaciones de DB

exports.signup = catchAsync( async (req, res, next) => {

	// aqui es donde creo el Nuevo User, aqui es donde creo un nuevo Document basado 
  // en un Model, y le paso como argumento que es el Objeto con los datos que se 
  // usaran para crear el Document.
	// User.create(req.body); esto regresa una Promise
	// Esta linea es obvio de que estoy en el server
	const newUser = await User.create(req.body);

	// luego mando este nuevo User al Client
	res.status(201).json({
		status: ‘success’,
		data: {
			user: newUser
		}
	});
});

Listo pero antes de probar, recuerda que esto es una Async function asi que hay 
que pensar en el Error Handling, asi que necesito envolver esta function en la 
catchAsync function, para no escribir el try y catch en cada async function

Ahora solo falta implementar el route para que este signup handler pueda ser llamado, 
asi que voy al folder Routes y al archivo userRoutes.js 

Recuerda que el User Resource es diferente a los demas Resources porque tiene que 
ver con la Authentication y entonces tengo otro Controller para eso, el 
authController.js, los nombres de las funciones son diferentes y por lo tanto 
tendre tambien una Route especial en userRoutes.js

En userRoutes.js
const authController = require(‘../controllers/authController’);

	router.post(‘/signup’, authController.signup);

Este ‘/signup’ tiene unendpoint diferente, no encaja en la arquitectura REST , 
en ciertos casos puedo crear otros endpoints que NO encajan al 100% con la filosofia 
REST, donde el nombre del Url no tiene nada que ver con la accion que se ejecuta

Como veras ‘/signup’ se llama asi porque estamos regustrando usuarios, al contrario 
de los metodos de userController.js donde implemente varios tipos de HTTPs, pero 
en signup solo necesito POST, ya que no ocupo usar metodos HTTP como get, update, 
patch en un signup, no tiene sentido, ya vamos a tener varios Routes similares a esta, 
por ejemplo para login, reset password, etc, y voy a dejar las otros routes de 
userRoutes (get, post, patch, delete) porque existe la posibilidad de un 
system admin actualizando, borrando o buscando todos los usuarios basados en su Id

Por ahora solo implementare funciiones que le importan al usuario, osea que tienen 
que ver con Authentication, como signup, login, reset password, ya que NO es un 
admin el que va a registrar a un user, o que un admin vaya a loggear a un user, 
sino que es el mismo user el que va a registrarse a si mismo, loggearse a si mismo

Ahora vamos a POSTMAN a crear un nuevo User, o mejor dicho usar signup
creo un nuevo Request de tipo HTTP POST con el siguiente URL
	127.0.0.1:8000/api/v1/users/signup

luego elijo Body -> Raw -> JSON
Y escribo el objeto que tiene los datos del User Nuevo
{
    "name": "abdelito",
    "email": "acero@hotmail.com",
    "password": "pass1234",
    "confirmpassword": "pass1234"
}

y me regresa

{
    "status": "success",
    "data": {
        "user": {
            "_id": "62af8cd6db1ec9d6a38fc803",
            "name": "abdelito",
            "email": "acero@hotmail.com",
            "password": "pass1234",
            "confirmPassword": "pass1234",
            "__v": 0,
            "id": "62af8cd6db1ec9d6a38fc803"
        }
    }
}

Para comprobar que se creo el User puedo ir a Compass y checar, al ver los datos 
veras que puedo ver el passoword y ESO NO es ideal, los password 
NUNCA NUNCA NUNCA 
deben guardarse asi en la BD, en la proxima leccion hare adminitracion de password 
para evitar esto

*/

const crypto = require ('crypto');
const { promisify } = require ('util');
const jwt = require ('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
// const sendEmail = require('../Utils/email');
const Email = require ('../Utils/email');


// exports.signup = catchAsync( async (req, res, next) => {

// 	// aqui es donde creo el Nuevo User, aqui es donde creo un nuevo Document basado 
//   // en un Model, y le paso como argumento que es el Objeto con los datos que se 
//   // usaran para crear el Document.
// 	// User.create(req.body); esto regresa una Promise
// 	// Esta linea es obvio de que estoy en el server
// 	// NOTA: para Update puedo usar User.save(req.body);

// 	const newUser = await User.create(req.body);

// 	// luego mando este nuevo User al Client
// 	res.status(201).json({
// 		status: 'success',
// 		data: {
// 			user: newUser
// 		}
// 	});
// });


///////////////////////////////////////////////////////////////////
// Lecture-130 Logging in Users
///////////////////////////////////////////////////////////////////
// regresare el token
// Al ser una sola linea código NO tengo que pober {} y se obvia que
// se hara un return osea no es necesario poner
// return jwt.sign ( { id: userId  }, process.env.JWT_SECRET, 	{ expiresIn: process.env.JWT_EXPIRES_IN })
// se da por hecho
const signToken = userId => jwt.sign ( 
			{ id: userId  }, 
		  	process.env.JWT_SECRET, 
			{ expiresIn: process.env.JWT_EXPIRES_IN }
	)


///////////////////////////////////////////////////////////////////
// Lecture-138 Updating the Current User: Password
///////////////////////////////////////////////////////////////////	
// const createSendToken = (user, statusCode, res) => {
// 	const token = signToken (user._id);

// 	// asi es como se crea un token, ahora solo falta mandarlo al Client, es todo lo 
// 	// que tengo que hacer para loggear a un nuevo User, porque en este momento no 
// 	// estoy checando si el password es correcto o si el User existe en la DB porque 
// 	// en este caso el User acaba de ser creado asi que de inmediato loggeo al User a 
// 	// la App al enviar un token y el Client del User debe de guardar este token

// 	// luego mando este nuevo User al Client
// 	res.status(statusCode).json({
// 		status: 'success',
// 		token,
// 		data: {
// 			user
// 		}
// 	});
// }	


///////////////////////////////////////////////////////////////////
// Lecture-142 Sending JWT via Cookie
///////////////////////////////////////////////////////////////////
/*


El JSON Web Token debe ser guardado en una secure HTTP-only cookie, pero en este 
momento solo enviamos el JWT {{jwt}} como un simple string en nuestro res.json response. 
En esta leccion mandaremos el token como una cookie para que el browser pueda guardarlo 
en esta mora mas segura

En que parte del codigo envio el token al Client? en authController, en la function 
createSendToken , aqui es donde trabajare

Una cookie es pdazo pequeño de texto que un server envia a clients , cuando el client recibe a la cookie la guardara automaticamente y automaticamente la enviara de regreso 
junto con los requests futuros que se generen al mismo server

Por el momento no es importante poque estamos probando las APIs usando POSTMAN pero 
despues cuando pintemos dynamic web pages e interactuemos con el browser entonces 
sera muy importante que el browser envie de regreso el token automaticamente en 
cada request

Como crear y enviar una cookie
Enviar una cookie es muy facil  solo hay que attach it al response Object

// el primer parametro es el nombre de la cookie , el nombre es un identificador 
unico para la cookie si recibo una cookie del server con el mismo nombre que tengo 
en el browser, se reemplazara


// 2do parametro los datos que quiero mandar en la cookie , como 3er parametro 
algunas opciones para la cookie

// expires significa que el browser o cualquier client borrara la cookie despues 
de expirar, la forma ne que la configuro es similar a como lo hago en la JSON Web Token, 
y voy a crear una variable nueva para eso en config.env, porque el JSON Web Token 
puede trabajar con el formato de 90d (osea 90 dias en JWT_EXPIRES) pero para 
JavaScript no tiene significado, asi que voy a crear una variable con un numero real

secure: true, significa que la cookie solo se enviara en una conexion encriptada HTTPS

httpOnly: true, significa que el browser no puede accesar o modificar la cookie esto 
es para prevenir el cross-site scripting (XSS) attacks, asi que lo unico que hara el 
browser es recibir la cookie, guardarla y mandarla al server de regreso conteniendo 
cada request

En config.env
JWT_COOKIE_EXPIRES_IN=90

y con esto ya puedo hacer opraciones porque la voy a convertir a milisegundos

Ahora si la quisiera probar ahorita NO funcionaria porque en este momento NO estamos 
usando HTTPS debido a secure: true la cookie no sera creada ni enviada al server, por 
lo tanto solo quiero activar esa opcion en Produccion, asi que lo que hare es exportar 
todo este objeto 

{ 
	expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
	secure: true, 
	httpOnly: true
}

a una variable
*/


const createSendToken = (user, statusCode, req, res, problemWithEmail = false) => {
	const token = signToken (user._id);

	// console.log('createSendToken');
	// console.log('token', token);

	if(process.env.NODE_ENV === 'production') { 
		res.cookie('jwt', token, { 
			expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
			httpOnly: true,
			sameSite: 'None',
			secure: req.secure || req.headers ['x-forwarded-proto'] === 'https'
		});
	}
	else if(process.env.NODE_ENV === 'development') {
		// console.log("development")
		res.cookie('jwt', token, { 
			expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
			httpOnly: true,
			// sameSite: 'None',
		});
	}

	// con esto ya NO manda de regreso el password ni el email al Client
	user.password = undefined;
	user.email = undefined;

	// asi es como se crea un token, ahora solo falta mandarlo al Client, es todo lo 
	// que tengo que hacer para loggear a un nuevo User, porque en este momento no 
	// estoy checando si el password es correcto o si el User existe en la DB porque 
	// en este caso el User acaba de ser creado asi que de inmediato loggeo al User a 
	// la App al enviar un token y el Client del User debe de guardar este token

	// console.log('cookie');
	// luego mando este nuevo User al Client
	res.status(statusCode).json({
		status: 'success',
		token,
		problemWithEmail: problemWithEmail,
		data: {
			user
		}
	});
}

/*
Ahora si lo pruebo en POSTMAN, y voy a empezar creando un nuevo User con /SignUp

{
    "name": “user”,
    "email": “user@hotmail.com",
    "password": “pass1234”,
    "confirmpassword": “pass1234”,
    “role”: “guide”
}

y me regresa

{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYmEzMTkyNTRlNTJhMWUxMTE4MWI0NyIsImlhdCI6MTY1NjM2OTU1NSwiZXhwIjoxNjY0MTQ1NTU1fQ.MDJrIjqJiYiFzUSCRLGCJVo6MBFQ7Fc38t3H-5FcAsk",
    "data": {
        "user": {
            "role": "guide",
            "active": true,
            "_id": "62ba319254e52a1e11181b47",
            "name": "user",
            "email": "user@hotmail.com",
            "__v": 0,
            "id": "62ba319254e52a1e11181b47"
        }
    }
}


PERO TAMBIEN ME REGRESA UNA COOKIE!!! ve la Cookie tab
ahi viene el nombre de la cookie: jwt y su valor que es el JSON Web Token, tambien tengo 
la Expiration Date que deber 90 dias despues de hoy y las 
Opciones: HTTPOnly: true, secure: false

{
	Name: jwt

	Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYmEzMTkyNTRlNTJhMWUxMTE4MWI0NyIsImlhdCI6MTY1NjM2OTU1NSwiZXhwIjoxNjY0MTQ1NTU1fQ.MDJrIjqJiYiFzUSCRLGCJVo6MBFQ7Fc38t3H-5FcAsk

	Expires: Sun, 25 Sep 2022 22:39:15 GMT (hoy estoy a 25 Junio osea 3 meses)

	HttpOnly: true

	Secure: false

	Path: /

	Domain: 127.0.0.1
}

La ultima cosa que quiero cambiar en createSendToken es quitar el password en el 
output, osea en lo que se manda al cliente en 
	res.status(statusCode).json
		data: {
			user
		}
	en user viene el password

En el userSchema le puse que en password tenga select: false para que no lo muestre 
cuando le doy GetAllUsers pero en este caso vien de SignUp de crear un Document nuevo  
asi que lo arreglo asi
	user.password = undefined;

Para Probarlo borro al User que acabo de Crear y lo vuelvo a crear en POSTMAN

Y ASI ES ya NO aparece el password

*/







///////////////////////////////////////////////////////////////////
// Lecture-129 Signing Up Users
///////////////////////////////////////////////////////////////////

/*

Ya implementé una simple funcionalidad para signup, pero ahora vamos a loggear al 
User haciendo mas real el proceso de Signup. A partir de esta leccion vamos a 
implmentar la Authentication, aqui ya nos ponemos serios. 

Antes de empezar una ADVERTENCIA! Authentication es muy dificil de hacerlo bien y 
muchos tutoriales de Authentication con NodeJS y Express hacen errores muy serios y 
simplifican demasiado. Te dare todas las mejores prácticas, debemos ser super 
cuidadosos al escribir el codigo de la Authentication

Hay librerias que pueden implementar Authentication y Authorization y la mas 
conocida es Passport, pero aun esa libreria NO hace todo el trabajo ni te quita 
la responsabilidad 

Vamos a implementar toda la logica del login completo, proteger, authorization, 
todo nosotros mismos, excepto por la implementacion del JSON Web Token, osea el 
signing y verification, se lo dejare a la libreria JWT

Como dije ya tengo la funcion signup en el archivo authController.js pero lo unico 
que hace es crear un nuevo User y regresarlo al Client, ahora hay un problema 
muy grave en esta forma de registrar Users, el problema es que cree un 
nuevo User usando los datos que llegan con el req.body, y el problema es que 
cualqueira puede especificar el rol de admin, corregir esto es muy simple

En lugar de esta linea
	const newUser = await User.create(req.body);

Es esto
	const newUser = await User.create ({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword
	});

Con este codigo solo permitimos datos que si necesitamos para el nuevo User, asi que 
un User intenta capturar el rol manualmente no se guardara en la BD, lo mismo para 
una foto por ejemplo, lo que esto significa es que ya no podemos registrar a un admin, 
asi que si necesito un nuevo admin, simplemente creo un nuevo User normal y 
luego voy a Compass y edito el rol ahi. Por supuesto podria definir una 
Route especial para crear admins pero no lo hare.

Cuando se hace un signup para cualquier web App automaticamente te loggean, asi que 
implementemos eso y lo unico que tengo que hacer es Sign un JSON Web Token y mandarlo 
de regreso al User , pero vamos primero a la Terminal para insyalar el package que 
necesito para todo lo relacionado con JSON Web Token

	npm i jsonwebtoken

Segun la documentacion de Github y Jonas, la primera funcion que voy a usar es 
jwt.sign para crear un nuevo token y para eso necesito como primer parametro el 
Payload, como segundo parametro la secretOrPrivateKey, the private secret que solo 
se guarda en el server y que necesito para sign el token y como tercer parametro 
puedo pasarle opciones

Otra funcion es jwt.verify donde se hace el proceso de verificacion y es la funcion 
que voy a usar para loggear a un User

Este package incluye las dos funcionalidades que necesito Signing y Verifying al User

En authController.js

const jwt = require (‘jsonwebtoken’);

*/

exports.signup = catchAsync( async (req, res, next) => {

	// aqui es donde creo el Nuevo User, aqui es donde creo un nuevo Document basado 
  // en un Model, y le paso como argumento que es el Objeto con los datos que se 
  // usaran para crear el Document.
	// User.create(req.body); esto regresa una Promise
	// Esta linea es obvio de que estoy en el server
	// NOTA: para Update puedo usar User.save(req.body);
	
	const newUser = await User.create ({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		///////////////////////////////////////////////////////////////////
    // Lecture-132 Protecting Tour Routes Part 2
    ///////////////////////////////////////////////////////////////////
		passwordChangedAt: req.body.passwordChangedAt,
		///////////////////////////////////////////////////////////////////
    // Lecture-134 Authorization: User Roles And Permissions
    ///////////////////////////////////////////////////////////////////
		role: req.body.role
	});


	///////////////////////////////////////////////////////////////////
	// Lecture-207 Email Templates with Pug: Welcome Emails
	///////////////////////////////////////////////////////////////////
	// le pongo await para quedarme aqui hasta que regrese de haber mandado el email
	// y puedo hacer eso porque sendWelcome es un async / await function 
	// y que url voy a poner? Recuerda que en welcome.pug donde puse ${url} esta 
	// Upload user photo, asi que mandarle la liga al User Account page para que la suba
	// osea 127.0.0.1:8000/me
	// pero no lo voy a dejar hardcodeado, asi que puedo usar req. para hacerlo mejor
	
	// comentarizado por mientras
	const url = `${req.protocol}://${req.get('host')}/me`;

	let problemWithEmail = true;

	// Si todo salio Bien al Mandar el Email entonces problemWithEmail = false;
	if (await new Email (newUser, url).sendWelcome())
		problemWithEmail = false;
		
			
	// console.log('User', User);
	// console.log('newUser', newUser);
	// 1er argumento es el Payload, es un objeto para todos los datos que voy a 
	// guardar en el token y en este caso solo quiero el Id del User que acabo de 
	// crear, recuerda que en MongoDB el id se llama _id

	// 2do argumento es el secret Key, un string, por supuesto el que puse ‘secret’ 
	// es terrible es solo un placeholder, porque en realidad el configuration file 
	// config.env es el lugar perfecto para guardar este dato secreto igual que el password, asi que ve a config.env y agrega
	// JWT_SECRET=la-llave-secreta-es-playa-jamaica-2022

	// el nombre que pongamos no importa porque lo que importa es la secret Key que 
	// ponga aqui, porque al usar la encriptación estandar HSA256 para la Signature 
	// el secret debe ser al menos 32 caracteres de largo, y si es mas largo mejor

	// el Header sera creado automatico y lo ue puedo hacer ahora es agregar un 3er 
	// agumento con opciones y la opcion que voy a pasar es cuando debe expirar el 
	// JWT, es decir el momento en que el JWT ya no sera valido aunque este 
	// correctamente verificado, es para log out a un User despues de cierto tiempo 
	// como medida de seguridad, ese tiempo de configuracion tambien lo definire en 
	// config.env, puedo poner un String especial como 90d y el signing algorithm 
	// automaticamente sabra que esto significa 90 dias, tambien puedes usar 
	// 10h, o 5m, o 3s, o cualquier numero que sera tratado como milisegundos

	// JWT_EXPIRES_IN=90d

	// const token = jwt.sign ( 
	// 			{ id: newUser._id  }, 
	// 			process.env.JWT_SECRET, 
	// 			{ expiresIn: process.env.JWT_EXPIRES_IN }
	// );
	// console.log('status 201');
	// comentarizado por mientras

	createSendToken (newUser, 201, req, res, problemWithEmail);

});

/*
Ahora lo pruebo en POSTMAN en SignUp 

{
    "name": "abdelito",
    "email": "acero@hotmail.com",
    "password": "pass1234",
    "confirmPassword": "pass1234"
}

y me regresa

{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjBjMjY5YjgyYThhMGNkZmMwODg0ZSIsImlhdCI6MTY1NTc1MTI3NSwiZXhwIjoxNjYzNTI3Mjc1fQ.7ROXBzN0aUsNldxIKo_hg4dWs7tu9P7jIFSRNuYE_NI",
    "data": {
        "user": {
            "_id": "62b0c269b82a8a0cdfc0884e",
            "name": "abdelito",
            "email": "acero@hotmail.com",
            "password": "$2a$12$OyBh.C5Y8GMTenfueuM3nOhAwssWykzV3XkeRWjAHypa8MluGN05a",
            "__v": 0,
            "id": "62b0c269b82a8a0cdfc0884e"
        }
    }
}

Ahora vere el JWT debugger, copiare el token que me regreso el server, vamos a jwt.io 
en google

Voy a donde dice Encoded y ahi pego el token y me dice INVALID SIGNATURE pero esto 
es porque la function jwt.sign editó las propiedades “iat” y “exp” porque especeifique 
una fecha de expiracion

“iat” es issued at y “exp” es expiration time, si borro a esos dos en el 
JWT debugger veras que ahora la SIGNATURE VERIFIED, lo importate aqui es que 
el Header es visible, es facilmente decodable, fue el JSON web token package el 
que creo el Header, pero si esta el Payload que especifique, si veo el id aqui 
debe ser igual al _id que esta en POSTMAN y asi es! y la Signature NO la podemos ver

Ya podemos loggear Uses pero solo si se acaban de registrar SignUp porque en este 
caso no necesitamos verificar el email en la BD ni el password, hacer esto es 
un proceso mas complejo, es lo que hare en la proxima leccion, donde loggeare Users
*/



///////////////////////////////////////////////////////////////////
// Lecture-130 Logging in Users
///////////////////////////////////////////////////////////////////

/*

Voy a implementar la funcionalidad de loggear usuarios basados en un password y 
email address

El concepto de loggear a un User significa sign un JSON Web Token y mandarlo al 
Client, pero en este caso solo mandamos el token en caso que el User sí exista y 
que el password sea el correcto

// 1. Checar si email y password existen
	if (!email || !password) {
		// si no existen mandar un mensaje de error al Client, usando AppError para que el
		// Global Handling Middleware mande el error al Client
		return next (new AppError (‘Please provide email and password’, 400));
		
	}

Ahora que cheque que existen voy a probar que funcione, hare un token falso, osea 
token = ‘’ y lo enviare al Client

	// para el login solo mando el token, NO tengo que mandar el User a diferencia
	// del SignUp
	const token = '';
	res.status(200).json({
		status: 'success',
		token
	});

Ahora implemento el Route en userRoutes.js, de nuevo esto solo es valido para POST requests porque quiero mandar los login credentials en el body
	router.post('/login', authController.login);


Ahora si lo pruebo en POSTMAN, creo un request /login
	127.0.0.1:8000/api/v1/users/login
luego elijo Body -> Raw -> JSON

En la primer prueba lo envio SIN password
{
    "email": "acero@hotmail.com"
}

y me regresa
{
    "status": "fail",
    "error": {
        "statusCode": 400,
        "status": "fail",
        "isOperational": true
    },
    "message": "Please provide email and password",
    "stack": "Error: Please provide email and password\n    
				at exports.login (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:384:9)\n    
				at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    
				at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:144:13)\n    
				at Route.dispatch (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:114:3)\n    
				at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    
				at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:284:15\n    at Function.process_params (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:346:12)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:280:10)\n    at Function.handle (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:175:3)\n    at router (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:47:12)\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at trim_prefix (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:328:13)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:286:9\n    at Function.process_params (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:346:12)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:280:10)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/app.js:572:3"
}

Ahora en POSTMAN mando la info completa
{
    "email": "acero@hotmail.com",
    "password": "pass1234"
}

y regresa
{
    "status": "success",
    "token": ""
}


En authController.js

const AppError = require(‘../Utils/appError’);

*/

// exports.login = (req, res, next) => {
// 	// lo primero es leer el email y el password del req.body, pero ESLint nos manda un error de
// 	// que mejor usemos Object Destructuring asi que usemos ES6 Destructuring

// 	// const email = req.body.email;
// 	const { email, password } = req.body;

// 	// asi es como el User manda los login credentials para que los chequemos
// 	// ese chequeo tiene un par de pasos

// 	// 1. Checar si email y password existen
// 	if (!email || !password) {
// 		// si no existen mandar un mensaje de error al Client, usando AppError para que el
// 		// Global Handling Middleware mande el error al Client
// 		return next (new AppError ('Please provide email and password', 400));	
// 	}
		

// 	// 2. Checar si el User existe  && si el password son correctos
	
// 	// 3. Si todo esta bien enviar el JSON Web Token al Client
// 	// para el login solo mando el token, NO tengo que mandar el User a diferencia
// 	// del SignUp
// 	const token = '';
// 	res.status(200).json({
// 		status: 'success',
// 		token
// 	});
// }

/*
NOTA IMPORTANTE: SI me sale el error [ERR_HTTP_HEADERS_SENT]: 
		Cannot set headers after they are sent to the client, quiere decir que de 
		alguna forma estoy mandando DOS veces response al Client, ya sea que puse 
		next y luego res.status o al reves, pero solo debe enviarse UNA VEZ para eso 
		uso el return o bien hago el codigo para que solo se envia UNO o el OTRO
*/

/*
Ahora voy a checar si en verdad existe el User para el email que mandó el User

exports.login =  catchAsync (async (req, res, next) => {
	// lo primero es leer el email y el password del req.body, pero ESLint nos manda un error de
	// que mejor usemos Object Destructuring asi que usemos ES6 Destructuring

	// const email = req.body.email;
	const { email, password } = req.body;

	// asi es como el User manda los login credentials para que los chequemos
	// ese chequeo tiene un par de pasos

	// 1. Checar si email y password existen
	if (!email || !password) {
		// si no existen mandar un mensaje de error al Client, usando AppError para que el
		// Global Handling Middleware mande el error al Client
		return next (new AppError (‘Please provide email and password’, 400));
		
	}
		

	// 2. Checar si el User existe  && si el password son correctos segun lo que haya en la BD
	// uso findOne por que no busco el User por su Id si no por el email

	// const user = User.findOne( { email: email } );
	// Si el field y la variable se llaman igual en ES6 lo puedo abreviar asi
	// ahora hay algo importante que necesito hacer por SEGURIDAD, si vamos a POSTMAN
	// cuando hice SignUp para una nueva cuenta, puedes ver que el Output despues de dar SEND
	// recibo el password , esta encriptada, pero AUN asi NO es una buena practica filtrar el 
	// password al Client, lo tengo que arreglar y es muy facil. solo voy al userModel.js, en el 
	// Schema y pongo en el password field, select: false
	// ahora al dar SignUp sigue mandando el password PERO NO debe de mandarlo si doy
	// por ejemplo Get All Users y lo voy a probar

	
	// Ve un poco mas abajo para ver el cambio en userController.js para 
	// actualizar getAllUsers
	

	// Ahora con el arreglo que hice en userModel.js de select: false y en userController.js, al 
	// ejecutar User.findOne ( { email } ); TAMPOCO me mandara el password pero lo NECESITO
	// para hacer la comparacion asi que hago una seleccion explicita y necesito ponerle un +  para
	// seleccionar un field que le puse select: false

	const user = await User.findOne( { email } ).select(‘+password’);
	
	console.log(user);
	
	// 3. Si todo esta bien enviar el JSON Web Token al Client
	
});

*/


// exports.login =  catchAsync (async (req, res, next) => {
// 	// lo primero es leer el email y el password del req.body, pero ESLint nos manda un error de
// 	// que mejor usemos Object Destructuring asi que usemos ES6 Destructuring

// 	// const email = req.body.email;
// 	const { email, password } = req.body;

// 	// asi es como el User manda los login credentials para que los chequemos
// 	// ese chequeo tiene un par de pasos

// 	// 1. Checar si email y password existen
// 	if (!email || !password) {
// 		// si no existen mandar un mensaje de error al Client, usando AppError para que el
// 		// Global Handling Middleware mande el error al Client
// 		return next (new AppError ('Please provide email and password', 400));	
// 	}
		

// 	// 2. Checar si el User existe  && si el password son correctos segun lo que haya en la BD
// 	// uso findOne por que no busco el User por su Id si no por el email

// 	// const user = User.findOne( { email: email } );
// 	// Si el field y la variable se llaman igual en ES6 lo puedo abreviar asi
// 	// ahora hay algo importante que necesito hacer por SEGURIDAD, si vamos a POSTMAN
// 	// cuando hice SignUp para una nueva cuenta, puedes ver que el Output despues de dar 
// 	// SEND recibo el password , esta encriptada, pero AUN asi NO es una buena practica 
// 	// filtrar el password al Client, lo tengo que arreglar y es muy facil. solo voy 
// 	// al userModel.js, en el Schema y pongo en el password field, select: false
// 	// ahora al dar SignUp sigue mandando el password PERO NO debe de mandarlo si doy
// 	// por ejemplo Get All Users y lo voy a probar

	
// 	// Ve un poco mas abajo para ver el cambio en userController.js para 
// 	// actualizar getAllUsers
	

// 	// Ahora con el arreglo que hice en userModel.js de select: false y en 
// 	// userController.js, al ejecutar User.findOne ( { email } ); TAMPOCO me 
// 	// mandara el password pero lo NECESITO para hacer la comparacion asi que 
// 	// hago una seleccion explicita y necesito ponerle un +  para
// 	// seleccionar un field que le puse select: false

// 	const user = await User.findOne( { email } ).select('+password');
	
// 	// console.log(user);

	
// 	// 3. Si todo esta bien enviar el JSON Web Token al Client
// 	const token = '';
// 	res.status(200).json({
// 		status: 'success',
// 		token
// 	});
// });


/*
Ahora voy a POSTMAN a /login y pruebo con la informacion correcta y completa y 
console.log(user) manda el PAssword

{
  _id: 62b0c269b82a8a0cdfc0884e,
  name: 'abdelito',
  email: 'acero@hotmail.com',
  password: '$2a$12$OyBh.C5Y8GMTenfueuM3nOhAwssWykzV3XkeRWjAHypa8MluGN05a',
  __v: 0,
  id: '62b0c269b82a8a0cdfc0884e'
}

*/

/*
Ahora es momento de comparar el password de la BD con la que capturo  y mandó 
el User al server pero como lo hare si el password de la BD esta encriptada y 
el que mando el User al quere darle login NO lo esta, solo hay que usar el 
bcrypt package. Use bcrypt para generar la hashed password y puedo usar el 
mismo pacakge para comparar  un password original como pass1234 con la 
hashed password, pero el password encriptado  NO hay manera de obtener el 
password a partir del cual se encriptó, ese es el punto de encriptar, 
la unica manera es encriptar el password que acaba de mandar el User tratando de 
loggearse y luego ya compararlas , para eso usare una nueva funcion, y lo hare en 
userModel.js y eso es porque esta relacionado a los datos y porque ya tengo ese 
package ahi

en userModel.js
Voy a crear un Instanced Method la primera vez en el curso, que es un metodo  
que va a estar disponible para todos los documentos de una cierta coleccion
Como este es un Instanced Method y esta disponible a todos los Documents 
puedo usar el this keyword y apunta al Document actual, pero en este caso 
como tengo el password como select: false, el this.password NO esta disponible, 
y es por esto que mandare como segundo argumento a userPassword, la meta de 
este metodo es retornar true o false, true si los passwords son iguales,

E igual que el metodo bcrypt.hash, el bcrypt.compare es una funcion ASINCRONA

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
}






exports.signup = catchAsync( async (req, res, next) => {

	const newUser = await User.create ({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword
	});

	const token = signToken (newUser._id);

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: newUser
		}
	});
});

*/

exports.login =  catchAsync (async (req, res, next) => {
	// lo primero es leer el email y el password del req.body, pero ESLint nos manda un error de
	// que mejor usemos Object Destructuring asi que usemos ES6 Destructuring

	// const email = req.body.email;
	const { email, password } = req.body;

	// asi es como el User manda los login credentials para que los chequemos
	// ese chequeo tiene un par de pasos

	// 1. Checar si email y password existen
	if (!email || !password) {
		// si no existen mandar un mensaje de error al Client, usando AppError para que el
		// Global Handling Middleware mande el error al Client
		return next (new AppError ('Por favor captura el correo electrónico y/o password', 400));
		
	}
		

	// 2. Checar si el User existe  && si el password son correctos segun lo que haya en 
	// la BD uso findOne por que no busco el User por su Id si no por el email

	// const user = User.findOne( { email: email } );
	// Si el field y la variable se llaman igual en ES6 lo puedo abreviar asi
	// ahora hay algo importante que necesito hacer por SEGURIDAD, si vamos a POSTMAN
	// cuando hice SignUp para una nueva cuenta, puedes ver que el Output despues de dar 
	// SEND recibo el password , esta encriptada, pero AUN asi NO es una buena practica filtrar el 
	// password al Client, lo tengo que arreglar y es muy facil. solo voy al userModel.js, 
	// en el Schema y pongo en el password field, select: false
	// ahora al dar SignUp sigue mandando el password PERO NO debe de mandarlo si doy
	// por ejemplo Get All Users y lo voy a probar

	
	// Ve un poco mas abajo para ver el cambio en userController.js para actualizar 
	// getAllUsers
	

	// Ahora con el arreglo que hice en userModel.js de select: false y en 
	// userController.js, al ejecutar User.findOne ( { email } ); TAMPOCO me mandara 
	// el password pero lo NECESITO para hacer la comparacion asi que hago una 
	// seleccion explicita y necesito ponerle un +  para seleccionar un field que 
	// le puse select: false

	const userDocument = await User.findOne( { email } ).select('+password');

	//console.log(user);
	// Recuerda que correctPassword que cree en userModel.js es un Instanced Method y 
	// que esta disponible en todos los User Documents y por lo tanto userDocument 
	// es un user Document porque es el resultado de hacer un query al user Model
	// Ahora bien tengo que darle await a esta funcion ASINCRONA
	// comentarice la sig linea solo para que vieran como se ve pero como userDocument
	// puede ser null o undefined tronaria asi que lo muevo mas abajo
	//const correct = await userDocument.correctPassword (email, userDocument.password);

	// si no existe el User o el password es invalido
	// status 401 es unauthorized
	if (!userDocument || !(await userDocument.correctPassword (password, userDocument.password))) {
		// console.log("El email o el password son incorrectos")
		return next ( new AppError ('El email o el password son incorrectos.', 401));
	}

	// 3. Si todo esta bien enviar el JSON Web Token al Client
	// Crear el token va a ser igual que cuando le di SignUp, asi que creare una funcion para ambas
	createSendToken (userDocument, 200, req, res);
});

/*
Lo pruebo en POSTMAN en el login pongo
{
    "email": "acero@hotmail.com",
    "password": "pass12"
}

con el password mal y me regresa
{
    "status": "fail",
    "error": {
        "statusCode": 401,
        "status": "fail",
        "isOperational": true
    },
    "message": "Incorrect email or password",
    "stack": "Error: Incorrect email or password\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:693:17"
}

luego pruebo con el email incorrecto
{
    "email": "acer@hotmail.com",
    "password": "pass1234"
}

y me manda el mismo error

leugo pruebo con los datos correctos y me manda success y el TOKEN!
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjBjMjY5YjgyYThhMGNkZmMwODg0ZSIsImlhdCI6MTY1NTc2ODEyNSwiZXhwIjoxNjYzNTQ0MTI1fQ.tRFtShRDXVnBuDmRWjteahcDAKudeY8lYT3AA0KJhqg"
}
*/


///////////////////////////////////////////////////////////////////
// Lecture-131 Protecting Tour Routes Part 1
///////////////////////////////////////////////////////////////////

/*

Ya hemos completado el Primer Paso de Authentication Y logging in un User, donde un 
JSON Web Token es creado y regresarlo al Client si el User proporciona un email 
y password correctos

Ahora implementaré Protected Routes, usare el JSON Web Token para dar acceso a 
Protected Routes a los Users loggeados. Este es el 2do paso de Authentication

DIgamos que quiero proteger el getAllTours Route, es decir solo permitir a usuarios 
loggeados que tengan acceso a la lista de todos los Tours, lo que significa que 
antes de ejecutar el getAllTours Handler en tourRoutes.js, debo hacer un chequeo 
para verificar si el User esta loggeado. La mejor forma de hacer eso es usar un 
Middleware function, este Middleware regresara un error  si el User no esta 
Authenticated o llamara al siguiente Middleware que en este caso el 
tourController.getAllTours Handler y asi como protejo efectivamente de acceso 
No Autorizado

Asi que voy a authController.js en el folder Controllers y creo una nueva 
Middleware function


	
	en tourRoutes.js en el folder Routes
	
	const authController = require(‘../controllers/authController’);
	
	router
		.route('/')
		.get(authController.protect, tourController.getAllTours)


*/

exports.protect = catchAsync(async (req, res, next) => {

	// 1. Get the JWT(token) and check if it’s there, if it exists in the Headers
		// Una practica comun es mandar un token usando un HTTP Header con el request
		// Let’s take a look on how to set Headers in POSTMAN to send them along with
		// the request and also how can we get access to these Headers in Express, I’m gonna
		// do the last one first, if I go to app.js I have this Middleware, the way
		//  I get access to  Headers in Express is with req.headers

		//	app.use((req, res, next) => {
  		//		req.requestTime = new Date().toISOString(); 
		// le agrego esta linea
		//		console.log(req.headers);
  		//		next();
		//	});

		// Para probar req.header voy a POSTMAN y a Get All Tours que es el Route que 
		// quiero proteger y voy y CONFIGURO un Header, con el Key: test-header y 
		// el Value: Abdelito y veo en la Console e VSCode y me regresa 

// {
//   'test-header': 'Abdelito',
//   'user-agent': 'PostmanRuntime/7.29.0',
//   accept: '* / *',
//   'postman-token': '4eb79803-b65d-426f-ba85-02d5df060c64',
//   host: '127.0.0.1:8000',
//   'accept-encoding': 'gzip, deflate, br',
//   connection: 'keep-alive'
// }
		// Para mandar un JSON Web Token como Header hay un estandar a seguir, el 
		// Header se debe llamar Auhtorization, el value del Header siempre debe empezar
		// con Bearer, porque poseemos este token y luego el value del token osea el String
		// que no tiene un significado legible
		// Key: Authorization   Value: Bearer ujHJNju8IKJllw3

		// Bearer ujHJNju8IKJllw3 es el valor del JWT (token) que voy a leer del Header

		let token;

		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			// para obtener el token que esta despues de Bearer hago un .split usando 
			// el espacio entre ellos como separador, y se creara un Array
			token = req.headers.authorization.split(' ')[1];
		}
		///////////////////////////////////////////////////////////////////
		// Lecture-189 Logging in Users with Our API - Part 1
		///////////////////////////////////////////////////////////////////
		else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
			token = req.cookies.jwt; 
		}
		// console.log(token);
	
		//  AHORA lo pruebo en POSTMAN, le agrego el AUTHORIZATION HEADER 
		// y su TOKEN en Get All Tours usando un token real
		// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjBjMjY5YjgyYThhMGNkZmMwODg0ZSIsImlhdCI6MTY1NTgyODA3MywiZXhwIjoxNjYzNjA0MDczfQ.ougpSBgysNEMJuYg1kFqc218iA_w_ixQIqMsnGocpHY

		// Y EN EFECTO SI ME REGRESA el Token
	
		// Ahora checo el si Token que me llega del Client en verdad Existe
		if (!token) {
			// 401 unauthorized
			return next (new AppError('No has iniciado sesión. Por favor inicia sesión para tener acceso.', 401));
		}
		// Vuelvo a probar en POSTMAN, le quito el AUTHORIZATION HEADER y me 
		// regresa mensaje de Error,
		// MUY BIEN
		// COMO este Middleware fallo, YA NO hace getAllTours
/*
{
    "status": "fail",
    "error": {
        "statusCode": 401,
        "status": "fail",
        "isOperational": true
    },
    "message": "You are not logged in. Please log in to get access",
    "stack": "Error: You are not logged in. Please log in to get access\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:831:17\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/Utils/catchAsync.js:5:3\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:144:13)\n    at Route.dispatch (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:114:3)\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:284:15\n    at Function.process_params (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:346:12)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:280:10)\n    at Function.handle (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:175:3)\n    at router (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:47:12)\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at trim_prefix (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:328:13)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:286:9\n    at Function.process_params (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:346:12)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:280:10)"
}
*/

	// En este punto ya hace la validacion de que en el request debe ir tambien un token
	// Pero falta validar el token si llega que es el paso siguiente, es decir un token 
	// en el que nadie intento cambiar el Payload, en este caso el Payload es 
	// el user._id con el que hice el signToken()



		// 2. Verification of the token, JWT algorithm verifies if the signature is valid

		///////////////////////////////////////////////////////////////////
		// Lecture-131 Protecting Tour Routes Part 2
		///////////////////////////////////////////////////////////////////	

/*
Aqui voy a checar si alguien manipulo los datos del Token (JWT) o si el Token ha 
expirado

Ya use la funcion jwt.sign(), ve la funcion signToken() que viene del package 
JSON Web Token y ahora usare la funcion jwt.verify()

El primer parametro es el token para que el algoritmo pueda leer el 
Payload (user._id en este caso) y este paso tambien necesita el Secret, para crear 
la test Signature, ese secret esta en config.env en JWT_SECRET

El tercer argumento es una callback function, esta function ejecutara en el momento 
que la verificacion se complete, asi que como te daras cuenta jwt.verify() es una 
funcion ASINCRONA

Hemos trabajado con Promises todo el tiempo asi que voy Promisifying esta funcion, 
osea hacer que regrese una Promise, para asi poder usar ASYNC / AWAIT como en todas 
las demas funciones Asincronas que he usado, para hacer eso NodeJS tiene una funcion 
para hacer Promisifying, lo unico que tengo que hacer es hacer un require, al inicio

const util = require (‘util’);

Con util voy a usar el metodo para Promisifying, pero como usare solo ese metodo 
lo puedo hacer mas facil, puedo hacer Destructuring

const { promisify } = require (‘util’);

// 	promisify(jwt.verify) esta parte regresa una Promise, asi que le puedo poner 
// await y guardar el resultado en una variable, en esta variable estara los datos decodificados, el payload decodificado del JSON Web Token

//	(token, process.env.JWT_SECRET,  aqui hago el llamado a la function

*/

		const decodedData =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		// console.log(decodedData);
		// Vuelvo a Probar en POSTMAN en Get All Tours y mandado el AUTHORIZATION HEADER 
		// y me regresa
		// { id: '62b0c269b82a8a0cdfc0884e', iat: 1655828073, exp: 1663604073 }
		// Que es la informacion del JWT (token), la id del User, issued At y Expire Time
		// id: '62b0c269b82a8a0cdfc0884e' esta debe ser la id del User

		// Vamos por pasos Cuando hice login en POSTMAN mande estos datos
	// 	{
	// 		"email": "acero@hotmail.com",
	// 		"password": "pass1234"
	// 	}

	// Igual en el login mande llamar a token = signToken (userDocument._id)
	// entre los datos que mande fue el User._id, el JWT_SECRET y JWT_EXPIRES_IN
	// con eso cree mi token para el email y password con el que me loggee

	// Y cuando hice Get All Tours en POSTMAN se hizo el llamado
	// a este Middleware llamado .protect y mandé a VERIFICAR el token que me llego
	// del Client por medio del HEADER, este token resulto ser el mismo
	// con el que me loggee 
	// el console.log (decodedData) me pone los siguiente datos

		// { id: '62b0c269b82a8a0cdfc0884e', iat: 1655828073, exp: 1663604073 }
		// Que es la informacion del JWT (token), la id del User, issued At y Expire Time
		// id: '62b0c269b82a8a0cdfc0884e' esta debe ser la id del User loggeado
		// y al verificar en Compass veo que ASI ES este id corresponde a Abdelito
		// con el email acero@hotmail.com

		// Eso significa que tengo el Payload correcto osea el User._id correcto

		// ESTA FUNCIONANDO!!

		// Ahora vamos a intentar manipular el Payload de este token

		// Copio el token
		//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjBjMjY5YjgyYThhMGNkZmMwODg0ZSIsImlhdCI6MTY1NTgyODA3MywiZXhwIjoxNjYzNjA0MDczfQ.ougpSBgysNEMJuYg1kFqc218iA_w_ixQIqMsnGocpHY

		// Voy al JWT debugger en jwt.io pego el token en Encode y modifico unos valores
		// en Decoded, por ejemplo en Payload cambio el id: 62b0c269b82a8a0cdfc0885t
		//  y eso cambiara el Token 
		// Token Apocrifo:
		// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjBjMjY5YjgyYThhMGNkZmMwODg1dCIsImlhdCI6MTY1NTgyODA3MywiZXhwIjoxNjYzNjA0MDczfQ.RLfafliF4bn4alvlqJsk87uFsL4LV3kACDJG-DsEPgc
		// el cual copiare y lo pondre en POSTMAN y 
		// volvere a buscar Get All Tours con el AUTORIZATION HEADER y el Token Apocrifo

		// POSTMAN me regresa este error
		/*
		{
				"status": "errorcin",
				"error": {
						"name": "JsonWebTokenError",
						"message": "invalid signature",
						"statusCode": 500,
						"status": "errorcin"
				},
				"message": "invalid signature",
				"stack": "JsonWebTokenError: invalid signature\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/jsonwebtoken/verify.js:133:19\n    at getSecret (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/jsonwebtoken/verify.js:90:14)\n    at module.exports (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/jsonwebtoken/verify.js:94:10)\n    at node:internal/util:360:7\n    at new Promise (<anonymous>)\n    at node:internal/util:346:12\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:901:51\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/Utils/catchAsync.js:5:3\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:144:13)\n    at Route.dispatch (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:114:3)\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:284:15\n    at Function.process_params (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:346:12)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:280:10)\n    at Function.handle (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:175:3)"
		}
		*/

		// Este error se llama "name": "JsonWebTokenError", asi que voy a manejarlo
		// Y la forma de hacerlo es agregar un try-catch y si hay errores los pesco
		// y se lo mando al Client, pero en lugar de usar eso mejor uso el 
		// Global Error Handling Middleware

		// Asi que voy a ErrorController.js, solo agrego los errores de Validacio
		// Como ya habia hecho con los errores de Mongoose, de otra libreria, y como
		// jwt tambien es una libreria de terceros y tiene su propio name

/*
En ErrorController.js

if(error.constructor.name === 'JsonWebTokenError')
			error = handleJWTError (error);

const handleJWTError = error => new AppError('Invalid token. Please log in again', 401);

*/

		// RECUERDA QUE ESTE MANEJO DE ERRORES EN ESPECIFICO ES PARA PRODUCCION
		// asi que en la terminal ejecuto
		//	npm run start:prod

		// Y POSTMAN manda de regreso
/*
		{
				"status": "fail",
				"message": "Invalid token. Please log in again"
		}
*/

		// Este es uno de los errores que pueden pasar, el segundo es que el TOKEN EXPIRO 
/*
	Y para recrear el segundo error voy a cambiar el tiempo que se necesita para que expire
el token en config.end y JWT_EXPIRES_IN:5s

	Regreso a POSTMAN a probar /login ya con el cambio

	Y me regresa este token que solo dura 5 segundos
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjBjMjY5YjgyYThhMGNkZmMwODg0ZSIsImlhdCI6MTY1NTg3MjgzOCwiZXhwIjoxNjU1ODcyODQzfQ.dUGvXCXrwGGUOb1XR-TvGsgSYDkMHjkkaYynoddiy6U"
}

	Ahora vuelvo a POSTMAN en ambiente de Desarrollo a probar Get All Tours y en el Header le pongo este token de 5 segundos y veo que me regresa 

{
    "status": "errorcin",
    "error": {
        "name": "TokenExpiredError",
        "message": "jwt expired",
        "expiredAt": "2022-06-22T04:40:43.000Z",
        "statusCode": 500,
        "status": "errorcin"
    },
    "message": "jwt expired",
    "stack": "TokenExpiredError: jwt expired\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/jsonwebtoken/verify.js:152:21\n    at getSecret (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/jsonwebtoken/verify.js:90:14)\n    at module.exports (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/jsonwebtoken/verify.js:94:10)\n    at node:internal/util:360:7\n    at new Promise (<anonymous>)\n    at node:internal/util:346:12\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:901:51\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/Utils/catchAsync.js:5:3\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:144:13)\n    at Route.dispatch (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:114:3)\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:284:15\n    at Function.process_params (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:346:12)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:280:10)\n    at Function.handle (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/index.js:175:3)"
}

	Este es el error "name": "TokenExpiredError"

Si hago la misma prueba en Ambiente de Produccion me regresa

{
    "status": "error",
    "message": "Something went very wrong"
}

	Y manejo este 2do error como manejé el primero en errorController.js

	const handleJWTExpiredError = error => new AppError(‘Your token has expired. Please log in again!’, 401);


	if(error.constructor.name === 'TokenExpiredError')
		error = handleJWTExpiredError (error);

		Con este cambio en errorController.js ahora en Produccion me manda este error
{
    "status": "fail",
    "message": "Your token has expired. Please log in again!"
}
*/	 

/*
	Ahora hay que checar por ejemplo si el User ha sido borrado durante este proceso? El token aun existiria pero si el User ya no existe no quiero que se loggee, o PEOR que tal si el User ha cambiado su password despues de que el token se ha creado?, tampoco deberia de funcionar, por ejemplo imagina que alguien robo el JSON Web Token del User y para protegerse el User cambia el password, asi que el token viejo que fue creado antes de que se cambiara el password ya no debe ser válido, ya no debe ser aceptado para entrar a protected Routes, es lo que voy a implementar en los 3 y 4

	Lo primero que voy a hacer es ver si el User aun existe, este es el mas facil
*/

	// 3. Check if the User who’s trying to access the Route still exists

	// Recuerda que el id del User esta en el Payload y el Payload esta en decodedData
	// Hasta antes de este punto sabemos que el ID del User es correcto porque ya pasamos
	// el jwt.verify, ahora lo que necesito es saber si el User aun existe
	// el proceso de verificacion esta a cargo de jwt.verify si nadie alteró el User._id que esta
	// en el Payload del token y vuelvo a repetir si llegue a este linea de codigo es porque
	// estoy seguro que el User al que le asigné el JWT es el mismo cuyo ID esta dentro
	// del decodedData Payload, el proceso de Verificacion jwt.verify, es la llave, es lo que hace
	// que todo esto funcione
	const currentUser = await User.findById(decodedData.id);

	if (!currentUser) {
		return next (new AppError('The User belonging to this token does no longer exists', 401));
	}

	// Voy a POSTMAN y lo pruebo, primero creo un nuevo User en /Sign Up, solo cambio el email
/*
{
    "name": "abdelito",
    "email": “test@hotmail.com",
    "password": "pass1234”,
    "confirmPassword": "pass1234”
}

Y me regresa
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjMxYzkwZmFjM2NhNzE2MWIxMzZlYSIsImlhdCI6MTY1NTkwNTQyNSwiZXhwIjoxNjYzNjgxNDI1fQ.RrUvz2Mdx0Q8F63lo4vf2-JcvJZYBoEX3QEBcYgusro",
    "data": {
        "user": {
            "_id": "62b31c90fac3ca7161b136ea",
            "name": "abdelito",
            "email": "test@hotmail.com",
            "password": "$2a$12$DGoXjKnOqDqAYugsaqqY3eZzpc0U/rKgqhW2WmCR90Zc6DUwtAXZG",
            "__v": 0,
            "id": "62b31c90fac3ca7161b136ea"
        }
    }
}

Copio el token que me dio y se lo pongo en Get All Tours, pero antes de darle 
SEND borro el User usando Compass, para poder hacer la prueba de tener el token 
pero que el User YA NO exista. Esto es para poner el ejemplo de que alguien 
creo un User (Sign Up), se loggeo, y obvio se creo un JWT, y que tiempo 
despues el User fue borrado, pero durante este tiempo alguien pudo tener acceso 
al JWT y podria tratar de loggearse como ese User que en realidad ya fue borrado, 
asi que debo impedir eso, asi que lo borro en Compass

Ahora regreso a POSTMAN e intento darle Get All Tours con el JWT (token) del 
User que acabo de borrar, recuerda que pongo el token en el Header

Y POSTMAN me regresa
{
    "status": "fail",
    "error": {
        "statusCode": 401,
        "status": "fail",
        "isOperational": true
    },
    "message": "The User belonging to this token does no longer exists",
    "stack": "Error: The User belonging to this token does no longer exists\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:1067:16\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"
}

MUY BIEN!
*/

	// 4. Check if the User changed the password after the JWT(token) was issued
	// Para probar si el Usuario ha cambiado el password despues de que el JWT fue creado
	// necesito crear otro Instanced Method, osea un metodo que va a estar disponible para
	// todos los Documents (Documents son instances de un Model) y lo hago porque se 
	// necesita mucho codigo para esta verificacion, y este codigo pertenece al 
	// User Model y NO al Controller y lo hare de nuevo, justo como lo hice antes 
	// para checar el password en userModel.js donde
	// ya implemente el Instanced metodo correctPassword

	/*
En userModel.js

// Como parametro mandare el JWT.issuedAt o TimeStamp es decir cuando fue creado el token
// Por default regresare false y eso significa que el User NO ha cambiado de password
// Despues de que el token fue creado
// Recuerda que en un Instanced Method el this keyword siempre apunta al Document actual
// Por lo que tengo acceso a las propierties
// Ahora necesito crear un field en el Schema para la fecha en el que el password fue 
// cambiado asi que voy al schema de userModel.js y agrego el field

//	passwordChangedAt: Date
// ahora necesito agregar el codigo para que se actualice la fecha cada vez que un 
// User cambie su password 
	

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
	
	// como acabo de crear esta property passwordChangedAt y puede haber Documents
	// que NO la tengan primero checo si existe la property para el Document actual
	if (this. passwordChangedAt) {
		console.log(this.passwordChangedAt, JWTTimeStamp);
	}

	return false;
}
	
Ahora para probarlo necesito crear un User que tenga passwordChangedAt, asi que voy a 
POSTMAN en Sign Up y creo un nuevo User y le agregare manualmente passwordChangedAt 
para propositos de la prueba, pero mas adelante pondre el codigo para cambiar el 
password es cuando actualizare passwordChangedAt

{
    "name": "abdelito",
    "email": “prueba3@hotmail.com",
    "password": "pass1234”,
    "confirmPassword": "pass1234”,
    “passwordChangedAt”: “2022-06-22”
}


y me regresa 
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjMyZmY3OGI4MWIyNzc4YmFmYzI4YiIsImlhdCI6MTY1NTkxMDM5MiwiZXhwIjoxNjYzNjg2MzkyfQ.pJj_cOW_ch0FkEWlMPsgGwWAOsivnUc4azWNm4xlWes",
    "data": {
        "user": {
            "_id": "62b32ff78b81b2778bafc28b",
            "name": "abdelito",
            "email": "prueba3@hotmail.com",
            "password": "$2a$12$juvx93nLYbDG2sHR7Tv3q.9dEbQFaZZv/JIg.miqyiBjXl80erDj.",
            "passwordChangedAt": "2022-06-22T00:00:00.000Z",
            "__v": 0,
            "id": "62b32ff78b81b2778bafc28b"
        }
    }
}

	Ahora para hacer este paso 4, y ver el resultado de si el User cambio el password necesito mandar al metodo que acabo de crear userSchema.methods.changedPasswordAfter
*/
//currentUser.changedPasswordAfter(decodedData.iat);

/* 
Ahora vuelvo a probar en POSTMAN y para eso necesito hacer un login con el email: prueba3@hotmail.com

{
    "email": "prueba3@hotmail.com",
    "password": "pass1234"
}

y me regresa

{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjMyZmY3OGI4MWIyNzc4YmFmYzI4YiIsImlhdCI6MTY1NTkxNjM1NSwiZXhwIjoxNjYzNjkyMzU1fQ.4ZLZeco7DdKw_QSd2iEhwAj4I_mZeS-whLwQwfnrLqM"
}

Copio el token y en POSTMAN voy a Get All Tours y lo pego en el AUTHORIZATION HEADER

y me regresa
{
    "status": "success",
    "results": 10,
    "data": {
        "allTours": [
            {
                "secretTour": false,
                "ratingsAverage": 4.7,
                "ratingsQuantity": 37,
                "images": [
                    "tour-1-1.jpg",
                    "tour-1-2.jpg",
                    "tour-1-3.jpg"
                ],
                "startDates": [

..........
todos los tours, NO los voy a poner aqui porque es demasiada informacion, pero TODO 
funciona bien

y el console.log(decodedData); me regresa

	{ id: '62b32ff78b81b2778bafc28b', iat: 1655916355, exp: 1663692355 }

y el console.log(this.passwordChangedAt, JWTTimeStamp); me regresa

	2022-06-22T00:00:00.000Z 1655916355

Por lo que tengo que hacer una conversion para poder comparar las 2 fechas, una que 
tiene fecha normal y la otra esta en TimeStamp, las dos seran TimeStamp y compararé

me regreso a userModel.js y continuo

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
	
	// como acabo de crear esta property passwordChangedAt y puede haber Documents
	// que NO la tengan primero checo si existe la property para el Document actual
	if (this.passwordChangedAt) {
		const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		console.log(changedTimeStamp, JWTTimeStamp);

		// Si es true hubo un cambio en el password
		return JWTTimeStamp < changedTimeStamp;
	}

	// False significa que NO hubo cambio de password
	return false;
}

*/
	
		if (currentUser.changedPasswordAfter(decodedData.iat)) {
			return next (new AppError('User recently changed password! Please log in again', 401));
		}
		// Solo si NO hubo problemas en los pasos previos se llamara a next() lo cual dara acceso
		// a la Protected Route

		// Poner el User data en el request y luego doy Acceso
		req.user = currentUser;
		// console.log("req.user", req.user);
		///////////////////////////////////////////////////////////////////
		// Lecture-194 Building the User Account Page
		///////////////////////////////////////////////////////////////////
		res.locals.user = currentUser;


		// Solo si NO hubo problemas en los pasos previos se llamara a next() lo cual 
		// dara acceso a la Protected Route
		next();

	/*
			Regreso a POSTMAN y vuelvo a probar primero en /Sign Up, veo la informacion 
			del User que estoy usando
	    "email": “prueba3@hotmail.com",
y el token que me regresó
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjMyZmY3OGI4MWIyNzc4YmFmYzI4YiIsImlhdCI6MTY1NTkxMDM5MiwiZXhwIjoxNjYzNjg2MzkyfQ.pJj_cOW_ch0FkEWlMPsgGwWAOsivnUc4azWNm4xlWes

este token fue creado DESPUES de que el password cambio

asi que me loggeo de nuevo
{
    "email": "prueba3@hotmail.com",
    "password": "pass1234"
}

y me regresa 
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjMyZmY3OGI4MWIyNzc4YmFmYzI4YiIsImlhdCI6MTY1NTkxODg2NCwiZXhwIjoxNjYzNjk0ODY0fQ.IeVoRHC3Jy5jgchdGsJ704daJrcvqrOjmFfsZKsOQ10"
}

y uso este token del log in para en POSTMAN Get All Tours

y me regresa los tours
{
    "status": "success",
    "results": 10,
    "data": {
        "allTours": [
            {
                "secretTour": false,
                "ratingsAverage": 4.7,
                "ratingsQuantity": 37,
                "images": [
                    "tour-1-1.jpg",
                    "tour-1-2.jpg",
                    "tour-1-3.jpg"
                ],
                "startDates": [
.......

Ahora voy a Compass, selecciono el Collection Users, el Document con el 
email: prueba3@hotmail.com para cambiar la fecha en que cambie el password, 
es decir cambio passwordChangedAt un mes despues de 2022-06-22, osea de Junio a Julio

Voy a POSTMAN y doy log in de nuevo 
{
    "email": "prueba3@hotmail.com",
    "password": "pass1234"
}

y me regresa este token
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjMyZmY3OGI4MWIyNzc4YmFmYzI4YiIsImlhdCI6MTY1NTkxOTQ4MSwiZXhwIjoxNjYzNjk1NDgxfQ.DSu_WAQF8_wUQepQvWTpHlPzHADk6oxI9fqrGvzgcx4"
}

En POSTMAN ahora trato de accesar el Protected Route Get All Tours poniendo 
este ultimo token que me mandó el login, pongo el token en AUTHORIZATION HEADER, 
entonces este token sera creado ANTES de que el password se cambió, osea el password 
se cambio el 22 de Julio de 2022, pero el token fue creado el 22 de Junio de 2022

y me manda el siguiente error
{
    "status": "fail",
    "error": {
        "statusCode": 401,
        "status": "fail",
        "isOperational": true
    },
    "message": "User recently changed password! Please log in again",
    "stack": "Error: User recently changed password! Please log in again\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:1267:17\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"
}

LISTO EL PROTECT MIDDLEWARE HA SIDO IMPLEMENTADO

*/


});



///////////////////////////////////////////////////////////////////
// Lecture-134 Authorization: User Roles And Permissions
///////////////////////////////////////////////////////////////////

// aqui va IMPLICITO el return asi que no necesito ponerlo
// ya que es una solo linea, al igual los {} NO se necesitan
exports.restrictTo = ( ...roles) => 

	// y en seguida regreso una funcion nueva y esta es la Middleware function
	// y esta Middleware function tiene acceso al roles parameter porque es un CLOSURE
	// aqui se sobre entiende que dice return (req, res, next) => {..... }
	 (req, res, next) => {
		// roles [ ‘admin’, ‘lead-guide’ ]
		// cuando le dare a un User acceso a ciertas Routes, pues cuando el Rol del User este dentro de este roles Array que le pasamos
		// asi que si un User tiene el Rol de ‘user’ osea no esta en el roles Array NO tendra permiso de usar este metodo del Resource

		// si este roles Array no incluye el Rol del current User entonces NO le dare permiso
		// y donde tengo guardado el Rol del current User?
		// recuerda que en authController en el metodo exports.protect al final puse
		// esta linea
		//		req.user = currentUser;
		// y fijate que exoprts.protect se ejecuta antes de restrictTo

		// console.log("req.user", req.user);
		if (!roles.includes(req.user.role)) {
			// statusCode 403 Forbidden, no Authorized
			return next (new AppError ('No tienes permiso o el rol para realizar esta acción.', 403));
		}
		next();
	}



///////////////////////////////////////////////////////////////////
// Lecture-135 Password Reset Functionality: Reset Token
///////////////////////////////////////////////////////////////////


// este es el primer paso
// exports.forgotPassword =  catchAsync( async (req, res, next) => {
// 	// 1. Get user based on POSTed email
// 	// Uso findOne no findById porque no conozco el User Id y el usuario tampoco sabe su Id 
// 	const user = await User.findOne( { email: req.body.email } );

// 	// Verifico si el User se encontró
// 	if (!user) {
// 		// 404 statusCode Not Found
// 		return next ( new AppError('There is no user with that email address', 404 ) );
// 	}

// 	// 2. Generate the random token
// 	// para esto necesito un Instanced method en userModel.js
// 	// esta linea modifica el Schema: passwordResetExpires y passwordResetTOken
// 	// falta grabarlo en la BD 
// 	const resetToken = user.createPasswordResetToken();
	
// 	// Le tuve que poner { validateBeforeSave: false } porque sino me sale
// 	// este error en POSTMAN
// /*
// {
//     "status": "errorcin",
//     "error": {
//         "errors": {
//             "confirmPassword": {
//                 "name": "ValidatorError",
//                 "message": "Please confirm your password",
//                 "properties": {
//                     "message": "Please confirm your password",
//                     "type": "required",
//                     "path": "confirmPassword"
//                 },
//                 "kind": "required",
//                 "path": "confirmPassword"
//             }
//         },
//         "_message": "User validation failed",
//         "statusCode": 500,
//         "status": "errorcin",
//         "name": "ValidationError",
//         "message": "User validation failed: confirmPassword: Please confirm your password"
//     },
//     "message": "User validation failed: confirmPassword: Please confirm your password",
//     "stack": "ValidationError: User validation failed: confirmPassword: Please confirm your password\n    at model.Document.invalidate (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/document.js:2782:32)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/document.js:2574:17\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/schematype.js:1273:9\n    at processTicksAndRejections (node:internal/process/task_queues:78:11)"
// }
// */
// 	await user.save( { validateBeforeSave: false } );

// /*
// Voy a POSTMAN a probarlo con
// 	{{URL}}api/v1/users/forgotPassword

// y me regresa

// {
//     "status": "error",
//     "message": "This route is not yet defined."
// }

// AH pero es que en POSTMAN le puse GET y no POST

// Ya le puse POST y me regresa

// {
//     "status": "fail",
//     "error": {
//         "statusCode": 404,
//         "status": "fail",
//         "isOperational": true
//     },
//     "message": "There is no user with that email address",
//     "stack": "Error: There is no user with that email address\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:1417:17\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"
// }

// Y esto es porque no le puse email en el body -> raw -> JSON de /forgotPassword
 
// {
// 	“email”: “hello@hotmail.com”
// }

// POSTMAN NO me regresa nada porque no le puse response en el codigo osea res.status
// Pero la Console si me regresa esto
// el random resetToken que me crea el código SIN encriptar, es un random hexadecimal 
// string es:

// resetToken: '5252171d2c10ac78c280f808f91b7bf475c78560d186a6cdc8a703322a875598'
 

// el random resetToken que me crea el código YA encriptado es:

// this.passwordResetToken: 756a1e1f6e5bfd857e1e19ca4cf136ebdf61745a88d3bf7caf145aeb27b9a877



// Ahora voy a Compass para comprobar que passwordResetToken y passwordResetExpires se 
// grabaron en la BD en la Collection Users, para el correo que puse en el Body del 
// API /forgotPassword

// email: “hello@hotmail.com"

// passwordResetExpires: 2022-06-24T16:10:35.874+00:00

// passwordResetToken: "756a1e1f6e5bfd857e1e19ca4cf136ebdf61745a88d3bf7caf145aeb27b9a877"
// */


	
// 	// 3. Send it to user’s email	
// });

// este es el segundo paso
/*
exports.resetPassword = (req, res, next) => {
	
}
*/

///////////////////////////////////////////////////////////////////
// Lecture-136 Sending Emails with Nodemailer
///////////////////////////////////////////////////////////////////

/*
En authController.js

const sendEmail = require(‘../Utils/email’);
*/

// este es el primer paso
exports.forgotPassword =  catchAsync( async (req, res, next) => {
	// 1. Get user based on POSTed email
	// Uso findOne no findById porque no conozco el User Id y el usuario tampoco sabe su Id 

	const { email, urlEncoded } = req.body;

	// const user = await User.findOne( { email: req.body.email } );
	const user = await User.findOne( { email: email } );

	// Verifico si el User se encontró
	if (!user) {
		// 404 statusCode Not Found
		return next ( new AppError('No existe un usuario con ese correo electrónico.', 404 ) );
	}

	// 2. Generate the random token
	// para esto necesito un Instanced method en userModel.js
	// esta linea modifica el Schema: passwordResetExpires y passwordResetTOken
	// falta grabarlo en la BD 
	const resetToken = user.createPasswordResetToken();
	
	// Le tuve que poner { validateBeforeSave: false } porque sino me sale
	// este error en POSTMAN
/*
{
    "status": "errorcin",
    "error": {
        "errors": {
            "confirmPassword": {
                "name": "ValidatorError",
                "message": "Please confirm your password",
                "properties": {
                    "message": "Please confirm your password",
                    "type": "required",
                    "path": "confirmPassword"
                },
                "kind": "required",
                "path": "confirmPassword"
            }
        },
        "_message": "User validation failed",
        "statusCode": 500,
        "status": "errorcin",
        "name": "ValidationError",
        "message": "User validation failed: confirmPassword: Please confirm your password"
    },
    "message": "User validation failed: confirmPassword: Please confirm your password",
    "stack": "ValidationError: User validation failed: confirmPassword: Please confirm your password\n    at model.Document.invalidate (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/document.js:2782:32)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/document.js:2574:17\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/schematype.js:1273:9\n    at processTicksAndRejections (node:internal/process/task_queues:78:11)"
}
*/
	await user.save( { validateBeforeSave: false } );

/*
Voy a POSTMAN a probarlo con
	{{URL}}api/v1/users/forgotPassword

y me regresa

{
    "status": "error",
    "message": "This route is not yet defined."
}

AH pero es que en POSTMAN le puse GET y no POST

Ya le puse POST y me regresa

{
    "status": "fail",
    "error": {
        "statusCode": 404,
        "status": "fail",
        "isOperational": true
    },
    "message": "There is no user with that email address",
    "stack": "Error: There is no user with that email address\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:1417:17\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"
}

Y esto es porque no le puse email en el body -> raw -> JSON de /forgotPassword
 
{
	“email”: “hello@hotmail.com”
}

POSTMAN NO me regresa nada porque no le puse response en el codigo osea res.status
Pero la Console si me regresa esto
el random resetToken que me crea el código SIN encriptar, es un random hexadecimal 
string es:

resetToken: '5252171d2c10ac78c280f808f91b7bf475c78560d186a6cdc8a703322a875598'
 

el random resetToken que me crea el código YA encriptado es:

this.passwordResetToken: 756a1e1f6e5bfd857e1e19ca4cf136ebdf61745a88d3bf7caf145aeb27b9a877



Ahora voy a Compass para comprobar que passwordResetToken y passwordResetExpires se 
grabaron en la BD en la Collection Users, para el correo que puse en el Body del 
API /forgotPassword

email: “hello@hotmail.com"

passwordResetExpires: 2022-06-24T16:10:35.874+00:00

passwordResetToken: "756a1e1f6e5bfd857e1e19ca4cf136ebdf61745a88d3bf7caf145aeb27b9a877"
*/

// 3. Send it to user’s email	
// Lecture-136 Sending Emails with Nodemailer

// defino el resetURL
// el User dara click al email y asi podra hacer el request, y asi funcionara cuando 
// implemente el dynamic website, pero por ahora quiero crear el resetURL para que el 
// User pueda copiarlo para que sea mas facil hacer el request

/*
Voy a POSTMAN y creo un nuevo request /resetPassword que sera un HTTP PATCH y va tener 
como parametro el token por ejemplo
  {{URL}}api/v1/users/resetPassword/3333	

Y es un PATCH porque el resultado de esto es la modificacion de la property password 
del Document Users
*/

// va a estar preparado para funcionar en development o Production 
// recuerda que aqui envio el resetToken SIN encriptar
// en el proximo paso comparate el resetTokenOriginal con el encriptado


// const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

// sendEmail es una funcion ASINCRONA
// user.email es lo mismo que req.body.email


///////////////////////////////////////////////////////////////////
// Lecture-207 Email Templates with Pug: Welcome Emails
///////////////////////////////////////////////////////////////////
try {
// lo comentatizo por el momento porque sendEmail va a ser cambiado por

//   await sendEmail ({  
//     email: user.email,
//     subject: 'Your password reset Token (valid for 10 min)',
//     message
//   });

	// const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
	// const resetURL = '127.0.0.1:8000/resetPasswordForm';
	// const resetURL = `${req.protocol}://${req.get('host')}/resetPasswordForm/${resetToken}`;

	// Este es el link de la pagina de Reset Password que se manda al correo del
	// Usuario, la página es de ReactJS y como necesito el URL, viene en urlEncoded
	const resetURL = `${urlEncoded}/reset-password/${resetToken}`;
	// const resetURL = `${req.protocol}://${req.get('host')}/resetPasswordForm`;


	console.log('resetURL', resetURL);
	let problemWithEmail = true;

	// Si todo salio Bien al Mandar el Email entonces problemWithEmail = false;
	if (await new Email (user, resetURL).sendPasswordReset())
		problemWithEmail = false;


	let message = "";

	if (problemWithEmail)
		message = "Hubo un error al enviar el token al correo electrónico"
	else
		message = "El token fue enviado al correo electrónico"
  // NO DEBO ENVIAR EL TOKEN POR AQUI osea dentro de JSON, sino cualquiera podria darle 
	// reset al password de cualquiera y controlar la cuenta, para eso mande el email 
	// con el token SIN encriptar 
  res.status(200).json({
    status: 'success',
    // message: 'Token sent to email',
    message,
		problemWithEmail: problemWithEmail
  });
} catch (err) {

	// console.log('err', err);
  // hago el set back
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // lo guardo en la BD
  await user.save( { validateBeforeSave: false } );

  // el statusCode es 500 porque es un error en el server
  return next (new AppError ('Hubo un error al enviar el correo electrónico. Vuelva a intentar más tarde', 500));
}

// aun asi tengo que manejar si pasa un error al usar el metodo sendEmail y entonces 
// debo mandar un mensaje de Error al Client, pero en este caso necesito hacer 
// aun mas que eso, necesito set back el passwordResetToken y el passwordResetExpires 
// que defini en userSchema y que se guardó en la BD, asi que para esto ultimo 
// SI necesito un try-catch en sendEmail  

/*
Ahora lo pruebo en POSTMAN en /forgotPassword en el Body pongo
{
“email”: “hello@hotmail.com”
}

y me regresa 
{
“status”: “success”,
“message”: “Token sent to email”
}


resetToken SIN Encriptar: 
'b664a2d0744bd6ae0fca9e318d2d4d2769655c5b11f5500e99afde5bc05bc22d'

Token Encriptado:
bb384ae5c29f1613141f4df94da5975628d92c9538de936c5950ed5826563957

y como use Mailtrap NO mando el mensaje sino que esta atrapado en Mailtrap

Voy a Mailtrap y checo mi correo
Forgot your password? Submit a PATCH request with your new password and 
confirmPassword to: 
http://127.0.0.1:8000/api/v1/users/resetPassword/
b664a2d0744bd6ae0fca9e318d2d4d2769655c5b11f5500e99afde5bc05bc22d.
If you didn't forget your password, please ignore this email!

ahora checo si el token que me llego al correo es correcto
Y lo puedo checar en el console.log de userModel.js 
en userSchema.methods.createPasswordResetToken

console.log( {resetToken} , this.passwordResetToken   ); 

Y en la BD debo tener el token encriptado asi que lo checo en Compass y la Collections 
Users y tambien que la fecha expira en 10 minutos

passwordResetExpires: 2022-06-25T04:05:46.595+00:00
passwordResetToken: bb384ae5c29f1613141f4df94da5975628d92c9538de936c5950ed5826563957

En la proxima leccion le hare un resetPassword basado en el nuevo password que el 
User mandara con el request de reset password
*/
});



///////////////////////////////////////////////////////////////////
// Lecture-137 Password Reset Functionality: Setting New Password
///////////////////////////////////////////////////////////////////

/*

Esta es la ultima parte de de Password Reset Functionality, donde configuro el 
nuevo password para el User

En authController.js

const crypto = require (‘crypto’);
*/

exports.resetPassword =  catchAsync( async (req, res, next) => {
	// 1. Get User based on the token
/*
	Como recordaras en .forgotPasssword le manda al User el Rett Token SIN Encriptar 
	y ahora necesito encriptarlo para comparar este token con el que esta guardado en la 
	BD que SI esta encriptado, ya hice algo similar con el password, no podia compararlo 
	tan facilmente como lo hare con el reset token 
*/
	const hashedResetToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

	
	// Ahora obtengo el User basado en el reset Token porque este token es lo unico que 
	// sobre el User en este momento, no tengo email, nada, asi que este reset token que 
	// puede identificar al User y con esto puedo darle query a la BD

	// Tambien hay que tomar en cuenta si passwordResetExpires es mayor que el momento 
	// actual si es asi quiere decir que AUN NO ha expirado
	// Date.now() es un timestamp del momento actual pero MongoDB convierte todo y asi 
	// puede compararlo

	const user = await User.findOne( { passwordResetToken: hashedResetToken, passwordResetExpires: { $gt: Date.now() } } );


	// 2. If token has not expired && there is a user : set the New Password
	// Mando un error si no se encontro el User o si el reset Token expiró
	if (!user) {
		return next (new AppError ('El Token es inválido o ha expirado' ,400));
	}

	// Si no hubo error entonces cambio el password y hago confirmPassword, estos datos 
	// los envio desde el Body del API
	user.password = req.body.password;
	user.confirmPassword = req.body.confirmPassword;

	// De paso borro el passwordResetToken y el passwordResetExpires
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	// actualizo el documento
	// en este caso NO hago { validateBeforeSave: false }  porque quieroo checar que 
	// el password y confirmPassword son iguales 
	// Recuuerda que uso save y NO findOneAndUpdate porque con save puedo ejecitar 
	// validaciones y PRE save middlewares, por ejemplo donde se encriptan los passwords
	await user.save();

	// 3. Update passwordChangedAt property for the current User

/*
En el userModel.js
	Voy a usar un Middleware function para actualizar la passwordChangedAt property
	Voy a poner las Middleware functions pegadas una debajo de la otra

	Tambien pude haberlo hecho en un Controller, por ejemplo en authController.js justo 
	antes del await user.save(), y despues de user.passwordResetExpires = undefined;
	Pero quiero que pase en automatico, prque despues tendre otro lugar dnde tendre que 
	actualizar el password y me tengo que asegurar que incluyo el mismo codigo alla

	Cuando exactamente quiero cambiar la passwordChangedAt? pues cuando cambie el password
	osea como este Middleware se ejecutara tanto cuando haga un Sign Up como cuando 
	haga cambios en cualquiera de las properties de User, incluido si cambie el 
	password necesito poner un if para que solo se ejecute si fue cambio de password

userSchema.pre('save', function (next) {
	// Si hice cambios en las properties menos en password me brinco este Middleware
	// SI hago un Sign Up, osea creacion de Usuario, me brinco este Middleware

	if (!this.isModified ('password') || this.isNew) {
		return next();	
	}

	// En teoria esto debe funcionar pero en la pratica a veces hay problemas y 
	// el problema es que a veces grabar en la BD es mas lento que enviar el 
	// JSON Web Token, haciendo que changed password timestamp en la BD es configurado 
	// despues de que el JSON Web Token fue creado y eso hara que el User no podra 
	// loggearse usando el nuevo Token, porque recuerda la razon de que el timestamp 
	// passwordChangedAt exista es para compararlo con el timestamp del JSON Web Token, 
	// es decir cuando se ejecuta esta linea 

	Teniendo esto en authController.js

					if (currentUser.changedPasswordAfter(decodedData.iat)) {
						return next (new AppError(‘User recently changed password! Please log in again’, 401));
					}


Y cuando ejecuto la linea que esta aqui abajito osea 
					const token = signToken (user._id);

es cuando creo el nuevo token, y lo que pasa es que este token a veces es creado ANTES del changed password timestamp, y lo puedo corregir restando un segundo a 
				this.passwordChangedAt = Date.now() - 1000 ;

Es un small hack
*/

	// 4. Log in the User, send the JWT to the Client 
	// Envio el JSON Web Token al Client  y puedo usar un cpdigo que ya tengo

	const token = signToken (user._id);

	// luego mando este nuevo User al Client
	res.status(201).json({
		status: 'success',
		token,
		data: {
			user
		}
	});

	// res.render("resetPasswordFormHTML", { email: verify.email, status: "verified" });


/*
Voy a POSTMAN a probarlo a /forgot Password
					{{URL}}api/v1/users/forgotPassword
{
    "email": "hello@hotmail.com"
}

y me regresa

{
    "status": "success",
    "message": “Reset Token sent to email"
}

Envia el correo a Mailtrap.io, actualiza MongoDB en Users: passwordResetToken y 
el passwordResetExpires

Luego voy a Mailtrap.io checo mi correo y de ahi saco el reset Token SIN encriptar, 
		4cf9339657527a7628782699a4daa799b1881ee6b9453b1a907ee35c7cf09239
lo copio y luego voy a POSTMAN en /resetPassword y pego el reset Token en la API 
ya que es un param

	{{URL}}api/v1/users/resetPassword/Pego el token


Voy a POSTMAN a /reset Password pego el Reset Token en el parametro

{{URL}}api/v1/users/resetPassword/4cf9339657527a7628782699a4daa799b1881ee6b9453b1a907ee35c7cf09239

Luego en el Body -> raw -> JSON de la API especifico el nuevo password y confirmPassword
{
    "password": "newpass123",
    "confirmPassword": "newpass123"
}

En Tests pongo donde se debe guardar la envinronment Variable “jwt” que es el 
JSON Web Token
	pm.environment.set("jwt", pm.response.json().token);


Me regresa el nuevo token con el que ya estoy loggeado, “token” que me llega es el 
JSON Web Token
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjRjMDg0M2E2MThiMzU4YjhmY2VlMiIsImlhdCI6MTY1NjI0OTAyMiwiZXhwIjoxNjY0MDI1MDIyfQ.a4QDZ-F0oaUaNImtQklBOB9ZbClCnVqQ4mCqG4S9PXM",
    "data": {
        "user": {
            "role": "user",
            "_id": "62b4c0843a618b358b8fcee2",
            "name": "abdelito",
            "email": "hello@hotmail.com",
            "__v": 0,
            "password": "$2a$12$y7MRvdCGdudb.OWjFleCZuY9mpUSAckz8sNAb5wKtblCbFf50ADeW",
            "passwordChangedAt": "2022-06-26T13:10:21.630Z",
            "id": "62b4c0843a618b358b8fcee2"
        }
    }
}


Voy a Compass, voy a Users, busco el email “hello@hotmail.com” que es el email sobre 
el cual di /forget Password y /reset Password para cambiar el Password y veo que 
tengo passwordChangedAt, que es el momento en el que cambie de password

	passwordChangedAt: 2022-06-26T13:10:21.630+00:00

Tambien puedo ver en Compass que passwordResetToken y 
el passwordResetExpires YA NO EXISTEN en el User que actualice con el 
email “hello@hotmail.com”

Voy a POSTMAN en / Get All Tours el token ya esta puesto en {{jwt}} en el tab de 
Authorization -> Bearer Token

	Y me regresa todos los tours

{
    "status": "success",
    "results": 9,
    "data": {
        "allTours": [
            {
                "secretTour": false,
                "ratingsAverage": 4.7,
                "ratingsQuantity": 37,
                "images": [
                    "tour-1-1.jpg",
                    "tour-1-2.jpg",
                    "tour-1-3.jpg"
                ],
                "startDates": [
                    "2021-04-25T15:00:00.000Z",
                    "2021-07-20T15:00:00.000Z",
                    "2021-10-05T15:00:00.000Z"
                ],

.....

*/

});


///////////////////////////////////////////////////////////////////
// Lecture-138 Updating the Current User: Password
///////////////////////////////////////////////////////////////////

/*

Le permito a un User cambiar su password cuando se le olvida y no se puede loggear 
pero ahora quiero permitirle cambiar el password a un User que ya esta loggeado, 
osea sin hacer el reset Token ni enviar el email

Aunque el User este loggeado si quiere cambiar su password necesita pasar al server 
su password actual para estar seguros que el User en vdd es quien dice ser

En userRoutes.js
	router.route(‘/updateMyPassword’).patch(authController.protect, authController.updateMyPassword);


En authController.js
*/

exports.updateMyPassword = catchAsync (async (req, res, next) => {
	// 1. Get User from the collection Users

/*
	Si ya estoy loggeado puedo usar req.user = currentUser
	esto viene desde exports.protect
	como veo actualizar un password debe ser Protected, asi que debo usar exports.protect 
	y esto me dara el currentUser en req.user y con esto ya tengo acceso a toda la 
	informacion del currentUser
	y por lo tanto que voy a mandar en exports.updateMyPassword, osea en la API que sera
	/updateMyPassword, pues el {{jwt}}

En userRoutes.js
	router.route(‘/updateMyPassword’).patch(authController.protect, authController.updateMyPassword);

	y en el Body -> raw -> JSON le paso el password para ver si es el correcto del que 
	esta en la bd
{
	“oldPassword": "newpass123",
	“newPassword”: “pass12345”,
	“confirmNewPassword”: “pass12345”
}
	Despues de ejecutar authController.protect ya tengo req.user = currentUser, ya se 
	busco en la BD en base al JWT, por lo que en el API /updateMyPassword debe tener 
	Authorization -> Bearer Token -> {{jwt}}

*/
	// const user = await User.findOne( { email: req.user.email } ).select('+password');
	const user = await User.findById( req.user.id ).select('+password');
	
	// Checo que se encontró el User en la collection && checo que
	// el password que mandó el User coincida con el password de la BD
	if (!user || !(await user.correctPassword (req.body.oldPassword, user.password))) {
		return next (new AppError('Tu password actual esta equivocado.', 404));
	}

/*
La otra forma que creo que Jonas quiere que haga no es con authController.protect 
sino que use el {{jwt}} o el email para .findOne pero no me convence
*/
	
	// 2. Check if the POSTed password is correct
	user.password = req.body.newPassword;
	user.confirmPassword = req.body.confirmNewPassword;

/*
	
	Entonces primero hago las validaciones de passwords, 
	1. que sea mayor a 8 caracteres, 	al hacer save
	2. que sean iguales, de ser asi, al hacer save
	3. SI la vieja password NO encriptada (req.body.oldPassword) Existe en la BD, 
	la cual esta encriptada
	console.log('req.user.password', req.user.password);
	if (!req.user || !(await req.user.correctPassword (req.body.oldPassword, req.user.password))) {
		return next ( new AppError ('Incorrect email or password', 401));
	}


	Entonces actualizo la BD con la nueva BD
	req.body.newPassword
	req.body.confirmNewPassword

*/

	// 3. If so, Update the Password in the DB
/*
	user.password = req.body.newPassword;
	user.confirmPassword = req.body.confirmNewPassword;

	// actualizo el documento
	// en este caso NO hago { validateBeforeSave: false }  porque quieroo checar que 
	// el password y confirmPassword son iguales 
	// Recuuerda que uso save y NO findOneAndUpdate porque con save puedo ejecitar 
	// validaciones y PRE save middlewares, por ejemplo donde se encriptan los passwords
	await user.save();
*/
	await user.save();

	// 4. Log in the User again, send JWT to the User
	// Vuelvo a loggear el User y mando el nuevo JWT y actualizo passwordChangedAt 

	// Si todo esta bien enviar el JSON Web Token al Client
	// Crear el token va a ser igual que cuando le di SignUp, asi que creare una funcion para ambas
	
	// luego mando este nuevo User al Client
	createSendToken (user, 200, req, res);

/*

Para probar primero hago login en POSTMAN para que se genere el {{jwt}}

{
    "email": "admin@hotmail.com",
    "password": "passabdel"
}

Luego voy a / UpdateMyPassword, cambio el password de passyussy a pass12345

{{URL}}api/v1/users/updateMyPassword


{
	"oldPassword": "passyussy",
	"newPassword": "pass12345",
	"confirmNewPassword": "pass12345"
}

pm.environment.set("jwt", pm.response.json().token);

y me regresa
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjRjMDM1M2E2MThiMzU4YjhmY2VlMCIsImlhdCI6MTY1NjI3MzM4OSwiZXhwIjoxNjY0MDQ5Mzg5fQ.AOYJe1jLLfFyfuF6msSs0RM1jsfKplMNkPcbWXlzHu0"
}

Tambien me regresa el {{jwt}} osea el nuevo JSON Web Token que usare luego en 
/Get All Tours

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjRjMDM1M2E2MThiMzU4YjhmY2VlMCIsImlhdCI6MTY1NjI3MzM4OSwiZXhwIjoxNjY0MDQ5Mzg5fQ.AOYJe1jLLfFyfuF6msSs0RM1jsfKplMNkPcbWXlzHu0

Luego voy a Compass a checar passwordChangedAt en el User que actualice el password osea 
ASI ES ahora el
password: $2a$12$QMwPp8Z903tlaYzoILWxlOeGCM3EK6dh9Eyk4rBIn2adKie.5IVsW

passwordChangedAt: 2022-06-26T23:04:58.825+00:00


Por ultimo voy en POSTMAN y checo /GetAllTours

{
    "status": "success",
    "results": 9,
    "data": {
        "allTours": [
            {
                "secretTour": false,
                "ratingsAverage": 4.7,
                "ratingsQuantity": 37,
                "images": [
                    "tour-1-1.jpg",
                    "tour-1-2.jpg",
                    "tour-1-3.jpg"
                ],
                "startDates": [
                    "2021-04-25T15:00:00.000Z",
                    "2021-07-20T15:00:00.000Z",

...
*/

});




///////////////////////////////////////////////////////////////////
// Lecture-190 Logging in Users with Our API - Part 2
///////////////////////////////////////////////////////////////////

/*

Lo primero que voy a hacer es poner una condicion para pintar los botones de Log in 
y Sign Up dependiendo si el User esta loggeado o no, y en caso que este loggeado 
pintar un menu y un boton de Log out

Y este pintado debe suceder desde el back end, osea en uno de los pug templates

Ahora como sabra el template si el User esta loggeado o no? Para saber eso necesito 
un Middleware function , podrias pensar que el protect Middleware hace algo similar 
pero hay una diferencia es que .protect solo funciona en protected routes, pero el 
nuevo Middleware functin que voy a crear va a ejecutarse en cada request en nuestro 
rendered website

En authController.js

Como el nuevo middleware es muy similiar al .protect Middleware, voy a copiarlo

Este Middleware es solo para paginas ya pintadas, asi que el objetivo NO es proteger 
una route, asi que NUNCA habra un mensaje de error en este Middleware

*/
exports.isLoggedIn = async (req, res, next) => {

	// 1. Get the JWT(token) and check if it’s there, if it exists in the Headers

	// El token debe venir de una cookie y NO de un Authorization header porque para 
	// paginas pintadas NO tendremos el token en el header

	if (req.cookies.jwt) {
		try {
			// 1. Verification of the token, JWT algorithm verifies if the signature is valid
			const decodedData =  await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);


			// 2. Check if the User who’s trying to access the Route still exists
			const currentUser = await User.findById(decodedData.id);

			if (!currentUser) {
				return next ();
			}

			// 3. Check if the User changed the password after the JWT(token) was issued	
			if (currentUser.changedPasswordAfter(decodedData.iat)) {
				return next ();
			}

			// Hay un User Loggeado, por lo que le doy acceso a los templates, y como lo hago?
			// esto es algo nuevo
			// uso res.locals = pongo una variable aqui y los pug templates tendran acceso 
			// a dicha variable
			// res.locals.user al hacer esto en los templates habra una variable llamada user
			// es como pasar datos a un template usando la render function
			res.locals.user = currentUser;

			return next();
		}
		catch(err) {
			return next();
		}
	}

	next();
};

/*
En viewRoutes.js

Aqui quero que isLoggedIn que se aplique a cada uno de los routes de viewRoutes.js

Agrego esta linea antes de cualquier router.route…
router.use(authController.isLoggedIn);

router.get(‘/’, viewsController.getOverview);
router.get(‘/tour/:slug’, viewController.getTour);
router.post(‘/login, authController.getLoginForm);


En _header.pug

Usare un conditional, recuerda que conditionals en pug no son muy poderosos y 
muchas veces mejor uso Javascript, pero para lo que quiero hacer ahorita es 
suficiente usar conditional


header.header
  nav.nav.nav--tours
    a.nav__el(href='/') All tours
  .header__logo
    img(src='/img/logo-white.png' alt='Natours logo')
  nav.nav.nav--user 
    if user
    	a.nav__el.nav__el--logout Log out 
    	a.nav__el(href='#')
    	img.nav__user-img(src=`/img/users/${user.photo}` alt=`Photo fo ${user.name}`)
    	span= user.name.split(‘ ‘)[0]
    else
    	a.nav__el(href='/login') Log in
    	a.nav__el.nav__el--cta Sign up


Ahora lo pruebo en Chrome

Borro la cookie
Me loggeo con 
	admin@natours.io
	tester12345

Me marca error por error en password

Me loggeo con 
	admin@natours.io
	tester1234

Sin embargo el User oho y name no fue mostrado de inmediato y esto es porque solo 
puede pasar despues de reload la pagina, porque es Express el que pinta las paginas

Voy a All Tours
Y me manda un error status 400 Can’t find / on the server

Me desloggeo borrando la cookie

Me loggeo como alguien mas, laura@example.com

Ahora quiero mostrar una alerta y reload la pagina despues de cierto tiempo, no 
recargando sino mandar la pagina de nuevo

Vuelvo a darle reload yo mismo a la pagina

En login.js

const login = async (email, password) => {

	try {
		// aqui hago el request
		// te dire como mandar datos directamente desde un HTML Form a nuestra Node App
		// Hay dos formas una es usando un HTTP Request como lo hago aqui y la otra es
		// Usar directamente la HTML Form, tambien es muy importante, lo dire mas tarde
		const  res = await axios({
			method: ‘POST’,
			url: ‘http://127.0.0.1:8000/api/v1/users/login’,
			data: {
				email : email,
				password : password
			}		
		});

		if (data.response.status === ‘success’) {
			alert (‘Logged in succesfully!’);
			// volver a cargar la home page despues de 1.5 segundos
			window.setTimeout ( () =>{
				// para cargar otra pagina pongo
				location.assign(‘/‘);
			}, 1500);
		}

		// console.log(res);
		}
		catch (err) {
			// console.log(err);
			// console.log(err.response.data);
			alert(err.response.data.message);
		}
}

Voy a Chrome

Me loggeo como 
	admin@natours.io 
	test12345

Me abre una ventana Incorrect email or password

Me loggeo como 
	admin@natours.io 
	test1234

Me abre una ventana: Logged in successfully!
No se recarga la pagina porque primero debo cerrar la ventana
Abre la pagina inicial con Log Out y eln ombre del User y su foto

En la proxima leccion quiero mejorar los alerts que le llegan al User, en vez de mostrar las ventanas de Javascript y ademas el Javascript bundling
*/



///////////////////////////////////////////////////////////////////
// Lecture-192 Logging Out users
///////////////////////////////////////////////////////////////////


/*

Voy a aprender una forma super segura de logging out

Hasta este punto cuando queria desloggear a un User solo borraba la cookie del browser, 
el problema es que cree esta cookie como una HttpOnlyCookie, eso significa que no 
puedo manipular/modificar la cookie en el browser, no puedo cambiarla ni borrarla, 
eso viene en

En authController.js

const createSendToken = (user, statusCode, res) => {
	const token = signToken (user._id);

	const cookieOptions = { 
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
		httpOnly: true
	}

Ahora si quiero seguir usando esta forma super segura de almacenar cookies, como voy a desloggear Users en el website? Porque con JWT Authentication solo borro la cookie del localstorage, pero eso no es posible con httpOnly: true, asi que lo que voy a hacer es crear un log out route muy simple que mandara de regreso al Client una nueva cookie con el mismo nombre osea ‘jwt’ pero sin el JSON Web Token, y eso reemplazara la cookie actual que esta en el browser con una que tiene el mismo nombre pero sin JSON Web Token. Y cuando el User haga un nuevo request se enviara esta nueva cookie y ya no sera posible identificarlo como logged in. Y tambien le dare a esta cookie un tiempo de expiracion muy corto de 10 segundos, y esto sera como borrar la cookie

En authController.js

Cuando hago Token based Authentication usualmente no necesito un end point como este, 
pero cuando quiero mandar una cookie super segura como lo estamos haciendo, entonces 
esta es la forma
*/

exports.logout = (req, res, next) => {
	
	// el secreto es darle a esta cookie el mismo nombre que cuando me loggeo, ‘jwt’
	// en el token mando un dummy text
	// que expire en 10 segundos
	// y tambien que sea httpOnly:true
	// pero en este caso no necesito hacerla tan seguro porque no mando datos sensibles
	console.log("logout");
	console.log("1");
	console.log(req.secure || req.headers ['x-forwarded-proto'] === 'https')

	if (req.secure || req.headers ['x-forwarded-proto'] === 'https')
		console.log("secure es true")
	else
		console.log("secure es false")

	if(process.env.NODE_ENV === 'production') { 
		res.cookie ('jwt', 'loggedout', 
			{ 
				// cambie de 10segundos a 1 segundo
				// expires: new Date( Date.now() + 1 * 1000),
				// ahora lo cambie a CERO segundos
				expires: new Date(0),
				httpOnly: true,
				sameSite: 'None',
				secure: req.secure || req.headers ['x-forwarded-proto'] === 'https'
			});

			console.log("loggingout prod");
	
	}
	if(process.env.NODE_ENV === 'development') { 
		res.cookie ('jwt', 'loggedout', 
			{ 
				// cambie de 10segundos a 1 segundo
				// expires: new Date( Date.now() + 1 * 1000),
				// ahora lo cambie a CERO segundos
				expires: new Date(0),
				httpOnly: true,
			});
			console.log("loggingout dev");
	}
	
	res.status(200).json({ status: 'success' });
}

/*
En userRoutes.js

// Aqui es un GET porque NO mando nada al server junto con el request, solo recibo 
// la cookie
router.get(‘logout’, authController.logout);


En login.js

export const logout = async () => {
	// no importa un try y catch pero aun asi lo pondre porque casi no es posible que haya un error aqui tal vez solo si no hay red 
	
	try {
		const res = await axios ({
			method: ‘GET’,
			url: 'http://127.0.0.1:8000/api/v1/users/logout’
		});

		// recargo la pagina en automatico y lo hago aqui porque como este es un AJAX request
		// no lo puedo hacer en el back-end, osea no lo puedo hacer en Express
		// Al recargar la pagina la cookie invalida que recien me llego sera enviada al server y es
 		// asi como ya no estare loggeado ni podere ver paginas privadas y el menu del Usuario 
		// dira Log In y Sign Up

		if (res.data.status === ’success’) {

			// Muy importante poner true porque eso fuerza una recarga de la pagina desde el
			// server y no del browser cache
			location.reload(true);
		}
	}
	catch (err) {
		showAlert (‘error’, ‘Error logging out!. Try again.’);
	}

}


En index.js
	import {login, logout} from ‘./login’;

	const logOutBtn = document.querySelector(‘nav__el--logout’);

	if (logOutBtn) {
		logOutBtn.addEventListener (‘click’, logout);
	}

	VOy a Chrome, recargo la pagina y le doy Log Out

	Me regresa
	GET http://127.0.0.1:8000/api/v1/users/logout 500 (Internal Server Error)

	Cast to ObjectId failed for value "logout" (type string) at path "_id" for model "User"

	El error fue porque no le puse el / en logout en userRoutes.js
		router.get('/logout', authController.logout);

	VOy a Chrome, recargo la pagina y le doy Log Out

	{"status":"errorcin","error":{"name":"JsonWebTokenError","message":"jwt malformed","statusCode":500,"status":"errorcin"}
		hubo mas texto dice que el error esta en isLoggedIn

	El JWT que mando dice 'loggedout' y es por eso que en isLoggedIn manda un error
	cuando hace el jwt.verify, y ese error es manjeado por catchAsync y el cual a su vez
	es manejado por el Flobal Handling Error Middleware, que en este caso no quiero
	ese error, porque en isLoggedIn NO quiero causar errores y la forma de hacer es
	quitar catchAsync de isLoggedIn , lo que quiero es pescar el error localmente
	en esa function y si hay un error solo darle next()
*/

// ESTE CODIGO ES MUY IMPORTANTE!
// Me ayuda a que si doy log out a un User y luego le doy para atras en el Browser
// No me cargue una pagina que estaba viendo cuando estaba Log in!!!!
// Era un bug muy severo
exports.controllCacheHeader = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); 
  res.setHeader('Pragma', 'no-cache'); 
  res.setHeader('Expires', '0');
  next();
};


///////////////////////////////////////////////////////////////////
// Lecture-207 Email Templates with Pug: Welcome Emails
///////////////////////////////////////////////////////////////////

/*


En este video voy a usar el poder de pug para crear un email template y luego enviar 
un welcome email basado en dicho template

Y ese template es emailTemplate.pug y esta en el folder dev-data/templates, lo copio y 
lo pego en welcome.pug en el folder views/emails

En welcome.pug
	Pego el contenido de emailTemplate.pug 


extends baseEmail

block content
  //- aqui uso firsName, url y esa es la razon por la que la pase en
  //- email.js en el metodo async send(template, subject) cuando uso el metodo
  //- pug.renderFile (....)
  p Hi #{firstName},
  p Welcome to Natours, we're glad to have you 🎉🙏
  p We're all a big familiy here, so make sure to upload your user photo so we get to know you a bit better!
  table.btn.btn-primary(role='presentation', border='0', cellpadding='0', cellspacing='0')
    tbody
      tr
        td(align='left')
          table(role='presentation', border='0', cellpadding='0', cellspacing='0')
            tbody
              tr
                td
                  a(href=`${url}`, target='_blank') Upload user photo
  p If you need any help with booking your next tour, please don't hesitate to contact me!
  p - Jonas Schmedtmann, CEO



Aqui veras muchas tables (td) y esto es porque muchos email Clients solo entienden 
tables para formatear pero lo importante es el area de
	// CONTENT
esta es la parte del template donde pondre el contenido, pero el punto es que 
tendremos muchos templates, en este caso habra dos, Welcome Email y 
Reset Password Email, asi que necesito una manera de reusar este codigo que esta 
fuera de // CONTENT, y eso fue lo que hice antes con el base.pug

Asi que en el folder /views/emails voy a crear un nuevo archivo llamado baseEmail.pug

En baseEmail.pug

	Copio el contenido de welcome.pug
	Le quito la parte de // CONTENT y lo pego en Welcome.pug


//- Email template adapted from https://github.com/leemunroe/responsive-html-email-template
//- Converted from HTML using https://html2pug.now.sh/

doctype html
html
  head
    meta(name='viewport', content='width=device-width')
    meta(http-equiv='Content-Type', content='text/html; charset=UTF-8')
    //- aqui tengo subject como el title y esa es la razon por la que la pase en
    //- email.js en el metodo async send(template, subject) cuando uso el metodo
    //- pug.renderFile (....)
    title= subject
      
    include _style
    
  body
    table.body(role='presentation', border='0', cellpadding='0', cellspacing='0')
      tbody
        tr
          td
          td.container
            .content
              // START CENTERED WHITE CONTAINER
              table.main(role='presentation')

                // START MAIN AREA
                tbody
                  tr
                    td.wrapper
                      table(role='presentation', border='0', cellpadding='0', cellspacing='0')
                        tbody
                          tr
                            td
                              // CONTENT
                              block content
 

              // START FOOTER
              .footer
                table(role='presentation', border='0', cellpadding='0', cellspacing='0')
                  tbody
                    tr
                      td.content-block
                        span.apple-link Natours Inc, 123 Nowhere Road, San Francisco CA 99999
                        br
                        |  Don't like these emails? 
                        a(href='#') Unsubscribe
          //- td


Cuando construya un HTML email necesito poner el CSS inline, pero voy a hacerlo mas 
limpio y voy a agarrar el CSS y lo exporto, creo un nuevo archivo en el 
folder views/emails llamado _style.pug

En _style.pug

	Aqui pego el codigo de CSS de emailTemplate.pug




En authController.js

Desde donde quiero mandar el email Welcome? En el authController.js en el 
exports.signup function


const Email = require (‘email’);

exports.signup = catchAsync( async (req, res, next) => {

	
	const newUser = await User.create ({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		role: req.body.role
	});

	// le pongo await para quedarme aqui hasta que regrese de haber mandado el email
	// y puedo hacer eso porque sendWelcome es un async / await function 
	// y que url voy a poner? Recuerda que en welcome.pug donde puse ${url} esta 
	// Upload user photo, asi que mandarle la liga al User Account page para que la suba
	// osea 127.0.0.1:8000/me
	// pero no lo voy a dejar hardcodeado, asi que puedo usar req. para hacerlo mejor
	const url = `${req.protocol}://${req.get(‘host’)}/me`;

	console.log(url);
	await new Email (newUser, url).sendWelcome;

	createSendToken (newUser, 201, res);
});




exports.forgotPassword =  catchAsync( async (req, res, next) => {

try {
// Por el momento comentarizo este codigo que lo voy a cambiar


  // await sendEmail ({  
  //   email: user.email,
  //   subject: 'Your password reset Token (valid for 10 min)',
  //   message
  // });



Ahora lo pruebo en POSTMAN creando un nuevo user en /signup

{
    "name": "test user”,
    "email": “test@natours.io”,
    "password": “test1234”,
    "confirmPassword": “test1234”
}

Y cuando cree este user debo recibir un email en mailtrap.io

{

En wwelcome.pug
 ERROR only named blocks and mixins can appear at the top level of an extends template
}

Si me marca error debo cambiar el email porque me dira que ya existe, duplicate, 

{
EXITO
}

Voy a Mailtrap.io a ver si me lego el correo

*/


//////////////////////////////////////////////////////////////////
// Lecture-224 Testing for Secure HTTPS Connections
//////////////////////////////////////////////////////////////////

/*


Probar conexiones seguras de HTTPS con Heroku, porque lo necesito en un punto de 
la App

En authController.js

Al inicio en createSendToken es donde pongo JSON Web Token cookie como segura, osea 

	const cookieOptions = { 
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
		httpOnly: true
	}
	
	if (process.env.NODE_ENV === 'production')
		cookieOptions.secure = true

	res.cookie('jwt', token, cookieOptions);

si es que estoy en producion

Y la cookie tiene unas opciones, la primera es cuando expira,la segunda que solo 
puede ser accesada por httpOnly, la tercera que la cookie solo puede ser mandada 
a una conexion segura, osea https

El problema es que, el hecho que estamos en Production NO significa que la conexion 
sea segura, porque NO todas las deployed Apps son automaticamente puestas como HTTPS,
 por lo que tengo que cambiar este if

En Express hay un secure property que esta en el request y solo cuando la conexion 
es segura entonces req.secure es true, EL PROBLEMA es que en Heroku esto NO FUNCIONA 
y esto es porque el proxy de Heroku redirige o modifica todos los requests entrantes 
a nuestra app antes  de que lleguen a la App, asi que para que tanbien funcione en 
Heroku  necesito tabien checar si el x-forwarded-proto-header esta configurado a 
HTTPS

	// AQUI me aseguro que la conexion sea segura
	if (req.secure || req.headers ['x-forwarded-proto'] === ‘https’)
		cookieOptions.secure = true

O mejor aun lo anterior a esto

	const cookieOptions = { 
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
		httpOnly: true,
		secure: req.secure || req.headers ['x-forwarded-proto'] === 'https'
	}

Incluso aun mas refactoring

	res.cookie('jwt', token, { 
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
		httpOnly: true,
		secure: req.secure || req.headers ['x-forwarded-proto'] === 'https'
	});

Pero ahora necesito agregar el req en esta funcion



const createSendToken = (user, statusCode, req, res) => {
	const token = signToken (user._id);

	res.cookie('jwt', token, res.cookie('jwt', token, { 
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
		httpOnly: true,
		secure: req.secure || req.headers ['x-forwarded-proto'] === 'https'
	});

	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user
		}
	});
}


exports.signup = catchAsync( async (req, res, next) => {

	
	const newUser = await User.create ({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		passwordChangedAt: req.body.passwordChangedAt,
		role: req.body.role
	});


	const url = `${req.protocol}://${req.get('host')}/me`;

	await new Email (newUser, url).sendWelcome();
	
	createSendToken (newUser, 201, req, res);
});


exports.login =  catchAsync (async (req, res, next) => {

	const { email, password } = req.body;


	// 1. Checar si email y password existen
	if (!email || !password) {
		// si no existen mandar un mensaje de error al Client, usando AppError para que el
		// Global Handling Middleware mande el error al Client
		return next (new AppError ('Please provide email and password', 400));
		
	}
		

	// 2. Checar si el User existe  && si el password son correctos segun lo que haya en 


	const userDocument = await User.findOne( { email } ).select('+password');

	if (!userDocument || !(await userDocument.correctPassword (password, userDocument.password))) {
		return next ( new AppError ('Incorrect email or password', 401));
	}

	// 3. Si todo esta bien enviar el JSON Web Token al Client
	// Crear el token va a ser igual que cuando le di SignUp, asi que creare una funcion para ambas
	createSendToken (userDocument, 200, req, res);
});




exports.updateMyPassword = catchAsync (async (req, res, next) => {
	// 1. Get User from the collection Users


	// const user = await User.findOne( { email: req.user.email } ).select('+password');
	const user = await User.findById( req.user.id ).select('+password');
	
	// Checo que se encontró el User en la collection && checo que
	// el password que mandó el User coincida con el password de la BD
	if (!user || !(await user.correctPassword (req.body.oldPassword, user.password))) {
		return next (new AppError('Your current password is wrong', 404));
	}

	
	// 2. Check if the POSTed password is correct
	user.password = req.body.newPassword;
	user.confirmPassword = req.body.confirmNewPassword;

	await user.save();

	// 4. Log in the User again, send JWT to the User
	// Vuelvo a loggear el User y mando el nuevo JWT y actualizo passwordChangedAt 

	// Si todo esta bien enviar el JSON Web Token al Client
	// Crear el token va a ser igual que cuando le di SignUp, asi que creare una funcion para ambas
	
	// luego mando este nuevo User al Client
	createSendToken (user, 200, req, res);

});



SIN EMBARGO AUN con estos cambios todavia NO FUNCIONARA, necesito otra cosa, que 
es que la APP confie en proxies, ya que req.secure NO funciona porque Heroku 
actua como un proxy que redirige y modifica requests entrantes asi que voy a app.js

En app.js

despues de
	const app = express();

	// Trust proxies, esto ya lo tiene Express para estas situaciones
	app.enable(‘trust proxy’);

Ahora si ya debe funcionar req.headers ['x-forwarded-proto'] === 'https' 

*/