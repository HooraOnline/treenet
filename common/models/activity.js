'use strict';

module.exports = function (Model) {
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

  Model.getUserAnnounce = function (params, callback) {
    const userId = params.userId;
    if (!userId) {
      callback(new Error('An error occurred'));
      return;
    }
    params.where = {receiverId: '_' + userId};
    params.order = 'id DESC';
    params.include = [
      {
        relation: 'join',
        scope: {
          fields: ['id', 'displayName', 'userKey', 'profileImage', 'username','mobile'],

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
                fields: ['id', 'displayName', 'userKey', 'profileImage',],
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
      callback(new Error('An error occurred'));
      return;
    }
    params.where = {receiverId: '_' + userId, isSeen: {neq: true}};
    params.field = 'id'

    // return Model.count(params)
    return Model.find(params)
      .then(res => {

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


