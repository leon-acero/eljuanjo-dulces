///////////////////////////////////////////////////////////////////
// Lecture-191 Logging in Users with Our API - Part 3
///////////////////////////////////////////////////////////////////

/* eslint-disable */

/*

Una bonita alerta cuando el user se loggea exitosamente

En un archivo nuevo alerts.js en public/js

En alerts.js

Primero pensemos en nuestra front-end architecture porque esto

	script(src=‘https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js')
	script(src’=/js/login.js’)
	script(src=‘/js/leaflet.js’)

NO ES UNA BUENA PRACTICA

Solo debemos tener un archivo grande de Javascript que incluya todo el codigo, por eso 
usamos un module bundler y el mas popular es Webpack, pero da muchos problemas y 
es dificil de configurar, asi que usare algo nuevo que se llama Parcel

	parceljs.org
Blazing fast, zero configuration web app bundler

En la Terminal
	npm i parcel --save-dev


Para usar Parcel necesito agregar unos scripts en package.json

	"build:js": "parcel build ./public/js/index.js --dist-dir ./public/js/bundled",
	"watch:js": "parcel watch --no-hmr ./public/js/index.js --dist-dir ./public/js/bundled"
 

Ahora creo el archivo index.js en el folder /public/js

En index.js
	console.log(‘Hello from parcel!’);

En base.pug

Comentarizo

	//- script(src=‘https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js')
	//- script(src’=/js/login.js’)
	//- script(src=‘/js/leaflet.js’)

	script(src=‘/js/bundle.js’)

En la Terminal
	npm run watch:js

Y me crea el archivo bundle.js en el folder /public/js

Voy a Chrome recargo la pagina me manda
	Hello fron parcel!

Ahora voy a configurar index.js

En index.js

Este archivo es el de entrada, aqui no puedo obtener datos del user interface asi que 
delego acciones a unas functions que estan en otros modules como login.js, alerts.js , 
igual que en NodeJS puedo exportar datos de estos modulos



En login.js


Quiero exportar const login = async (email, password) =>

La exportacion es diferente del front-end al back-end (NodeJS), porque NodeJS usa algo 
llamado CommonJS para implementar modules, pero en front-end Javascript desde ES2015 o 
ES6 hay algo llamado modules in Javascript, la sintaxis es diferente pero por debajo 
del agua es lo mismo
*/

/* eslint-disable */

/*
import axios from ‘axios’

Agrego export al inicio	

export const login = async (email, password) =>
	try {
	
		const  res = await axios({
			method: ‘POST’,
			// login end point
			url: ‘http://127.0.0.1:8000/api/v1/users/login’,
			// el data que envio junto con el request
			data: {
……




En index.js

Ahora el siguiente codigo, Lo pondre en index.js
Recuerda que index.js lo uso para obtener informacion del User Interface y luego d
elegar la accion

En front¡end uso import en vez de require, luego la variable que quiero importar , 
entre {} el nombre de la variable y luego from ‘nombre del archivo sin .js’

Esta es una forma de exportar
*/

/* eslint-disable */

/*
import { login } from ‘./login’;

document.querySelector(‘.form’).addEventListener(‘submit’, e => {
	// con esto prevengo que la form cargue otra pagina
	e.preventDefault();

	// de login.pug obtengo los datos del #email y #password
	const email = document.getElementById(‘email’).value;
	const password = document.getElementById(‘password’).value;

	login (email, password);

});



La segunda forma de exportar parecida a module.exports , que es el export default, 
en ES6 modules se le llama default export, en ese caso no usaria los 
curly braces { login }

Una cosa muy importante en este login es que usa Axios y recuerda que dije que lo 
instalaria con npm en la Terminal, de hecho es necesario porque ya lo comentarice 
en base.pug, por lo que en este momento login NO puede usar Axios

	npm i axios

Ahora solo necesito hacer

En login.js

import axios from ‘axios’

ERRORES
Me marca siguiente Error 
	Uncaught Error: Cannot find module ‘axios’

Este me sirvio para quitar el error:
En package.json
	 "browserslist": "> 0.5%, last 2 versions, not dead",


Al instalar con npm i axios y comentarizar en base.pug

En base.pug
	script(src=‘https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js')


Al cargar la pagina en Chrome, me marco el siguiente Error
	Parsing error: 'import' and 'export' may appear only with 'sourceType: module'

Lo arregle modificando .eslintrc.json

En .eslintrc.json

  },
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
    "allowImportExportEverywhere": true
  }




Tambien necesito instalar un polyfill que hara algunas de las nuevas funcionalidad de 
Javascript  trabahen en browsers mas viejos, en la Terminal

	npm i regenerator-runtime

En index.js

esto no se guarda en ninguna variable
	import ‘regenerator-runtime/runtime’;

Ahora importo el mapbox/leaflet tambien y para eso necesito crear una function

En mapbox.js o leaflet.js

Recuerda que index.js es para obtener datos del User Interface y delegar acciones a 
otros modulos

Muevo las siguientes dos lineas a index.js
locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log

export const displayMap = (locations) => {

  const map = L.map('map', { zoomControl: false });

  // ----------------------------------------------
  // Add a tile layer to add to our map
  // ----------------------------------------------
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

  // ----------------------------------------------
  // Create icon using the image provided by Jonas
  // ----------------------------------------------
  
  var greenIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [32, 40], // size of the icon
    iconAnchor: [16, 45], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -50], // point from which the popup should open relative to the iconAnchor
  });

  // ----------------------------------------------
  // Add locations to the map
  // ----------------------------------------------
  
  const points = [];
  locations.forEach(loc => {
    // Create points
    points.push([loc.coordinates[1], loc.coordinates[0]]);
  
    // Add markers
    L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: greenIcon })
      .addTo(map)
      // Add popup
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
        className: 'mapPopup',
      })
      .openPopup();
  });

  // ----------------------------------------------
  // Set map bounds to include current location
  // ----------------------------------------------
  
  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);
  
  // Disable scroll on map
  map.scrollWheelZoom.disable();

}


En index.js
*/

/* eslint-disable */

/*
import ‘regenerator-runtime/runtime’;
import { displayMap } from ‘./leaflet’;
import { login } from ‘./login’;


// DOM ELEMENTS
const leaflet = document.getElementById('map’);
const loginForm = document.querySelector(‘.form’);


// DELEGATION
if (leaflet) {
	const locations = JSON.parse(leaflet.dataset.locations);
	console.log (locations);

	displayMap(locations);
}

if (loginForm) {
	loginForm .addEventListener(‘submit’, e => {
		// con esto prevengo que la form cargue otra pagina
		e.preventDefault();

		// de login.pug obtengo los datos del #email y #password
		const email = document.getElementById(‘email’).value;
		const password = document.getElementById(‘password’).value;

		login (email, password);

	});
}


Voy a Chome me loggeo

admin@natours.io
test1234

ME LOGGEO!


En alerts.js

*/


/* eslint-disable */


// type is success or error

// esto crea una alerta muy simple
// export const showAlert = (type, msg) => {

// 	// Primero oculto todas las alertas que ya existan
// 	hideAlert ();
	
// 	const markup = `<div class="alert alert--${type}">${msg}</div>`;
// 	document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

// 	// escondo las alertas despues de 5 segundos
// 	window.setTimeout (hideAlert, 5000);
// }


///////////////////////////////////////////////////////////////////
// Lecture-227 Finishing Payments with Stripe Webhooks
///////////////////////////////////////////////////////////////////

export const showAlert = (type, msg, time = 7) => {

	// Primero oculto todas las alertas que ya existan
	hideAlert ();
	
	const markup = `<div class="alert alert--${type}">${msg}</div>`;
	document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

	// escondo las alertas despues de 5 segundos
	window.setTimeout (hideAlert, time * 1000);
}


// tambien quiero una function para ocultar alerts

export const hideAlert = () => {

	const el = document.querySelector('.alert');

	if (el) {
		el.parentElement.removeChild(el);
	}
}
/*
En login.js

import { showAlert } from ‘./alerts’

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

		if (res.data.status === ‘success’) {
			showAlert (‘success’, ‘Logged in succesfully!’);
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
			showAlert(‘error’, err.response.data.message);
		}
}

Voy a Chrome

Me loggeo con password equivocado
admin@natours.io
test12345

Me manda ERROR

Me loggeo con password correcto
admin@natours.io
test1234

ME LOGGEO!

PARCEL / BUNDLE - 
AXIOS - import error
BABEL/POLYFILL - deprecated errors
ESLINT errors

HAY ERRORES EN ESTA LECCION / LOS CUALES YA ARREGLE!!!!
Posibles Soluciones

Usar Webpack en vez de Parcel para hacer el Bundle
Hacer un downgrade de NodeJS de la version actual a 14, ver preguntas y respuestas (NO)
ESLINT para encontrar bugs en NODEJS
package.json, como se crea? npm init
npm

== 

1. Parcel es para hacer Bundles, Igual que Webpack

2. Babel/Polyfill es para hacer compatible codigo de ES6 / ES 2015 en Browsers viejos, 
convirtiendo ese codigo de ES6 en código antiguo que pueda ser usado en dichos 
browsers viejos

3. ESLint se usa para encontrar errores en NodeJS

4. Axios se usa para hacer HTTP request desde el Client

5. Webpack se usa para hacer el codigo Modular usando import y export y tambien usando 
Webpack luego se hace un Bundle de todos esos archivos

Ahora para el problema de babel/polyfill voy a usar core-js/stable y 
regenerator-runtime/runtime y para eso en la terminal instalo

	npm i regenerator-runtime

En index.js
	import ‘regenerator-runtime/runtime’;

*/