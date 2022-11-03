///////////////////////////////////////////////////////////////////
// Lecture-212 Processing Payments on the Front-End
///////////////////////////////////////////////////////////////////

/* eslint-disable */

/*

Como procesar el pago pagos con Stripe en el Front-End cuando el User da click a un 
Boton de Compra

Y para empezar voy a hacer que ese Boton de Compra solo aparezca cuando el User esta 
loggeado
En el tour detail page, hay un boton que dice

	Book Tour Now

Y si no esta loggeado que me dirija al login page

Necesito cambiar de que pueda ver el Detalle de un Tour sin estar loggeado, porque 
ahorita lo tengo como .protect

En el folder /views en tour.pug



En tour.pug

block append head
link(rel='stylesheet' href='https://unpkg.com/leaflet@1.8.0/dist/leaflet.css'
   integrity='sha512-hoalWLoI8r4UszCkZ5kL8vayOGVae1oxXe/2A4AO6J9+580uKHDO3JdHb7NzwwzK5xr/Fs0W40kiNHxM9vyTtQ==' crossorigin='')
   
  script(src="https://unpkg.com/leaflet@1.8.0/dist/leaflet.js"
   integrity="sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ=="
   crossorigin="")

    //- Esto me da un Stripe object al Global Scope
    script(src=‘https://js.stripe.com/v3/‘)


El script que necesito lo saco de la Documentacin

  section.section-cta
    .cta
      .cta__img.cta__img--logo
        img(src='/img/logo-white.png', alt='Natours logo')
      img.cta__img.cta__img--1(src='/img/tours/tour-5-2.jpg', alt='')
      img.cta__img.cta__img--2(src='/img/tours/tour-5-1.jpg', alt='')
      .cta__content
        h2.heading-secondary What are you waiting for?
        p.cta__text 10 days. 1 adventure. Infinite memories. Make it yours today!

	//- Si actualmente esta loggeado un User, significa que tengo acceso al User variable
	if user
		//- necesito agregar un ID llamado #book-tour para seleccionarlo con Javascript
		//- y algo muy importante es el current Tour Id, y para que? recuerda como el API
		//- end point /checkout-session/:tourId necesita el tour Id
		//- y por eso lo pongo aqui para que el archivo de Javascript lo tome de aqui y lo mande 
		//- junto con el request a la Checkout-session route
		//- igual como lo hice en #map usare un data-attribute 
		//- #map(data-locations=`${JSON.stringify(tour.locations)}`)
        		a.btn.btn--green.span-all-rows#book-tour(data-tour-id=`${tour.id}`) Book tour now!
	else
		a.btn.btn--green.span-all-rows(href=‘/login’) Log in to book tour


Voy a Chrome en 127.0.0.1:8000/tour/the-sea-explorer

Le doy Inspect al Boton que acabo de modificar

Y SI esta data-tour-id= “89787978979879”

Ahora si le doy Log out y vuelvo a entrar a la misma pagina debe decir ese boton
	Log In to book tour

Me loggeo y vuelvo a 127.0.0.1:8000/tour/the-sea-explorer


Ahora creo un script donde hare el request y procesare el pago en e Front-End

Voy a /public/js y le llamare al archivo stripe.js



En stripe.js
*/

import axios from 'axios';
import { showAlert } from './alerts';


// Necesito acceso a la libreria stripe pero NO la misma que use en bookingController.js
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Porque esta SOLO funciona para el Back-End

// Y en el Front-End necsito incluir un script en el HTML, y como solo lo necesito 
// en el Tour Page Detail, lo hare igual que en el mapbox/leaflet script en tour.pug

// Aqu uso el Stripe Object, y pongo mi Public Key
// Mis keys estan en
// https://dashboard.stripe.com/test/apikeys


export const bookTour = async tourId => {
	const stripe = Stripe('pk_test_51LPTmTAOs4iWb6mMPTGPxSISCf1cbb5A2kyE4M1Q7lpHsXU6YfMnZDBgMAA9rmq8xQiGYTMcxp9KFChMuH0m6q5z00FsDcYnXD');

	try {
		// este Tour Id es el que viene de tour.pug

		// a.btn.btn--green.span-all-rows#book-tour(data-tour-id=`${tour.id}`) Book tour now!

		// 1. Obtengo la Stripe Checkout Session del server, ahi es donde uso el route /checkout-session/:tourId, aqui es donde use el end   para que el Client obtenga la Session

		// necesito mandar un HTTP request usando axios
		// si solo necesito hcer un GET solo paso el url, aqui no necsito especificar method ni el data
		// porque solo es un GET

		
		// Este url es para Development
		// const session = await axios( `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`);
		// Este url es para Production
		const session = await axios( `/api/v1/bookings/checkout-session/${tourId}`);

	  // console.log(session);

		// 2. Usar el Stripe Object para crear la Checkout Form y hacer el cargo a la tarjeta
		// Recuerda que axios crea el Object .data y es la response
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id
    });
	}
	catch (err)
	{
		console.log(err);
		showAlert('error', err);	
	}
}

/*
En index.js

Aqui conecto el boton del Tour Page Detail con la function de stripe.js

import { bookTour } from ‘./stripe’;

const bookTourBtn = document.getElementById(book-tour);

if (bookTourBtn) {
	bookTourBtn.addEventListener(‘click’, e => {

		e.target.textContent = ‘Processing…’;

		// aqui obtengo el Tour Id del boton para eso use data-attributes
		// e.target es el elemento al que se le hizo click
		// como estoy usando los mismos nombres, osea el de la variable const
		// y el del data-attibute osea tourId, puede hacer Destructuring
		// const tourId = e.target.dataset.tourId;
		const tourId = e.target.dataset;

		bookTour (tourId);

		e.target.textContent = ‘Processing…’;

	});
}


Voy a probar en Chrome me loggeo como User Normal

	en  127.0.0.1:8000/the-sea-explorer

	le doy click a Book Tour Now

Le doy Inspect En la Console me regresa

You may test your Stripe.js  integration over HTPP

Object CON DATOS Y SI TENGO LA SESSION


Vuelvo a probar YA COMPLETO

Voy a probar en Chrome me loggeo como User Normal

	en  127.0.0.1:8000/the-sea-explorer

	le doy click a Book Tour Now

ME MANDA A LA PAGINA DE STRIPE!! LISTO PARA PAGAR EL TOUR! LA CHECKOUT PAGE

EN STRIPE cuando estoy probando la tarjeta de credito, el numero que pondre es
	4242 4242 4242 4242

Expiration: Cualquier mes y año
CVC: Cualquier numero
Name: Cualquier nombre
Country: El que quieras

Al pagar me manda a 127.0.0.1:8000/
osea la pagina de inicio que especifique como el success_url en bookingCotroller.js

Voy a Stripe.com
Y checo en Payments y debe decir EXITO!!

Si voy a Custimers tambien me debe de aparecer

El USer tambien recibira un email, puedes ver en Settings -> Email Receipts 
Y ahi veras sobre como stripe envia los correos al recibir un pago, Successful payments

Como Resumen

Cree la getCheckoutSession en bookingController.js
 
Que recibe como entrada osea parametro el tourId (req.params.tourId) para poder 
buscar el tour y su infoirmacion como name, price, slug, summary, imageCover, etc. 
informacion que quiero  mostrar en la Checkout Page  de Stripe pero tambien en el 
Dashbord de Stripe

Tambien mande el email, req.user.email para que el User no lo tenga que poner en el 
Checkout

El client_reference_id lo usare mas delante

Y esta session la creo siempre que un User use el Route /checkout-session/:tourId en 
el bookingRoute.js y esto pasa cuando el User en el website, le de click al 
Boton Book Tour Now, en el tour Detail Page y que luego llama a stripe.js, donde 
aqui creo una session y luego un redirectToCheckout y es donde hago el cargo a 
la Tarjeta

Y en stripe.js uso el tourId el cual viene de tour.pug justo en el boton donde el 
User le da click para dar Booking New Tour, el cual se manda primero a index.js, de 
ahi a stripe.js

LO QUE FALTA AQUI es que cuando hay un nuevo Booking quiero crear un Document en la 
MongoDB, y voy a crear el Bookings Model en la siguiente leccion, para crear 
nuevos Tours cuanga haya compras exitosas

*/