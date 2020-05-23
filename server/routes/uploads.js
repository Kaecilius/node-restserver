const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();


const Usuario = require('../model/usuario');
const Producto = require('../model/producto');

const fs = require('fs');
const path = require('path');

//defaiult options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;


    if (!req.files)
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha selecionado nigun archivo'
                }
            });

    //Validar tipos
    let tiposValidos = ['producto', 'usuario'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        })

    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones Permitidas
    let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitiadas son ' + extencionesValidas.join(', ')
            }
        })
    }

    //Cmabiar nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });


        // Aqui , imgen cargada
        if (tipo === 'usuario') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }


        /*res.json({
            ok: true,
            message: 'Imagen subida correctamente'
        });*/

    })
});


function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productooDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'producto');
            res.status(500).json({
                ok: false,
                err
            });
        }


        if (!productooDB) {
            borraArchivo(nombreArchivo, 'producto');
            res.status(400).json({
                ok: false,
                err: {
                    message: 'producto no existe'
                }
            });
        }


        borraArchivo(productooDB.img, 'producto');

        productooDB.img = nombreArchivo;

        productooDB.save((err, prodGuardado) => {
            res.json({
                ok: true,
                producto: prodGuardado,
                img: nombreArchivo
            })
        });
    });

}


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuario');
            res.status(500).json({
                ok: false,
                err
            });
        }


        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuario');
            res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        /* let pathImagen = path.resolve(__dirname, `../../uploads/usuario/${ usuarioDB.img }`);
         if (fs.existsSync(pathImagen)) {
             fs.unlinkSync(pathImagen);
         }*/

        borraArchivo(usuarioDB.img, 'usuario');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });
    });
}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}


module.exports = app;