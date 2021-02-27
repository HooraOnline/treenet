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

    let entity={id:data.id,memberId:userId,key:data.key, logo:data.logo,title:data.title, subTitle:data.subTitle,story:data.story,udate:new Date()};
    if(!data.id) entity.cdate=new Date();
    if(data.key){
      Model.find({where: {key:data.key.toLowerCase()}})
        .then(res=>{
          console.log(res[0]);
          console.log(data.id);
          if(res && res[0] && res[0].id.toString()!==data.id)
            callback(null, {
              errorCode: 7,
              errorKey: 'این آی دی رزرو شده است',
              message: 'Error,Pleas try again.',
              errorMessage: 'این آی دی رزرو شده است.'
            });
          else
            Model.updateOrCreate(entity, function(err, res) {
              if(err){
                callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در اضافه کردن . دوباره سعی کنید.'});
              }else{
                callback(null,res);
              }
            })
        }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_member_error_tryAgain',
          message: 'Error,Pleas try again.',
          errorMessage: 'خطایی رخ داد. دوباره تلاش کنید'
        });
        return err;
      })
    }else{
      Model.updateOrCreate(entity, function(err, res) {
        if(err){
          callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در اضافه کردن . دوباره سعی کنید.'});
        }else{
          callback(null,res);
        }
      })
    }





  };

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

  Model.removeCard =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
     Model.destroyById(data.id)
      .then(res=>{
        app.models.Contact.destroyAll({cardId:data.id});
        callback(null,res);
      })
      .catch(err=>{
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در حذف . دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'removeCard',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/removeCard',
        verb: 'POST',
      },
    }
  );

  Model.get = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.where={memberId:userId};
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

  };
  Model.remoteMethod(
    'get',
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
        path: '/get',
        verb: 'POST',
      },
    }
  );

  Model.getOne = function (params, callback) {
    const key=params.key;
    params.where={key:key};

    params.include=  [
      {
        relation: 'contacts',
        scope: {
        }
      },

    ]
    Model.find(params, function (err, res) {
      if (err) {
        callback(err);
      }
      else if(!res[0]) {
        callback(null,{errorCode:434,errorKey:'کارت ویزیتی با این آدرس وجود ندارد.',errorMessage:'کارت ویزیت وجود ندارد'});
      }
      else {
        callback(err, res[0]);
      }
    });
  };
  Model.remoteMethod(
    'getOne',
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
        path: '/getOne',
        verb: 'POST',
      },
    }
  );

  const setLogo=(cardId,data,oldlogo,callback)=>{

    let entity={id:cardId,logo:data.logo};
    Model.updateOrCreate(entity)
      .then(res=>{

        if(oldlogo){
          Model.app.models.container.removeFile('member',oldlogo);
        }

        callback(null,entity);
      }).catch(err=>{

      callback(null,{errorCode:7, lbError:err, errorKey:'خطا در ذخیره تصویر',message:'Error update logo',errorMessage:'خطا در ذخیره تصویر '});
      return err;
    })
  }

  Model.setLogo =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    if(!data.logo){
      callback(new Error('image is require'));
      return
    }

    Model.findById(data.cardId,{fields:['logo']})
      .then((res)=>{
        setLogo(data.cardId,data,res.logo,callback);
      })
      .catch((err)=>{

        callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
      })

  };
  Model.remoteMethod(
    'setLogo',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/setLogo',
        verb: 'POST',
      },
    }
  );

  Model.checkKeyExist =  (data, callback)=> {
    if(!data.key){
      callback(new Error('key is require'));
      return
    }
    if(data.currentKey===data.key.toLowerCase()){
      callback(null,false);
      return
    }
    Model.find({where: {key:data.key.toLowerCase()}})
      .then(res=>{
        if(res && res[0])
          callback(null,true);
        else
          callback(null,false);
      }).catch(err=>{
      callback(null, {
        errorCode: 7,
        lbError: err,
        errorKey: 'server_member_error_tryAgain',
        message: 'Error,Pleas try again.',
        errorMessage: 'خطایی رخ داد. دوباره تلاش کنید'
      });
      return err;
    })
  };
  Model.remoteMethod(
    'checkKeyExist',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/checkKeyExist',
        verb: 'POST',
      },
    }
  );



};



