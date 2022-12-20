///////////////////////////////////////////////////////////////////
// Lecture-136 Sending Emails with Nodemailer
///////////////////////////////////////////////////////////////////
const nodemailer = require ('nodemailer');
const pug = require ('pug');
const htmlToText = require ('html-to-text');
/*

Ahora necesito mandar el Reset Token por correo al User y lo hare usando Nodemailer

Ahora crearé un email Handler function que puedo usar en toda la App y lo hare en 
folder Utils y creare un archivo email.js

Primero instalo el nodemailer package en la Terminal
	npm i nodemailer

En email.js

const nodemailer = require (‘nodemailer’);

/*
Voy a pasar algunas opciones como parametros, el email address el subject, the content 
y mas cosas 
*/

// const sendEmail = async options => {
// /*
//   1. Create a transporter which is a service that’ll send the email because is not 
//   NodeJS that will send the email, it’s a service like GMail, the act of creating 
//   the transporter is the same no matter which server I use

// 	There are a couple of well known services that Nodemailer knows how to deal with and 
//   so we don’t have to configure this manually, Gmail is just one of them, but there 
//   is Yahoo, Hotmail and others
// 	auth is authorization and in there user and password and just like before we save 
//   that kind of stuff in config.env file

// 	EMAIL_USERNAME=your-gmail
// 	EMAIL_PASSWORD=your-password

// 	then in your Gmail account you have to activate something called the 
//   Less Secure App Option
// 	But Jonas will not use Gmail and the reason is because Gmail is not a good idea 
//   for a Production App, using Gmail for this kind of stuff you can only send 500 mails 
//   per day and you will be marked very quickly as a spammer and from there it will 
//   only go downhill, unless it’s a private App and only send emails to yourself or 
//   10 friends you should use another service, and some well known ones are 
//   SendGrid and Mailgun and we’ll use SendGrid

// 	What we’re gonna use is a special development service which basically faked to 
//   send emails to real addresses but in reality these emails end up trapped in a 
//   development inbox so that we can take a look at how they will look later in 
//   production, that service is called Mailtrap (Safe Email Testing for Staging and 
//   Development), so I go to google and sign up for that
// 	https://mailtrap.io

// 	Creo una cuenta (Sign Up) con Github
// 	Voy a https://mailtrap.io/inboxes
// 	Y creo un inbox “natours”
// 	Entro en ella y veo las Credentials: SMTP Settings -> SMTP / POP3
// 	Tengo un Host, Port, Username, Password, es lo que voy a especificar en transport 
//   en Nodemailer, de ahi los copio y pego en config.env. 
// 	NOTA: Uso SMTP
// 	NOTA 2: Hago todas estas copias y pegar porque Mailtrap NO es uno de los servicios 
//   predefinidos que vienen con Nodemailer
	
//   En config.env:
// 	EMAIL_USERNAME=306779a613bcfe
// 	EMAIL_PASSWORD=7b833175c47f34
// 	EMAIL_HOST=smtp.mailtrap.io
// 	EMAIL_PORT=25

// */

// /*
// 	// EJEMPLO PARA GMAIL
// 	const transporter = nodemailer.createTransport ( {
// 		service: ‘Gmail’,
// 		auth: {  
// 			user: process.env.EMAIL_USERNAME,
// 			password: process.env.EMAIL_PASSWORD
// 		}
// 	}); 
// */

//   const transporter = nodemailer.createTransport ({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {  
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   }); 

//   // 2. Define the email options
//   // mas adelante dire como convertir el texto osea el mensaje a HTML
//   const mailOptions = {
//     from: 'Abdelito <acero@hotmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//     // html: 
//   }

//   // 3. Send the email with Nodemailer
//   // el .sendMail regresa una Promise, osea es una funcion ASINCRONA y como no quiero trabajar directamente con Promises, hagamos ASYNC / AWAIT
//   // NO es necesario guardar lo que regresa la Promise asi que no declaro una variable 
//   await transporter.sendMail(mailOptions);

// };





///////////////////////////////////////////////////////////////////
// Lecture-206 Building a Complex Email Handler
///////////////////////////////////////////////////////////////////
/*

Vamos a enviar Emails, y ya lo hice anteriormente para el Password Reset pero ahora 
hare algo mas complejo

VOy a hacer email templates con pug y mandar emails reales usando el SendGrid service

VOy a construir un email handler mas robusto

En el Utils folder y abro el archivo email.js el cual es muy sencillo


En config.env

EMAIL_FROM=acero@hotmail.com


En email.js
*/

// Como usare esta class en la practica? cuando mande un email voy a importar esta 
// email class y 
// la usare asi: 
// el parametro user tendra el email address y name por si quiero personalizar el email y
// el segundo parametro el url, por ejemplo para el resetPassword
// new Email (user, url).sendWelcome()




module.exports = class Email {
	// el constructor es la function que se ejecutara cuando se cree un object d esta class
	constructor(user, url) {
		this.to = user.email;
		this.firstName = user.name.split(' ')[0];
		this.url = url;
		this.from = `Abdel Yussuf <${process.env.EMAIL_FROM}>`;
	} 

	newTransport () {
		// QUiero tener diferentes Trasports dependiendo si estoy en Production o Development
		// En Production quiero mandar emails reales usando SendGrid y en Development uso
		// MailTrap

		if (process.env.NODE_ENV === 'production') {
			return nodemailer.createTransport({
				service: 'SendinBlue',
				auth: {
					user: process.env.SENDINBLUE_USERNAME,
					pass: process.env.SENDINBLUE_PASSWORD
				}
			});
		}
		return nodemailer.createTransport({
			service: 'SendGrid',
			auth: {
				user: process.env.SENDGRID_USERNAME,
				pass: process.env.SENDGRID_PASSWORD
			}
		});
  	// return nodemailer.createTransport ({
		// 	host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {  
    //       user: process.env.EMAIL_USERNAME,
    //       pass: process.env.EMAIL_PASSWORD
    //   }
		// });		
	}

	// este es el metodo que enviara el email y recibicra un template y el subject
	// este es un metodo general
	async send( template, subject) {
		
		// Recuerda que voy a tener un metodo llamado sendWelcome y otro llamado 
		// setResetPassword

		// 1. Pintar el HTML para el email basado en el pug template
		// uso pug para crear un template, luego paso el nombre del template en la render
		// function en la response (res)
		// lo que la render function hace por debajo del agua es crear el HTML basado en el
		// pug template y luego mandarlo al Client, pero en este caso NO quiero pintarlo,
		// solo quiero crear el HTML a partir del template para mandar ese HTML como el email
		// y lo mando en mailOptions, en html:
		// asi que por eso NO usare res.render
		
		// res.render(‘
		// y por eso necesito 
		// 		const = pug require (‘pug’);
		
		// toma como parametro un archivo y convertira el pug code a HTML
		// __dirname es la location del script que se ejecuta en ese momento y en este caso es
		// ../Utils folder
		// ademas puedo pasarle datos a renderFile y es importante si quiero personalizar el
		// email con el nombre, pasar el URL

		try {
			const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
				firstName: this.firstName,
				url: this.url,
				subject
			});

			// ahora para el welcome email que el pug template en el folder /views/emails y 
			// el nombre del archivo sera welcome.pug

			// 2. Definir email Options

			// es importante tener una version de texto en el email por que es mejor para
			// email delivery rates y para spam folders
			// para convertir de HTML a texto instalare un package llamado html-to-text
			// En la Terminal
			// npm i html-to-text
			const mailOptions = {
				from: this.from,
				to: this.to,
				subject,
				html,
				text: htmlToText.fromString(html)
			}

			// 3. Crear un Transport y enviar email
			// PREGUNTA COMO PUDO encadenar .sendMail??
			// Este if es porque si existe la Promise entonces regreso true
			// significa que NO hubo problemas al enviar el Email
			// si regresa false es que SI hubo problemas al enviar el Email
			const Promise = await this.newTransport().sendMail(mailOptions);

			// console.log('Promise', Promise);
			if(Promise)
				return true;
				
			return false;

		}
		catch (err){
			console.log('Error Email', err);
			// si regresa false es que SI hubo problemas al enviar el Email
			return false;
		}
	}

	// metodos eespecificos
	async sendWelcome() {
		// como this.send es AWAIT / SYNC entonces esta function TAMBIEN DEBE SERLO
		// porque estoyr usando this.end

		// Este if es porque si existe la Promise entonces regreso true
		// significa que NO hubo problemas al enviar el Email
		// si regresa false es que SI hubo problemas al enviar el Email

		if(await this.send ('welcome', 'Welcome to the Natours Family!'))
			return true;
		
		return false;
	}

  async sendPasswordReset () {
		if (await this.send('passwordReset', 'Tu solicitud para cambiar de password de El Juanjo | Dulcería (solo válido por 10 minutos)'))
			return true;

		return false;
	} 

} 


// Checa authController.js


///////////////////////////////////////////////////////////////////
// Lecture-208 Sending Password Reset Emails
///////////////////////////////////////////////////////////////////

/*


Voy a enviar correos para Password Resets

El correo sera muy similar al de Bienvenida, asi que copio welcome.pug y creo otro 
archivo donde pegarlo

En passwordReset.pug

aqui pego el codigo

Solo tomo texto que necesito para este pug , y lo tomo de exports.forgotPassword de 
authController.js


extends baseEmail

block content
  //- aqui uso firsName, url y esa es la razon por la que la pase en
  //- email.js en el metodo async send(template, subject) cuando uso el metodo
  //- pug.renderFile (....)
  p Hi #{firstName},
  p Forgot your password? Submit a PATCH request with your new password and confirm Password to: #{url}.
  p (Website for this action not yet implemented.)
  table.btn.btn-primary(role='presentation', border='0', cellpadding='0', cellspacing='0')
    tbody
      tr
        td(align='left')
          table(role='presentation', border='0', cellpadding='0', cellspacing='0')
            tbody
              tr
                td
                  a(href=`${url}`, target='_blank') Reset your password
  p If you didn't forget your password, please ignore this email!



En email.js

module.exports = Class Email {

…
…

	async sendPasswordReset () {
		await this.send(‘passwordReset.pug’, ‘Your password reset token (valid for only 10 minutes)’);
	} 

}


En authController.js


exports.forgotPassword =  catchAsync( async (req, res, next) => {

try {
// Por el momento comentarizo este codigo que lo voy a cambiar

// YA NO SE USA porque me hago cargo en passwordReset.pug
// const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;


  // await sendEmail ({  
  //   email: user.email,
  //   subject: 'Your password reset Token (valid for 10 min)',
  //   message
  // });


// cambio el codigo anterior por

await new Email (user, resetURL).sendPasswordReset();


Voy a POSTMAN voy a darle /forgot password al user que acabo de crear test12@natours.io
{
	“email”: “test12@natours.io”
}

COn esto obtengo el Reset Token por Mailtrap.io

Me regresa

{
    "status": "success",
    "message": "Token sent to email"
}


Voy a Mailtrap.io
Y ME LLEGA EL CORREO PARA RESET EL PASSWORD!!

Copio el link y voy a POSTMAN en /Reset Password y aqui pego el link

{
	“password”: “newpassword”,
	“confirmPassword”: “newpassword”
}

y me regresa
{
EXITO
}

Voy a Chrome y me loggeo con el nuevo password

127.0.0.1:8000/login

user: test12@natours.io
password: newpassword

ME LOGGEO

En la proxima leccion mandare correos reales a cuentas reales
*/




///////////////////////////////////////////////////////////////////
// Lecture-209 Using SendGrid for “Real” Emails
///////////////////////////////////////////////////////////////////

/*


Voy a enviar correos reales usando el package Sendgrid en lugar de Mailtrap (Development)

	sendgrid.com

acero@hotmail.com
1mplaCABLEdelanoche

	sendinblue.com

acero@hotmail.com
1mplaCABLE


Cambien sendgrig por Sendinblue, despues de crear mi cuenta entre a ala pagina hay 
un dashboard

Voy a configurar SMTP Relay
	https://account.sendinblue.com/advanced/api

Create a New SMTP Key
	natours
	Y me da este password
		xsmtpsib-b77e5a0cc69c46bfe156d2c2db17eb912b673f13801da8f32ee83ce39606f887-P16RNpHqcCEfkhXY

	Solo necesito el username y el password

En config.env
SENDINBLUE_USERNAME=acero@hotmail.com
SENDINBLUE_PASSWORD=xsmtpsib-b77e5a0cc69c46bfe156d2c2db17eb912b673f13801da8f32ee83ce39606f887-P16RNpHqcCEfkhXY


Create a new API Key
	natoursapi
	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


En email.js

module.exports = Class Email {


	newTransport () {
		if (process.env.NODE_ENV === ‘production’) {

			
			return nodemailer.createTransport({
				service: ‘SendinBlue’,
				auth: {
					user: process.env.SENDINBLUE_USERNAME,
					pass: process.env.SENDINBLUE_PASSWORD

				}
			});
		}

Compilo en VS Code cambiando a Production osea

	npm run start:prod

Para probarlo creo un User nuevo con un email real

Voy a POSTMAN en /signup

Voy a crear un correo deshechable usando Mailsac service mailsac.com

{
    "name": “yussy”,
    "email": "acero@mailsac.com",
    "password": “test1234”,
    "confirmPassword": “test1234”
}

y me regresa
{
EXITO!
}

Ahora puedo ir a mailsac.com a ver si me llego
Y puedo ir a sendinblue.com a ver si ahi tambien esta el correo


*/