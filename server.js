/////////////////////////////////////////////////////////////////////////////
// // Lecture-67 Environment Variables
/////////////////////////////////////////////////////////////////////////////


// // despues añadire aqui cosas no relacionados con express
// // como database configurations, error handling, environment variables
// // ESTE ES AHORA EL PUNTO DE INICIO DE LA APPLICACION
// // AHORA CORTO EL PROCESO QUE HA ESTADO CORRIENDO
// // porque ya no ejecuto nodemon app.js
// // ahora es server.js
// // asi que creare un npm script para esto en package.json:
// // "scripts": {
// //   "start": "nodemon server.js"
// // }
// // asi no tengo que saber cual es el archivo que tengo que ejecutar
// // asi en la terminal solo tengo que poner
// // npm start
// // y se ejecuta el script

// // como es nuestro propio modulo necesito poner la ubicacion
// const dotenv = require('dotenv');

// /////////////////////////////////////////////////////////////////////
// // Lecture-67 Environment Variables
// // como resultado pone: development
// // eso quiere decir que actualmente el ambiente es Desarrollo
// // app.get('env') nos devuelve el env enviroment variable

// // console.log(app.get('env'));
// // En resumen, environment variables son variables globales
// // que son usados para definir el ambiente en el que un node.app esta ejecutadose
// // esta en particular es configurada por Express, pero NodeJS configura muchos
// // ambientes
// // Veamos esas variables tambien 
// // console.log(process.env);
// // En Express muchos packages dependen de una variable espcial llamada NODE_ENV
// // Es una variable que es una estandar que define si estamos en Desarrollo o Produccion
// // Pero Express NO define esta variable, tenemos que hacerlo manualmente
// // Hay muchas formas de hacerlo, veamos la mas facil, usando la Terminal
// // cortamos el proceso de npm start, en caso que se este ejecutando
// // Cuando empezamos el proceso lo hice con: npm start y esto lo que hace
// // segun package.json es ejecutar el script: nodemon server.js

// //      nodemon server.js
// // Pero si quiero configurar una variable de Ambiente para este proceso necesito
// // preparar esa variable en este comando: nodemon server.js, asi:

// //      NODE_ENV=development nodemon server.js
// //  esto nos manda muchos mensajes a la console, entre ellos este

// //      NODE_ENV: 'development',
// // estos mensajes son el resultado de: 
// //      console.log(process.env);

// // puedo definir mas Variables de ambiente si quiero, en la Terminal
// //      NODE_ENV=development X=23 nodemon server.js

// // me arroja
// //      NODE_ENV: 'development',
// //      X: '23', 
// // Muchos packages que se usan en npm que usamos para Express
// // development dependen de esta variable de Ambiente
// // Asi que cuando nuestro proyecto este listo y lo implementemos
// // debemos cambiar la variable NODE_ENV a production

// // Pero podemos hacer mucho mas que configurar las variables NODE_ENV y X
// // por ejemplo, es comun usar Variables de Ambiente (Environment Variables)
// // para configurar la aplicacion (configuration settings)
// // Siempre que la app necesite configuracion  para cosas que tengan
// // que ver con el Ambiente (environment) en el que la App se esta ejecutando
// // es que usamos environment Variables
// // POr ejemplo podemos usar diferentes BDs para Desarrollo, Testing y Produccion
// // Tambien podemos configurar datos delicados como passwords y user names usando
// // variables de ambiente
// // Ahora bien NO siempr es practico definir siempre estas variables en el comando 
// // donde empezamos la aplicacion osea el nodemon..., asi que para eso uso
// // un configuration file, que llamare
// //      config.env
// // el nombre es un estandar y VSCode lo reconoce
// // NOTA: Puedo usar una extension llamada DotENV para que se vea bonito ese archivo
// // Ahora como conecto este ENV file con nuestra aplicacion de NODE
// // necesito una forma de leer las variables de config.env y luego grabarlas
// // como Environment Variables
// // Para esto usamos un npm package llamado dotenv, ve a la Terminal
// // 
// //      npm i dotenv

// // Ya que se instalo vamos a server.js y
// //      const dotenv = require('dotenv');

// // ahora si puedo usar el metodo config y paso un objeto con el path
// // donde se encientra el archivo de configuracion osea config.env

// //      dotenv.config({ path: './config.env'});
// // lo que hace esto es leer el archivo y grabar las Varaible que ahi estan
// // en variables de ambiente de NodeJS
// dotenv.config({ path: './config.env'});
// // Primero tengo que ejecutar la linea anterior ANTES de 
// //  const app = require('app')

// // ahora desde la terminal ejecutemos
// //        npm start
// // hara que se manden a la console las variables de ambiente debido a 
// //        console.log(process.env);

// // LISTO SALIERON LAS VARIABLES EN LA CONSOLE!
// // Para terminar usemos la variable NODE_ENV y tambien la variable PORT 
// // Para eso voy a app.js y donde mencione el PORT ahi uso la variable
// // y tambien ahi tengo el logger MIddleware y lo que quiero tambien es
// // ejecutar ese Middleware solo si el ambiente es Desarrollo
// // asi vamos a app.js

// // console.log(process.env);

// // Muy bien hagamos una prueba de HTTP Request para ver si el logger aun funciona

// // para terminar agreguemos un nuevo start script en package.json para Produccion
// //        "start:prod": "NODE_ENV=production nodemon server.js"

// //  y lo ejecuto asi desde la Terminal
// //        npm run start:prod

// // y puedo ver que se ejecuta esto en la console
// //      NODE_ENV=production nodemon server.js

// // y si ahora ejecuto un HTTP Reques como get All Tours ya NO se vera el Logger

// // y si quiero trabajar en anmbiente de desarrollo, desde la Terminal
// //        npm run start:dev

// // este es app.js
// const app = require('./app');



// // 4. ENCIENDO EL SERVER
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Running on port ${port}...`);
// });






///////////////////////////////////////////////////////////////////////
// // Lecture-83 Connecting Our Database to the Express App
///////////////////////////////////////////////////////////////////////


// // despues añadire aqui cosas no relacionados con express
// // como database configurations, error handling, environment variables
// // ESTE ES AHORA EL PUNTO DE INICIO DE LA APPLICACION
// // AHORA CORTO EL PROCESO QUE HA ESTADO CORRIENDO
// // porque ya no ejecuto nodemon app.js
// // ahora es server.js
// // asi que creare un npm script para esto en package.json:
// // "scripts": {
// //   "start": "nodemon server.js"
// // }
// // asi no tengo que saber cual es el archivo que tengo que ejecutar
// // asi en la terminal solo tengo que poner
// // npm start
// // y se ejecuta el script

// const mongoose = require('mongoose');

// // como es nuestro propio modulo necesito poner la ubicacion
// const dotenv = require('dotenv');

// /////////////////////////////////////////////////////////////////////
// // Lecture-67 Environment Variables
// // como resultado pone: development
// // eso quiere decir que actualmente el ambiente es Desarrollo
// // app.get('env') nos devuelve el env enviroment variable

// // console.log(app.get('env'));
// // En resumen, environment variables son variables globales
// // que son usados para definir el ambiente en el que un node.app esta ejecutadose
// // esta en particular es configurada por Express, pero NodeJS configura muchos
// // ambientes
// // Veamos esas variables tambien 
// // console.log(process.env);
// // En Express muchos packages dependen de una variable espcial llamada NODE_ENV
// // Es una variable que es una estandar que define si estamos en Desarrollo o Produccion
// // Pero Express NO define esta variable, tenemos que hacerlo manualmente
// // Hay muchas formas de hacerlo, veamos la mas facil, usando la Terminal
// // cortamos el proceso de npm start, en caso que se este ejecutando
// // Cuando empezamos el proceso lo hice con: npm start y esto lo que hace
// // segun package.json es ejecutar el script: nodemon server.js

// //      nodemon server.js
// // Pero si quiero configurar una variable de Ambiente para este proceso necesito
// // preparar esa variable en este comando: nodemon server.js, asi:

// //      NODE_ENV=development nodemon server.js
// //  esto nos manda muchos mensajes a la console, entre ellos este

// //      NODE_ENV: 'development',
// // estos mensajes son el resultado de: 
// //      console.log(process.env);

// // puedo definir mas Variables de ambiente si quiero, en la Terminal
// //      NODE_ENV=development X=23 nodemon server.js

// // me arroja
// //      NODE_ENV: 'development',
// //      X: '23', 
// // Muchos packages que se usan en npm que usamos para Express
// // development dependen de esta variable de Ambiente
// // Asi que cuando nuestro proyecto este listo y lo implementemos
// // debemos cambiar la variable NODE_ENV a production

// // Pero podemos hacer mucho mas que configurar las variables NODE_ENV y X
// // por ejemplo, es comun usar Variables de Ambiente (Environment Variables)
// // para configurar la aplicacion (configuration settings)
// // Siempre que la app necesite configuracion  para cosas que tengan
// // que ver con el Ambiente (environment) en el que la App se esta ejecutando
// // es que usamos environment Variables
// // POr ejemplo podemos usar diferentes BDs para Desarrollo, Testing y Produccion
// // Tambien podemos configurar datos delicados como passwords y user names usando
// // variables de ambiente
// // Ahora bien NO siempr es practico definir siempre estas variables en el comando 
// // donde empezamos la aplicacion osea el nodemon..., asi que para eso uso
// // un configuration file, que llamare
// //      config.env
// // el nombre es un estandar y VSCode lo reconoce
// // NOTA: Puedo usar una extension llamada DotENV para que se vea bonito ese archivo
// // Ahora como conecto este ENV file con nuestra aplicacion de NODE
// // necesito una forma de leer las variables de config.env y luego grabarlas
// // como Environment Variables
// // Para esto usamos un npm package llamado dotenv, ve a la Terminal
// // 
// //      npm i dotenv

// // Ya que se instalo vamos a server.js y
// //      const dotenv = require('dotenv');

// // ahora si puedo usar el metodo config y paso un objeto con el path
// // donde se encientra el archivo de configuracion osea config.env

// //      dotenv.config({ path: './config.env'});
// // lo que hace esto es leer el archivo y grabar las Varaible que ahi estan
// // en variables de ambiente de NodeJS
// dotenv.config({ path: './config.env'});
// // Primero tengo que ejecutar la linea anterior ANTES de 
// //  const app = require('app')

// // ahora desde la terminal ejecutemos
// //        npm start
// // hara que se manden a la console las variables de ambiente debido a 
// //        console.log(process.env);

// // LISTO SALIERON LAS VARIABLES EN LA CONSOLE!
// // Para terminar usemos la variable NODE_ENV y tambien la variable PORT 
// // Para eso voy a app.js y donde mencione el PORT ahi uso la variable
// // y tambien ahi tengo el logger MIddleware y lo que quiero tambien es
// // ejecutar ese Middleware solo si el ambiente es Desarrollo
// // asi vamos a app.js

// // console.log(process.env);

// // Muy bien hagamos una prueba de HTTP Request para ver si el logger aun funciona

// // para terminar agreguemos un nuevo start script en package.json para Produccion
// //        "start:prod": "NODE_ENV=production nodemon server.js"

// //  y lo ejecuto asi desde la Terminal
// //        npm run start:prod

// // y puedo ver que se ejecuta esto en la console
// //      NODE_ENV=production nodemon server.js

// // y si ahora ejecuto un HTTP Reques como get All Tours ya NO se vera el Logger

// // y si quiero trabajar en anmbiente de desarrollo, desde la Terminal
// //        npm run start:dev




///////////////////////////////////////////////////////////////////////
// // Lecture-83 Connecting Our Database to the Express App
///////////////////////////////////////////////////////////////////////


// // aqui paso el Connection String, pero primero poner EL PASSWORD
// // Conexion REMOTA a BD en ATLAS en la Cloud
// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// // Conexion Local a BD en mi laptop 
// // const DB = process.env.DATABASE_LOCAL;

// // DB ES EL Connection String, el segund parametro es un Object con opciones
// // para manejar unos deprecation warnings
// // este connect method va a regresar un Promise, asi que vamos a manejar dicha Promise
// // esta Promise tiene acceso a un Connection Object
// // connection es el resolved value de la Promise
// mongoose.connect(DB, { 
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
//   useUnifiedTopology: true
// }).then( () => {
//   // connection es un parametro que agregue aqui como connection => {}
//   // pero lo quite
//   // console.log(connection.connections);
//   console.log('DB Connection succesful');
// })


// // este es app.js
// const app = require('./app');



// // 4. ENCIENDO EL SERVER
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Running on port ${port}...`);
// });






// ///////////////////////////////////////////////////////////////////
// // Creating a Simple Tour Model
// ///////////////////////////////////////////////////////////////////


// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config({ path: './config.env'});

// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// mongoose.connect(DB, { 
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
//   useUnifiedTopology: true
// }).then( () => {
//   // connection es un parametro que agregue aqui como connection => {}
//   // pero lo quite
//   // console.log(connection.connections);
//   console.log('DB Connection succesful');
// })


// ///////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////
// // Creating a Simple Tour Model
// // Mongoose usa los tipos de datos Nativos de Javascript
// // const tourSchema = new mongoose.Schema( 
// //   { name: String, 
// //     price: Number, 
// //     rating: Number 
// // });

// // Esta es la forma mas basica de definir un Schema pero podemos 
// // llevarlo mas alla usando Schema Type Options para cada campo o solo para algunos
// // En required puedo especificar un error que se mostrara cuando no se capture ese campo, 
// // se usa un Array
// // 	required: [true, 'A tour must have a name' ]

// // Y puede ser diferente el Schema Type Options segun el tipo de dato osea es diferente 
// // para String que para Number

// // Tambien puedo poner valores default


// const tourSchema = new mongoose.Schema( 
//   { name: { 
//         type: String,
//         required: [true, 'A tour must have a name'],
//         unique: true
//       },  
//       rating: {
//         type: Number,
//         default: 4.5
//       },
//       price: { 
//         type: Number,
//         required: [true, 'A tour must have a price']
//       }
// });

// // Ahora voy a crear un Model
// // el primer parameteo es el nombre del Modelo con Mayuscula Tour tanto en el Modelo
// // como la Variable, y luego segundo parametro el Schema
// const Tour = mongoose.model('Tour', tourSchema)


// // este es app.js
// const app = require('./app');

// // 4. ENCIENDO EL SERVER
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Running on port ${port}...`);
// });





// ///////////////////////////////////////////////////////////////////
// // Creating Documents and testing the Model
// ///////////////////////////////////////////////////////////////////


// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config({ path: './config.env'});

// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// mongoose.connect(DB, { 
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
//   useUnifiedTopology: true
// }).then( () => {
//   // connection es un parametro que agregue aqui como connection => {}
//   // pero lo quite
//   // console.log(connection.connections);
//   console.log('DB Connection succesful');
// })


// const tourSchema = new mongoose.Schema( 
//   { name: { 
//         type: String,
//         required: [true, 'A tour must have a name'],
//         unique: true
//       },  
//       rating: {
//         type: Number,
//         default: 4.5
//       },
//       price: { 
//         type: Number,
//         required: [true, 'A tour must have a price']
//       }
// });

// // model('Tour'...
// // como NO existe una Colleccion al inicio, entonces mongoose la crea
// // y usar ese primer parametro 'Tour', para nombrar la Collecction
// // pero lo hace minusculas y lo hace plural
// const Tour = mongoose.model('Tour', tourSchema)

// // Este es un Nuevo documento del tour Model (molde)
// // testTour es una instancia del Tour Model
// // Tiene unos metodos para interactuar con la BD
// const testTour = new Tour ( {
//   name: 'The Park Camper',
//   price: 997
// });

// // esto graba el Modelo en el tours Collection en la BD
// // este save regresa una Promise que puedo consumir
// // por ahora uso .then para consumirla pero en el futuro usare
// // Async/Await para consumir la Promise
// // la Promise que regresa nos da acceso al documento que acaba de
// // ser grabado en la BD, osea el resolved value de la Promise es el
// // Documento Final en la BD
// // Asu vez puede haber un error al intentar grabar la informacion en la BD
// // asi que uso un catch
// testTour.save().then( document => {
//   console.log(document)
// }).catch(err => {
//   console.log('ERROR at saving to the DB 😰: ', err);
// });


// // este es app.js
// const app = require('./app');

// // 4. ENCIENDO EL SERVER
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Running on port ${port}...`);
// });






const mongoose = require('mongoose');
const dotenv = require('dotenv');

///////////////////////////////////////////////////////////////////
// Catching Uncaught Exceptions
///////////////////////////////////////////////////////////////////

/*

Que son Uncaught Exceptions? Todos los errores o bugs que ocurren en codigo 
SINCRONO pero que no son manejados en ningun lado se le llaman Uncaught Exceptions, 
un ejemplo de esto es darle console.log a algo que no existe

	console.log(x);

console.log(x);
              ^

ReferenceError: x is not defined
    at Object.<anonymous> (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/server.js:676:15)
    at Module._compile (node:internal/modules/cjs/loader:1105:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
    at node:internal/main/run_main_module:17:47

Para corregirlo es muy parecido a manejar Unhandled Rejections, de nuevo escucho a 
un evento esta vez llamado uncaughtException

	process.on(‘uncaughtException’, err => {
 		console.log('UNCAUGHT EXCEPTION! 💀 Shutting down…');
		console.log(err.name, err.message);
		// console.log(err);
		server.close( () =>{ 
			// hasta que cierro el server (que termine todos los requests que estan 
      // pendientes o que se esten ejecutando al momento) es cuando termino la App
			process.exit(1);
		});
	});

En NodeJS no es una buena practica confiar nadamas en estos dos error handlers 
unhandledRejection y uncaughtException, los errores deben manejarse en el ugar donde 
ocurren, por ejemplo en el problema de conectar a la BD es mejor agregar un 
catch handler ahi y no confiar nadamas en unhandledRejection

Ahora este ultimo codigo
		process.on(‘uncaughtException’, err => {

deberia estar al inicio de todo el codigo, porque si muevo el console.log(x); 
antes de esa linea entonces el uncaughtException ya NO funciona

El problema es que si lo pongo muy arriba el server aun NO esta iniciado, pero 
dice Jonas que eso no es problema porque no necesito el server ahi, porque estos 
errores no van a pasar ASINCRONAMENTE

*/

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💀 Shutting down…');
  console.log(err.name, err.message);
  console.log(err);
  // console.log(err);

  // hasta que cierro el server (que termine todos los requests que estan 
  // pendientes o que se esten ejecutando al momento) es cuando termino la App
  process.exit(1);
});


///////////////////////////////////////////////////////////////////
// Refactoring MVC
///////////////////////////////////////////////////////////////////

//esta linea que esta abajo debe estar ANTES de
// const app = require('./app');
// de lo contrario NO se loggea esta informacion
// GET /api/v1/tours?difficulty=easy&duration=5 200 2500.972 ms - 9390
dotenv.config({ path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// AQUI en cuanto a mongoose solo dejo la conexion a la BD y todo lo que sea sobre Models
// lo hare en sus respectivas carpeta de Models y sus archivos como tourModel.js

mongoose.connect(DB, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then( () => {
  // connection es un parametro que agregue aqui como connection => {}
  // pero lo quite
  // console.log(connection.connections);
  console.log('DB Connection succesful');
});


// este es app.js
const app = require('./app');

// 4. ENCIENDO EL SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Running on port ${port}...`);
});





///////////////////////////////////////////////////////////////////
//Errors Outside Express: Unhandled Rejections
///////////////////////////////////////////////////////////////////

/*

Hablemos de algo que hay en NodeJs llamado Unhandled Rejections y luego veremos 
como manejarlos

Hasta ahora hemos manejado errores en nuestra Express App pasando operational 
asynchronous errors a un Global Error Handling Middleware y este a su vez manda 
mensajes de errores relevantes al Client dependiendo del tipo de error que ocurrio. 
Sin embargo pueden ocurrir errores fuera de Express y un buen ejemplo de eso en 
nuestra App es la conexion de MongoDB a la BD, imagina que la BD esta apagada por 
una razon  o que por alguna razon no me pueda loggear y en ese caso hay errores 
que manejar, pero NO ocurrieron dentro de nuestra Express App y por lo tanto el 
Error handler que implemente no funcionara

Para hacer una prueba de esto vamos a config.env y camibiare el Password para 
logearme a la BD por una invalida y eso me debe mandar algun error

Asi que voy a server.js 

/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/cmap/connection.js:299
          callback(new MongoError(document));
                   ^

MongoError: bad auth : Authentication failed.
    at MessageStream.messageHandler (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/cmap/connection.js:299:20)
    at MessageStream.emit (node:events:527:28)
    at processIncomingData (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/cmap/message_stream.js:144:12)
    at MessageStream._write (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongodb/lib/cmap/message_stream.js:42:5)
    at writeOrBuffer (node:internal/streams/writable:389:12)
    at _write (node:internal/streams/writable:330:10)
    at MessageStream.Writable.write (node:internal/streams/writable:334:10)
    at TLSSocket.ondata (node:internal/streams/readable:754:22)
    at TLSSocket.emit (node:events:527:28)
    at addChunk (node:internal/streams/readable:315:12)
    at readableAddChunk (node:internal/streams/readable:289:9)
    at TLSSocket.Readable.push (node:internal/streams/readable:228:10)
    at TLSWrap.onStreamRead (node:internal/stream_base_commons:190:23) {
  ok: 0,
  code: 8000,
  codeName: 'AtlasError'
}

Al cambiar el password a la BD me genera este error: 
MongoError: bad auth : Authentication failed.

Sin embargo a Jonas le salio otro error: Unhandled Promise Rejection y este es 
el tema de este video y tambien a Jonas le aparece un DeprecationWarning que 
significa que en el futuro promise rejections que no sean manejadas terminaran 
el proceso de NodeJS con un exit code de non-zero que no necesariamente sea lo 
que quieres

Unhandled Promise Rejection significa que en algun lugar del codigo hubo una 
Promise que fue rejected pero que no fue manejada en ningun lado

La forma mas sencilla de manejar el Unhandled Promise Rejection es agregar un 
.catch aqui en server.js

mongoose.connect(DB, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then( () => {
  // connection es un parametro que agregue aqui como connection => {}
  // pero lo quite
  // console.log(connection.connections);
  console.log('DB Connection succesful');

}).catch(  err => console.log(‘ERROR DB Connection’));

SI FUNCIONA, PERO loque quiero es hacer un Global Error Handling for 
Unhandled Rejected Promises, porque en una App mas grande puede ser mas dificil 
tener el registro de todas las Promises que pudieran ser rejected

Recuerda como en las primeras Secciones del curso hablé de events y events listeners, 
ahora es el momento de usar ese conocimiento

Cada vez que hay unhandled rejection, en algun lugar de la App, el process Object 
emite un Objeto llamado Unhandled Rejection y nos podemos suscribir a ese event asi:


 	// el primer argumento es el nombre del event, el 2do es una callback function
  process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💀 Shutting down…');
  process.exit(1);
});


y manda esto de regreso a la console
  MongoError bad auth : Authentication failed.
  UNHANDLED REJECTION! 💀 Shutting down…
  [nodemon] app crashed - waiting for file changes before starting..

Con esto ya estoy manejando los errores de unhandled Promise Rejections pero tambien 
manejo cualquier otra Promise Rejection que podria no atrapar en algun lugar de la 
App que pesco aqui

Ahora si tengo un error del tipo de NO poder conectarse a la BD, entonces debo cerrar 
la App y para hacerlo uso process.exit y de hecho ya lo use en el script donde 
importe los datos del archivo JSON y lo exporte a MongoDB

Y dentro de process.exit() le puedo pasar un codigo como argumento, el 0 significa 
exito, 1 significa uncaught excepction

const server = app.listen(port, () => {
  console.log(`Running on port ${port}...`);
});


Por supuesto NO es ideal que la App crashed porque ahora la App no se esta ejecutando,
usualmente en una App de Production en un web server tendriamos una herramienta que 
vuelva a iniciar la App despues de un crash , o alguna de las plataformas que host 
NodeJS lo haran automaticamente , porque NO queremos que la App quede asi por siempre

TODO ESTE ES PARA PROCESOS ASINCRONOS

PERO Y QUE PASA CON LOS PROCESOS SINCRONOS?????
*/


	// el primer argumento es el nombre del event, el 2do es una callback function
	process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💀 Shutting down…');
		console.log(err.name, err.message);
    console.log(err);
		// console.log(err);
		server.close( () =>{ 
			// hasta que cierro el server (que termine todos los requests que estan 
      // pendientes o que se esten ejecutando al momento) es cuando termino la App
			process.exit(1);
		});
	});

  
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💀 Shutting down…');
  console.log(err.name, err.message);
  //  console.log(err);
  server.close( () =>{ 
    // hasta que cierro el server (que termine todos los requests que estan 
    // pendientes o que se esten ejecutando al momento) es cuando termino la App
    process.exit(1);
  });
});


//////////////////////////////////////////////////////////////////
// Lecture-225 Responding to a SIGTERM Signal
//////////////////////////////////////////////////////////////////

/*

Una ultima configuracion de Heroku que es responder a una disque “sick term signal” 
que Heroku emite de vez en cuando

Un heroku dyno, y dyno es un nombre que Heroku usa para un contenedor en la que 
nuestra App se ejecuta, estos dynos se reinician cada 24 horas para que nuestra app 
se encuentre sana y la forma en que Heroku hace esto es mandando una “sick term signal” 
a nuesta Node app y la App se cerrara autmaticamente 

El problema es que se cierra abruptamente, esto deja requests que estan procesandose 
en el aire
Eso pasa tambien en un unhandled rejection

En server.js

Aqui tumbo la App cada vez que haya un Unhandled Rejection , asi que hare algo similar 
cuando reciba la “sick term signal”
*/

process.on('SIGTERM', () => {

	console.log ('👋 SIGTERM RECEIVED. Shutting down gracefully');
	// Cierro el server graciosamente pero tambien maneja os requests pendientes que es lo que
	// quiero en vez de una cierre abrupto
	server.close( () => {
		console.log('💀 Process Terminated! ');

		// en este caso no uso proces.exit porque el SIGTERM se encarga de cerrar la App
	});
});

/*
Voy a probarlo pero primero le doy commit a todas las modificaciones 

	git add -A
	git commit -m “Added Heroku config”

Redeploy la App
	git push heroku master

Para probar manualmente restart la App, eso tambien mandara el SIGTERM a la App y 
debe ejecutar lo que pase ahi

Vamos a checar nuestros dynos

	heroku ps

y me regresa
	=== web (Free): npm start (1)
este Free web dyno que se ejecuta con npm start

Y lo que haga para darle restart es 
	heroku ps:restart

y me regresa
	Restarting dynos on ⬢ natours-acero... done

Ahora checo los logs

	heroku logs --tail

y me regresa

2022-07-28T00:45:33.143298+00:00 heroku[web.1]: Stopping all processes with SIGTERM
2022-07-28T00:45:33.177694+00:00 app[web.1]: ✌🏻 SIGTERM RECEIVED. Shutting down gracefully
2022-07-28T00:45:33.178427+00:00 app[web.1]: 💀 Process Terminated!
2022-07-28T00:45:33.304719+00:00 heroku[web.1]: Process exited with status 143	
Luego se reinicia

2022-07-28T00:45:37.488496+00:00 heroku[web.1]: Starting process with command `npm start`
2022-07-28T00:45:39.615862+00:00 app[web.1]: 
2022-07-28T00:45:39.615880+00:00 app[web.1]: > natours@1.0.0 start
2022-07-28T00:45:39.615881+00:00 app[web.1]: > node server.js
2022-07-28T00:45:39.615881+00:00 app[web.1]: 
2022-07-28T00:45:40.669412+00:00 app[web.1]: Running on port 25026...
2022-07-28T00:45:40.798179+00:00 heroku[web.1]: State changed from starting to up
2022-07-28T00:45:40.816160+00:00 app[web.1]: DB Connection succesful

Con esto termino toda la COnfiguracion de Heroku para mi App

Ahora solo falta implementar CORS Cross Origin Resource Sharing y terminar el Stripe PAyments usando Webhooks
*/