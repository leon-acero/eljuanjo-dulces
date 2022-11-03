console.log('Hello from parcel!');

import { login } from './login';

if (document.querySelector('.form')) {
  document.querySelector('.form').addEventListener('submit', e => {
    // con esto prevengo que la form cargue otra pagina
    e.preventDefault();

    // de login.pug obtengo los datos del #email y #password
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login (email, password);

  });
}