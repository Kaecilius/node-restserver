const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../model/producto');
let Categoria = require('../model/categoria');


//Obtener todo los produtos 
app.get('/producto', verificaToken, (req, res) => {

    //parametros:
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let hasta = req.query.hasta || 5;
    hasta = Number(hasta);

    Producto.find({ disponible: true })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'description')
        .skip(desde)
        .limit(hasta)
        .exec((err, productos) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            };

            if (!productos) {
                res.status(400).json({
                    ok: false,
                    err
                });
            };

            res.json({
                ok: true,
                producto: productos
            });

        });


    //trae todos los productos
    //populate usuario y categorias 
});


//Obtener todo los produtos por ID
app.get('/producto/:id', verificaToken, (req, res) => {
    //trae todos los productos
    //populate usuario y categorias
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'description')
        .exec((err, productoDB) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            };

            if (!productoDB) {
                res.status(400).json({
                    ok: false,
                    err
                });
            };

            res.json({
                ok: true,
                producto: productoDB
            });


        });
});


//Buscar productos

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

        let termino = req.params.termino;

        let regex = new RegExp(termino, 'i');

        Producto.find({ nombre: regex })
            .populate('categoria', 'description')
            .exec((err, productos) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        err
                    });
                };

                if (!productos) {
                    res.status(400).json({
                        ok: false,
                        err
                    });
                };

                res.json({
                    ok: true,
                    producto: productos
                });


            });
    })
    //Crear un nuevo producto
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;
    let usuario = req.usuario;

    //grabar usuario
    //grabar una categoria

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: usuario
    });

    producto.save((err, productoDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoDB) {
            res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            producto
        });
    });
});


//Actualizar un producto
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;
    let actualizar = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria

    }

    Producto.findByIdAndUpdate(id, actualizar, { new: true }, (err, productoDB) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                });
            };

            if (!productoDB) {
                res.status(400).json({
                    ok: false,
                    err
                });
            };

            res.json({
                ok: true,
                productoDB
            });

        })
        //grabar usuario
        //grabar una categoria

});


//Borrar un producto
app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let estado = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, estado, { new: true }, (err, result) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        };

        if (!result) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo borrar el producto'
                }
            });
        };

        res.json({
            ok: true,
            resolve: {
                producto: result,
                message: 'El producto fue removido con exito'
            }
        });

    });
    //grabar usuario
    //grabar una categoria
    //disponible = false

});





module.exports = app;