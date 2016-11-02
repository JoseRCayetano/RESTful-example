'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Al no ser librearia de npm, se indica la ruta
const Product = require('./models/product');

const app = express();
const port = process.env.PORT || 3001 //Para que use una variable de entorno o el puerto 3000

//Middleware , capas con las que trabaja node
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json()); //Para admitir peticiones con el cuerpo del mensaje en formato JSON

/*
app.get("/hola/:name", (req,res) => {
	res.send({message : `Hola ${req.params.name}`});
	res.end(); // No envia nada

});*/

app.get('/api/product', (req,res) => {

	//para que liste todos los productos se envía objeto vacío y funcion de callback
	Product.find({}, (err, products) => {
		if (err) return res.status(500).send({message: `Error al realizar la peticion ${err}`});
		if (!products) return res.status(404).send({message: `No existen productos`});

		res.status(200).send({products});

	})
	
});

app.get('/api/product/:productId', (req,res) => {

	let productId = req.params.productId;

	Product.findById(productId, (err,product) => {
		if (err) return res.status(500).send({message: `Error al realizar la peticion ${err}`});
		if (!product) return res.status(404).send({message: `El producto no existe`});

		//Cuando la clave es igual al valor en ECMAC6 en vez de {product:'product'}, se usa...
		res.status(200).send({product});
	})
});

app.post('/api/product', (req,res) => {
	console.log('POST /api/product');
	console.log(req.body) //Por si hay algún error

	let product = new Product();
	product.name = req.body.name;
	product.picture = req.body.picture;
	product.category = req.body.category;
	product.description = req.body.description;

	/*
	product.save( (err, productStore) => {
		if (err) {
			res.status(500).send({message : `Error al salvar en la base de datos: ${err} `})
		}else{
			res.status(200).send({product: productStored});
		}
	});*/

	product.save().then((productStore) => {
		if (productStore) {
			res.status(200).send({message : `Datos guardados correctamente: ${productStore} `})
		}
	});

	/*
	//Gracias a body parse obtenemos el cuerpo de la peticion
	console.log(req.body)
	res.status(200).send({message: 'EL producto se ha recibido'});*/
});

app.put('/api/product/:productId', (req,res) => {

	let productId = req.params.productId;
	let update = req.body

	//Pasamos ID y objeto con los campos a actualizar
	Product.findByIdAndUpdate(productId,update, (err, productUpdated) => {
		if (err) return res.status(500).send({message: `Error al actualizar  el producto ${err}`});

		res.status(200).send({product: productUpdated});
	})
});

app.delete('/api/product/:productId', (req,res) => {

	let productId = req.params.productId;

	Product.findById(productId, (err,product) => {
		if (err) return res.status(500).send({message: `Error al borrar  el producto ${err}`});

		product.remove (error => {
			if (err) return res.status(500).send({message: `Error al borrar  el producto ${err}`});
			res.status(200).send({message: 'El producto ha sido eliminado'})
		})

	})

});

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/shop', (err,res) => {
	if (err){
		return console.log(`Error al conectar a la base de datos mongo: ${err}` );
	} 
	console.log('Conexión con base de datos Mongo establecida...');

	//Arranca server api
	app.listen(port, () => {
		console.log(`API REST corriendo en http://localhost:${port}`);
	})
})

