/* eslint-disable */

// console.log('Hello from parcel!');
import 'regenerator-runtime/runtime';
// import x from './login';
import { login, logout, signUp, forgotPassword, resetPassword } from './login';
import { displayMap } from './leaflet';
import { updateUserSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';


// console.log(`I imported ${x} from another module!`);

// DOM ELEMENTS
const formLogin           = document.querySelector ('.form--login');
const formSignUp          = document.querySelector ('.form--signup');
const formUserAccount     = document.querySelector ('.form-user-data');
const formUpdatePassword  = document.querySelector ('.form-user-password');
const formForgotPassword  = document.querySelector ('.form--forgot-password');
const formResetPassword   = document.querySelector ('.form--reset-password');

const mapBox              = document.getElementById('map');
const btnBookTour         = document.getElementById('book-tour');
const btnLogOut           = document.querySelector ('.nav__el--logout');


// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  // console.log(locations);

  displayMap(locations);
}

if (formLogin) {
  formLogin.addEventListener('submit', e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    // de login.pug obtengo los datos del #email y #password
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login (email, password);

  });
}

///////////////////////////////////////////////////////////////////
// Lecture-196 Updating User Data with Our API
///////////////////////////////////////////////////////////////////

// if (formUserAccount) {
//   formUserAccount.addEventListener('submit', e => {
//     // con esto prevengo que la form cargue otra pagina
//     e.preventDefault();

//     // de login.pug obtengo los datos del #email y #password
//     const name = document.getElementById('name').value;
//     const email = document.getElementById('email').value;
//     updateUserSettings (name, email);

//   });
// }

///////////////////////////////////////////////////////////////////
// Lecture-197 Updating User Password with Our API
///////////////////////////////////////////////////////////////////
// if (formUserAccount) {
//   formUserAccount.addEventListener('submit', e => {
//     // con esto prevengo que la form cargue otra pagina
//     e.preventDefault();

//     // de login.pug obtengo los datos del #email y #password
//     const name = document.getElementById('name').value;
//     const email = document.getElementById('email').value;
//     updateUserSettings ({ name, email }, 'data');

//   });
// }


/////////////////////////////////////////////////////////////////////////////////
// ESTE CODIGO SI FUNCIONA yo lo puse, pero lo comentarizo porque Jonas hizo
// una correcion a su codigo para que los inputs de Current Password, New Password
// y Confirm Password se vacien despues de dar Save Settings
// Yo no tuve que hacerlo porque con este codigo que estoy comentarizando
// hago un reload a la pagina, pero voy a probar la solucion de Jonas

// if (formUpdatePassword) {
//   formUpdatePassword.addEventListener('submit', e => {
//     // con esto prevengo que la form cargue otra pagina
//     e.preventDefault();

//     // de login.pug obtengo los datos del #email y #password
//     const oldPassword = document.getElementById('password-current').value;
//     const newPassword = document.getElementById('password').value;
//     const confirmNewPassword = document.getElementById('password-confirm').value;

//     updateUserSettings ({oldPassword, newPassword, confirmNewPassword }, 'password');

//   });
// }
/////////////////////////////////////////////////////////////////////////////////

if (formUpdatePassword) {
  formUpdatePassword.addEventListener('submit', async e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    document.querySelector ('.btn--save-password').innerHTML = 'Updating...';

    // de login.pug obtengo los datos del #email y #password
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmNewPassword = document.getElementById('password-confirm').value;

    await updateUserSettings ({oldPassword, newPassword, confirmNewPassword }, 'password');

    document.querySelector ('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}



///////////////////////////////////////////////////////////////////
// Lecture-192 Logging Out users
///////////////////////////////////////////////////////////////////

if (btnLogOut) {
  btnLogOut.addEventListener ('click', logout);
}


///////////////////////////////////////////////////////////////////
// Lecture-203 Adding Image Uploads to Form
///////////////////////////////////////////////////////////////////

/*

Ahora si voy a subir fotos desde la Form

El primer paso es agregar un nuevo input element al HTML, osea al account.pug template, 
que le permitira al file selector seleccionar el ardhivo

En /views/account.pug

Cambio esta linea
	a.btn-text(href='') Choose new photo

Por

Hay inputs para varios types de datos como: text, email. file, password
Para file e puedo especificar el tipo de archivo que acepto, en este caso todos los 
tipos de imagenes
El id es muy importante para poder seleccionarlo en Javascript
El name le puse photo porque es el nombre que le puse en userDocument.js Y TAMBIEN es 
el field name que multer esta esperando
	input.form__upload(type=‘file’, accept=‘image/*’, id=‘photo’, name=‘photo’)

En for le pongo el nombre del id del input element
La manera en que funciona esto es que cuando le de click al label va a activar el 
input element que tenga el ID que especifique en for, osea for=‘photo’ 
	label(for=‘photo’) Choose new photo

Igual que antes hay dos maneras de mandar los datos al server: 
1. SIN el API
	Si quisiera mandar el archivo con este metodo tendria que especificar otra opcion
	
		form.form.form-user-data(action=‘/submit-user-data’, method=‘POST’ 
                enctype=‘multipart/form-data’)

	Y de neuvo necesito el multer Middleware para manehar este multipart form data


2. CON el API
	Aqui especifico ‘multipart/form-data’ pero con codigo



En index.js
*/

if (formUserAccount) {

  const elemUpload = document.querySelector('.form__upload');
  const elemUserPhoto = document.querySelector('.form__user-photo');

  // Este código es para Actualizar la foto del User despues de que la seleccionó
  // Pero ANTES de darle Save Settings
  elemUpload.addEventListener('change', e => {
      const file = document.getElementById('photo').files[0];
      const reader = new FileReader();

      reader.onload = e => {
          elemUserPhoto.src = e.target.result;
      };

      reader.readAsDataURL(file);
  });

  // Este es el código cuando el User le da Save Settings
  formUserAccount.addEventListener('submit', async e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    // 
    document.querySelector ('.btn--save-settings').textContent = 'Updating...';
    
    // de login.pug obtengo los datos del #email y #password y #photo
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    // le pongo files[0] porque files es un Array y como solo mando una foto elijo 
    // el primer elemento
    form.append('photo', document.getElementById('photo').files[0]);

    // console.log(form);
    await updateUserSettings ( form, 'data');

    document.querySelector ('.btn--save-settings').textContent = 'Save Settings';
  });
}

/*

Voy a Chrome 127.0.0.1:8000/login me loggeo como aarav@example.com

Voy a 127.0.0.1:8000/Me y lo pruebo

Voy a poner la imagen original que tenia el User
	public/img/users/user-11.jpg

Le doy Save Settings

Me regresa EXITO!

No carga la foto inmediatamente, ni en la Form ni en el Header, pero lo hara cuando 
cargue la foto y podria hacerlo con Javascript pero eso es mucho trabajo

Ahora solo hago un reload manual al browser
Y LO HACE!

Voy a public/img/users a confirmar que se subio la foto
Y AHI ESTA

VUELVO a regresar la foto que tenia al inicio
	dev-data/img/aarav.jpg

Le doy inspect a la pagina
En console tengo FormData

*/


///////////////////////////////////////////////////////////////////
// Lecture-212 Processing Payments on the Front-End
///////////////////////////////////////////////////////////////////

if (btnBookTour) {
	btnBookTour.addEventListener('click', e => {

		e.target.textContent = 'Processing...';

		// aqui obtengo el Tour Id del boton para eso use data-attributes
		// e.target es el elemento al que se le hizo click
		// como estoy usando los mismos nombres, osea el de la variable const
		// y el del data-attibute osea tourId, puede hacer Destructuring
		const tourId = e.target.dataset.tourId;
		// const tourId = e.target.dataset;
		bookTour (tourId);

		// e.target.textContent = 'Book Tour Now';

	});
}


///////////////////////////////////////////////////////////////////
// Lecture-227 Finishing Payments with Stripe Webhooks
///////////////////////////////////////////////////////////////////
const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage)
	showAlert ('success', alertMessage, 15);



  if (formSignUp) {
    formSignUp.addEventListener('submit', e => {
      // con esto prevengo que la form cargue otra pagina
      e.preventDefault();
  
      // de login.pug obtengo los datos del #email y #password
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
  
      signUp (name, email, password, confirmPassword);
  
    });
  }


  if (formForgotPassword) {
    formForgotPassword.addEventListener('submit', e => {
      // con esto prevengo que la form cargue otra pagina
      e.preventDefault();
  
      // de login.pug obtengo los datos del #email y #password
      const email = document.getElementById('email').value;
  
      forgotPassword (email);
  
    });
  }


  if (formResetPassword)
  {
    const resetToken = document.querySelector('.form--reset-password').dataset.resetToken;

    formResetPassword.addEventListener('submit', e => {
      // con esto prevengo que la form cargue otra pagina
      e.preventDefault();
  
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
  
      resetPassword (password, confirmPassword, resetToken);
  
    });   
  }

