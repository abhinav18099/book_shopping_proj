const joi = require('joi');

module.exports = {
    validatebody: (schema) => {
        return (req,res,next) => {
            const result = schema.validate(req.body);
            if(result.error){
                return res.status(400).json(result.error);
            }

            if(!req.value) { req.value = {}; }
            req.value['body'] = result.value;
            next();
        }
    },
    schemas: {
        signUpSchema: joi.object().keys({
            username: joi.string().alphanum().min(3).max(30).required(),
            email: joi.string().email().required(),
            password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            Submit: joi.string(),
        }),

        signInSchema: joi.object().keys({
            email: joi.string().email().required(),
            password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            Submit: joi.string(),
        }),

        PersonSchema: joi.object().keys({
            username: joi.string().alphanum().min(3).max(30),
            phone:  joi.string().trim().regex(/^[0-9]{7,10}$/),
            address: joi.string(),
            zipcode: joi.string(),
        }),
    }
}