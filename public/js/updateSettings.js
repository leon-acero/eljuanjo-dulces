///////////////////////////////////////////////////////////////////
// Lecture-196 Updating User Data with Our API
///////////////////////////////////////////////////////////////////

/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

/*
export const updateUserSettings = async (name, email) => {

  try {
    const res = await axios ({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/updateMe',
      data: {
        name: name,
        email: email
      }
    });

    if (res.data.status === 'success'){
        showAlert('success', 'User account successfully updated');
        window.setTimeout ( () =>{
          location.reload(true);
        }, 1500);
    }
  }
  catch(err) {
    showAlert ('error', err.response.data.message);
  }
}
*/


///////////////////////////////////////////////////////////////////
// Lecture-197 Updating User Password with Our API
///////////////////////////////////////////////////////////////////

/*

Vamos a usar el API para actualizar el password del User


En updateSettings.js 

Aqui ya tengo la function llamada 
      export const updateUserSettings = async (name, email) => {


la cual voy a modificar para que sirva para actualizar los datos del User o su password ,
y en vez de pasarle name y email, le pasare un objeto  que tenga los datos que quiero 
actualizar y un string para el type que puede ser “data” o “password”

*/


// type que puede ser “data” o “password”
export const updateUserSettings = async (data, type) => {

  // recuerda que si actualizo el password usare otro url
  try {
    const url = type === 'data' 
              // Este url es para Development
              // ? 'http://127.0.0.1:8000/api/v1/users/updateMe' 
              // : 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'; 
              // Este url es para Production
              ? '/api/v1/users/updateMe' 
              : '/api/v1/users/updateMyPassword'; 
    const res = await axios ({
      method: 'PATCH',
      url: url,
      data: data
    });

    // ESTE CODIGO SI FUNCIONA yo lo puse, pero lo comentarizo porque Jonas hizo
    // una correcion a su codigo para que los inputs de Current Password, New Password
    // y Confirm Password se vacien despues de dar Save Settings
    // Yo no tuve que hacerlo porque con este codigo que estoy comentarizando
    // hago un reload a la pagina, pero voy a probar la solucion de Jonas
    if (res.data.status === 'success'){
        showAlert('success', `${type.toUpperCase()} updated successfully`);
        // window.setTimeout ( () =>{
        //   location.reload(true);
        // }, 1500);
    }
  }
  catch(err) {
    showAlert ('error', err.response.data.message);
  }
}

/*
En index.js


if (accountForm) {
  accountForm.addEventListener('submit', e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    // de login.pug obtengo los datos del #email y #password
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateUserSettings ({ name, email }, ‘data’);

  });
}


Vuelvo a Probar en Chrome en la pagina de 127.0.0.1:8000/me

Modifico el name y el email

Y me regresa EXITO!

Ahora necesito leer los datos del Current Password, New Password y Confirm Password y 
pasarlos al UpdateUserSettings

En account.pug
DE aqui saco los datos de los passwords

La Form del Password
form-user-password

Current Password
password-current

New Password
password

Confirm Password
password-confirm

En index.js

const userPasswordForm = document.querySelector('.form-user-password’);


if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    // de login.pug obtengo los datos del #email y #password
    const passwordCurrent = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    updateUserSettings ({passwordCurrent, newPassword, passwordConfirm }, ‘password’);

  });
}

Voy a POSTMAN para checar los nombres de las variables que uso ahi y que de hecho 
tambien uso en authController.js en la function exports.updateMyPassword

{
	"oldPassword": "xxx",
	"newPassword": "newpass123",
	"confirmNewPassword": "newpass123"
}

asi que 
passwordCurrent = oldPassword
newPassword = newPassword
passwordConfirm = confirmNewPassword

Asi que lo mejor es que todas se llamen igual, como POSTMAN fue primero lo dejo como 
POSTMAN

    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmNewPassword = document.getElementById('password-confirm').value;

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    // de login.pug obtengo los datos del #email y #password
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmNewPassword = document.getElementById('password-confirm').value;

    updateUserSettings ({oldPassword, newPassword, confirmNewPassword }, ‘password’);

  });
}

Vuelvo a Probar en Chrome en la pagina de 127.0.0.1:8000/me a cambiar el password

EXITO!

Checo la cookie porque debo haber recibido una nueva, checo la fecha de expiracion y 
de creacion

Esto es porque despues cambiar el password me envia el server un nuevo JSON Web Token 
y quiere decir que aun estoy loggeado

Ahora abro una nueva Tab en Chrome

Aun tengo los passwords en la Form y no quiero eso, asi que despues de que la llamada 
al API fue exitosa debo borrar el contenido de los inputs sin embargo yo recargo la 
pagina y Jonas no, asi que no creo que Yo tenga que hacer esto

Pero hare la solucion de Jonas pars ver como lo hace

Como updateUserSettings es un async / await Function entonces regresa una Promise, asi 
que puedo darle await  aqui en index.js y NO es para guardar el result de la Promise 
es solo para esperar hasta que termine para despues hacer otras cosas, en este caso es 
para limpiar los passwords inputs de la Form

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    // de login.pug obtengo los datos del #email y #password
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmNewPassword = document.getElementById('password-confirm').value;

    await updateUserSettings ({oldPassword, newPassword, confirmNewPassword }, ‘password’);

   document.getElementById('password-current').value = ‘’;
   document.getElementById('password').value = ‘’;
   document.getElementById('password-confirm').value = ‘’;
  });
}

Siguiendo con la correccion de Jonas para su codigo

En updateSettings.js

Comentarizo esto que yo puse y que SI funciona

export const updateUserSettings = async (data, type) => {


        window.setTimeout ( () =>{
          location.reload(true);
        }, 1500);
 
Voy y lo pruebo en Chrome

EXITO

Ahora quiero darle al User un mensaje de que estoy actulizando el password porque 
debido al encriptado se tarda un poco asi que en el boton de Save Passwoird le pondre 
un mensaje

En account.pug

Le agrego btn--save-password
	button.btn.btn--small.btn--green.btn--save-password Save password


En index.js

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

   document.querySelector (‘.btn--save-password’).innerHTML = ‘Updating…’;

    // de login.pug obtengo los datos del #email y #password
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmNewPassword = document.getElementById('password-confirm').value;

    await updateUserSettings ({oldPassword, newPassword, confirmNewPassword }, ‘password’);

   document.querySelector (‘.btn--save-password’).textContent = ‘Save password’;
   document.getElementById('password-current').value = ‘’;
   document.getElementById('password').value = ‘’;
   document.getElementById('password-confirm').value = ‘’;
  });
}

*/