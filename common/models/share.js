'use strict';
var app = require('../../server/server');
module.exports = function(Model) {
  Model.sharePost =  (data, callback)=> {
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

    const postId=data.postId;
    const receiverList=data.receiverList;
    const userId=data.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    if(!postId){
      callback(new Error('postId is requier'));
      return
    }
    if(!receiverList){
      callback(new Error('receiverList is requier'));
      return
    }
    let shareList=[];

    receiverList.map(receiver=>{
      shareList.push({memberId:userId,postId:postId,receiverId:receiver,cdate:(new Date()).toJSON(),modelkey:'post'});
    })

    return Model.create(shareList)
      .then(res=>{

          let actovityList=[];
          res.map(share=>{
            actovityList.push({ shareId:share.id,receiverId:'_'+share.receiverId,action:'share',type:'share_post',cdate:(new Date()).toJSON(),});
            actovityList.push({shareId:share.id,receiverId:'_'+data.postMemeberId,action:'share',type:'share_your_post',cdate:(new Date()).toJSON(),});
          });
          const activity= app.models.Activity.create(actovityList);
          callback(null,shareList);
      }).then(err=>{
          callback(null,{errorCode:17, lbError:err, errorKey:'server_share_error_add_share',errorMessage:'خطا در ارسال پست. دوباره سعی کنید.'});
          return err;
      });
  };

  Model.remoteMethod(
    'sharePost',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/sharePost',
        verb: 'POST',
      },
    }
  );






  Model.getMyShares = function (params, callback) {

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
      }).then(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_share_error_get_my_shares',
          errorMessage: 'خطا در بارگذاری کامنتها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getMyShares',
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
        path: '/me/getShares',
        verb: 'POST',
      },
    }
  );

};


