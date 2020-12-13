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
      .then(follow=>{
        console.log(follow)
        const activity={followId:follow.id,reciverId:('_'+followedId),action:'follow',type:follow.isFollowing?'follow_you':'unfollow_you',cdate:(new Date()).toJSON()};
        app.models.Activity.create(activity);
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

  Model.getUserFollowers = function (params, callback) {
    const userId=params.userId ;
    const memberId=params.memberId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    params.where={and:[{followedId:memberId},{isFollowing: true}]};
    //params.fields=['id'],
    params.order='id DESC';
    params.include=  {
      relation: 'follower',
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

    return Model.find(params)
      .then(res => {
        callback(null, res);
      }).then(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_followers_error_get_followers',
          errorMessage: 'خطا در بارگذاری فالورها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserFollowers',
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
        path: '/getUserFollowers',
        verb: 'POST',
      },
    }
  );
  

 

};


