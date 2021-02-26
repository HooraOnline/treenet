const logger = require('./winstonLogger');
const jwtRun = require('./jwtRun');

const config = require('config');
const serverConfig = config.get('TREENET.serverConfig');

function verifyToken(req, res, next) {
  //next();
  //return


  let openApiList=[
      '/members/getRegentInfo',
      '/members/checkMobileExist',
      '/members/me/register',
      '/members/me/login',
      '/pay/result',
      '/members/me/checkusernameexist',
      '/whiteNumbers/isWhite',
      '/treenetparsianbankdata',
      '/uniquparsianbankdata',
      '/aff_landings/add',
    ];
    let memberPermission=[
      '/members/checkMobileExist',
      '/members/getRegentInfo',
      '/members/me/checkUserNameExist',
      '/members/me/register',
      '/members/me/login',
      '/pay/result',
      '/members/me/checkUserKeyExist',
      '/members/me/getProfile',
      '/members/getsubsetlist',
      '/activities/getNewAnnounceCount',
      '/members/getUserPage',
      '/members/searchByKeyword',
    ].map(m=>m.toLowerCase());
  let postPermission=[
    '/posts/me/addPost',
    '/posts/getById',
    '/posts/removePost',
    '/posts/me/getPosts',
    '/posts/me/getFollowboardPosts',
    '/posts/me/getSpecializedPostIn24h',
    '/posts/me/getLastSpecializedPost',
    '/posts/geComments',

  ].map(m=>m.toLowerCase());
  let activityPermission=[
    '/activities/getUserAnnounce',
    '/activities/getNewAnnounceCount',
  ].map(m=>m.toLowerCase());
  let publicRolePermission=memberPermission.concat(postPermission).concat(activityPermission)
  //let apiPath=req.originalUrl.toLowerCase().replace('/api','');
  let apiPath=req._parsedUrl.pathname.toLowerCase().replace('/api','');
  console.log('apiPath=',apiPath);
  let openPath=openApiList.find(path=>path.toLowerCase()===apiPath);
    if (openPath ||  apiPath.search('explorer')>-1 || apiPath.search('client')>-1) {
        next();
    }else {
      jwtRun.tokenValidation(req, (state, tokenObj) => {

        if (state) {
                const permissionKey=apiPath;
                //console.log('jwt tokenObj======',tokenObj);
                let userPermissions=tokenObj.userPermissions.concat(publicRolePermission);
                const havePermission=userPermissions.includes(permissionKey);
                if(!havePermission ){
                  //return res.status(401).send('access denied!!!');
                }

              if(tokenObj.userId){
                 req.params.userId=tokenObj.userId;
                 req.userId = tokenObj.userId;

               }
               next();
            }else {
                logger.error('!!!Verify Token not have Token: Authorization Failed!!! => API: %s', req.originalUrl);
                return res.status(401).send('Authorization Failed!!!');
            }
        });
    }
}
module.exports = verifyToken;
