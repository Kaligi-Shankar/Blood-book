const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try{
        let token = req.header('x-token');
        if(!token){
            return res.status(404).send('Token is required')
        }
        let decode= jwt.verify(token, 'jwt key')
        req.user=decode.user;
        next();
    }
    catch(err){
        console.error(err)
        return res.status(500).send('internal server error')
    }
}