const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

///////////////////////////////////////////////////////////////////
// Modelling The Clients
///////////////////////////////////////////////////////////////////

const clientSchema = new mongoose.Schema( 
    { 
        // trim solo funciona para Strings, quita los white spaces al inicio y 
        // final del String, ejemplo: "  Este Product me gusto porque     "
        // tambien agregar trim a name
        ownerName: { 
            type: String,
            required: [true, 'Escribe el nombre del cliente.'],
            trim: true,
            maxlength: [ 80, 'El nombre del cliente debe ser menor o igual a 80 letras.'],
            minlength: [ 5, 'El nombre del cliente debe ser mayor o igual a 5 letras.']
        },  

        businessName: { 
            type: String,
            required: [true, 'Escribe el nombre del negocio.'],
            maxlength: [ 80, 'El nombre del negocio debe ser menor o igual a 80 letras.'],
            minlength: [ 5, 'El nombre del negocio debe ser mayor o igual a 5 letras.']
        },  
    
        businessAddress: { 
            type: String,
            // required: [true, 'Escribe la dirección del negocio.'],
            maxlength: [ 100, 'La dirección del negocio debe ser menor o igual a 100 letras.'],
            // minlength: [ 5, 'La dirección del negocio debe ser mayor o igual a 5 letras.']
        },  

        // En el Client el cellPhone lo puse como opcional, asi que No puede
        // ser required aqui en el server, ni tampoco unique, porque si le pongo
        // vacio, osea sin valor, en el momento en que a otro cliente no le ponga
        // dato del celular me va a rezongar el sistema porque se duplica
        // el valor vacio
        cellPhone: { 
            type: String,
            // required: [true, 'Escribe el celular del Negocio.'],
            // unique: true,
            trim: true,
            maxlength: [ 20, 'El número de celular del negocio no debe ser mayor a 20 caracteres.']
        },  

        fixedPhone: { 
            type: String,
            // required: [true, 'Escribe el teléfono fijo del Negocio.'],
            trim: true,
            maxlength: [ 20, 'El número de teléfono fijo del negocio no debe ser mayor a 20 caracteres.']
        }, 

        email: {
            type: String,
            // required: [true, 'Por favor escribe tu correo electrónico.'],
            lowercase: true,
            // validate: [validator.isEmail, 'Por favor escribe un correo electrónico válido.']
        },

        esMayorista: {
            type: Boolean,
            default: false,
        },

        imageCover: {
            type: String,
            default: 'camera.webp'
            // required: [true, 'El negocio debe tener una imagen.']
        },

        isActive: {
            type: Boolean,
            default: true
        },

        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },

        slug: String,

        sku: {
            type: Number,
            unique: true,
            required: [true, 'El cliente debe tener SKU.']
        },
    },
    { 
        toJSON: { virtuals: true } ,  
        toObject: { virtuals: true } 
    }
);

clientSchema.pre('save', function(next) {
    console.log('slugify');

      //recuerda que en este contexto this es el Document que se esta procesando Actualmente
      // y puedo definirle una nueva propiedad .slug
      this.slug = slugify(this.businessName, { lower: true });
    
      next();
});
    
// model('Client'...
// como NO existe una Collection al inicio, entonces mongoose la crea
// y usa ese primer parametro 'Client', para nombrar la Collection
// pero lo hace minusculas y lo hace plural
const Client = mongoose.model('Client', clientSchema)

    
// esta variable Client la exportare a clientController.js en su folder Controller
// que es donde hare: creates, query, deletes y updates Clients Documents
module.exports = Client;