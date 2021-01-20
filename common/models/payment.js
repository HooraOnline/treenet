'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId;
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

  Model.save =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    app.models.Basket.find({where:{buyerId:userId}})
      .then((products)=>{
        let entity={id:data.id,memberId:userId,orderList:[],cdate:new Date(),udate:new Date()};
        Model.updateOrCreate(entity, function(err, res) {
          if(err){
            callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در ثبت پرداخت . دوباره سعی کنید.'});
          }else{
            callback(null,res);
          }
        })

      })
      .catch(err=>{
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در ثبت پرداخت . دوباره سعی کنید.'});
      })


  Model.remoteMethod(
    'save',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/save',
        verb: 'POST',
      },
    }
  );







};


