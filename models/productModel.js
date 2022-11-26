const mongoose = require('mongoose');
const slugify = require('slugify');

///////////////////////////////////////////////////////////////////
// Modelling The Products
///////////////////////////////////////////////////////////////////

const productSchema = new mongoose.Schema( 
  { 
    // trim solo funciona para Strings, quita los white spaces al inicio y 
    // final del String, ejemplo: "  Este Product me gusto porque     "
    // tambien agregar trim a productName
    productName: { 
        type: String,
        required: [true, 'El producto debe tener nombre'],
        unique: true,
        trim: true,
        maxlength: [ 40, 'El nombre del producto debe ser menor o igual a 40 letras.'],
        minlength: [ 5, 'El nombre del producto debe ser mayor o igual a 5 letras.']
    },  
    
    slug: String,

    sku: {
        type: Number,
        unique: true,
        required: [true, 'El producto debe tener SKU.']
    },

    priceMenudeo: { 
        type: Number,
        required: [true, 'El producto debe tener precio de Menudeo.']
    },

    priceMayoreo: { 
        type: Number,
   },

    costo: Number,

    inventarioActual: Number,

    inventarioMinimo: Number,

    //la imagen es de tipo String, porque aqui va el nombre de la imagen, 
    // el cual leeremos del file system (fs), el nombre de la imagen, el cual 
    // una referencia sera guardada en la BD, esta es una practica muy comun, 
    // podria guardar la imagen en la BD PERO eso NO es una buena idea
    imageCover: {
        type: String,
        default: 'camera.webp'
    },

    // Es un timestamp en milisegundos que se configura en el momento en el que 
    // el usuario obtiene un nuevo Product, esto se hace en automatico en el 
    // momento que un Product es creado, pero en mongoose se guarda como una fecha normal
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },

    /*
    NOTA IMPORTANTE: Este Validator SOLO va a funcionar cuando se crea un NUEVO Document 
    osea .save() o .create()

    NO funciona cuando se Actualiza osea .update() y esto es por que el this keyword 
    solo apunta al Document Actual cuando se esta creando
    */
    // priceDiscount: {
    //   type: Number,
    //   validate: { 
    //     validator: 
    //         function (value) {
    //           //return value >= this.price ? false : true;
    //           return value < this.price;
    //         },
    //     message: 'Discount price ({VALUE}) should be below regular price.'
    //   }
    // },

    // ahora el resto de las imagenes, aqui hay algo nuevo, ya que usare un 
    // Array de Strings, asi se hace, un array de tipo string
    // images: [String],   

    ///////////////////////////////////////////////////////////////////
    // Lecture-152 Modelling Product Guides: Child Referencing
    ///////////////////////////////////////////////////////////////////     
    // guides: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     // aqui esta la magia que hace la referencia a la Collection User
    //     ref: 'User'
    //   }
    // ]    
}, 
  { 
    toJSON: { virtuals: true } ,  
    toObject: { virtuals: true } 
});


productSchema.pre('save', function(next) {
// en un save middleware el this va a apuntar al documento que actualmente se esta 
  // procesando y esta es la razon por la que se llama Document Middleware, ahora pra 
  // probar esta funcion tenemos que ejecutar el comando .save() o .create(), asi que 
  // tengo que crear un nuevo Product usando el API createProduct(), asi que voy a POSTMAN y 
  // lo pruebo

  // y lo que me regresa this es el Document ANTES de ser Grabado en la BD

  // Ahora lo que quiero hacer ANTES de Grabar en BD es crear un SLUG para cada
  // uno de los Documents, recuerda que en la primera seccion creamos un SLUG
  // por cada uno de los Productos en la Node Farm, un SLUG es un String que puedo
  // poner en el URL usualmente basado en un string como el productName de Product, recuerda
  // que para eso uso el slugify package asi que lo instalo desde la Terminal
  //    npm i slugify 

  // const slugify = require('slugify');
/*
  Por alguna razon despues de usar slugify y next() NO FUNCIONO y la razon
  es que no tengo un slug en el Schema, asi que asi en este metodo puse
      this.slug = slugify(this.productName, { lower: true });

  En el Schema tambien debo agregarlo: slug: String
  ahora regresa a POSTMAN crea un Product y veras como se agrega el field Slug
  con slugify(this.productName, { lower: true })
  osea
      "slug": "test-Product-3"
*/

  /* 
    {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
      images: [],
      createdAt: 2022-06-13T16:52:51.790Z,
      startDates: [],
      _id: 62a76b746488182e8e8831eb,
      productName: 'Test Product',
      duration: 1,
      maxGroupSize: 5,
      difficulty: 'easy',
      price: 597,
      description: 'Testing.',
      imageCover: 'Product-1-cover.jpg',
      durationWeeks: 0.14285714285714285,
      id: '62a76b746488182e8e8831eb'
    }  
  */
	// console.log(this);
  //recuerda que en este contexto this es el Document que se esta procesando Actualmente
  // y puedo definirle una nueva propiedad .slug
  this.slug = slugify(this.productName, { lower: true });

  next();
});

// model('Product'...
// como NO existe una Collection al inicio, entonces mongoose la crea
// y usa ese primer parametro 'Product', para nombrar la Collection
// pero lo hace minusculas y lo hace plural
const Product = mongoose.model('Product', productSchema)


// esta variable Product la exportare a productController.js en su folder Controller
// que es donde hare: creates, query, deletes y updates Products Documents
module.exports = Product;