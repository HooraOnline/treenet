'use strict';
var app = require('../../server/server');
module.exports = function(Model) {
  Model.addComment =  (data, callback)=> {

    const postId=data.postId;
    const text=data.text;
    const userId=data.userId ;
    if(!userId){
      callback(new Error('token expier'));
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
    console.log('4444444444=',params);
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    params.include=  {
      relation: 'member',
        scope: {
        fields: ['id', 'fullName','username','profileImage','avatar'],
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
        console.log(res);
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


