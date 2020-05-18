const express = require('express');

const _ = require('underscore');

const Categoria = require('../model/categoria');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

//Mostrar todas las categirias
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('description')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err)
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No existe categorias para mostrar'
                    }
                });

            res.json({
                ok: true,
                categoria: categorias
            });
        });
});

// Mostrar categoria por ID
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontro la categoria'
                }

            });
        }

        res.json({
            categoria
        })
    });

});

//crear nueva categoria
app.post('/categoria', [verificaToken, verificaAdmin_Role], (req, res) => {
    //req.usuaio => ADMIN_ROLE
    let body = req.body;
    let usuario = req.usuario;

    let categoria = new Categoria;
    categoria.description = body.description;
    categoria.usuario = usuario

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        };

        //regresa la nueva categoria
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

//actualizar categoria
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let description = {
        description: body.description
    }

    Categoria.findByIdAndUpdate(id, description, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

})

//elimiar una categoria
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //Solo un administrador debe borrar una categorria
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, result) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!result) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            result

        });

    });


});



module.exports = app;