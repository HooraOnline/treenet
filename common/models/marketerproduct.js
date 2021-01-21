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





  Model.selectForSelivery =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    let where={
      marketerId:userId,
      productId:data.productId,
    };
    let entity={
      marketerId:userId,
      productId:data.productId,
      cdate:new Date(),
    };

    return Model.find({where:where}, function(error, products){
      if(error){
        callback(null,{errorCode:17, lbError:error, errorKey:'خطا در انتخاب کردن کالا',errorMessage:'خطا در اضافه کردن کالا. دوباره سعی کنید.'});
      }else if(products && products[0]){
        callback(null,{errorCode:17,  errorKey:'قبلا به صفحه شما اضافه شده',errorMessage:'قبلا به صفحه شما اضافه شده.'});
      }else{
        Model.updateOrCreate(entity, function(err, res) {
          if(err){
            callback(null,{errorCode:17, lbError:err, errorKey:'خطا در انتخاب کردن کالا',errorMessage:'خطا در اضافه کردن کالا. دوباره سعی کنید.'});
          }else{
            callback(null,res);
          }
        });
      }
    });


  };

  Model.remoteMethod(
    'selectForSelivery',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/selectForSelivery',
        verb: 'POST',
      },
    }
  );



  Model.unSelectFromSelivery =  (data, callback)=> {

    const userId=data.userId;
    if(!userId ){
      callback(new Error('An error occurred'));
      return
    }

    if(!data.marketerId ){
      callback(new Error('An error occurred'));
      return
    }

    if(userId===data.marketerId){
      callback(null,{errorCode:17,  errorKey:'شما نمی توانید از مشارکت در فروش کالایی که متعلق به خودتان است خارج شوید.',errorMessage:'شما نمی توانید در فروش کالایی که متعلق به خودتان است مشارکت نکنید.'});
      return ;
    }

    return Model.destroyById(data.id)
      .then(res=>{

        callback(null,res);
      })
      .catch(err=>{
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا در حذف',errorMessage:'خطا در حذف، دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'unSelectFromSelivery',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/unSelectFromSelivery',
        verb: 'POST',
      },
    }
  );

  Model.getMyProducts = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  {
      relation: 'product',
      scope: {
        fields: ['id','memberId', 'title','text','file','fileType','price','commission'],
        /*include: {
          relation: 'orders',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }

    params.where={
      marketerId:userId,
    };
    params.order='id DESC';

    return Model.find(params)
      .then(res => {

        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_product_error_get_my_products',
          errorMessage: 'خطا در بارگذاری کالاها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getMyProducts',
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
        path: '/getMyProducts',
        verb: 'POST',
      },
    }
  );

  Model.getById = function (data, callback) {
    const userId=data.userId ;
    if(!userId || !data.marketerProductId){
      callback(new Error('An error occurred'));
      return
    }
    const params={}
    params.include=  [{
      relation: 'product',
      scope: {
        //fields: ['id','memberId', 'title','text','file','fileType','price','commission','userKey'],
        include: [{
          relation: 'member',
          scope: {
            fields: ['id', 'fullName','userKey','displayName','profileImage','avatar','storeName'],
            // include: {//for like by me
            //   relation: 'likes',
            //     scope: {
            //     where: {memberId: userId}
            //   }
            // }
          }
        },
          {
            relation: 'comments',
            scope: {
              fields: ['id'],

            }
          },
          {
            relation: 'firstComment',
            scope: {
              //fields: ['id', 'text','member'],
              limit:1,
              include: {
                relation: 'member',
                scope: {
                  fields: ['id', 'fullName','userKey','profileImage','avatar','displayName'],
                  //where: {orderId: 5}
                }
              }
            }
          },
          {
            relation: 'likes',
            scope: {
              fields: ['id'],

            }
          },
          {
            relation: 'myLike',
            scope: {
              fields: ['id'],
              where: {memberId: userId}
            }
          },
          {
            relation: 'seens',
            scope: {
              fields: ['id'],

            }
          },
          {
            relation: 'mySeen',
            scope: {
              fields: ['id'],
              where: {memberId: userId}
            }
          }]
      }
    },
      {
        relation: 'marketer',
        scope: {
          fields: ['id','fullName', 'storeName','firstName','profileImage',],
          /*include: {
            relation: 'orders',
              scope: {
              where: {orderId: 5}
            }
          }*/
        }
      }
    ]


    return Model.findById(data.marketerProductId, params)
      .then(res => {

        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'خطا در بارگذاری کالا',
          errorMessage: 'خطا در بارگذاری کالا'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getById',
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
        path: '/getById',
        verb: 'POST',
      },
    }
  );




  Model.removeProductAndSelivery = function (data, callback) {
    const userId=data.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    if(userId!==data.marketerId){
      callback(null,{errorCode:17,  errorKey:'شما نمی توانید این کالا را حذف کنید.',errorMessage:'خطا در حذف، دوباره سعی کنید.'});
      return;
    }

    app.models.Post.destroyById(data.productId)
      .then(res=>{
        //حذف مشارکت کنندگان
        Model.deleteAll({productId: data.productId})
        callback(null,res);
      })
      .catch(err=>{
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا در حذف کالا',errorMessage:'خطا در حذف، دوباره سعی کنید.'});
        return err;
      });


  };
  Model.remoteMethod(
    'removeProductAndSelivery',
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
        path: '/removeProductAndSelivery',
        verb: 'POST',
      },
    }
  );


};


