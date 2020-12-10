'use strict';

module.exports = function(Model) {
  
  Model.getUserAnnounce = function (params, callback) {
    console.log('4444444444=',params);
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    params.where={reciverId:userId};
    params.include=  {
      relation: 'share',
        scope: {
          //fields: ['id',],
            include: [{
              relation: 'post',
                scope: {
                  //fields: ['id',],
                  include: {
                    relation: 'member',
                    fields: ['id', 'displayName','userKey','profileImage','avatar'],
                      scope: {
                        //fields: ['id',],
                        //where: {orderId: 5}
                      }
                  }
                }
            },
            {
              relation: 'sender',
                scope: {
                  fields: ['id', 'displayName','userKey','profileImage','avatar'],
                  //where: {orderId: 5}
                }
            }
          ]
      }
    }

   // params.where={memberId:userId};
    params.order='id DESC';
    return Model.find(params)
      .then(res => {
        console.log('announce======',res);
        callback(null, res);
      }).then(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_share_error_get_my_shares',
          errorMessage: 'خطا در بارگذاری اعلان ها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserAnnounce',
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
        path: '/getUserAnnounce',
        verb: 'POST',
      },
    }
  );

};


