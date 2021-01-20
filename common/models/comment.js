'use strict';
var app = require('../../server/server');
module.exports = function(Model) {
  Model.disableRemoteMethod("create", true);
  Model.disableRemoteMethod("upsert", true);
  Model.disableRemoteMethod("replaceOrCreate", true);
  Model.disableRemoteMethod("upsertWithWhere", true);
  Model.disableRemoteMethod("exists", true);
  Model.disableRemoteMethod("findById", true);
  Model.disableRemoteMethod("find", true);
  Model.disableRemoteMethod("findOne", true);
  Model.disableRemoteMethod("updateAll", true);
  Model.disableRemoteMethod("deleteById", true);
  Model.disableRemoteMethod("count", true);
  Model.disableRemoteMethod("updateAttributes", true);
  Model.disableRemoteMethod("createChangeStream", true);
  Model.disableRemoteMethod("confirm", true);
  Model.disableRemoteMethod("replaceById", true);
  Model.disableRemoteMethod("login", true);
  Model.disableRemoteMethod("resetPassword", true);
  Model.disableRemoteMethod('__count__accessTokens', true);
  Model.disableRemoteMethod('__create__accessTokens', true);
  Model.disableRemoteMethod('__delete__accessTokens', true);
  Model.disableRemoteMethod('__destroyById__accessTokens', true);
  Model.disableRemoteMethod('__findById__accessTokens', true);
  Model.disableRemoteMethod('__get__accessTokens', true);
  Model.disableRemoteMethod('__updateById__accessTokens', true);
  Model.addComment =  (data, callback)=> {

    const postId=data.postId;
    const text=data.text;
    const userId=data.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    if(!postId){
      callback(new Error('postId is requier'));
      return
    }
    if(!text){
      callback(new Error('text is requier'));
      return
    }
    let entity={memberId:userId,postId:postId,text:text,modelkey:'post',cdate:new Date};
    if(data.commentId){
      entity.commentId=data.commentId;
    }

    return Model.updateOrCreate(entity, function(error, comment) {
      if(error){
        callback(null,{errorCode:17, lbError:error, errorKey:'server_comment_error_add_comment',errorMessage:'خطا در ارسال پست. دوباره سعی کنید.'});
      }else{
        if(data.receiverId){
          const activity={replayId:comment.id,receiverId:('_'+data.receiverId),action:'replay',type:'replay_comment',cdate:(new Date()).toJSON()};
          app.models.Activity.create(activity);
        }
        callback(null,entity);
      }
    })

  };

  Model.remoteMethod(
    'addComment',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/addComment',
        verb: 'POST',
      },
    }
  );


  Model.getMyComments = function (params, callback) {

    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  {
      relation: 'member',
        scope: {
        fields: ['id', 'fullName','username','profileImage','avatar','displayName'],
          /*include: {
            relation: 'orders',
              scope: {
              where: {orderId: 5}
            }
          }*/
      }
    }

    params.where={memberId:userId};
    params.order='id DESC';
    return Model.find(params)
      .then(res => {

        callback(null, res);
      }).catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_comment_error_get_my_comments',
          errorMessage: 'خطا در بارگذاری کامنتها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getMyComments',
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
        path: '/me/getComments',
        verb: 'POST',
      },
    }
  );

};


