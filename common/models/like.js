'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId; 
module.exports = function(Model) {
  
  Model.likePost = async (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    if(!data.postId){
      callback(new Error('postId is requer'));
      return
    }
    const entity={memberId:userId,postId:data.postId,reciverId:data.reciverId,cdate:new Date()}
    console.log('entity====',entity);
    return Model.updateOrCreate(entity)
      .then(like=>{
          const activity={likeId:like.id,reciverId:('_'+data.reciverId),action:'like',type:'like_post',cdate:(new Date()).toJSON()};
          app.models.Activity.create(activity);
          callback(null,entity);
      }).then(err=>{
          callback(null,{errorCode:17, lbError:error, errorKey:'server_post_error_add_like',errorMessage:'خطا در لایک کردن. دوباره سعی کنید.'});
          return err;
      });
  };

  Model.remoteMethod(
    'likePost',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/likePost',
        verb: 'POST',
      },
    }
  );

  Model.unlikePost = async (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    if(!data.postId){
      callback(new Error('postId is requer'));
      return
    }
    const filter={memberId:userId,postId:data.postId}
    console.log('entity====',filter);
    return Model.deleteAll(filter)
      .then(res=>{
        callback(null,res);
      }).then(err=>{
        callback(null,{errorCode:17, lbError:error, errorKey:'server_post_error_unlike',errorMessage:'خطا در آنلایک کردن. دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'unlikePost',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/unlikePost',
        verb: 'POST',
      },
    }
  );

  Model.getUserLikes = function (params, callback) {
    const userId=params.userId ;
    const memberId=params.memberId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    params.where={memberId:memberId};
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


