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
      callback(new Error('token expier'));
      return
    }
    let where={
      memberId:userId,
      productId:data.productId,
    };
    let entity={
      memberId:userId,
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
            callback(null,{errorCode:17, lbError:error, errorKey:'خطا در انتخاب کردن کالا',errorMessage:'خطا در اضافه کردن کالا. دوباره سعی کنید.'});
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
    console.log(data);
    const userId=data.userId;
    if(!userId ){
      callback(new Error('token expier'));
      return
    }

    if(!data.memberId ){
      callback(new Error('token expier'));
      return
    }

    if(userId===data.memberId){
      callback(null,{errorCode:17,  errorKey:'شما نمی توانید در فروش کالایی که متعلق به خودتان است مشارکت نکنید.',errorMessage:'شما نمی توانید در فروش کالایی که متعلق به خودتان است مشارکت نکنید.'});
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
    console.log(1111111111);
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    params.include=  {
      relation: 'product',
      scope: {
        fields: ['id', 'title','text','file','fileType','price','commission'],
        /*include: {
          relation: 'orders',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }

    params.where={
      memberId:userId,
    };
    params.order='id DESC';
    console.log(1111111111);
    return Model.find(params)
      .then(res => {
        console.log(res);
        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_product_error_get_my_products',
          errorMessage: 'خطا در بارگذاری پستها'
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


  Model.removeProductAndSelivery = function (data, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    app.models.Post.destroyById(data.productId)
      .then(res=>{
        //حذف مشارکت کنندگان
        return Model.deleteAll({productId: data.productId})
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















  let parentIds=[];
  const getUserParentsIds= async(regentId)=>{
      let query={where:{invitationCode:regentId},fields:["id","regentId"]};
      let parentList=await app.models.Member.find(query);

      if(parentList && parentList[0] && parentList[0].regentId!=='null'){
        parentIds.push(res[0]);
        await getUserParentsIds(res[0].regentId)
      }else{

      }
  }

  const getParentProducts= (parentsList,followers,userId,callback,)=>{

    followers=followers.map(item=>item.followedId)
    followers.push(userId);
    //let userIdList=followers.concat(parentsList)
    const params={}
    params.include=  [{
      relation: 'member',
      scope: {
        fields: ['id', 'fullName','userKey','displayName','profileImage','avatar'],
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
      }
    ]

    const orFilter1=followers.map(parentId=>{return {memberId:parentId}});
    const orFilter2=parentsList.map(parentId=>{return {and:[
        {memberId:parentId},
        {isSpecial:true},
      ]}});

    const orFilter=orFilter1.concat(orFilter2);
    const filter={and:[{isDeleted:{neq: true}},{or:orFilter}]}

    params.where=filter;
    params.order='id DESC';



    return Model.find(params)
      .then(res => {
        //Model.updateAll({isSeen: {neq: true}}, {isSeen: true});
        if(res[0]){
          app.models.Member.update({id:userId,lastSeenProductDate:res[0].cdate})
        }

        callback(null, res);
      }).catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_product_error_get_my_products',
          errorMessage: 'خطا در بارگذاری پستها'
        });
        return err;
      });

  }

  Model.getFollowboardProducts =  function (data, callback) {
    const userId=data.userId ;


    if(!userId){
      callback(new Error('token expier'));
      return
    }
    app.models.Member.findById(userId,{fields:["parentsList"]},function(error, parent) {
      if(error){
        callback(null, {
          errorCode: 17,
          lbError: error,
          errorKey: 'server_product_error_get_my_products',
          errorMessage: 'خطا در بارگذاری پستها'
        });
      }else{
        const parentsList=parent.parentsList;
        const followerParam={}
        followerParam.where={and:[{followerId:userId},{isFollowing:true}]};
        followerParam.fields=["followedId"];
        app.models.Follow.find(followerParam,function(error, followers) {
          if(error){
            callback(null, {
              errorCode: 17,
              lbError: error,
              errorKey: 'server_product_error_get_my_products',
              errorMessage: 'خطا در بارگذاری پستها'
            });
          }else{
            return getParentProducts(parentsList,followers,userId,callback);
          }
        });

      }
    });

  };
  Model.remoteMethod(
    'getFollowboardProducts',
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
        path: '/getFollowboardProducts',
        verb: 'POST',
      },
    }
  );

  Model.getSpecializedProductIn24h = function (data, callback) {
    const userId=data.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return;
    }
    let nowtime=new Date();
    nowtime.setDate(nowtime.getDate()-1);
    const params={};
    params.where={and:[{memberId:userId},{isSpecial:true},{cdate:{lt:nowtime}}]};



    return Model.find(params)
      .then(res => {

        callback(null, res);
      }).catch(err => {

        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_product_error_get_my_products',
          errorMessage: 'خطا در یافتن آخرین پست منتشر شده'
        });
        return err;
      });
  };


  Model.remoteMethod(
    'getSpecializedProductIn24h',
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
        path: '/me/getSpecializedProductIn24h',
        verb: 'POST',
      },
    }
  );
  Model.getLastSpecializedProduct = function (data, callback) {
    const userId=data.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    const params={};
    params.where={and:[{memberId:userId},{isSpecial:true}]};
    params.order='id DESC';
    params.limit=1;


    return Model.find(params)
      .then(res => {

        if(res.length>0){
          let product=res[0];
          let second=(new Date()-new Date(product.cdate))/1000;
          product.time=second;
          callback(null, product);
        }else{
          callback(null, {});
        }
      }).catch(err => {

        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_product_error_get_my_products',
          errorMessage: 'خطا در یافتن آخرین پست منتشر شده'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getLastSpecializedProduct',
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
        path: '/me/getLastSpecializedProduct',
        verb: 'POST',
      },
    }
  );

  Model.geComments = function (params, callback) {
    const productId=params.productId ;
    if(!productId){
      callback(new Error('productId is require'));
      return
    }
    params.where={id:productId};
    //params.order='id DESC';
    params.include=  [{
      relation: 'comments',
      scope: {
        //fields: ['id', 'fullName','userKey','profileImage','avatar'],
        include:[ {
          relation: 'member',
            scope: {
              fields: ['id', 'fullName','userKey','profileImage','avatar','displayName'],
              //where: {orderId: 5}
          }
        },

        {
          relation: 'comments',
          scope: {
            include:[{
              relation: 'member',
                scope: {
                  fields: ['id', 'fullName','userKey','profileImage','avatar','displayName'],
                  //where: {orderId: 5}
              }
            },
            {
              relation: 'parent',
              scope: {
                //fields: ['id','commentId','memberId','productId','text','cdate',],
                include:{
                  relation: 'member',
                    scope: {
                      fields: ['userKey'],
                      //where: {orderId: 5}
                  }
                }
              }
            },
          ]
          }
        }
      ],

      }
    },
    {
      relation: 'member',
      scope: {
        fields: ['id', 'fullName','userKey','profileImage','avatar','displayName'],

      }
    }]



  return Model.find(params)
      .then(res => {

        callback(null, res);
      }).catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_product_error_get_product_comments',
          errorMessage: 'خطا در بارگذاری کامنتها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'geComments',
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
        path: '/geComments',
        verb: 'POST',
      },
    }
  );


  const getParentProductsCounts= (parentsList,followers,userId,lastSeenProductDate,callback,)=>{

    followers=followers.map(item=>item.followedId)
    followers.push(userId);
    //let userIdList=followers.concat(parentsList)
    const params={}

    const orFilter1=followers.map(parentId=>{return {memberId:parentId}});
    const orFilter2=parentsList.map(parentId=>{return {and:[
        {memberId:parentId},
        {isSpecial:true},
      ]}});

    const orFilter=orFilter1.concat(orFilter2);
    let andFilter=[{memberId:{neq: userId}, isDeleted:{neq: true}},{or:orFilter}];
    if(lastSeenProductDate){andFilter.push({cdate: {gt:lastSeenProductDate}})}
    const filter={and:andFilter}

    params.where=filter;
    params.fields=['id'];

    return Model.find(params)
      .then(res => {


        callback(null, res.length);
      }).catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_product_error_get_my_products',
          errorMessage: 'خطا در بارگذاری تعداد پستها'
        });
        return err;
      });

  }
  Model.getUserNewProductCount = function (params, callback) {

    const userId = params.userId;
    if (!userId) {
      callback(new Error('token expier'));
      return;
    }

    app.models.Member.findById(userId,{fields:["parentsList","lastSeenProductDate"]},function(error, member) {
      if(error){
        callback(null, {
          errorCode: 17,
          lbError: error,
          errorKey: 'server_product_error_get_my_products',
          errorMessage: 'خطا در بارگذاری تعداد پستها'
        });
      }else{

        const parentsList=member.parentsList;
        const followerParam={};
        followerParam.where={and:[{followerId:userId},{isFollowing:true}]};
        followerParam.fields=["followedId"];
        app.models.Follow.find(followerParam,function(error, followers) {
          if(error){
            callback(null, {
              errorCode: 17,
              lbError: error,
              errorKey: 'server_product_error_get_my_products',
              errorMessage: 'خطا در بارگذاری تعداد پستها'
            });
          }else{
            return getParentProductsCounts(parentsList,followers,userId,member.lastSeenProductDate,callback);
          }
        });

      }
    });



  };

  Model.remoteMethod(
    'getUserNewProductCount',
    {
      accepts: {
        arg: 'data',
        type: 'object',
        http: {source: 'body'}
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        path: '/getUserNewProductCount',
        verb: 'POST',
      },
    }
  );


};


