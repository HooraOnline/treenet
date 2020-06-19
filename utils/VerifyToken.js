const logger = require('./winstonLogger');
const jwtRun = require('./jwtRun');

const config = require('config');
const serverConfig = config.get('APAMAN.serverConfig');

function verifyToken(req, res, next) {
  //next();
  //return


  let openApiList=[
      '/members/me/register',
      '/members/me/login',
      '/pay/result',
    ];
  //let apiPath=req.originalUrl.toLowerCase().replace('/api','');
  let apiPath=req._parsedUrl.pathname.toLowerCase().replace('/api','');
  console.log(apiPath);
  let openPath=openApiList.find(path=>path.toLowerCase()==apiPath);
    if (openPath || apiPath.search('containers')>-1) {
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
