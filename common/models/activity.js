'use strict';

module.exports = function (Model) {
  Model.getUserAnnounce = function (params, callback) {
    const userId = params.userId;
    if (!userId) {
      callback(new Error('token expier'));
      return;
    }
    params.where = {receiverId: '_' + userId};
    params.order = 'id DESC';
    params.include = [
      {
        relation: 'join',
        scope: {
          fields: ['id', 'displayName', 'userKey', 'profileImage', 'username'],

        },

      },
      {
        relation: 'follow',
        scope: {
          // fields: ['id',],
          include: [
            {
              relation: 'follower',
              scope: {
                fields: ['id', 'displayName', 'userKey', 'profileImage'],
                //where: {orderId: 5}
              },
            },
          ],
        },
      },

      {
        relation: 'share',
        scope: {
          // fields: ['id',],
          include: [{
            relation: 'post',
            scope: {
              // fields: ['id',],
              include: {
                relation: 'member',
                fields: ['id', 'displayName', 'userKey', 'profileImage', 'avatar'],
                scope: {
                  //fields: ['id',],
                  //where: {orderId: 5}
                }
              }
            }
          },
            {
              relation: 'member',
              scope: {
                fields: ['id', 'displayName', 'userKey', 'profileImage', 'avatar'],
                //where: {orderId: 5}
              }
            }
          ]
        }
      },

      {
        relation: 'like',
        scope: {
          //fields: ['id',],
          include: [{
            relation: 'post',
            scope: {
              //fields: ['id',],
              include: {
                relation: 'member',
                fields: ['id', 'displayName', 'userKey', 'profileImage', 'avatar'],
                scope: {
                  //fields: ['id',],
                  //where: {orderId: 5}
                }
              }
            }
          },
            {
              relation: 'member',
              scope: {
                fields: ['id', 'displayName', 'userKey', 'profileImage', 'avatar'],
                //where: {orderId: 5}
              }
            }
          ]
        }
      },
      {
        relation: 'replay',
        scope: {
          //fields: ['id',],
          include: [{
            relation: 'post',
            scope: {
              //fields: ['id',],
              include: {
                relation: 'member',
                fields: ['id', 'displayName', 'userKey', 'profileImage', 'avatar'],
                scope: {
                  //fields: ['id',],
                  //where: {orderId: 5}
                }
              }
            }
          },

            {
              relation: 'member',
              scope: {
                fields: ['id', 'displayName', 'userKey', 'profileImage', 'avatar'],
                //where: {orderId: 5}
              }
            }
          ]
        }
      },
    ]


    return Model.find(params)
      .then(res => {
        console.log('announce======', res);
        Model.updateAll({isSeen: {neq: true}}, {isSeen: true});
        callback(null, res);
      }).catch(err => {
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
        http: {source: 'body'}
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

  Model.getNewAnnounceCount = function (params, callback) {
    const userId = params.userId;
    if (!userId) {
      callback(new Error('token expier'));
      return;
    }
    params.where = {receiverId: '_' + userId, isSeen: {neq: true}};
    params.field = 'id'
    console.log(params)
    // return Model.count(params)
    return Model.find(params)
      .then(res => {
        console.log('announce======', res);
        callback(null, res.length);
      }).catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_share_error_get_my_shares',
          errorMessage: 'خطا در بارگذاری تعداد اعلان ها'
        });
        return err;
      });
  };

  Model.remoteMethod(
    'getNewAnnounceCount',
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
        path: '/getNewAnnounceCount',
        verb: 'POST',
      },
    }
  );


};


