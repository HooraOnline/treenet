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
    let entity={memberId:userId,address:data.address,caption:data.caption, type:data.type,icon:data.icon,isSocial:data.isSocial, sort:(data.sort || 1),cdate:new Date(),udate:new Date()};

    return Model.updateOrCreate(entity, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در اضافه کردن . دوباره سعی کنید.'});
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

  Model.removeAddress =  (data, callback)=> {
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
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در حذف . دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'removeAddress',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/removeAddress',
        verb: 'POST',
      },
    }
  );

  Model.getUserContact = function (params, callback) {
    const userId=params.userId ;
    if(!params.userKey){
      callback(new Error('An error occurred'));
      return
    }
    const par={};
    par.where={userKey:params.userKey};
    par.fields=['id'];
    app.models.Member.find(par)
      .then(res => {
        if(res[0]){
          params.where={memberId:res[0].id};
          //params.order='sort ASC';
          Model.find(params)
            .then(res => {
              callback(null, res);
            })
            .catch(err => {
              callback(null, {
                errorCode: 17,
                lbError: err,
                errorKey: 'server_public_error',
                errorMessage: 'خطا در بارگذاری '
              });
              return err;
            });
        }else{
          console.log(444444444444);
          callback(null, {
            errorCode: 17,
            errorKey: 'کارت ویزیت پیدا نشد.',
            errorMessage: 'کارت ویزیت پیدا نشد.'
          });
        }

      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در بارگذاری '
        });
        return err;
      });

  };
  Model.remoteMethod(
    'getUserContact',
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
        path: '/getUserContact',
        verb: 'POST',
      },
    }
  );





};


