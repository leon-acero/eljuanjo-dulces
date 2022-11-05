//////////////////////////////////////////////////////////////////
// Lecture-58 Middleware and the Request-Response Cycle
//////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////
// Lecture-59 Creating Our Own Middleware (COOM)
//////////////////////////////////////////////////////////////////


const express = require('express');
const path = require ('path'); 
const morgan = require('morgan');
const rateLimit = require ('express-rate-limit');
const helmet = require ('helmet');
const mongoSanitize= require ('express-mongo-sanitize');
const xss = require ('xss-clean');
const hpp = require('hpp');
const cookieParser = require ('cookie-parser');
const compression = require ('compression');
const cors = require ('cors');


const AppError = require ('./Utils/appError');
const globalErrorHandler = require('./controllers/errorController');


// const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
// const viewRouter = require ('./routes/viewRoutes');
// const bookingRouter = require('./routes/bookingRoutes');
// const bookingController = require ('./controllers/bookingController');

const productRouter = require('./routes/productRoutes');
const clientRouter = require('./routes/clientRoutes');
const saleRouter = require('./routes/saleRoutes');


///////////////////////////////////////////////////////////////////
// Lecture-155 Creating And Getting Reviews
///////////////////////////////////////////////////////////////////
// const reviewRouter = require('./routes/reviewRoutes');

// Start Express App
const app = express();


//////////////////////////////////////////////////////////////////
// Lecture-224 Testing for Secure HTTPS Connections
//////////////////////////////////////////////////////////////////

// Trust proxies, esto ya lo tiene Express para estas situaciones
app.enable('trust proxy');

//////////////////////////////////////////////////////////////////
// Lecture-176 Setting Up Pug in Express
//////////////////////////////////////////////////////////////////

// app.set('view engine', 'pug');

// el path que pongo aqui es relativo al directory donde ejecutamos el Node App y 
// usualmente es el root project folder pero puede que no sea asi asi que es mejor 
// usar __dirname variable junto con un truco que puedo usar con Node que es usar el 
// path module, path es un built-in Node Module, osea un core Module que se usa para 
// manipular Path Names, asi que le hago un require

// app.set('views', path.join(__dirname, 'views'));


// // 1. PRIMERO PONGO LOS MIDDLEWARES

// ///////////////////////////////////////////////////////////////////////////
// // RECUERDA QUE LOS MIDDLEWARE SE VAN EJECUTANDO EN EL ORDEN EN EL QUE
// // ESTAN CODIFICADOS
// // (COOM)
// ///////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
// Lecture-66 Serving Static Files
/////////////////////////////////////////////////////////////////////

// uso un simple built-in Midleware
// paso como parametro el directorio de donde quiero servir static files
// en este caso es el public directory, donde esta overview.html
// Y LISTO YA PUEDO ACCEDER A ESE DIRECTORY
// AHORA uso 
// 127.0.0.1:3000/overview.html
// sin /public

// MIDDLEWARE: SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`))
//////////////////////////////////////////////////////////////////
// Lecture-176 Setting Up Pug in Express
//////////////////////////////////////////////////////////////////
app.use(express.static(path.join(__dirname, 'public' )));


// // y le paso como parametro que especifica como se vera el logging
// // llamar la funcion morgan, regresara una funcion similar a
// // (req, res, next) => {
// //   console.log('Hello from the Middleware 😻');
// //   next();
// // }
// app.use(morgan('dev'));
// // el resultado que morgan me manda en la console es
// // GET /api/v1/tours 200 14.371 ms - 8871
// // cual fue la api que se ejecuto, el metodo, el estatus, cuanto tiempo se tardo
// // en mandar la response, y el tamaño del response en bytes
// // esta informacion la manda si el parametro es 'dev'
// // pero si pongo 'tiny' manda
// // GET /api/v1/tours 200 8871 - 5.673 ms

// // THIS IS A SIMPLE MIDDLEWARE = express.json()
// // esta es la linea necesaria para usar MIDDLEWARE
// // express.json() regresa una funcion, y esa funcion
// // se agrega al MIDDLEWARE stack
// app.use(express.json());

// // y es asi tambien como podemos crear nuestra propia funcion MIDDLEWARE
// // sigo usando app.use, pero le paso la funcion que quiero agregar
// // al MIDDLEWARE Stack
// // recuerda que en cada funcion MIDDLEWARE tengo acceso al request y al response
// // pero tambien tengo disponible la next function
// // y es asi como Express sabe que estamos definiendo un MIDDLEWARE
// // next puede llevar cualquier nombre, lo que importa es que es el tercer argumento
// app.use((req, res, next) => {
//   console.log('Hello from the Middleware 😻');
//   // ahora tengo que llamar a la next function de lo contrario
//   // el ciclo request/response quedaria estancado en este punto
//   // y nunca podriamos mandar una response al cliente, asi que
//   // nunca olvides usar next en TODOS los MIDDLEWARE
//   next();
//   // ahora para probar solo falta mandar un request usando un API
//   // y para esto cualquier API es bueno, PORQUE NO ESPECIFIQUE
//   // NINGUN ROUTE
//   // Estos Midlleware functions son mas simples que los Middleware
//   // que estan mas abajo que si tienen Route, por lo que estos
//   // Middleware de aqui aplican para TODOS los Request
//   // por lo menos si el Route Handler viene antes que este Middleware
// });

// // (COOM)
// app.use((req, res, next) => {
//   // Ahora quiero manipular el request
//   // agregar la hora actual al request
//   // simpleente defino una propiedad en el request object called request time
//   req.requestTime = new Date().toISOString();
//   next();
// });

// const toursInfo = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))


// // 2. LUEGO PONGO LOS ROUTE HANDLERS
// const getAllTours = (req, res) => {
//   // (COOM)
//   console.log(req.requestTime);

//   res.status(200).json({
//       status: 'success',
//       requestedAt: req.requestTime,
//       results: toursInfo.length,
//       data: {
//         toursInfo
//       }
//   });
// }

// const createTour = (req, res) => {
//   const newId = toursInfo[toursInfo.length - 1].id + 1;
//   const newTour = Object.assign ({ id: newId}, req.body);
//   // ahora agrego este nuevo Tour al Array de Tours
//   toursInfo.push(newTour);

//   fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(toursInfo), err => {
//       res.status(201).json( { 
//         status: 'success',
//         data: { 
//           tour: newTour 
//         }    
//       });
//   });
// }

// const getTour = (req, res) => {
//   console.log(req.params);

//   const id = req.params.id * 1;
//   const tour = toursInfo.find( current => current.id === id);

//   if(!tour)
//     return res.status(404).json( {
//         status: 'fail',
//         message: 'Invalid ID'
//     });
  
//   res.status(200).json({
//       status: 'success',
//       data: {
//         tour
//       }
//   });
// }

// const updateTour = (req, res) => {
//   if((req.params.id * 1) > toursInfo.length)
//     return res.status(404).json( {
//         status: 'fail',
//         message: 'Invalid ID'
//   });

//   res.status(200)
//     .json( {
//       status: 'success',
//       data: {
//         tour: '<Updated tour here...>'
//       }
//     })
// }

// const deleteTour = (req, res) => {
//   if((req.params.id * 1) > toursInfo.length)
//     return res.status(404).json( {
//         status: 'fail',
//         message: 'Invalid ID'
//   });

//   res.status(204)
//     .json( {
//       status: 'success',
//       data: null
//     })
// }

// const getAllUsers = (req, res) => { 
//   // 500 Internal Server Error, aun no lo implemento
//   res.status(500).json( {
//       status: 'error',
//       message: 'This route is not yet defined.'
//   });
// }

// const getUser = (req, res) => {
//     res.status(500).json( {
//       status: 'error',
//       message: 'This route is not yet defined.'
//   });
// }

// const createUser = (req, res) => {
//   res.status(500).json( {
//     status: 'error',
//     message: 'This route is not yet defined.'
//   });
// }

// const updateUser = (req, res) => {
//   res.status(500).json( {
//     status: 'error',
//     message: 'This route is not yet defined.'
//   });
// }

// const deleteUser = (req, res) => {
//   res.status(500).json( {
//     status: 'error',
//     message: 'This route is not yet defined.'
//   });
// }

// // app.get   ('/api/v1/tours',        getAllTours);
// // app.get   ('/api/v1/tours/:id',    getTour);
// // app.post  ('/api/v1/tours',        createTour);
// // app.patch ('/api/v1/tours/:id',    updateTour);
// // app.delete('/api/v1/tours/:id',    deleteTour);

// // Con esto hacemos mejores practicas en Route y Route Handler
// // Estos ROUTES son como MIDDLEWARE, son funciones Middleware
// // que solo aplican para ciertos URLs
// // 3. LUEGO TENGO LOS ROUTES
// app
//   .route('/api/v1/tours')
//   .get(getAllTours)
//   .post(createTour);

//   app
//     .route('/api/v1/tours/:id')
//     .get(getTour)
//     .patch(updateTour)
//     .delete(deleteTour);

//   app
//     .route('/api/v1/users')
//     .get(getAllUsers)
//     .post(createUser);


//   app
//     .route('/api/v1/users/:id')
//     .get(getUser)
//     .patch(updateUser)
//     .delete(deleteUser);

// // 4. ENCIENDO EL SERVER
// const port = 3000;
// app.listen(port, () => {
//   console.log(`Running on port ${port}...`);
// });



//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// Lecture-60 Using 3rd Party Middleware
// Vamos a usar un Middleware de Terceros llamado Morgan, instalando con npm
// para hacer el desarrollo mas facil
// es un Middleware muy popular para logging, osea llevar un registro de lo
// que pasa en la App
// Nos ayuda a ver request data en la console
// en la terminal haz
// npm i morgan
// como dije nos ayuda a hacer el desarrollo mas facil pero sigue siendo
// codigo que incluiremos en nuestra aplicacion y es por eso que NO es
// development dependency, sino un dependency normal, por eso no le puse
// --save-dev

//////////////////////////////////////////////////////////
// Lecture-61 Implementing The “Users” Route
// Nuestro API tendra varios resources
// EL primero del que ya hablamos e implementamos es el Tours resource
// EL otro es el Users resource
// podemos crear cuentas de Users, tener diferentes roles de Users





//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// Lecture-62 Creating and Mounting Multiple Routers
// Esto es mas avanzado
// el objetivo es separar todo este codigo en multiples archivos

//////////////////////////////////////////////////////////
// Esto en un archivo de routes para tours
// app
//   .route('/api/v1/tours')
//   .get(getAllTours)
//   .post(createTour);

//   app
//     .route('/api/v1/tours/:id')
//     .get(getTour)
//     .patch(updateTour)
//     .delete(deleteTour);

//////////////////////////////////////////////////////////
// Esto en otro archivo de routes para users
//   app
//     .route('/api/v1/users')
//     .get(getAllUsers)
//     .post(createUser);

//   app
//     .route('/api/v1/users/:id')
//     .get(getUser)
//     .patch(updateUser)
//     .delete(deleteUser);

//////////////////////////////////////////////////////////
// Otro archivo que contenga los Route handlers, solo para los tours
// const getAllTours = (req, res) => {
// const getTour = (req, res) => {
// const createTour = (req, res) => {
// const updateTour = (req, res) => {
// const deleteTour = (req, res) => {


//////////////////////////////////////////////////////////
// Otro archivo que contenga los Route handlers, solo para los users
// const getAllUsers = (req, res) => {
// const getUser = (req, res) => {
// const createUser = (req, res) => {
// const updateUser = (req, res) => {
// const deleteUser = (req, res) => {

// Pero antes de hacer la separacion del codigo en archivos
// necesito crear un router Separado para cada uno de los Resources
// ahora si checo los routes
// app.route('/api/v1/tours')
// app.route('/api/v1/tours/:id')
// app.route('/api/v1/users')
// app.route('/api/v1/users/:id')

// se puede decir que todos estan en el mismo Router
// y ese router es el app object
// el cual viene de 
// const app = express();
// Osea es Express!!!!
// Pero como mi intencion es crear dos archivos separados
// uno para los ROutes de Tours, y otro para los Routes de Users
// Entonces lo mejor es crear un Router para cada uno de los Resources
// asi que vamos a 3. ROUTES


// ///////////////////////////////////////////////////////////
// // 1. PRIMERO PONGO LOS MIDDLEWARES
// app.use(morgan('dev'));
// app.use(express.json());

// app.use((req, res, next) => {
//   console.log('Hello from the Middleware 😻');
//   next();
// });

// // (COOM)
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// const toursInfo = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)) 


// // 2. LUEGO PONGO LOS ROUTE HANDLERS
// const getAllTours = (req, res) => {
//   // (COOM)
//   console.log(req.requestTime);

//   res.status(200).json({
//       status: 'success',
//       requestedAt: req.requestTime,
//       results: toursInfo.length,
//       data: {
//         toursInfo
//       }
//   });
// }

// const createTour = (req, res) => {
//   const newId = toursInfo[toursInfo.length - 1].id + 1;
//   const newTour = Object.assign ({ id: newId}, req.body);
//   // ahora agrego este nuevo Tour al Array de Tours
//   toursInfo.push(newTour);

//   fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(toursInfo), err => {
//       res.status(201).json( { 
//         status: 'success',
//         data: { 
//           tour: newTour 
//         }    
//       });
//   });
// }

// const getTour = (req, res) => {
//   console.log(req.params);

//   const id = req.params.id * 1;
//   const tour = toursInfo.find( current => current.id === id);

//   if(!tour)
//     return res.status(404).json( {
//         status: 'fail',
//         message: 'Invalid ID'
//     });
  
//   res.status(200).json({
//       status: 'success',
//       data: {
//         tour
//       }
//   });
// }

// const updateTour = (req, res) => {
//   if((req.params.id * 1) > toursInfo.length)
//     return res.status(404).json( {
//         status: 'fail',
//         message: 'Invalid ID'
//   });

//   res.status(200)
//     .json( {
//       status: 'success',
//       data: {
//         tour: '<Updated tour here...>'
//       }
//     })
// }

// const deleteTour = (req, res) => {
//   if((req.params.id * 1) > toursInfo.length)
//     return res.status(404).json( {
//         status: 'fail',
//         message: 'Invalid ID'
//   });

//   res.status(204)
//     .json( {
//       status: 'success',
//       data: null
//     })
// }

// const getAllUsers = (req, res) => { 
//   // 500 Internal Server Error, aun no lo implemento
//   res.status(500).json( {
//       status: 'error',
//       message: 'This route is not yet defined.'
//   });
// }

// const getUser = (req, res) => {
//     res.status(500).json( {
//       status: 'error',
//       message: 'This route is not yet defined.'
//   });
// }

// const createUser = (req, res) => {
//   res.status(500).json( {
//     status: 'error',
//     message: 'This route is not yet defined.'
//   });
// }

// const updateUser = (req, res) => {
//   res.status(500).json( {
//     status: 'error',
//     message: 'This route is not yet defined.'
//   });
// }

// const deleteUser = (req, res) => {
//   res.status(500).json( {
//     status: 'error',
//     message: 'This route is not yet defined.'
//   });
// }

// // 3. LUEGO TENGO LOS ROUTES

// // asi es como creo un nuevo Router, hare uno por cada Resource
// const tourRouter = express.Router();
// const userRouter = express.Router();

// // ahora como conecto el nuevo Router tourRouter  con la aplicacion?
// // la usaremos como Middleware, esto porque este nuevo tourRouter modular
// // es un verdadero Middleware, asi que pongo
// // donde tourRouter lo quiero usar en /api/v1/tours
// // y es asi como creo una subaplicacion
// // la forma de operar es la siguiente, si llega un request al server
// // pidiendo /api/v1/tours/:id, entonces el request llega
// // al Middleware stack y cuando llega a  
// // app.use('/api/v1/tours', tourRouter);
// // hace match con el route: /api/v1/tours
// // entonces el Middleware se ejecutara osea tourRouter, la subaplicacion
// // el cual tiene sus propios Routes: '/' y '/:id'
// // y de ahi ejecuta uno de los handlers: .get .patch .delete

// tourRouter
//   .route('/')
//   .get(getAllTours)
//   .post(createTour);

// tourRouter
//     .route('/:id')
//     .get(getTour)
//     .patch(updateTour)
//     .delete(deleteTour);

// userRouter
//     .route('/')
//     .get(getAllUsers)
//     .post(createUser);

// userRouter
//     .route('/:id')
//     .get(getUser)
//     .patch(updateUser)
//     .delete(deleteUser);

// // Todo lo anterior fue declaracion, configurar, y ahora si los puedo
// // usar, osea .use
// app.use('/api/v1/tours', tourRouter); // a esto se llama Mounting the Router
// app.use('/api/v1/users', userRouter); // a esto se llama Mounting the Router
// // Mounting the Router, osea montar un nuefo Router en un Route    

// // 4. ENCIENDO EL SERVER
// const port = 3000;
// app.listen(port, () => {
//   console.log(`Running on port ${port}...`);
// });




///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
// Lecture-63 A Better File Structure
// Voy a crear varios archivos nuevos
// y una nueva Estructura de Archivos
// creo un nuevo folder llamado Routes
// ahi tendre un archivo para tour Routes y otro para user Routes

///////////////////////////////////////////////////////////////////
// 1. PRIMERO PONGO LOS GLOBAL MIDDLEWARES

/*

ESTE ES UN CODIGO QUE VI EN EL CURSO DE UDEMY
I found that when typing in my heroku url that if I did not specify the https it would 
defualt to an http connection in the browser. I found this code to add to our app.js 
to always force an http connection. Hope this helps!

source with explanation here https://jaketrent.com/post/https-redirect-node-heroku


*/
if(process.env.NODE_ENV === 'production') { 
  app.use((req, res, next) => { 
    if (req.header('x-forwarded-proto') !== 'https') 
      res.redirect(`https://${req.header('host')}${req.url}`) 
    else 
      next();
  }) 
}


///////////////////////////////////////////////////////////////////
// Lecture-226 Implementing CORS
///////////////////////////////////////////////////////////////////

// Implement CORS
// esto regresa un Middleware function que agregara unos headers a la response, y pensara para que uso otro package nomas para esto?
// pues busca en google github cors
// ve a su pagina en la carpeta /lib/index.js
// agrega este header:  key: Access-Control-Allow-Origin
// value: *
// esto significa todos los requests sin importar de donde vienen 
// entre otros mas headers
// en vez de hacerlo a mano y querer reinventar la rueda mejor uso packages ya listos
// con esto ya permito Cross Origin Sharing para todas las incoming requests, osea todas mis APIs
// del proyecto

// aqui pongo la lista blanca de dominios que estan permitidos que usen
// mi app, cuando haga deplu a production quitare los 127.0.0.1 y localhost

// credentials: true, es muy importante ya que permite al server mandar la cookie
// que contiene el JSON Web Token (JWT) para que el usuario pueda navegar
// en las protected routes
// y asu vez en el Client, cuando axios mande llamar una API usa withCredentials: true
// que es el complemento de credentials: true del server
// ESTE CODIGO lo saque del curso de NodeJS de Dave Gray y de expressjs.org en cors
// Dave tiene un codigo mas estructurado que este, pero hacer el cambio no lo quiero
// hacer ahorita, estete codigo jala

if(process.env.NODE_ENV === 'development') { 
    const whiteList = ['https://eljuanjo-dulces.herokuapp.com', 'http://127.0.0.1:3000', 'http://localhost:3000', 'http://127.0.0.1:8000', 'http://localhost:8000'];

    const corsOptions = {
      credentials: true,
      origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1) {
          callback (null, true);
        }
        else {
          callback(new Error ('Not Allowed by CORS'));
        }
      },
      optionsSuccessStatus: 200
    }
    app.use(cors(corsOptions));

}

//  como dije es muy similar a app.get o app.post , etc
// asi que defino la route a la cual quiero manejar las options, y lo quiero para 
// todas las routes
// asi que le pongo *
// luego el handler, osea el cors middleware

app.options ('*', cors());



///////////////////////////////////////////////////////////////////
// Lecture-144 Setting Security HTTP Headers
///////////////////////////////////////////////////////////////////

/*

Voy a usar otro npm package para configurar un par de Security HTTP Headers muy 
importantes. Lo instalo desde la Terminal

	npm i helmet

Documentation: helmet github en google
Helmet es una coleccion de multiples middlewares

Es un standar en Express development, todos los que construyan una Express app siempre 
deben de usar el helmet package, porque Express no tiene de cajon  estas mejores practicas de seguridad

Para configurar estos headers usare otro Middleware Function 

En app.js
*/

// Lo pongo COMO EL PRIMER MIDDLEWARE

// En app.use necesito una function NO una function call
// Es mejor usar el helmet package al inicio del Middleware stack

// MIDDLEWARE: SET SECURITY HTTP HEADERS
// Por mientras lo comentarizo por Leaflet
// app.use(helmet());


// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://js.stripe.com',
    'https://m.stripe.network',
    'https://*.cloudflare.com'
  ];
  const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/'
  ];
  const connectSrcUrls = [
    'https://unpkg.com',
    'https://tile.openstreetmap.org',
    'https://*.stripe.com',
    'https://bundle.js:*',
    'ws://127.0.0.1:*/'
  ];
  const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
   
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", ...fontSrcUrls],
        scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", 'blob:', 'https://m.stripe.network'],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          ...connectSrcUrls
        ],
        upgradeInsecureRequests: []
      }
    })
  );

/*
Ahora voy a POSTMAN a probar el helmet package, hago un request el que sea, puede 
ser /Get All Tours para ver a los Headers y veo que ahora me aparecen estos:

	X-DNS-Prefetch-Control -> off
	Strict-Transport-Security -> max-age=15552000
	X-Download-Options -> noopen
	X-XSS-Protection -> 1;mode=block
*/



///////////////////////////////////////////////////////////////////
// Lecture-143 Implementing Rate Limiting
///////////////////////////////////////////////////////////////////

/*
Vamos a implementar Rate Limiting para impedir que la misma IP haga demsiados requests 
a nuestras APIs y eso nos ayudara a prevenir ataques como negar el servicio o 
brute force attacks

El Rate Limiting sera implementado como una Global Middleware Function, lo que 
Rate Limiting hará es contar el numero de requests llegando de una IP y cuando 
haya demasiados bloqueara esos requests

El Global Middleeare Function estara en app.js

Y para esto usare un npm package llamado Express Rate Limit desde la Terminal

	npm i express-rate-limit

En app.js

const rateLimit = require (‘express-rate-limit’);

Y voy a poner este Middleware mero arriba de los demas Global Middleware

Recibe un parametro que es un Objeto con opciones, en el que se define cuantos re
quests por IP voy a permitir en un cierto periodo de tiempo, window, la ventana de tiempo, 
en este caso 100 requests por hora, 60 min por 60 seg por 1000 ms y si se pasan de eso 
mando un mensaje de error

Tengo que encontrar un balance para la App, por ejemplo si estoy haciendo un 
API que neceista muchos requests para un IP, entonces el max debe ser mayor

Este limiter viene siendo un Middleware function 

*/

// MIDDLEWARE: LIMIT REQUESTS FROM SAME /API
const limiter = rateLimit ( { 
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour'
});

// lo que quiero es limitar el acceso a mi API route, esto afectara a todas las 
// routes dentro de /api
app.use ('/api', limiter);

/*
Voy a POSTMAN  probarlo con el mas simple /Get All Tours

y me regresa
{
 Todos los Tours
}

Ahora fijate en Headers (dentro de POSTMAN), el rate limiter crea dos headers:

X-RateLimit-Limit -> 100
X-Ratelimit-Remaining -> 99
X-RateLimit-Reset -> 188787833 (este es el timestamp donde sera reseteado) 
la window de 1 hora

Ahora si le doy /Get Tour

X-RateLimit-Limit -> 100
X-Ratelimit-Remaining -> 98

Si en el transcurso de este tiempo la App se reinicia , por ejemplo al dar Save en 
el codigo se vuelve a compilar y se reinicia la App y por lo tanto se vuelve a 
reiniciar el contador X-Rate-Limit-Remaining y x-Rate-Limit-Reset

Para hacer una prueba para ver el mensaje de error y el 
status Code 429 Too many requests si me paso del maximo de requests por hora cambio 
el max a 3

*/


///////////////////////////////////////////////////////////////////
// Lecture-67 Environment Variables
// ahora porque tengo acceso a process.env.NODE_ENV aqui en app.js si la decalre
// en server.js?
// la respuesta es que la lectura de las variables de config.env solo se tiene que
// hacer una vez, luego esta en el proceso y el proceso es el mismo sin importar
// en que archivo me encuentre

// MIDDLEWARE: DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


///////////////////////////////////////////////////////////////////
// Lecture-227 Finishing Payments with Stripe Webhooks
///////////////////////////////////////////////////////////////////
// PONER ESTO Antes del Body Parser

// y porque creo este webhook-Checkout en app.js en vez de bookingRouter.js ?? 
// Es porque esta handler function bookingController.webhookCheckout, cuando recibo el 
// Body de Stripe, la Stripr function que voy a usar  para leer el Body, necesita que 
// este Body este en raw form, como String y NO como JSON, y es por esto que pongo este 
// codigo ANTES del Body Parser, porque cuando llegue al parser el Body seara parseado y 
// convertido a JSON y si dejo que pase eso el route handler: 
// bookingController.webhookCheckout NO FUNCIONARA, por eso tuve que poner este 
// codigo en app.js y antes de Body Parser

// Aun asi, tengo que darle parse al Body pero un formato raw y cuando Jonas grabo 
// la leccion no se podia hacer con Express directamente, asi que en este video 
// se instala el body-parser de npm, pero 5 dias despues del video Express agrego 
// el Raw Parser , asi que usare Express y no el package, osea usare express.raw

// Para agregar que el body este en raw format, lo hago como un Middleware, entre 
// el Route y el Handler

// app.post( '/webhook-checkout', 
//           express.raw({ type: 'application/json' }), 
//           bookingController.webhookCheckout);




// BODY PARSER, READING DATA FROM THE BODY INTO req.body
// Aqui puedo implementar otra medida de seguridad en el que limito la cantidad de 
// datos que estan en el Body, si recibo un Body de mas de 10kb el Body NO sera aceptado
app.use(express.json( { limit: '10kb' } ));


///////////////////////////////////////////////////////////////////
// Lecture-195 Updating User Data
///////////////////////////////////////////////////////////////////

// Esto es un Express-built-in Middleware, express.urlencoded y se llama asi porque 
// recuerda que la manera en que la Form envia los datos al sever tambien se llama 
// URL enconded, y este Midleware se usa para parse datos que vienen de un URL 
// encoded Form, y le paso unos settings
app.use(express.urlencoded( { extended: true, limit: '10kb' }));


///////////////////////////////////////////////////////////////////
// Lecture-189 Logging in Users with Our API - Part 1
///////////////////////////////////////////////////////////////////
app.use(cookieParser());


///////////////////////////////////////////////////////////////////
// Lecture-145 Data Sanitization
///////////////////////////////////////////////////////////////////

/*

En esta leccion voy a usar dos packages para mejorar la seguridad de la App. 
En esta ocasion para Data Sanitization, esto significa limpiar todos los datos que 
llega a la App con codigo malicioso. En este caso me quiero defender de dos ataques

En app.js

despues del body parser osea despues del Middleware que lee los datos de req.body 
es cuando me pongo a limpiarlo

Esta es la razon por la que es muy importante defenderse contra NOSQL QUERY INJECTION
Voy a simular un ataque de este tipo y puedes quedar traumado cuando lo veas

Vamos a POSTMAN intenta loggearte como alguien sin saber su email address, solo con 
saber el password, seremos capaces de entrar sin saber el email en /Login

“$gt”: “” esto funciona porque siempre sera verdad  

{
	“email”: { “$gt”: “” },
	“password”: “newpass123”
}

y nos regresa que se loggeo como ADMIN!!!, con todo y JSON Web Token
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYjRjMDM1M2E2MThiMzU4YjhmY2VlMCIsImlhdCI6MTY1NjQzMjQzMiwiZXhwIjoxNjY0MjA4NDMyfQ.7w3yEKvCyI849wVIR6OBUYXR96On6E2bKgPERyjqo90",
    "data": {
        "user": {
            "role": "admin",
            "_id": "62b4c0353a618b358b8fcee0",
            "name": "admin",
            "email": "admin@hotmail.com",
            "__v": 0,
            "passwordChangedAt": "2022-06-28T03:47:50.358Z",
            "id": "62b4c0353a618b358b8fcee0"
        }
    }
}

y tambien lo puedo hacer en Compass y hacer lo mismo, voy a la Collection Users, 
en Filter
	{ “email”: { “$gt”: “” } }

esto es un query valido, le das FIND

y me regresa TODOS los Users

A esto se le llama malicious query injection nos permite loggearnos sabiendo solo el 
password

Para protegerme instalo otro Middleware en la Terminal
	npm i express-mongo-sanitize

Y de una vez instalo el otro package desde la Terminal
	npm i xss-clean


const mongoSanitize= require (‘express-mongo-sanitize’);
const xss = require (‘xss-clean’);
*/

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

/*
 mongoSanitize() es una funcion que mandare llamar y la cual regresa un Middleware 
function la cual puedo darle .use y con esto puedo prevenir NOSQL QUERY INJECTION, 
lo que hace este Middleware es checar el req.body , el request Query String y req.params 
y filtra todos los signos $ y puntos porque asi como los operadores de MongoDB se escriben

// Regreso y hago la misma prueba que hice anteriormente en POSTMAN

y me regresa 

{
    "status": "errorcin",
    "error": {
        "stringValue": "\"{}\"",
        "valueType": "Object",
        "kind": "string",
        "value": {},
        "path": "email",
        "reason": null,
        "name": "CastError",
        "message": "Cast to string failed for value \"{}\" (type Object) at path \"email\" for model \"User\""
    },
    "message": "Cast to string failed for value \"{}\" (type Object) at path \"email\" for model \"User\"",
    "stack": "CastError: Cast to string failed for value \"{}\" (type Object) at path \"email\" for model \"User\"\n    at model.Query.exec (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/query.js:4498:21)\n    at model.Query.Query.then (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/mongoose/lib/query.js:4592:15)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"
}
*/



// DATA SANITIZATION AGAINST XSS ATTACKS
/* 

Limpia cualquier captura que haya hecho el User y que tenga HTML malicioso, imagina 
que un atacante intenta insertar codigo malicioso de HTML junto Javascript, eso seria 
inyectado a nuestro sitio de HTML, lo que hace el Middleware es convertir esos simbolos 
de HTML

Tambien la validacion de Mongooose ya de por si es muy buena contra XSS porque no 
permite nda raro que entre a la BD siempre que lo usemos correctamente, siempre 
que puedas agrega validacion a los Schemas y eso te protege de cross-side scripting 
por lo menos en el server side
*/

app.use(xss());

/*
Para probarlo en POSTMAN en /SignUp para crear un User nuevo

{
    "name": “<div id=‘bad-code’>Name</div>”,
    "email": “tester@hotmail.com",
    "password": “pass1234”,
    "confirmpassword": “pass1234”
}

y me regresa, y convierte el codigo de HTML que se le puso, si agrega al User a la 
BD pero NO como se capturo desde el Client
{
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyYmI0ZGUxNTJiYzkxNDIxY2I0MjYyMSIsImlhdCI6MTY1NjQ0MjMzOCwiZXhwIjoxNjY0MjE4MzM4fQ.loHN1rtPZ04fjD-4k7BiA19yN7s2jhQLfUCOY2y2L3E",
    "data": {
        "user": {
            "role": "user",
            "active": true,
            "_id": "62bb4de152bc91421cb42621",
            "name": "&lt;div id='bad-code'>Name&lt;/div>",
            "email": "tester@hotmail.com",
            "__v": 0,
            "id": "62bb4de152bc91421cb42621"
        }
    }
}

Y veo que en Compass Tambien esta este User!! SI lo agregó, solo lo borro de ahi

*/


/*

Tambien recuerda que el Validator Function Library que usamos antes tambien tiene 
muy buenas opciones de sanitizacion, tambien puedo construir manualmente unos 
Middlewares usando esta library pero no es necesario porque Mongoose ya tiene un 
Schema estricto

Creo que se refiere al Validator que instale usando
	npm i validator

Ahora falta prevenir Parameter Pollution
*/



///////////////////////////////////////////////////////////////////
// Lecture-146 Preventing Parameter Pollution
///////////////////////////////////////////////////////////////////

/*

Vamos a prevenir Parameter Pollution usando otro package desde la Terminal
	npm i hpp

hpp es HTTP Parameter Pollution

El error sin el package se ve asi:

Veamos el error en POSTMAN, primero me loggeo /Login, luego uso /Get All Tours Route 
y le agrego unos parametros al Query String
	{{URL}}/api/v1/tours?sort=duration&sort=price

y no tiene sentido porque estamos preparados para usar sort con solo un parametro

y me regresa un error en APIFeatures.js en la linea 72
	const sortBy = this.queryString.sort.split(',').join(' ');

Express esta tratando de hacer un split a la sort property que esta esperando sea un 
String pero en este caso como lo definimos dos veces sort=duration&sort=price, 
Express crea un Array con duration y price y eso NO funciona porque split funciona 
en Strings no en Arrays, esto es un problema tipico que los atacantes pueden usar, 
lo que voy a usar es un Middleware que quitara los fields duplicados, en este caso sort

{
    "status": "errorcin",
    "error": {
        "statusCode": 500,
        "status": "errorcin"
    },
    "message": "this.queryString.sort.split is not a function",
    "stack": "TypeError: this.queryString.sort.split is not a function\n    at APIFeatures.sort (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/Utils/apiFeatures.js:72:41)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/tourController.js:3894:16\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/Utils/catchAsync.js:5:3\n    at Layer.handle [as handle_request] (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/layer.js:95:5)\n    at next (/Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/node_modules/express/lib/router/route.js:144:13)\n    at /Users/abdelrocker/Downloads/NodeJS/Test/4-natours/starter/controllers/authController.js:1466:3\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)"
}

Ahora ya con el package y corregido el error

const hpp = require(‘hpp’);

Despues de Data Sanitization
*/

// Ponerlo al final ya que limpia el Query String
// MIDDLEWARE: PREVENT PARAMETER POLLUTION
app.use(hpp( {
			whitelist: [
				'duration',
				'ratingsQuantity',
				'ratingsAverage',
				'maxGroupSize',
				'difficulty',
				'price'
			]
}));


/*
Vuelvo a probar en POSTMAN

y me regresa, el error ya no esta y ahora solo usa el ultimo sort=price

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

....

Ya esta casi arreglafo pero en realidad quiero unas propiedades o fields duplicados 
en algunos casos, por ejemplo: puedo querer buscar tours con una duration = 9 y 5

	{{URL}}/api/v1/tours?duration=5&duration=9

En este momento esto no funciona, solo encuentra un tour con 9 dias
Pero si no tuviera el hpp Middleware SI funcionaria, y es la funcionalidad esperada

asi que lo arreglo asi: puedo poner unos parametros en una lista blanca (whitelist), 
por medio de un objeto dentro la hpp function

Whitelist es un Array de properties para los que permitimos duplicados en el Query String

app.use (hpp({
	whitelist: [
		‘duration’,
		‘ratingsQuantity’,
		‘ratingsAverage’,
		‘maxGroupSize’,
		‘difficulty’,
		‘price’
	]
}));

Regreso a POSTMAN y vuelvo a probar

y me regresa los tours de 5 y 9 dias

{

}

Ahora si lo pruebo /Get All TOurs con dos sort
	{{URL}}/api/v1/tours?sort=duration&sort=price

Ahora bien le agrego todos los fields que considere necesario a la Whitelist y parece 
raro agregar a mano todos los fields que necesite y hace falta agregar los fields para 
los demas Resources y esta Whitelist sera mucho mas grande

*/


///////////////////////////////////////////////////////////////////
// Lecture-222 Preparing Our App for Deployment
///////////////////////////////////////////////////////////////////

// compression() regresara un Middleware function que hara la compresion a los 
// textos que se envien al CLient, esto no funcionara para imagenes, porque genralmente 
// ya estan comprimidas. Una vez que el website este deployed voy a probar si la 
// compresion funciona
app.use (compression());

// app.use((req, res, next) => {
//   console.log('Hello from the Middleware 😻');
//   next();
// });

// (COOM)
// MIDDLEWARE: TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // 
  // console.log('req.headers', req.headers);

  ///////////////////////////////////////////////////////////////////
  // Lecture-189 Logging in Users with Our API - Part 1
  ///////////////////////////////////////////////////////////////////

  // console.log('req.cookies',req.cookies);
  next();
});


// MIDDLEWARE: MOUNTING THE ROUTER


//////////////////////////////////////////////////////////////////
// Lecture-176 Setting Up Pug in Express
//////////////////////////////////////////////////////////////////
// app.get que para pintar paginas en el browser es lo que uso generalmente, asi que 
// especifico el URL, osea el route y eso es el root del website y como segundo parametro 
// uso un handler function

// En vez de usar .json uso .render el cual pintara el template con el nombre que 
// le pasemos, en este caso base pero sin ponerle .pug y buscara este archivo dentro 
// del folder que le especifique al inicio y lo mandara como response al browser

///////////////////////////////////////////////////////////////////
// Lecture-181 Setting Up The Project Structure
///////////////////////////////////////////////////////////////////
// Este codigo se mueve a viewRoutes.js

// app.get('/', (req, res) => {
// 	res.status(200).render ('base', {
//         tour: 'The Forest Hiker',
//         user: 'Abdelito'
//     });
// });


//////////////////////////////////////////////////////////////////
// Lecture-180 Extending Our Base Template with Blocks
//////////////////////////////////////////////////////////////////

// app.get('/overview', (req, res) => {
// 	res.status(200).render('overview', {
// 		title: 'All Tours'
// 	});
// });

// // Como overview.pug no existe, lo creo en el folder views


// app.get('/tour', (req, res) => {
// 	res.status(200).render('tour', {
// 		title: 'The Forest Hiker'
// 	});
// });

// Como tour.pug(helme) no existe, lo creo en el folder views

///////////////////////////////////////////////////////////////////
// Lecture-181 Setting Up The Project Structure
///////////////////////////////////////////////////////////////////
// app.use('/', viewRouter);
// app.use('/api/v1/tours', tourRouter); // a esto se llama Mounting the Router
app.use('/api/v1/users', userRouter); // a esto se llama Mounting the Router

///////////////////////////////////////////////////////////////////
// Lecture-155 Creating And Getting Reviews
///////////////////////////////////////////////////////////////////
// app.use('/api/v1/reviews', reviewRouter);
// Mounting the Router, osea montar un nuefo Router en un Route    

///////////////////////////////////////////////////////////////////
// Lecture-211 Integrating Stripe into the Back-End
///////////////////////////////////////////////////////////////////

// app.use('/api/v1/bookings', bookingRouter);

app.use('/api/v1/products', productRouter); // a esto se llama Mounting the Router

app.use('/api/v1/clients', clientRouter); // a esto se llama Mounting the Router

app.use('/api/v1/sales', saleRouter); // a esto se llama Mounting the Router


///////////////////////////////////////////////////////////////////
// Para el Deployment
// Uso este middleware para decirle a mi Express App que voy a usar el directorio client como mi static folder, osea que usare archivos de html, css y js dentro de client

app.use(express.static(path.join(__dirname, '/client/build')));

// Y aqui con el * le digo que cuando le lleue cualquier request lo va a redireccionar a este path

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});
///////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////
// Lecture-112 Handling Unhandled Routes
///////////////////////////////////////////////////////////////////

/*

si la app llega a este punto significa que ninguna de las 2 lineas anteriores
tourRouter y userRouter pudieron atrapar el request

uso app.all para manejar todos los metodos de HTTP, get, post, patch y asi con una 
sola linea manejo a todos , en el primer parametro especifico el URL y como quiero 
manejar a todos los URLs que no fueron manejados anteriormente  puedo usar * , 
el segundo parametro es una Middleware function normal y solo quiero mandar 
una response en JSON formato no HTML

Lo pruebo en POSTMAN asi
	127.0.0.1:8000/v1/tours

y me manda este resultado

    {
        "status": "fail",
        "message": "Can't find /v1/tours on this server"
    }
*/

app.all('*', (req, res, next) => {
	// res.status(404).json({
	// 	status: 'fail',
	// 	message: `Can't find ${req.originalUrl} on this server`
	// });

  	// el string que se manda como parametro es el err.message
	// const err = new Error (`Can't find ${req.originalUrl} on this server`);
	// err.status = 'fail';
	// err.statusCode = 404;

	// como siempre uso next para que vaya al siguiente middleware pero ahora lo uso 
  // de forma especial , porque voy a pasar err a next, si la next function recibe un 
  // argumento, sin importar cual sea, Express automaticamente sabra que es un error y 
  // eso aplica para cualquier next function en cualquier middleware y se saltara todos 
  // los middlewares y se ira al Global Error Handling Middleware 

  ///////////////////////////////////////////////////////////////////
  // Lecture-115 Better Errors and Refactoring
  ///////////////////////////////////////////////////////////////////
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});


///////////////////////////////////////////////////////////////////
// Lecture-114 Implementing a Global Error Handling Middleware
///////////////////////////////////////////////////////////////////

/*

En este video voy a implementar el Global Error Handling Middleware
Voy a empezar creando la Middleware function que maneja los errores y en Express es 
muy facil recuerda que Express ya viene con middleware handlers  empiezo con app.use 
y le defino 4 argumentos para que sea un Middleware function que maneje errores, 
ya que Express automaticamente lo reconocera como tal y por lo tanto solo la llamara 
si hay un error, esta es un error first function, que significa que el primer argumento 
es el error, y luego req, res, next

Voy a app.js
*/

/*
Ahora vamos a crear un error para probar este Global Error Handler

y lo hago en app.js, modifico
app.all(‘*’, (req, res, next) => {
	// el string que se manda como parametro es el err.message
	const err = new Error (`Can't find ${req.originalUrl} on this server`);

	err.status = ‘fail’;
	err.statusCode = 404;

	// como siempre uso next para que vaya al siguiente middleware pero ahora lo uso 
  de forma especial , porque voy a pasar err a next, si la next function recibe un 
  argumento, sin importar cual sea, Express automaticamente sabra que es un error y 
  eso aplica para cualquier next function en cualquier middleware y se saltara todos 
  los middlewares y se ira al Global Error Handling Middleware 
	next(err);
});

Ahora para probarlo en POSTMAN solo hay que pasar un Route que no este definida como
	127.0.0.1:8000/api/v1/toursss
*/


///////////////////////////////////////////////////////////////////
// Lecture-114 Implementing a Global Error Handling Middleware
///////////////////////////////////////////////////////////////////
app.use(globalErrorHandler);


/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////



// En resumen este archivo app.js SE USA mas que nada para declarar MIDDLEWARES
// Tenemos middlewares que queremos aplicar a todos los routes
// en este caso engo 4 Middlewares que quiero aplicar a TODOS los routes:

// app.use(morgan('dev'));
// app.use(express.json());
// app.use((req, res, next) => { console.log('Hello from the Middleware 😻');
// app.use((req, res, next) => { req.requestTime = new Date().toISOString();

// y luego tengo 2 Middlewares personalizados para ciertos Routes
// app.use('/api/v1/tours', tourRouter); 
// app.use('/api/v1/users', userRouter); 

// Ahora creo un folder llamado controllers 
// les habia estado llamado Route Handlers pero el folder se llama controllers
// pero como usare MVC, los controllers seran estos Route Hndlers
// y dos archivos llamados tourController y userController

// Ahora creo un server.js, es una buena practica tener todo lo relacionado
// a Express en un archivo y todo lo relacionado al server en otro archivo main
// asi que desde ahora server.js sera nuestro archivo de inicio, donde todo comienza
// y es ahi donde hacemos listen al server

// ahora necesito exportar app, para usarlo en server.js
module.exports = app;

// y es asi como tengo la configuracion de la aplicacion en un solo archivo



/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// Lecture-64 Param Middleware
// This is a special type of Middleware
// Is a Middleware that only runs for certain Parameters
// when we have a certain parameter in the URL
// hasta ahora el unico paraemtro que manejo es el id
// puedo crear un Middleware que solo se ejecuta cuando el id esta presente
// en el URL
// ve al archivo tourRoutes.js




/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// Lecture-65 Chaining Multiple Middleware Functions
// for the Same Route

// Hasta ahora cada vez que quiero definir un Middleware function
// solo he pasado una sola function
// por ejemplo: en tourRoutes.js
// para manejar el post Request
// .post(tourController.createTour);
// solo le paso esta Middleware function: tourController.createTour
// pero supon que quiero ejecutar multiples Middleware functions
// y para que quiero haacer eso?
// bueno puede ser que necesite ejecutar un Middleware function ANTES
// de crear el Tour, por ejemplo checar los datos que vienen en el Body
// parecido al checkID de param Middleware, asi que tal vez necesite checar algo
// por ejemplo checar si request.body en verdad tiene la informacion del Tour
// esto es un CHALLENGE paa que lo haga yo

// 1. Create a checkBody Middleware function
// 2. Check if the body contains the Tour name Property and price Property
// 3. Si no lo tienen mandar un estatus code de 400 (bad request)
// 4. Add it to the post handler Stack
// lo que tenfo que hacer es
// .post(tourController.checkBody, tourController.createTour);
// supon que la funcion que tengo que agregar para checar eso se llama middleware
//  de tal forma que primero ejecuta
// middleware
// y despues tourController.createTour

// esto va a ser muy util, puedo checar si un usario esta loggeado, si tiene privilegios
// derechos para crear tours, cualquier validacion ANTES de crear un tour
// de esta forma toda la logica que NO tiene que ver con crear un nuevo resource
// fuera de su Middleware function




/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// Lecture-66 Serving Static Files

// What are static files?
// Son los archivos que estan en el sistema de archivos que por el momento
// no puedo accesar usando Routes, por ejemplo /public/overview.html, pero
// por el momento no puedo acceder a ese archivo usando un browser
// al igual que las imagenes en el folder /img, o los archivos css en el folder /css
// o los archivos de JS en su folder
// para probarlo usemos el browser
// usa 127.0.0.1:3000/api/v1/tours
// obvio esto se ve en el browser pero SIN formatear, pero digamos
// que quiero tener acceso a overview.html
// intenta:
// 127.0.0.1:3000/public/overview.html
// y te marca error
// Cannot GET /public/overview.html
// esto es porque NO definimos un Route
// No tenemos ningun Route Handler asociado con este Route
// Si quiero accesar un archivo del file system (sistema de archivos)
// necesito usar un built-in Express Middleware
// lo hare asi

// por ejemplo, despues de
// app.use(express.json());

// CHECA el codigo arriba y ahora si
// uso 
// 127.0.0.1:3000/overview.html
// sin /public
//  y porque NO es necesario poner /public en el URL?
// porque cuando abro un URL que no puede encontrar en ningun otro Route
// buscara en el public  folder que defini y configura ese folder al root
// y si quiero abrir una imagen solo pongo
// 127.0.0.1:3000/img/pin.png
// lo que NO esta permitido es esto
// 127.0.0.1:3000/img
// porque esto NO es un archivo
// parece un Route normal entonces Express trata de encontrar un Route handler
// y obvio no existe, entonces esto funciona solo para Static Files
// y es asi como servimos Static Files de un FOLDER y NO de un Route




/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// Lecture-67 Environment Variables

// Que son, como las configuramos, como las usamos?
// Esto no tiene que ver con Express, sino con NodeJS development in general
// Pero es necesario para seguir adelante con elproyecto
// NodeJS o Express apps pueden ejecutarse en diferentes Ambientes
// Los mas importantes son el ambiente de Desarrollo y el de Produccion
// Porque dependiendo del ambiente usaremos diferentes bases de datos
// podriamos apagar/encender la necesidad de login, o apagar/encender
// debugging, entre otras cosas
// Hay mas ambientes para equipos mas grandes
// Por default Express condigura el ambiente a Desarrollo
// Vamos a hacer una demostracion en server.js
// Esto es porque todo lo que NO tenga que ver con Express
// lo haremos fuera de app.js, ya que app.js solo lo usamos
// para configurar la aplicacion, osea lo que tiene que ver con
// la aplicacion Express




/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// Lecture-68 Setting Up ES Lint + Prettier in VS Code

// ES Lint es un programa que constantemente escanea el codigo y encuentra
// errores potenciales o malas practicas, es MUY configurable
// Tambien se puede usar para formatear codigo, pero para eso Jonas
// dejara a Prettier como su principal formateador, pero basado en
// algunas reglas de ES Lint que definiremos
// Asi que lo ES Lint hara sera mostrar errores
// Instalemos la Extension de ES Lint para VS Code
// Tambien hay que instalar varias Dev Dependencies desde la Terminal
// Es necesario instalar ES Lint en Prettier como npm Packages

// eslint-config-prettier 
// esto deshabilita que ES Lint formatee codigo
// eslint-plugin-prettier 
// esto le permite a ES Lint mostrar errores de formato al escribir
// ahora necesito un style guides, el mas popular y que usare es airbnb style guide: 
// eslint-config-airbnb
// eslint-plugin-node 
// esto agrega unas reglas especificas de ES Lint, solo para NodeJS,
// para encontrar errores que estemos cometiendo al usar codigo de NodeJS
// luego necesitamos 3 ES Lint plugins que solo son necesarios para que funcione el
// el style guide airbnb
// eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react
// por ultimo grabarlos como dev dependencies: 
// --save-dev

//    npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev

// el siguiente paso es que necesito archivos de configuracion, config files para
// Prettier (.prettierrc) y ES Lint (.eslintrc.json)

// https://eslint.org

// Vamos a probar esta nueva configuracion, vamos a server.js




//////////////////////////////////////////////////////////////////
// Lecture-176 Setting Up Pug in Express
//////////////////////////////////////////////////////////////////


/*

Pug es un Templating Engine lo que nos permitira pintar websites usando templates simples

Como construyo y pinto estos websites? Uso un template engine que nos creara un template
 y facilmente llenar ese template con datos y el template engine se llama Pug, 
 hay otros template engine como Handlebars o EGS

El primer paso es decirle a Express que template engine voy a usar y lo hago al inicio 
de la app

En app.js
	const app = express();

	app.set(‘view engine’, ‘pug’);

Express soporta los engines mas comunes directamente, asi que no necesito instalar pug 
ni hacerle require todo sucede debajo del agua en Express
NOTA: SI NECESITO INSTALAR PUG

Ahora necesito definir en donde los views estan ubicados en el file system
Nuestos pug templates son llamados views en Express y esto es porque estos templates 
son los View en el Model View Controller Architecture

Ahora es tiempo de crear el folder views

// el path que pongo aqui es relativo al directory donde ejecutamos el Node App y 
// usualmente es el root project folder pero puede que no sea asi asi que es mejor 
// usar __dirname variable junto con un truco que puedo usar con Node que es usar el 
// path module, path es un built-in Node Module, osea un core Module que se usa para 
// manipular Path Names, asi que le hago un require
	 
const path = require (‘path’); 

app.set(‘views’, path.join(__dirname, ‘views’));

Uso path.join porque no siempre se si un path que recibo de algun lugar ya tiene 
un / o no, por eso se usa path.join para prevenir este bug, con esto no nos 
preocupamos si hay un / porque Node se encarga de crear un Path correcto

Y tambien lo usare cuando creo este Middleware
Y lo muevo mero arriba con los Midlewares, antes de app.use(helmet());
porque trabaja junto con el views engine

app.use(express.static(path.join(__dirname, 'public' )));

Y con esto ya tengo configurado el pug engine

Ahora creo el primer template

En el views folder creo el archivo base.pug

Por ahora solo le agrego un H1 con el nombre de un tour

h1 The Park Camper

Ahora creo un nuevo route a partir del cual puedo accesar a ese template base.pug

Sigo en app.js en los Mounting Routes
app.get que para pintar paginas en el browser es lo que uso generalmente, asi que 
especifico el URL, osea el route y eso es el root del website y como segundo parametro 
uso un handler function

En vez de usar .json uso .render el cual pintara el template con el nombre que 
le pasemos, en este caso base pero sin ponerle .pug y buscara este archivo dentro 
del folder que le especifique al inicio y lo mandara como response al browser

app.get(‘/‘, (req, res) => {
	res.status(200).render (‘base’);
});

Ahora lo pruebo en Chrome
127.0.0.1:8000

Y me manda el error Cannot find module pug

Significa que SI tengo que instalar el pug module

Voy a la Terminal
	npm i pug

Ahora lo pruebo en Chrome
127.0.0.1:8000
127.0.0.1:8000/

Y ME MANDA LA PAGINA

Al accesar el root, el route en nuestro host, asi es como tengo acceso a un 
dynamically rendered website basado en base.pug template

*/




//////////////////////////////////////////////////////////////////
// Lecture-180 Extending Our Base Template with Blocks
//////////////////////////////////////////////////////////////////

/*


Esta es una de las mas importantes y complejas funcionalidades de Pug y se llaman Extends

Con Extends podemos usar el mismo base layout para cada pagina que use para pintar

Hasta ahora tengo el base template casi terminado, empecemos a llenar el Content

Por supuesto que quiero llenar contenido diferente para para diferentes paginas y 
para empezar quiero tener un overview page con todos los tours y otra pagina con los 
detalles de los tours para un tour en especifico, vamos a implementar unos routes para 
ambas paginas

En app.js

despues de
app.get(‘/‘, (req, res) => {
	res.status(200).render (‘base’, {
		tour: ‘The Forest Hiker’,
		user: ‘Abdelito’
	});
});

app.get(‘/overview’, (req, res) => {
	res.status(200).render(‘overview’, {
		title: ‘All Tours’
	});
});

Como overview.pug no existe, lo creo en el folder views


app.get(‘/tour’, (req, res) => {
	res.status(200).render(‘tour’, {
		title: ‘The Forest Hiker’
	});
});


Como tour.pug no existe, lo creo en el folder views

*/


///////////////////////////////////////////////////////////////////
// Lecture-222 Preparing Our App for Deployment
///////////////////////////////////////////////////////////////////

/*


Hay un par de cosas antes del Deployment. Primero voy a instalar un package que 
va a comprimir todas las responses, es decir cada vez que envie un text response a 
un CLient sin importar si es JSON o HTML con el compression package, ese texto 
sera reducido dramaticamente. En la terminal

	npm i compression

Luego lo incluyo en app.js


En app.js

const compression = require (‘compression’);

Esto me dara un Middleware function muy sencillo al que solo me tengo que conectar 
en el Middleware stack. No importa el lugar donde lo ponga, antes del Test Middleware

// compression() regresara un Middleware function que hara la compresion a los textos que se envien al CLient, esto no funcionara para imagenes, porque genralmente ya estan comprimidas. Una vez que el website este deployed voy a probar si la compresion funciona
app.use (compression());

El siguiente paso antes del Deployment es quitar la mayoria de los console.log y 
esto es porque estos console.logs se quedaran en la Hosting Platform logs, y no 
quiero contaminar Produccion con estos logs

Asi que busco en todo el proyecto por console

En errorController.js
Solo dejo los que mandan un mensaje de ERROR que puse especialmente para eso

En import-dev-data.js
Tambien el que dice que la DB Connection successful

En tourModel.js

Quitar donde dice Query took milisconds


Ahora voy a cambiar los URLs en las llamadas de APIs en el Client Side Javascript

En /public/js

En login.js

Donde dice 127.0.0.1:8000 es un localhost para Develooment pero en Production necesito 
un url real
Entonces si borro esa parte y solo dejo /api/v1/users/login me queda este 
relative path y ya que el API y el website estan hosted en el mismo server esto 
va a funcionar perfecto, hacerlo asi el relative path es como especificar las 
imagenes en el HTML, por ejemplo en overview.pug tengo /img/tours/ y eso ira al 
current Url

En stripe.js

Tamnbien tengo 127.0.0.1:8000

En updateSettings.js

Tambien lo modifico


Por ultimo necesito crear el Bundle Final!, porque hasta ahora he usado el

	npm run watch:js
Este no tiene compresion, ni mejora de performance

Ahora ejecuto el
	npm run build:js

Te pueden salir muchos archivos nuevos en VSCode en Git y es porque son creados por 
Parcel_cache, pero NO quiero ese folder en el Git Repository, entonces lo agrego 
a .gitignore

	.parcel-cache/

Veras que en cuanto grabo el .gitignore con este nueva excepcion se borran de 
VSCode Git esos archvos cache

AHORA SI LA APP ESTA LISTA PARA SER DEPLOYED!

EL ULTIMO PASO es darle commit todos estos archivos modificados a nuestro repository

	git add -A

	git commit -m “Prepared App for Deployment”

Ahora se dice que la current working Branch esta clean

*/



///////////////////////////////////////////////////////////////////
// Lecture-226 Implementing CORS
///////////////////////////////////////////////////////////////////

/*


Implementar CORS Cross Origin Resource Sharing

Esta es una funcionalidad fundamental de cualquier API, pero solo te la puedo mostrar 
ya que la App ha sido deployed

Que es CORS y porque necesito implementarla?
Digamos que tengo mi API en natours-acero.herokuapp.com/app/v1 …. y luegootro website 
por ejemplo en example.com quiere accesar mi API y a esto se le llama un 
Cross Origin Request porque heroku-app.com es un dominio diferente a example.com y 
si example.com quiere accesarlo es un Cross Origin Request

Por default Cross Origin Request no son permitidos y por default falllaran, a menos 
que implemente CORS y ya que quiero que mis APIs sean accesibles par todos, necesito 
implementar esto

Asi es como fallaria

Hare un HTTP request a mi API
En una ventana nueva en Chrome abro la console, porque si lo hago por aqui tambien 
sera un Cross Origin Request	

fetch es una function similar a Axios, pero es Javascript nativo en el browser

const x = await fetch ('https://natours-acero.herokuapp.com/api/v1/tours')

me deberia mandar mensaje de ERROR! aunque no lo mande de:

Access to fetch  at ‘https://natours-acero.herokuapp.com/api/v1/tours' from origin 
‘chrome-extension://uihkhkuhhih' has been blocked by 
CORS policy: No ‘Access-Control-Allow-Origin’ header is present on the requests 
source. If an opaque response serves your needs, set the request’s mode to ‘no-cors’ 
to fetch the resource with CORS disabled

Uncaught TypeError: Failed to fetch

Este error solo aplica en requests hechos por el browser, por ejemplo usando fetch 
o axios, pero desde el server si podremos hacer cross origin requests, solo hay 
problema en el browser por razones de seguridad, para ser cross-origin el request 
debe venir de otro domain, perotambien un diferente sub-domain, diferente protocolo 
o un port diferente se considera cross-origin request

Por ejemplo un request de
	api.natours.com a natrours.com
tambien se considera cross origin request y fallaria

Pero ya que quiero que otros websites accedan a mis APIs es la razon que voy a 
implementar Cross Origin Resource Sharin CORS

Para eso instalo un npm package llamado cors

	npm i cors

En app.js

	const cors = require (‘cors’);

cors es un Middleware muy simple

Lo pongo al inicio de los Middlewares

// 1. GLOBAL MIDDLEWARES

// Implement CORS
// esto regresa un Middleware function que agregara unos headers a la response, y pensara para que uso otro package nomas para esto?
// pues busca en google github cors
// ve a su pagina en la carpeta /lib/index.js
// agrega este header:  key: Access-Control-Allow-Origin
// value: *
// esto significa todos los requests sin importar de donde vienen 
// entre otros mas headers
// en vez de hacerlo a mano y querer reinventar la rueda mejor uso packages ya listos
// con esto ya permito Cross Origin Sharing para todas las incoming requests, osea todas mis APIs
// del proyecto
app.use(cors());

// pero digamos que solo quiero permitir cors en una route especifica, lo haria asi

// app.use('/api/v1/tours', cors(), tourRouter);

// Ahora imagina el caso donde NO quiero compartir mis API, pero quiero que el API este en un domain  o un sub-domain y mi front-end App en un domain diferente

// Por ejemplo tengo mis APIS en api.natours.com
// Y mi front-end esta en natours.com
// y lo que quiero es tener acceso desde natours.com
// entonces haria

*/


/*

podria agregar mas origins, algunos websites especificos

app.use (cors ({
	origin: ‘https://ww.natours.com'
});

*/


/*
Esta es la primera parte de permitir CORS, porque esto solo funciona para requests 
simples y estos son: get y post, por otro lado estan los non-simple-requests osea 
put. patch, delete, tambien requests que mandan cookies o que usan 
non-standard headers, y estos non-simple requests necesitan algo llamado 
preflight phase. Asi que siempre haya un non-simple request el browser 
automaticamente mandara la preflight phase  y asi funciona:

Antes de que el request verdadero suceda, por ejemplo un delete request, 
el browser primero hace un options request para darse cuenta si el request 
verdadero es seguro de mandar, lo que significa para el desarrollador es que en 
nuestro server necesito responder a ese options request, y este options es solo 
otro HTTP method como un get, post, delete, etc

Asi que cuando reciba uno de esos opttions requests en mi server, necesito enviar 
de regreso al Client el mismo Access-Control-Allow-Origin header, e esta forma el 
browser sabra que el request verdadero, en este caso el delete request, es seguro 
de ejecutar y asi que lo ejecuta

// como dije es muy similar a app.get o app.post , etc
// asi que defino la route a la cual quiero manejar las options, y lo quiero para 
// todas las routes
// asi que le pongo *
// luego el handler, osea el cors middleware

app.options (‘*’, cors());

// y por supuesto podria permitir estos requests complejos solo en en routes 
// especificos, ejemplo:
// asi que si alguien hace un delete o patch en un tour y solo ahi permito 
// preflight phase recuerda que esto es solo para websites, subdomains, domains 
// que vengan de otro lado de donde originalmente estan mis APIs
// app.options(‘/api/v1/tours/:id’, cors());

Y eso es todo para permitir CORS en mi App

Ahora quiero cambiar algo en package.json

En package.json

A veces puede crear problemas si especifico la version asi

"engines": {
    "node": ">=10.0.0"
  }


asi que la cambio a 
que solo instale version 10 y no mas alla

"engines": {
    "node": "10.0.0"
  }

Yo tengo la version de node
v16.15.0

igual puedo dejar esta

"engines": {
    "node": "16.0.0”
  }


AHORA SI HAGO REDEPLOY
Asi que vuelvo a actualizar todo a Git y a subir a Heroku, redeploy

	git add -A
	git commit -m “Implemented CORS”

	git push heroku master

La App ya se subio exitosamente

Voy a Chrome y a la pagina le doy reload para ver que siga funcionando

Para probar que funciona diferente con CORS hago este request de nuevo en el Browser y en Inspect -> Console

const x = await fetch ('https://natours-acero.herokuapp.com/api/v1/tours')

x
	Response

Y YA NO ME MARCA ERROR Y SI ME MANDA LA INFORMACION


YA PUEDO HACER CROSS ORIGIN REQUESTS!!!

Ahora muestros los headers que el CORS package agrega, voy a POSTMAN

Voy Natours: Prod

En /Get All Tours

{
EXITO
}

En headers veo
	Access-Control-Allow-Origin = *


*/