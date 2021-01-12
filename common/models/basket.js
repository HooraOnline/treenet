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

  Model.addPToBasket =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    let entity={id:data.id,memberId:userId,productId:data.productId,number:(data.number || 1),cdate:new Date(),udate:new Date()};
    Model.updateOrCreate(entity, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در اضافه کردن . دوباره سعی کنید.'});
      }else{
        callback(null,res);
      }
    })


  };

  Model.remoteMethod(
    'addPToBasket',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/addPToBasket',
        verb: 'POST',
      },
    }
  );

  Model.getUserBasket = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    params.where={memberId:userId};
    params.order='cdate DESC';
    return Model.find(params)
      .then(res => {

        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'خطا در بارگذاری اقلام سبد',
          errorMessage: 'خطا در بارگذاری اقلام سبد'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserBasket',
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
        path: '/getUserBasket',
        verb: 'POST',
      },
    }
  );

  Model.getUserBasketProduct = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    params.where={memberId:userId};
    params.order='cdate DESC';
    params.include=  {
      relation: 'product',
      scope: {
        //fields: ['id', 'title','text',],
      }
    }
    return Model.find(params)
      .then(res => {
        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'خطا در بارگذاری اقلام سبد',
          errorMessage: 'خطا در بارگذاری اقلام سبد'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserBasketProduct',
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
        path: '/getUserBasketProduct',
        verb: 'POST',
      },
    }
  );

  Model.removeFromBasket =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    return Model.destroyById(data.id)
      .then(res=>{
        callback(null,res);
      })
      .catch(err=>{
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا در حذف از سبد. دوباره سعی کنید.',errorMessage:'خطا در حذف از سبد. دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'removeFromBasket',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/removeFromBasket',
        verb: 'POST',
      },
    }
  );



  Model.isWhite = function (data, callback) {
    const invitationCode=data.invitationCode ;
    let params={};
    params.where={invitationCode:invitationCode};
    params.fields=['number'];
    return Model.find(params)
      .then(res => {
        console.log(res,data.number);
        let white=res.find(item=>item.number===data.number.trim())
        console.log(333333333333333,white);
        if(white)
         callback(null, true);
        else
          callback(null, false);
      })
      .catch(err => {
        console.log(err);
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا '
        });
        return err;
      });
  };
  Model.remoteMethod(
    'isWhite',
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
        path: '/isWhite',
        verb: 'POST',
      },
    }
  );



};


