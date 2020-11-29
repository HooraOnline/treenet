'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId; 
module.exports = function(Model) {
  Model.addPost = async (data, callback)=> {

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
    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,entity);
      }).then(err=>{
        callback(null,{errorCode:17, lbError:error, errorKey:'server_post_error_add_post',errorMessage:'خطا در ارسال پست. دوباره سعی کنید.'});
        return err;
      });
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

  Model.getFollowboardPosts = async function (data, callback) {
   
   
    const userId=data.userId ;
    console.log('aaaaaaaaaaaaaaaaaa===',userId);
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    
    
    const user= await app.models.Member.findById(userId,{fields:["parentsList"]});
    const parentsList=user.parentsList;
    parentsList.push(userId);
   
    
    const params={}
    params.include=  {
      relation: 'member',
      scope: {
        fields: ['id', 'fullName','userKey','dispplayName','profileImage','avatar'],
        /*include: {
          relation: 'orders',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }
    
    const orFilter=parentsList.map(parentId=>{return {memberId:parentId}});
    const filter={or:orFilter}
    params.where=filter;
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

  Model.getLastSpecialedPost = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    params.where={and:[{memberId:userId},{isSpecial:true}]};
    params.order='id DESC';
    params.limit=1;

    return Model.find(params)
      .then(res => {
 
        if(res.length>0){
          let post=res[0];
          let secend=(new Date()-new Date(post.cdate))/1000;
          post.time=secend;
          callback(null, post);
        }else{
          callback(null, null);
        }

      }).then(err => {
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
    'getLastSpecialedPost',
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
        path: '/me/getLastSpecialedPost',
        verb: 'POST',
      },
    }
  );


};


