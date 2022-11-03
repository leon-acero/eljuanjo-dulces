///////////////////////////////////////////////////////////////////
// Lecture-161 Building Handling Factory Functions: Delete
///////////////////////////////////////////////////////////////////

const catchAsync = require ('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const APIFeatures = require ('../Utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  
  // en este caso al borrar un Document NO le mando nada al cliente
  // por lo que no tengo que poner const document = await....
  const deletedDocument = await Model.findByIdAndDelete(req.params.id);

  // si no existe deletedDocument es que es null
  if (!deletedDocument) {
    return next(new AppError ('No Document found with that Id', 404));
  }

  res.status(204).json( {
    status: 'success',
    data: null
  });
 
});



///////////////////////////////////////////////////////////////////
// Lecture-162 Factory Functions: Update and Create
///////////////////////////////////////////////////////////////////

/*

Usar Factory Functions para crear y actualizar Resources

En handlerFactory.js

Vuelvo a copiar el codigo de exports.updateTour del tourController.js
*/

exports.updateOne = Model => catchAsync(async (req, res, next) => {

  // new: true, significa que me va a regresar el Document YA actualizado
  // console.log("req.params.id", req.params.id)
  // console.log("req.body", req.body)
  const updatedModel = await Model.findByIdAndUpdate(req.params.id, req.body, { 
    new: true, 
    runValidators: true });

  // si no existe updatedModel es que es null
  if (!updatedModel) {
    return next(new AppError ('No Document found with that Id', 404));
  }
  // console.log("updatedModel", updatedModel)
  res.status(200)
  .json( {
    status: 'success',
    data: {
      data: updatedModel
    }
  }); 
});

/*
En tourController.js

	exports.updateTour = factory.updateOne(Tour);
*/


/*
Voy a POSTMAN y lo pruebo, busco un Tour para actualizar, en /Get All Tours y luego hago un Update

    {{URL}}api/v1/tours/5c88fa8cf4afda39709c2970

    cambio de medium a difficult
{
    "difficulty": "difficult"
}

y me regresa
{
  difficult modificado
}


Ahora hago lo mismo para Users

En userController.js

	exports.updateUser = factory.updateOne(User);

Recuerda que esta function exports.updateUser solo es para Admins! Y solo para actualizar datos que No sean 
passwords porque recuerda cada vez que uso .findByIdAndUpdate los PRE save Middleware NO son ejecutados

Voy a POSTMAN y creo un API llamado /Update User for Admin

    PATCH {{URL}}api/v1/users/62bcca37a1f5ba75c92a7566

{
    "name": "Calamardo"
}

Y me regresa

{
    "status": "success",
    "data": {
        "data": {
            "role": "guide",
            "_id": "62bcca37a1f5ba75c92a7566",
            "name": "Calamardo",
            "email": "guide@hotmail.com",
            "__v": 0,
            "id": "62bcca37a1f5ba75c92a7566"
        }
    }
}


Ahora en reviewController.js

	exports.updateReview = factory.updateOne(Review);

En reviewRoutes.js
	router
		.route(‘/:id’)
		.patch(reviewController.updateReview)
		.delete(reviewController.deleteReview);
	

Ahora en POSTMAN busco un review usando /Get All Reviews escojo uno

Agrego el Route /Update Review que es un PATCH y lo grabo en el folder Reviews y el 
API tendra el nombre de /Update Review

	PATCH {{URL}}api/v1/reviews/79899097787

En Body -> raw -> JSON
{
	“rating”: 4.8
}

y me regresa
{

}


Ahora en POSTMAN voy a actualizar Users, busco un User usando /Get All Users, escojo uno

Agrego el Route (Update User que es un PATCH y lo grabo en el folder Users y el API 
  tendra el nombre de /Update User

	PATCH {{URL}}api/v1/users/90234211

En Body -> raw -> JSON
{
	“name”: “administrator”
}


En handlerFactory.js ahora hago createOne
*/

exports.createOne = Model => catchAsync( async (req, res, next) => {

    const newDocument = await Model.create(req.body);

    res.status(201).json( { 
      status: 'success',
      data: { 
        data: newDocument 
      }    
    });  
});

/*
En tourController.js cambio

exports.createTour = factory.createOne(Tour);

Para Users NO necesito createOne porque para crear users ya tengo SignUp y no puedo 
reemplazarlo con un Factory Function porque NO es generico


Ahora en reviewController.js 

Aqui si puedo usar createOne, pero si te fijas en exports.createReview veras que tengo 
unos ifs, validaciones que No existen en createOne y como hago en este caso? 
Puedo crear un Middleware que se ejecute antes de createReview lo hago asi

exports.setTourUserIds = (req, res, next) => {
	// Allow nested Routes
	if (!req.body.tour) {
		req.body.tour = req.params.tourId;
	}

	// Obtengo req.user.id del authController.protect
	if (!req.body.user) {
		req.body.user = req.user.id;
	}

	next();	
}

exports.createReview = factory.createOne(Review);

Y lo que hago luego es agregar el Middleware setTourUserIds en el reviewRoutes.js

En reviewRoutes.js

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(  authController.protect, 
            authController.restrictTo('user'), 
	          reviewController. setTourUserIds,
            reviewController.createReview);

 
Voy a POSTMAN y creo un nuevo Review en /Create New Review on a Tour y para 
eso necesito el tour ID, asi que uso /Get All Tours para consgeuir un ID, si es 
necesario me loggeo

{
	“rating”: 4.6
	“review:” “Increible fue de los mejores tours que he tomado”
}
*/



///////////////////////////////////////////////////////////////////
// Lecture-163 Factory Functions: Readings
///////////////////////////////////////////////////////////////////

/*

Creamos Factory Function para leer Documents.

Empiezo con getOne

En handlerFactory.js

es diferente a las anteriores porque esta tiene .populate en el getTour handler, pero 
no es problema porque lo que hare es pasar un Populate Options Object a la getOne 
function 
*/


exports.getOne = (Model, popOptions) =>  catchAsync(async (req, res, next) => {

  let query = Model.findById(req.params.id);

  if (popOptions) {
	  query = query.populate(popOptions);
  }

  const getDocument = await query;

  // si no existe getDocument es que es null
  if (! getDocument) {
      return next(new AppError ('No Document found with that Id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: getDocument
    }
  });
});

/*
En tourController.js

	// el path property es el field que quiero populate y tambien puedo espcificar 
  // select si lo deseo 
	exports.getTour = factory.getOne(Tour, { path: ‘reviews’ } );


Voy a POSTMAN y checo /getTour 
		GET {{URL}}api/v1/tours/62bcf38c7ad48180a92eb0ed

y me regresa
{
}


Ahora en userController.js

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
	res,status(500).json({
		status: ‘error’,
		message: ‘This route is not defined! Please use /SignUp instead’
	});
}


Voy a POSTMAN /Get All Users busco un user Id y luego creo el API /Get User con el 
Id que escoji y lo guardo en el folder Users

  {{URL}}api/v1/users/62bcca37a1f5ba75c92a7566

y me regresa
{
    "status": "success",
    "data": {
        "data": {
            "role": "guide",
            "_id": "62bcca37a1f5ba75c92a7566",
            "name": "Calamardo",
            "email": "guide@hotmail.com",
            "__v": 0,
            "id": "62bcca37a1f5ba75c92a7566"
        }
    }
}

En reviewController.js

exports.getReview = factory.getOne(Review);


En reviewRoutes.js

	router
		.route(‘/:id’)
		.get(reviewController.getReview)

Voy a POSTMAN /Get All Reviews busco un Review ID y luego creo /Get Review con el Id 
que escogi y lo guardo en el folder Reviews

    GET {{URL}}api/v1/reviews/62be077772139ea9cbabcd05

y me regresa
{
    "status": "success",
    "data": {
        "data": {
            "rating": 5,
            "_id": "62be077772139ea9cbabcd05",
            "review": "Este tour estuvo muy facil para la otra agarraré uno más difícil pero lo disfruté mucho",
            "tour": "62bcf38c7ad48180a92eb0ed",
            "user": {
                "_id": "62b4c0843a618b358b8fcee2",
                "name": "abdelito",
                "id": "62b4c0843a618b358b8fcee2"
            },
            "__v": 0,
            "id": "62be077772139ea9cbabcd05"
        }
    }
}


Ahora creo Get All Factory Function

Copio getAllTours de tourController.js

En handlerFactory.js

const APIFeatures = require (‘../Utils/apiFeatures’);
*/



exports.getAll = Model => catchAsync( async (req, res, next) => {

  // To allow for NESTED Get Reviews on Tour
  let filter = {};
	
  if (req.params.tourId) 
		filter = { tour: req.params.tourId };

  const features = new APIFeatures (Model.find(filter), req.query)
              .filter()
              .sort()
              .limitFields()
              .pagination();

  // const allDocuments = await features.query.explain();
  const allDocuments = await features.query;


  // SEND RESPONSE
  res.status(200).json({
      status: 'success',
      results: allDocuments.length,
      data: {
        data: allDocuments
      }
  })  
});

/*
En tourController.js
	exports getAllTours = factory.getAll(Tour);

Voy a POSTMAN y pruebo /Get All Tours
	
	{{URL}}api/v1/tours?duration[gte]=10&sort=price

y me regresa
{

}

En reviewController.js

	En getAllReviews tengo el problema que hay dos lineas extras de codigo

  let filter = {};
	
  if (req.params.tourId) 
		filter = { tour: req.params.tourId };

que los otros getAll handlers NO tienen pero lo unico que hare es copiar este codigo 
al Factory handler

	exports.getAllReviews = factory.getAll(Review);

Voy a POSTMAN y pruebo /Get All Reviews

		GET {{URL}}api/v1/reviews?rating=4

y me regresa 
{
}

Y tambien pruebo /Get All Reviews on Tour

y me regresa
{
}

Ahora en userController.js

	exports.getAllUsers = factory.getAll(User);

Voy a POSTMAN y pruebo /Get All Users

		GET {{URL}}api/v1/users?role=user


*/