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
  Model.likePost = (data, callback) => {
    const userId = data.userId;
    if (!userId) {
      callback(new Error('token expier'));
      return;
    }
    if (!data.postId) {
      callback(new Error('postId is requer'));
      return;
    }
    // eslint-disable-next-line max-len
    const entity = {memberId: userId, postId: data.postId, receiverId: data.receiverId, cdate: new Date()};

    return Model.updateOrCreate(entity, function(err, like) {
      if (err) {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_post_error_add_like',
          errorMessage: 'خطا در لایک کردن. دوباره سعی کنید.'
        });
      } else {
        const activity = {
          likeId: like.id,
          receiverId: ('_' + data.receiverId),
          action: 'like',
          type: 'like_post',
          cdate: (new Date()).toJSON(),
        };
        app.models.Activity.create(activity);
        callback(null, entity);
      }
    });

  };

  Model.remoteMethod(
    'likePost',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: {source: 'body'},
      }],
      returns: {arg: 'result', type: 'object', root: true},
      http: {
        path: '/likePost',
        verb: 'POST',
      },
    }
  );

  Model.unlikePost = (data, callback) => {
    const userId = data.userId;
    if (!userId) {
      callback(new Error('token expier'));
      return;
    }
    if (!data.postId) {
      callback(new Error('postId is requer'));
      return;
    }
    const filter = {memberId: userId, postId: data.postId}

    return Model.deleteAll(filter, function(err, res) {
      if (err) {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_post_error_unlike',
          errorMessage: 'خطا در آنلایک کردن. دوباره سعی کنید.'
        });
      } else {
        callback(null, res);
      }
    })

  };

  Model.remoteMethod(
    'unlikePost',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: {source: 'body'}
      }],
      returns: {arg: 'result', type: 'object', root: true},
      http: {
        path: '/unlikePost',
        verb: 'POST',
      },
    }
  );

  Model.getUserLikes = function (params, callback) {
    const userId = params.userId;
    const memberId = params.memberId;
    if (!userId) {
      callback(new Error('token expier'));
      return
    }

    params.where = {memberId: memberId};
    //params.fields=['id'],
    params.order = 'id DESC';
    params.include = {
      relation: 'post',
      scope: {
        //fields: ['id', 'fullName','userKey','profileImage','avatar','displayName'],
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
          errorKey: 'server_likeers_error_get_likeers',
          errorMessage: 'خطا در بارگذاری فالورها'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserLikes',
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
        path: '/getUserLikes',
        verb: 'POST',
      },
    }
  );


};


