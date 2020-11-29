'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId; 
module.exports = function(Model) {
  Model.followUser = async (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    if(!data.followedId){
      callback(new Error('followedId is requer'));
      return
    }
    const followedId=data.followedId
    const where={and:[{followerId:data.userId},{followedId:followedId}]}
    const entityList= await Model.find({where: where});
    
    let entity;
    if(entityList && entityList[0] ){
      entity=entityList[0];
      entity.isFollowing=!entity.isFollowing
      entity.udate=new Date();
    }else{
      entity={followerId:userId,followedId:followedId,isFollowing:true,cdate:new Date(),udate:new Date()}
    }

    console.log('entity====',entity);
    
    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,entity);
      }).then(err=>{
        callback(null,{errorCode:17, lbError:error, errorKey:'server_post_error_add_follow',errorMessage:'خطا در دنبال کردن. دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'followUser',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/followUser',
        verb: 'POST',
      },
    }
  );

  Model.getFllowers = function (params, callback) {
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

    params.where={memberId:userId};
    params.order='id DESC';
    return Model.find(params)
      .then(res => {

        callback(null, res);
      }).then(err => {
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
    'getFllowers',
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
        path: '/me/getFllowers',
        verb: 'POST',
      },
    }
  );
  Model.getUserFollowers = function (params, callback) {
    
    const userKey=params.userKey ;
    if(!userKey){
      callback(new Error('token expier'));
      return
    }
    userKey=userKey.toLowerCase();
    params.where={userKey:userKey};
    params.fields=['id','fullName','userKey','profileImage','avatar'];
    params.order='id DESC';
    params.include=  {
      relation: 'posts',
      scope: {
        fields: ['id','message','file'],
        /*include: {
          relation: 'comments',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }
   

    return  app.models.Member.find(params)
      .then(res => {
        console.log(res)
      
        callback(null,res);

      }).then(err => {
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
    'getUserFolloers',
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
        path: '/getUserFolloers',
        verb: 'POST',
      },
    }
  );

 

};


