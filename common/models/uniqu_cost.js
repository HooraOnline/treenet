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

  Model.add =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    console.log(data);
    let entity={
      id:data.id,
      buildingId: 1,
      headingId:data.headingId,
      date:data.date,
      price:data.price,
      description:data.description,

      cdate:new Date(),
      udate:new Date()
    };

    return Model.updateOrCreate(entity, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا، دوباره سعی کنید.',errorMessage:'خطا، دوباره سعی کنید.'});
      }else{
        callback(null,res);
      }
    })

  };

  Model.remoteMethod(
    'add',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/add',
        verb: 'POST',
      },
    }
  );

  Model.getList = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    params.where={buildingId:1};
    //params.order='title DESC';
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
    'getList',
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
        path: '/getList',
        verb: 'POST',
      },
    }
  );

  Model.removeNumber =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
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


