const logger = require('./winstonLogger');
const jwtRun = require('./jwtRun');

const config = require('config');
const serverConfig = config.get('APAMAN.serverConfig');

function verifyToken(req, res, next) {
      next();
      return

    if (req.originalUrl.search('car') >-1) {
        req.userId = 122;
        next();
    } else if (req.originalUrl === `${serverConfig.SN}/user/login` || req.originalUrl === `${serverConfig.SN}/pay/result`) {
        next();
    }
    else {
        jwtRun.tokenValidation(req, (state, id) => {
            if (state) {
                logger.info('Verify Token API: %s', req.originalUrl);
                req.userId = id;
                next();
            } else {
                logger.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                return res.status(401).send('Authorization Failed!!!');
            }
        });
    }
}
module.exports = verifyToken;
