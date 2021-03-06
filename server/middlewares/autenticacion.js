const jwt = require('jsonwebtoken');

//==============================
//VERIFIAR TOKEN
//==============================

let verificaToken = (req, res, next) => {

    let token = req.get('token') //Authorization

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }


        req.usuario = decoded.usuario;
        next();

    });

};
//==============================
//VERIFIAR ADMIN ROLE
//==============================


let verificaAdmin_Role = (req, res, next) => {


    let usuario = req.usuario;



    if (usuario.role === 'ADMIN_ROLE') {

        //console.log('EL usuario es Administrador');
        next();

    } else {

        res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });

    }




};

//==============================
//VERIFIAR TOKEN PARA IMAGEN
//==============================


let verificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }


        req.usuario = decoded.usuario;
        next();

    });


}


module.exports = {

    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}