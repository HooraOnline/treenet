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



  Model.addPost =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    let expireDay=data.expireDay ||10;
    let date=new Date();
    let expireDate = new Date(date.setDate(date.getDate() + expireDay));
    console.log(expireDate);
    let entity={
      type:data.postType ||'post',
      postType:data.postType ||'post',
      memberId:userId,
      file:data.file,
      fileExtention:data.fileExtention.toLowerCase(),
      fileType:data.fileExtention.split('/')[0].toLocaleLowerCase(),
      text:data.text,
      isSpecial:data.isSpecial,
      externalLink:data.externalLink,
      cdate:new Date(),
      udate:new Date(),
      expireDate:expireDate,
    };
    if(data.marketerProductId){
      entity.marketerProductId=data.marketerProductId;
    }
    if(entity.id){
      entity.udate=new Date();
    }else{
      entity.cdate=new Date();
    }

    return Model.updateOrCreate(entity, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'server_post_error_add_post',errorMessage:'خطا در ارسال پست. دوباره سعی کنید.'});
      }else{
        callback(null,res);
      }
    })

  };

  Model.remoteMethod(
    'addPost',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/addPost',
        verb: 'POST',
      },
    }
  );


  Model.addProduct =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    let entity={
      type:'product',
      memberId:userId,
      file:data.file,
      fileExtention:data.fileExtention.toLowerCase(),
      fileType:data.fileExtention.split('/')[0].toLocaleLowerCase(),
      text:data.text,
      price:data.price,
      title:data.title,
      commission:data.commission || 0,
      isSelivery:data.isSelivery,
      isSpecial:data.isSpecial,//مشارکت در فروش
      cdate:new Date(),
      udate:new Date()
    };
    if(entity.id){
      entity.udate=new Date();
    }else{
      entity.cdate=new Date();
    }

    return Model.updateOrCreate(entity, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا در اضافه کردن کالا',errorMessage:'خطا در اضافه کردن کالا. دوباره سعی کنید.'});
      }else{
        let marketerProduct={marketerId:userId,productId:res.id,cdate:new Date(), };
        app.models.Marketerproduct.create(marketerProduct);
        callback(null,res);
      }
    });
  };

  Model.remoteMethod(
    'addProduct',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/addProduct',
        verb: 'POST',
      },
    }
  );


  Model.getById = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    const postId=params.postId ;
    if(!postId){
      callback(new Error('An error occurred'));
      return
    }

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
    }]
    //params.where={postId:postId,isDeleted:{neq: true }};
    return Model.findById(postId,params, function(err, res) {
      if(err){
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_post_error_get_my_posts',
          errorMessage: 'خطا در بارگذاری پست'
        });
      }else{
        callback(null, res);
      }
    })

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

  Model.removePost =  (data, callback)=> {

    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    if(!data.postId){
      callback(new Error('postId not found'));
      return
    }
    let postId=data.postId;
    Model.findById(postId)
      .then(post=>{
        if(post.memberId.toString()!==userId.toString()){
          callback(null,{errorCode:502,errorKey:'عدم دسترسی',errorMessage:'عدم دسترسی.'});
          return;
        }
        return Model.destroyById(postId)
          .then(res=>{
            if(post.postType!=='selivery'){
              const folder=data.fileType.toLocaleLowerCase()==='video'?'post_video':'post_image';
              Model.app.models.container.removeFile(folder,data.file);
            }

            callback(null,entity);
          })
          .catch(err=>{
            callback(null,{errorCode:17, lbError:err, errorKey:'server_post_error_remove_post',errorMessage:'خطا در حذف پست. دوباره سعی کنید.'});
            return err;
          });
      })
      .catch(err=>{
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا در حذف پست. دوباره سعی کنید.',errorMessage:'خطا در حذف پست. دوباره سعی کنید.'});
        return err;
      });





    const entity={isDeleted:true,delteDate:new Date()};

  };

  Model.remoteMethod(
    'removePost',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/removePost',
        verb: 'POST',
      },
    }
  );

  Model.getMyPosts = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  {
      relation: 'member',
      scope: {
        fields: ['id', 'fullName','userKey','profileImage','avatar','displayName'],
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
      type:'product',
      //isDeleted:{neq: true }
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
          errorKey: 'server_post_error_get_my_posts',
          errorMessage: 'خطا در بارگذاری پستها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getMyPosts',
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
        path: '/me/getPosts',
        verb: 'POST',
      },
    }
  );

  Model.getStoreProducts = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  {
      relation: 'member',
      scope: {
        fields: ['id', 'fullName','userKey','profileImage','avatar','displayName'],
        /*include: {
          relation: 'orders',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }

    params.where={memberId:userId,type:'product'};
    params.order='id DESC';
    return Model.find(params)
      .then(res => {

        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'خطا در بارگذاری کالاها',
          errorMessage: 'خطا در بارگذاری کالاها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getStoreProducts',
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
        path: '/getStoreProducts',
        verb: 'POST',
      },
    }
  );

  Model.getParticipatoryProduct = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  {
      relation: 'member',
      scope: {
        fields: ['id', 'fullName','userKey','profileImage','avatar','displayName'],
        /*include: {
          relation: 'orders',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }


    params.where={isSelivery:true,type:'product'};
    params.order='id DESC';
    return Model.find(params)
      .then(res => {

        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'خطا در بارگذاری کالاها',
          errorMessage: 'خطا در بارگذاری کالاها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getParticipatoryProduct',
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
        path: '/getParticipatoryProduct',
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

  const getParentPosts= (parentsList,followers,userId,callback,)=>{

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
          app.models.Member.update({id:userId,lastSeenPostDate:res[0].cdate})
        }

        callback(null, res);
      }).catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_post_error_get_my_posts',
          errorMessage: 'خطا در بارگذاری پستها'
        });
        return err;
      });

  }

  Model.getFollowboardPosts =  function (data, callback) {
    const userId=data.userId ;


    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    app.models.Member.findById(userId,{fields:["parentsList"]},function(error, parent) {
      if(error){
        callback(null, {
          errorCode: 17,
          lbError: error,
          errorKey: 'server_post_error_get_my_posts',
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
              errorKey: 'server_post_error_get_my_posts',
              errorMessage: 'خطا در بارگذاری پستها'
            });
          }else{
            return getParentPosts(parentsList,followers,userId,callback);
          }
        });

      }
    });

  };
  Model.remoteMethod(
    'getFollowboardPosts',
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
        path: '/getFollowboardPosts',
        verb: 'POST',
      },
    }
  );

  Model.getSpecializedPostIn24h = function (data, callback) {
    const userId=data.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
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
          errorKey: 'server_post_error_get_my_posts',
          errorMessage: 'خطا در یافتن آخرین پست منتشر شده'
        });
        return err;
      });
  };


  Model.remoteMethod(
    'getSpecializedPostIn24h',
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
        path: '/me/getSpecializedPostIn24h',
        verb: 'POST',
      },
    }
  );
  Model.getLastSpecializedPost = function (data, callback) {
    const userId=data.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    const params={};
    params.where={and:[{memberId:userId},{isSpecial:true}]};
    params.order='id DESC';
    params.limit=1;


    return Model.find(params)
      .then(res => {

        if(res.length>0){
          let post=res[0];
          let second=(new Date()-new Date(post.cdate))/1000;
          post.time=second;
          callback(null, post);
        }else{
          callback(null, {});
        }
      }).catch(err => {

        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_post_error_get_my_posts',
          errorMessage: 'خطا در یافتن آخرین پست منتشر شده'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getLastSpecializedPost',
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
        path: '/me/getLastSpecializedPost',
        verb: 'POST',
      },
    }
  );

  Model.geComments = function (params, callback) {
    const postId=params.postId ;
    if(!postId){
      callback(new Error('postId is require'));
      return
    }
    params.where={id:postId};
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
                //fields: ['id','commentId','memberId','postId','text','cdate',],
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
          errorKey: 'server_post_error_get_post_comments',
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


  const getParentPostsCounts= (parentsList,followers,userId,lastSeenPostDate,callback,)=>{

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
    if(lastSeenPostDate){andFilter.push({cdate: {gt:lastSeenPostDate}})}
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
          errorKey: 'server_post_error_get_my_posts',
          errorMessage: 'خطا در بارگذاری تعداد پستها'
        });
        return err;
      });

  }
  Model.getUserNewPostCount = function (params, callback) {

    const userId = params.userId;
    if (!userId) {
      callback(new Error('An error occurred'));
      return;
    }

    app.models.Member.findById(userId,{fields:["parentsList","lastSeenPostDate"]},function(error, member) {
      if(error){
        callback(null, {
          errorCode: 17,
          lbError: error,
          errorKey: 'server_post_error_get_my_posts',
          errorMessage: 'خطا در بارگذاری تعداد پستها'
        });
      }else if(!member){
        callback(null, {
          errorCode: 17,
          lbError: error,
          errorKey: 'fa_server_member_user_notExist',
          errorMessage: 'کاربر وجود ندارد'
        });
        return;
      }
      else{
        console.log(1111111111);
        console.log(member);

        const parentsList=member.parentsList;
        const followerParam={};
        followerParam.where={and:[{followerId:userId},{isFollowing:true}]};
        followerParam.fields=["followedId"];
        app.models.Follow.find(followerParam,function(error, followers) {
          if(error){
            callback(null, {
              errorCode: 17,
              lbError: error,
              errorKey: 'server_post_error_get_my_posts',
              errorMessage: 'خطا در بارگذاری تعداد پستها'
            });
          }else{
            return getParentPostsCounts(parentsList,followers,userId,member.lastSeenPostDate,callback);
          }
        });

      }
    });



  };

  Model.remoteMethod(
    'getUserNewPostCount',
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
        path: '/getUserNewPostCount',
        verb: 'POST',
      },
    }
  );


};


