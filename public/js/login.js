///////////////////////////////////////////////////////////////////
// Lecture-189 Logging in Users with Our API - Part 1
///////////////////////////////////////////////////////////////////

/* eslint-disable */

// console.log('Imported module!');

import axios from 'axios';
import { showAlert } from './alerts';

// export default 99;


export const login = async (email, password) => {

	try {
	
		const  res = await axios({
			method: 'POST',
			// Este url es para Development
			// url: 'http://127.0.0.1:8000/api/v1/users/login',
			// Este url es para Production
			url: '/api/v1/users/login',
			data: {
				email : email,
				password : password
			}		
		});

		if (res.data.status === 'success') {
			// alert ('Logged in succesfully!');
			// Despues de se loggeo exitosamente que hago??
			// Se supone que hago un render a una pagina
			// Y SI lo que hago es location.assign('/');
			// que viene siendo que cargue la pagina inicial del website
			// osea http://127.0.0.1:8000/ o lo que es lo mismo
			// // osea http://127.0.0.1:8000/overview
			showAlert ('success', 'Logged in succesfully!');
			window.setTimeout ( () =>{
				location.assign('/');
			}, 1500);
		}    
	}
	catch (err) {
		// console.log(err);
		// del Axios documentation me pide que ponga esto
		// me manda el error que el API manda desde e server, justo como si fuera en POSTMAN
		// console.log(err.response.data);
		// alert(err.response.data.message);
		showAlert ('error', err.response.data.message);
	}
}



///////////////////////////////////////////////////////////////////
// Lecture-192 Logging Out users
///////////////////////////////////////////////////////////////////
export const logout = async () => {
	// no importa un try y catch pero aun asi lo pondre porque casi no es posible que 
	// haya un error aqui tal vez solo si no hay red 

	try {

		const res = await axios ({
			method: 'GET',
			// Este url es para Development
			// url: 'http://127.0.0.1:8000/api/v1/users/logout'
			// Este url es para Production
			url: '/api/v1/users/logout'
		});

		// recargo la pagina en automatico y lo hago aqui porque como este es un AJAX request
		// no lo puedo hacer en el back-end, osea no lo puedo hacer en Express
		// Al recargar la pagina la cookie invalida que recien me llego sera enviada al 
		// server y es asi como ya no estare loggeado ni podere ver paginas privadas y el 
		// menu del Usuario dira Log In y Sign Up
		if (res.data.status === 'success') {
			// Muy importante poner true porque eso fuerza una recarga de la pagina desde el
			// server y no del browser cache
			// location.reload(true);

			// location.assign('/');
			// espera 2 segundos y manda al HomePage
			// window.setTimeout ( () =>{
			// 	location.assign('/');
			// }, 2000);
			location.assign('/');
		}
	}
	catch (err) {
		showAlert ('error', 'Error logging out!. Try again.');
	}

}


export const signUp = async (name, email, password, confirmPassword) => {

	try {
		const  res = await axios({
			method: 'POST',
			// Este url es para Development
			// url: 'http://127.0.0.1:8000/api/v1/users/login',
			// Este url es para Production
			url: '/api/v1/users/signup',
			data: {
				name,
				email,
				password,
				confirmPassword
			}		
		});

		// console.log('res.data', res.data);
		// console.log('res.data.data', res.data.data);
		if (res.data.status === 'success') {
			// alert ('Logged in succesfully!');
			// Despues de se loggeo exitosamente que hago??
			// Se supone que hago un render a una pagina
			// Y SI lo que hago es location.assign('/');
			// que viene siendo que cargue la pagina inicial del website
			// osea http://127.0.0.1:8000/ o lo que es lo mismo
			// // osea http://127.0.0.1:8000/overview

			// console.log ('problemWitEmail', res.data.problemWithEmail);
			let timeout = 1500;
			if (!res.data.problemWithEmail)
				showAlert ('success', 'Your account was created succesfully!');
			else
			{
				showAlert ('success', 'Your account was created succesfully! However there was an error sending your Welcome Email, please contact: issues@natours.com');
				timeout = 7000;
			}
			window.setTimeout ( () =>{
				location.assign('/');
			}, timeout);
		}    
	}
	catch (err) {
		// console.log('error', err);
		// del Axios documentation me pide que ponga esto
		// me manda el error que el API manda desde e server, justo como si fuera en POSTMAN
		// console.log('err.response.data', err.response.data);
		// console.log('err.response.data.error.code', err.response.data.error.code);
		// console.log('err.response.data.message', err.response.data.message);

		// if (err.response.data.error.code &&  err.response.data.error.code === 11000)
		// {
		// 	showAlert ('error', 'Email address already exists in Natours. Try another one.');
		// }
		// else if (err.response.data.message === 'User validation failed: confirmPassword: Passwords are not the same')
		// {
		// 	showAlert ('error', 'Password and Confirm Password are not the same.');
		// }
		// else {
			// alert(err.response.data.message);
			showAlert ('error', err.response.data.message);
		// }
	}
}


export const forgotPassword = async (email) => {

	try {
		const  res = await axios({
			method: 'POST',
			// Este url es para Development
			// url: 'http://127.0.0.1:8000/api/v1/users/login',
			// Este url es para Production
			url: '/api/v1/users/forgotPassword',
			data: {
				email
			}		
		});

		if (res.data.status === 'success') {
			let timeout = 1500;
			if (!res.data.problemWithEmail)
				showAlert ('success', 'The Email was sent succesfully!');
			else
			{
				showAlert ('error', 'There was an error sending the email. Please try again later.');
				timeout = 7000;
			}
			// window.setTimeout ( () =>{
			// 	location.assign('/');
			// }, timeout);
		}    
	}
	catch (err) {
		showAlert ('error', err.response.data.message);
	}
}



export const resetPassword = async (password, confirmPassword, resetToken) => {

	try {
	
		const  res = await axios({
			method: 'PATCH',
			// Este url es para Development
			// url: 'http://127.0.0.1:8000/api/v1/users/login',
			// Este url es para Production
			url: `/api/v1/users/resetPassword/${resetToken}` ,
			data: {
				password,
				confirmPassword
			}		
		});

		if (res.data.status === 'success') {
			showAlert ('success', 'The password was changed succesfully!');
			window.setTimeout ( () =>{
				location.assign('/');
			}, 1500);
		}    
	}
	catch (err) {
		showAlert ('error', err.response.data.message);
	}
}