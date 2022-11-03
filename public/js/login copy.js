///////////////////////////////////////////////////////////////////
// Lecture-189 Logging in Users with Our API - Part 1
///////////////////////////////////////////////////////////////////

/* eslint-disable */


/*


Vamos a hacer que haya interaccion entre el front-end y back-end

Vamos a permitir que users se loggen al website haciendo un HTTP request, osea un 
AJAX call y voy a hacer esa HTTP request al Login API end point que implemente 
anteriormente usando los datos que el User da en el form de Login

Recuerda que el API mandara una cookie al Client que automaticamente se guarda en el 
browser, y que automaticamente se envia al server cada vez que haya un request 
subsecuente. Esto es fundamental para que la Authentication funcione

Como voy a hacer este HTTP request en el browser seguire trabajando en el Client side

Creo un nuevo archivo llamado login.js en el folder public/js

En la proxima leccion voy a hacer un bundle de los archivos de Javascript del front-end 

El login form (login.pug) tiene una class llamada form
	form.form

En login.js
*/


const login = async (email, password) => {
	// console.log(email, password);

/*
	Para usar el HTTP request para el login voy a usar una libreria muy popular llamada 
  Axios, en la proxima leccion voy a bajar esta libreria usando npm desde la Terminal 
  y hacer un bundle con todos los scripts, pwero por ahora usare Axios desde CDN , 
  busco Axios CDN en google

	https://cdnjs.com/libraries/axios
	https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js pego esto en 
  base.pug

En base.pug
	al final
	script(src=‘https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js');
*/

	// axios regresa una Promise asi que necesito usar async / await
	// este es codigo de Client y solo los browsers mas modernos soportan async / await 
  // asi que cuidado

	// algo bueno de axios es que manda un error si hay el API request nos manda un error, 
  // por ejemplo si el password es incorrecto manda un estatis 403, y es muy util 
  // porque asi puedo usar try-catch

	try {
	
    // aqui hago el request
		// te dire como mandar datos directamente desde un HTML Form a nuestra Node App
		// Hay dos formas una es usando un HTTP Request como lo hago aqui y la otra es
		// Usar directamente la HTML Form, tambien es muy importante, lo dire mas tarde

		const  res = await axios({
			method: 'POST',
			// login end point
			url: 'http://127.0.0.1:8000/api/v1/users/login',
			// el data que envio junto con el request
			data: {
				// el endpoint espera una property llamada email y otra llamada password 
        // pero como las variables que envio se llaman igual puedo dejarlas simplemente como email, password
				email : email,
				password : password
			}		
		});

		if (res.data.status === 'success') {
			alert ('Logged in succesfully!');
			// volver a cargar la home page despues de 1.5 segundos
			window.setTimeout ( () =>{
				// para cargar otra pagina pongo
				location.assign('/');
			}, 1500);
		}    

		// console.log(res);
		}
		catch (err) {
			// console.log(err);
			// del Axios documentation me pide que ponga esto
			// me manda el error que el API manda desde e server, justo como si fuera en POSTMAN
			// console.log(err.response.data);
			alert(err.response.data.message);
		}
}

// cada vez que el user de click en el submit button de una form

if (document.querySelector('.form'))
{
  document.querySelector('.form').addEventListener('submit', e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    // de login.pug obtengo los datos del #email y #password
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login (email, password);

  });
}
/*
En base.pug

al final
	script(src’=/js/login.js’);

Para mejorar el performance hare un bundle luego

Voy y pruebo en Chrome, en la form de Login

email address: admin@natours.io
password: test1234xx

me manda un error en Console
	POST ‘http://127.0.0.1:8000/api/v1/users/login  400 BAD REQUEST , 401
	Incorrect email or password


email address: admin@natours.io
password: test123

EXITO
Status 201


En res.data me manda la informacion del response
	status: 200 OK
	token (JWT)
	headers

Ahora checo la cookie y la puedo ver en Chrom dando click en el icono al lado izquierdo 
del URL

Esta cookie es la que nos permitira construir la Authentication, porque el browser
mandara esta cookie al server junto con los requests subsecuentes y te lo  mostrare 
en el back-end

En app.js

De vuelta en NodeJS o mas bien Express
Para tener acceso a las cookies que estan en el request que son mandadas por el Client, 
en Express necesito instalar un Middleware, desde la Terminal

	npm i cookie-parser

const cookieParser = require (‘cookie-parser’);

y lo implemento cerca del body parser

// BODY PARSER, READING DATA FROM THE BODY INTO req.body
// Aqui puedo implementar otra medida de seguridad en el que limito la cantidad de datos 
// que estan en el Body, si recibo un Body de mas de 10kb el Body NO sera aceptado
app.use(express.json( { limit: ’10kb’ } ));

// ambos son muy similares, la linea de arriba parses el data del body
// la linea de abajo parser el data de las cookies

app.use(cookieParser());


ahora en test middleware pued usar
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  // console.log(req.headers);
  console.log(req.cookies);
  next();
});

Y ahora puedo usar la cookie que manda el browser al server para proteger la route

En authController.js

Hasta ahora solo estoy leyendo el JSON Web Token (JWT) del 
Authorization Header -> Bearer Token pero ahora tambien quiero leer el 
JSON Web Token de la cookie, asi que hago un else if

Y asi es como puedo Authenticate Users basado en tokens enviados en cookies y no 
solo en el Authorization header



exports.protect = catchAsync(async (req, res, next) => {

	// 1. Get the JWT(token) and check if it’s there, if it exists in the Headers

	let token;

	if (req.headers.authorization && 
	    req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}
	else if (req.cookies.jwt) {
		token = req.cookies.jwt; 
	}
	

	if (!token) {
		return next (new AppError('You are not logged in. Please log in to get access', 401));
	}


	// 2. Verification of the token, JWT algorithm verifies if the signature is valid

	const decodedData =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);


	// 3. Check if the User who’s trying to access the Route still exists

	const currentUser = await User.findById(decodedData.id);

	if (!currentUser) {
		return next (new AppError('The User belonging to this token does no longer exists', 401));
	}


	// 4. Check if the User changed the password after the JWT(token) was issued
	
	if (currentUser.changedPasswordAfter(decodedData.iat)) {
		return next (new AppError('User recently changed password! Please log in again', 401));
	}

	// Solo si NO hubo problemas en los pasos previos se llamara a next() lo cual dara acceso
	// a la Protected Route

	// Poner el User data en el request y luego doy Acceso
	req.user = currentUser;

	// Solo si NO hubo problemas en los pasos previos se llamara a next() lo cual 
	// dara acceso a la Protected Route
	next();

});

AHORA PARA PROBARLO LAS COOKIES, vamos a proteger una de las routes en los views, osea 

En viewRoutes.js

const authController = require (‘../controllers/authController’);

router.get(‘/tour/:slug’, authController.protect, viewController.getTour);


Ahora para AHORA SI PROBAR, necesito borrar la cookie para mostrar que pasa cuando un 
User no loggeado trata de accesar la route ‘/tour/:slug’

Voy de nuevo a Chrome en el icono a lado del URL y ahi borro la cookie, y es como 
logging out

En Chrome voy a All Tours y luego selecciono un Tour

Manda ERROR de que no estoy loggeado

Ahora me loggeo y vuelvo a intentar

EXITO!!

Ahora idealmente cuando el User esta loggeado no debo mostrar los botones de 
Log in ni Sign Up sino un menu o la foto del User, hare eso en la proxima leccion y 
tambien hare un bundle de los archivos de Javascript

*/