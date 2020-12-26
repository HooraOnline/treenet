'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId;
module.exports = function(Model) {

  Model.seenPost =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    if(!data.postId){
      callback(new Error('postId is requer'));
      return
    }
    const entity={memberId:userId,postId:data.postId,cdate:new Date()}

    console.log('entity====',entity);

    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,entity);
      }).then(err=>{
        callback(null,{errorCode:17, lbError:error, errorKey:'server_post_error_add_like',errorMessage:'خطا در لایک کردن. دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'seenPost',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/seenPost',
        verb: 'POST',
      },
    }
  );





  Model.getPostSeen = function (params, callback) {
    const userId=params.userId ;
    const memberId=params.memberId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    params.where={postId:params.PostId};
    //params.fields=['id'],
    params.order='id DESC';
    params.include=  {
      relation: 'post',
      scope: {
        //fields: ['id', 'fullName','userKey','profileImage','avatar'],
        /*include: {
          relation: 'orders',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }

    return Model.find(params)
      .then(res => {
        callback(null, res);
      }).then(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_likeers_error_get_likeers',
          errorMessage: 'خطا در بارگذاری فالورها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserLikes',
    {
      accepts: {
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        path: '/getUserLikes',
        verb: 'POST',
      },
    }
  );




};


