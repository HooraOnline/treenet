const logger = require('./winstonLogger');
const jwtRun = require('./jwtRun');

const config = require('config');
const serverConfig = config.get('APAMAN.serverConfig');

function verifyToken(req, res, next) {
  let openApiList=[
      '/members/me/login',
      '/members/me/confirmMobile',
      '/members/me/register',
      '/members/me/checkUserNameExist',
      '/members/me/updateUsernameAndPassword',
      '/members/me/setProfileImage',
      '/members/me/initProfile',
      '/pay/result',
    ];

  let apiPath=req.originalUrl.toLowerCase().replace('/api','');
  console.log(apiPath);
    let openPath=openApiList.find(path=>path==apiPath);
    if (openPath) {
        next();
    }else {
        jwtRun.tokenValidation(req, (state, id) => {
            if (state) {
               logger.info('Verify Token API: %s', req.originalUrl);
               req.params.userId=id;
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
