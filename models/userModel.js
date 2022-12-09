///////////////////////////////////////////////////////////////////
// Modelling Users
///////////////////////////////////////////////////////////////////

/*

Authentication y Authorization trata sobre usuarios creando sus cuentas, logging in 
y accesar paginas o routes a las que les dimos permiso, se trata de usuarios y 
necesitamos implementar el User Model en esta leccion para que en la siguiente 
podamos crear nuevos usuarios en la BD

Vamos a crear un nuevo archivo para el User Model, en el folder Models creo el 
archivo userModel.js
E igual que antes empiezo con
	const mongoose = require (‘mongoose’);

Ahora creo un Schema y luego un Model a partir del Schema

Voy a crea un Schema con 5 fields: name, email, photo, password, confirmPassword
Al final lo exporto

El email se usara para el login, no usare un username
*/

// esta built-in en express o NodeJS no estoy seguro pero por eso no es un package de 3eros y no tengo que instalarlo
const crypto = require ('crypto');
const mongoose = require ('mongoose');
// const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');


// ESTE ES EL SCHEMA
// const userSchema = new mongoose.Schema (
//   {
//     name: {
//       type: String,
//       required: [true, 'Please tell us your name']
//     },
//     email: {
//       type: String,
//       required: [true, 'Please give us your email'],
//       unique: true,
//       lowercase: true,
//       validate: [validator.isEmail, 'Please provide a valid email']
//     },
//     photo: String,
//     password: {
//       type: String,
//       required: [true, 'Please provide a password'],
//       minlength: 8
//     },
//     confirmPassword: {
//       type: String,
//       required: [true, 'Please confirm your password']
//     },
//     slug: String
//   },
//   { 
//     toJSON: { virtuals: true } ,  
//     toObject: { virtuals: true } 
//   }
// );


// // AQUI CREO EL MODEL
// const User = mongoose.model('User', userSchema);

// // AQUI EXPORTO EL MODEL
// module.exports = User;


///////////////////////////////////////////////////////////////////
// Managing Passwords
///////////////////////////////////////////////////////////////////

/*
Voy a administrar los passwords

Voy a validar si el password que se capturó es igual al confirmedPassword y tambien 
encriptar el password en la BD para que este segura de ataques

El mejor lugar para validar los passwords es en el Schema en la parte de 
confirmedPassword, con un custom validator

En userModel.js, en el Schema

confirmPassword: {
	type: String,
	required: [true, 'Please confirm your password’],
	validate: {
		validator: function (current) {
			// recuerda que en el validator debo usar una function normal NO un Arrow function para poder usar el this keyword
			// del validator function debo regresar true o false, si es false significa que hay un error en la validacion
			// current es confirmPassword
			// IMPORTANTE: Esto solo funciona en Save o Create, NO en Update, es por esto que si quiero actualizar un User debo usar Save y NO findOneAndUpdate
			return current === this.password;
		}
	}

}

Vamos a POSTMAN a probar esta Validacion, vamos a crear un nuevo User
*/

const userSchema = new mongoose.Schema (
  {
    name: {
      type: String,
      required: [true, 'Por favor escribe tu nombre.']
    },
    email: {
      type: String,
      required: [true, 'Por favor escribe tu correo electrónico.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Por favor escribe un correo electrónico válido.']
    },
    photo: {
      type: String,
      default: ''
      // default: 'default.jpg'
    },
    ///////////////////////////////////////////////////////////////////
    // Lecture-134 Authorization: User Roles And Permissions
    ///////////////////////////////////////////////////////////////////
    role: {
      type: String,
      enum: [ 'user', 'guide', 'lead-guide', 'admin', 'vendedor' ],
      default: 'vendedor'
    },    
    password: {
      type: String,
      required: [true, 'Por favor escribe un password.'],
      minlength: 8,
      ///////////////////////////////////////////////////////////////////
      // Lecture-130 Logging in Users
      // select: false para SEGURIDAD, no mandar password al Client
      ///////////////////////////////////////////////////////////////////
      select: false
    },
    confirmPassword: {
      type: String,
      required: [true, 'Por favor confirma el password.'],
      validate: {
        validator: function (current) {
          // recuerda que en el validator debo usar una function normal NO un 
          // Arrow function para poder usar el this keyword
          // del validator function debo regresar true o false, si es false 
          // significa que hay un error en la validacion
          // current es confirmPassword
          // IMPORTANTE: Esta validacion de confirmPassword funciona en Save o Create, 
          // NO en Update, es por 
          // esto que si quiero actualizar un User debo usar Save y NO findOneAndUpdate
          return current === this.password;
        },
        message: 'Los passwords no son el mismo.'
      }
    },
    slug: String,
    ///////////////////////////////////////////////////////////////////
    // Lecture-132 Protecting Tour Routes Part 2
    ///////////////////////////////////////////////////////////////////
    passwordChangedAt: Date,

    ///////////////////////////////////////////////////////////////////
    // Lecture-135 Password Reset Functionality: Reset Token
    ///////////////////////////////////////////////////////////////////
    // el Reset Token expirara por seguridad despues de cierto tiempo como seguridad, tendras como 10 minutos 
    passwordResetToken: String,
    passwordResetExpires: Date,

    ///////////////////////////////////////////////////////////////////
    // Lecture-140 Deleting the Current User
    ///////////////////////////////////////////////////////////////////
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  { 
    toJSON: { virtuals: true } ,  
    toObject: { virtuals: true } 
  }
);

/*
Ahora voy a encriptar los Passwords!
Cual es el mejor lugar para hacer eso? Digo que es en el Model, como tiene que ver 
con los datos, debe estar en el Model y no en el Controller, Recuerda la filosofia 
fatModelsThinControllers

Como voy a implementar la encriptacion?
Este es un excelente caso de para Mongoose Middleware, y el que voy a usar es un 
PRE-SAVE Middleware, osea Document Middleware, este Middleware se ejecuta entre el 
momento en que recibimos los datos capturados y el momento en que se graba a la BD. 
Solo quiero encriptar el password si dicho field fue actualizado o si acaba de crearse. 
Puedo usar isModified que es un metodo en todos los Documents que podemos usar si un 
cierto field se ha actualizado

Ahora es el momento de encriptar o hash the password o hashing. Para encriptar 
vamos a usar un muy conocido, muy bien estudiado y muy popular hashing algoritmo 
llamado bcrypt, este algortimo primero hara un salt (va a agregar un random string al password para que dos passwords iguales NO generen en el mismo hash) y luego encriptara el password para ptotegerlo de ataques (bruteforce attacks)

Ahora tengo que usar la Terminal para instalar el package bcryptJS

	npm i bcryptjs

const bcrypt = require(‘bcryptjs’);


Ahora lo pruebo en POSTMAN, creo un User con signup
*/

///////////////////////////////////////////////////////////////////
// Lecture-127 Managing Passwords
///////////////////////////////////////////////////////////////////

userSchema.pre('save', async function (next) {
	
	if (!this.isModified('password')) {
		return next();	
	}

	// el primer parametro es el password actual, el segundo paraemtro tengo que 
  // especificar un cost, y lo puedo hacer de dos maneras. la primera es generar 
  // manualmente el salt, osea el random string que sera agregado al password y luego 
  // usar ese salt en esta hash function. Pero para hacerlo mas facil puede pasar 
  // simplemente un cost parameter, y esto es basicamente una medida de que tan intenso
  // sera la opracion para el CPU, el valor default es 10 pero lo pondre a 12, ya que 
  // cada vez los CPUs son mas potentes, hace 20 años huibiera sido 8

	// Ahora el metodo hash es asincrono, hay metodo sincrono pero no quiero usarlo 
  // porque bloquearia el event loop y a otros usuarios, asi que uso hash y esto regresa 
  // una Promise y por logica necesito darle await y por lo tanto la funcion debe ser 
  // async

	this.password = await bcrypt.hash (this.password, 12);

	// Ahora necesito borrar el confirmPassword para que no persista en la BD le pongo 
  // undefined, la unica razon de teenr confirmPassword en el Schema es para hacer la 
  // validacion de que el usuario haya capturado dos passwords iguales
	
  // Para aclarar required significa que es obligatorio la captura no que se guardara 
  // en la BD obligatoriamente
	this.confirmPassword = undefined;
	next();
});



///////////////////////////////////////////////////////////////////
// Lecture-137 Password Reset Functionality: Setting New Password
///////////////////////////////////////////////////////////////////
userSchema.pre('save', function (next) {
	// Si hice cambios en las properties menos en password me brinco este Middleware
	// SI hago un Sign Up, osea creacion de Usuario, me brinco este Middleware

	if (!this.isModified ('password') || this.isNew) {
		return next();	
	}

	// En teoria esto debe funcionar pero en la pratica a veces hay problemas y 
	// el problema es que a veces grabar en la BD es mas lento que enviar el 
	// JSON Web Token, haciendo que changed password timestamp en la BD es configurado 
	// despues de que el JSON Web Token fue creado y eso hara que el User no podra 
	// loggearse usando el nuevo Token, porque recuerda la razon de que el timestamp 
	// passwordChangedAt exista es para compararlo con el timestamp del JSON Web Token, 
	// es decir cuando se ejecuta esta linea 

// 	Teniendo esto en authController.js

// 					if (currentUser.changedPasswordAfter(decodedData.iat)) {
// 						return next (new AppError(‘User recently changed password! Please log in again’, 401));
// 					}


// Y cuando ejecuto la linea que esta aqui abajito osea 
// 					const token = signToken (user._id);

// es cuando creo el nuevo token, y lo que pasa es que este token a veces es creado ANTES del changed password timestamp, y lo puedo corregir restando un segundo a 
// 				this.passwordChangedAt = Date.now() - 1000 ;

// Es un small hack

  this.passwordChangedAt = Date.now() - 1000;
	next();

});


///////////////////////////////////////////////////////////////////
// Lecture-140 Deleting the Current User
///////////////////////////////////////////////////////////////////
/*
Recuerda que uso una regular function para tener acceso al this keyword , osea que 
apunta al Current Query, osea que si voy a ejecutar exports.getAllUsers, veo que ahi 
tengo un find query
  	const allUsers = await User.find(} );


Tambien recuerda que uso una regular expresion para indicar que quiero NO solo find 
sino tambien cualquier query que empiece con find como find and Update, find and Delete, etc
*/
userSchema.pre(/^find/, function (next) {
	// esta linea no funciono porque agregué active al Schema despues de que empece a 
  // crear Users, asi que mucho no tienen el field active, asi que la opcion es la 
  // siguiente linea despues de esta
	// this.find ( { active: true  } );
	this.find ( { active: { $ne: false}  } );

	next();
});


///////////////////////////////////////////////////////////////////
// Lecture-130 Logging in Users
///////////////////////////////////////////////////////////////////
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
}

///////////////////////////////////////////////////////////////////
// Lecture-132 Protecting Tour Routes Part 2
///////////////////////////////////////////////////////////////////
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
	
	// como acabo de crear esta property passwordChangedAt y puede haber Documents
	// que NO la tengan primero checo si existe la property para el Document actual
	if (this.passwordChangedAt) {
		const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		// console.log(changedTimeStamp, JWTTimeStamp);

		// Si es true hubo un cambio en el password
		return JWTTimeStamp < changedTimeStamp;
	}

	// False significa que NO hubo cambio de password
	return false;
}



///////////////////////////////////////////////////////////////////
// Lecture-135 Password Reset Functionality: Reset Token
///////////////////////////////////////////////////////////////////
userSchema.methods.createPasswordResetToken = function () {
	// El PasswordResetToken debe ser un random string pero al mismo tiempo no tiene 
  // que ser tan criptograficamente  fuerte como el password hash que cree antes

	// Puedo usar la muy simple random bytes function del built-in crypto module osea crypto
	// y necesito darle require
	// Ahora si genero el token con crypto.randomBytes y especifico el numero de caracteres
	// y al final lo convierto a un hexadecimal string
	const resetToken = crypto.randomBytes(32).toString('hex');
	
	// este token es lo que voy a enviar al User y es como un reset password que el User
  // puede usar para crear un password verdadero y por supuesto solo este User tendra 
  // acceso a este token y por lo tanto se comporta como un password 

	// Y ya que es un password significa que si un hacker tuviera acceso a la BD eso le 
  // permitira al hacker tener acceso a la cuenta al poner un nuevo password, si fuera 
  // a guardar este reset token en la BD , si un hacker tiene acceso a la BD pudieran 
  // usar ese token y crear un nuevo password usando dicho token en lugar del User. 
  // En fecto podrian controlar la cuenta del User. 

	// Igual que un password nunca se debe de guardar el reset token sin encriptar en la 
  // BD, asi que la encriptare, pero igual que con el password no tiene que ser 
  // criptograficamente fuerte, porque estos reset token son un punto de ataque mucho 
  // menos peligrosos

	// y donde voy a guardar este reset token? voy a crear un nuevo field en el User Schema
	// lo quiero guardar en la BD para compararlo con el token que el User provee
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	// quiero que expire en 10 minutos, 10 por 60 segundos por 1000 milisegundos
  let dateNow = Date.now();
  dateNow += 10 * 60 * 1000;
	this.passwordResetExpires = new Date(dateNow).toString();
	// this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  ///////////////////////////////////////////////////////////////////
  // PROBLEMASCONLASFECHASRESUELTO
  // let dateNow = Date.now();
  // console.log('Date.now()', dateNow.toString());

  // console.log('Datenow ToString + 10 ', new Date(Date.now() + 10 * 60 * 1000));
  // la hora correcta es 13:37:45
  // let DateNow = Date.now();
  // console.log('DateNow', new Date(DateNow).toString());

  // DateNow += 10 * 60 * 1000;
  // console.log('DateNow + 10', new Date(DateNow).toString());
  // Date.now() Sat Jun 25 2022 13:37:45 GMT-0500 (Central Daylight Time)
  // console.log('Date.now()', new Date(DateNow).toString())
  // console.log('new Date(Date.now()).toString()', new Date(Date.now()).toString())

  // new Date 2022-06-25T18:37:45.205Z
  // console.log('new Date', new Date);
  // let date = new Date;
  // date = date.toString();
  // new Date.toString() Sat Jun 25 2022 13:37:45 GMT-0500 (Central Daylight Time)
  // console.log('new Date.toString()', date);
  // let ISOdate = new Date().toISOString();
  // console.log('new Date.toISOString()', ISOdate);
  ///////////////////////////////////////////////////////////////////

	// Quiero regresar el reset token sin encriptar porque eso es lo que voy a enviar
	// por correo, de tal forma que tengo guardado en la BD el reset token encriptado y 
  // al User le mando el reset token sin encriptar, el encriptado es inutil para cambiar
  //  el password, es lo mismo que cuando guardé el password encriptado en la BD 
  // cuando hice el Sign Up

	// si hago console.log como un Objeto osea {resetToken} me dice el nombre de la variable
	// y su valor
  // pormientras
	// console.log( {resetToken} , this.passwordResetToken ); 

	return resetToken;

}


// AQUI CREO EL MODEL
const User = mongoose.model('User', userSchema);

// AQUI EXPORTO EL MODEL
module.exports = User;

