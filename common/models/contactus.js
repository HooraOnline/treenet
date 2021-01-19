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

  Model.addMessage =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    let entity={title:data.title,memberId:userId,text:data.text,type:'sellContact',cdate:new Date()};

    return Model.updateOrCreate(entity, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در اضافه کردن درخواست. دوباره سعی کنید.'});
      }else{
        callback(null,res);
      }
    })
  };

  Model.remoteMethod(
    'addMessage',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/addMessage',
        verb: 'POST',
      },
    }
  );

  Model.removeNumber =  (data, callback)=> {
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
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در حذف شماره. دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'removeNumber',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/removeNumber',
        verb: 'POST',
      },
    }
  );

  Model.getUserWhiteNumbers = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    params.where={memberId:userId};
    params.order='firstName DESC';
    return Model.find(params)
      .then(res => {

        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در بارگذاری لیست سفید'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserWhiteNumbers',
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
        path: '/getUserWhiteNumbers',
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

        let white=res.find(item=>item.number===data.number.trim())

        if(white)
         callback(null, true);
        else
          callback(null, false);
      })
      .catch(err => {

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


