'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId;
module.exports = function(Model) {
  Model.addPost =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    let entity={memberId:userId,file:data.file,text:data.text,isSpecial:data.isSpecial,cdate:new Date(),udate:new Date()};
    if(entity.id){
      entity.udate=new Date();
    }else{
      entity.cdate=new Date();
    }
    return Model.updateOrCreate(entity, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:error, errorKey:'server_post_error_add_post',errorMessage:'خطا در ارسال پست. دوباره سعی کنید.'});
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


  Model.getById = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    const postId=params.postId ;
    if(!postId){
      callback(new Error('token expier'));
      return
    }

    params.include=  [{
      relation: 'member',
      scope: {
        fields: ['id', 'fullName','userKey','dispplayName','profileImage','avatar'],
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
              fields: ['id', 'fullName','userKey','profileImage','avatar'],
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
      callback(new Error('token expier'));
      return
    }
    if(!data.postId){
      callback(new Error('postId not found'));
      return
    }
    let postId=data.postId;

    const where={id:postId,memberId:userId};
    const entity={isDeleted:true,delteDate:new Date()};

    return Model.updateAll(where,entity)
      .then(res=>{
        callback(null,entity);
      })
      .catch(err=>{
        callback(null,{errorCode:17, lbError:error, errorKey:'server_post_error_remove_post',errorMessage:'خطا در حذف پست. دوباره سعی کنید.'});
        return err;
      });
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
      callback(new Error('token expier'));
      return
    }
    params.include=  {
      relation: 'member',
      scope: {
        fields: ['id', 'fullName','userKey','profileImage','avatar'],
        /*include: {
          relation: 'orders',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }

    params.where={memberId:userId,isDeleted:{neq: true }};
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
        fields: ['id', 'fullName','userKey','dispplayName','profileImage','avatar'],
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
              fields: ['id', 'fullName','userKey','profileImage','avatar'],
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
    console.log('filter======',filter)
    params.where=filter;
    params.order='id DESC';



    return Model.find(params)
      .then(res => {
        console.log(res);
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
    console.log('data===',data);
    if(!userId){
      callback(new Error('token expier'));
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
      callback(new Error('token expier'));
      return;
    }
    let nowtime=new Date();
    nowtime.setDate(nowtime.getDate()-1);
    const params={};
    params.where={and:[{memberId:userId},{isSpecial:true},{cdate:{gt:nowtime}}]};


    console.log(params);
    return Model.find(params)
      .then(res => {
        console.log('postList===',res);
        callback(null, res);
      }).catch(err => {
        console.log(err);
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
      callback(new Error('token expier'));
      return
    }

    const params={};
    params.where={and:[{memberId:userId},{isSpecial:true}]};
    params.order='id DESC';
    params.limit=1;

    console.log(params);
    return Model.find(params)
      .then(res => {
        console.log(res);
        if(res.length>0){
          let post=res[0];
          let second=(new Date()-new Date(post.cdate))/1000;
          post.time=second;
          callback(null, post);
        }else{
          callback(null, {});
        }
      }).catch(err => {
        console.log(err);
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
              fields: ['id', 'fullName','userKey','profileImage','avatar'],
              //where: {orderId: 5}
          }
        },

        {
          relation: 'comments',
          scope: {
            include:[{
              relation: 'member',
                scope: {
                  fields: ['id', 'fullName','userKey','profileImage','avatar'],
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
        fields: ['id', 'fullName','userKey','profileImage','avatar'],

      }
    }]



  return Model.find(params)
      .then(res => {
        console.log(res);
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


};


