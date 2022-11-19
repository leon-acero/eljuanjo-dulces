const mongoose = require('mongoose');

const saleSchema = mongoose.Schema (
  {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:[ true, 'La Venta debe tener un Usuario.' ]
      },

      client: {
        type: mongoose.Schema.ObjectId,
        ref: 'Client',
        required:[ true, 'La Venta debe tener un Cliente.' ]
      },

      createdAt: {
        type: Date,
        default: new Date(Date.now())
      },

      businessName: {
        type: String,
        required: [ true, 'El Negocio debe tener un nombre.' ]
      },

      userName: {
        type: String,
        required: [ true, 'El Usuario debe tener un nombre.' ]
      },

      // value: 1 por-entregar, el producto aun no se entrega y NO se ha cobrado
      // value: 2 entregado, el producto ya se entregó y cobró

      // estatusPedido: {
      //   type: String,
      //   enum: [ 'porEntregar', 'entregado' ],
      //   default: 'porEntregar'
      // },  
      // cambie estatusPedido de String  Number
      estatusPedido: {
        type: Number,
        enum: [ 1, 2 ],
        default: 1
      },  

      esMayorista: {
        type: Boolean,
        default: false,
      },

      seAplicaDescuento: {
        type: Boolean,
        default: false,
      },

      businessImageCover: {
        type: String,
        default: 'defaultBusiness.jpg'
      },

      // Array de Objects
      productOrdered: [
        {
          product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required:[ true, 'La Venta debe tener un Producto.' ]
          },

          productName: {
            type: String,
            required: [ true, 'El Producto debe tener un nombre.' ]
          },

          // me interesa tener el price aqui porque podria cambiar en el futuro 
          // asi que lo necesito aqui
          priceDeVenta: {
            type: Number,
            required: [ true, 'La Venta debe tener un precio.' ]
          },

          quantity: {
            type: Number,
            required: [ true, 'La Venta debe tener una cantidad.' ]
          },

          // me interesa tener el costo aqui porque podria cambiar en el futuro 
          // asi que lo  necesito aqui
          costo: {
            type: Number,
            // required: [ true, 'La Venta debe tener un costo.' ]
          },

          descuento: {
            type: Number,
          },

          sku: {
            type: Number,
            required: [true, 'El producto debe tener SKU.']
          },

          imageCover: {
            type: String,
            default: 'defaultProduct.jpg'
          },
        }
      ],
  },
  { 
      toJSON: { virtuals: true } ,  
      toObject: { virtuals: true } 
  }
);

// model('Sale'...
// como NO existe una Collection al inicio, entonces mongoose la crea
// y usa ese primer parametro 'Sale', para nombrar la Collection
// pero lo hace minusculas y lo hace plural
const Sale = mongoose.model('Sale', saleSchema)

    
// esta variable Sale la exportare a SaleController.js en su folder Controller
// que es donde hare: creates, query, deletes y updates Clients Documents
module.exports = Sale;