const fs = require('fs');
const jwt = require('jsonwebtoken');

const logger = require('./winstonLogger');


// use 'utf8' to get string instead of byte array  (512 bit key)
const privateKEY = fs.readFileSync(__dirname + '/private.key', 'utf8');
const publicKEY = fs.readFileSync(__dirname + '/public.key', 'utf8');
module.exports = {


    tokenValidation: (req, callBack) => {
        let token = req.headers['authorization']; // Express headers are auto converted to lowercase
        if (token && token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        if (token) {
            let tokenObj = verify(token);
            console.log('tokenObj====',tokenObj);
            if (!tokenObj) {
                return callBack(false)
            } else {
                return callBack(true, tokenObj)
            }

        } else {
            return callBack(false)
        }
    },

    sign: (payload) => {
        logger.info('API: JWT sign payload %j ', payload);
        sOptions = {
            issuer: "Authorization/Resource/Treenet server",
            subject: "hejazi.ppp@gmail.com",
            // audience: "Client_Identity" // this should be provided by client
        };

        // Token signing options
        const signOptions = {
            issuer: sOptions.issuer,
            subject: sOptions.subject,
            // audience:  sOptions.audience,
            expiresIn: "30d",    // 30 days validity
            algorithm: "RS256"
        };
        return jwt.sign(payload, privateKEY, signOptions);
    },

    decode: (token) => {
        return jwt.decode(token, { complete: true });
        //returns null if token is invalid
    }
};

function verify(token) {
    // logger.info('TokenValidation verify token is: %s ',token);
    vOption = {
        issuer: "Authorization/Resource/Treenet server",
        subject: "hejazi.ppp@gmail.com",
        // audience: "Client_Identity" // this should be provided by client
    };

    const verifyOptions = {
        issuer: vOption.issuer,
        subject: vOption.subject,
        // audience:  vOption.audience,
        expiresIn: "30d",
        algorithm: ["RS256"]
    };
    try {
        return jwt.verify(token, publicKEY, verifyOptions);
    } catch (err) {
        return false;
    }
}
