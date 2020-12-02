'use strict';

module.exports = function(Model) {
  Model.addComment = async (data, callback)=> {
    console.log('comment=',data);
    const postId=data.postId;
    const text=data.text;
    const userId=data.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    if(!postId){
      callback(new Error('postId is requier'));
      return
    }
    if(!text){
      callback(new Error('text is requier'));
      return
    }
    let entity={memberId:userId,postId:postId,text:text};
    if(data.commentId){
      entity.commentId=data.commentId;
    }
    if(entity.id){
      entity.udate=new Date();
    }else{
      entity.cdate=new Date();
    }
    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,entity);
      }).then(err=>{
        callback(null,{errorCode:17, lbError:error, errorKey:'server_comment_error_add_comment',errorMessage:'خطا در ارسال پست. دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'addComment',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/addComment',
        verb: 'POST',
      },
    }
  );






  Model.getMyComments = function (params, callback) {
    console.log('4444444444=',params);
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    params.include=  {
      relation: 'member',
        scope: {
        fields: ['id', 'fullName','username','profileImage','avatar'],
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
        console.log(res);
        callback(null, res);
      }).then(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_comment_error_get_my_comments',
          errorMessage: 'خطا در بارگذاری کامنتها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getMyComments',
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
        path: '/me/getComments',
        verb: 'POST',
      },
    }
  );

};


