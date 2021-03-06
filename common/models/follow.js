'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId;
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
  const followUser = (userId,followedId,entityList, callback) => {
    let entity;
    if (entityList && entityList[0]) {
      entity = entityList[0];
      entity.isFollowing = !entity.isFollowing;
      entity.udate = new Date();
    } else {
      entity = {followerId: userId, followedId: followedId, isFollowing: true, cdate: new Date(), udate: new Date()};
    }


    return Model.updateOrCreate(entity)
      .then(follow => {

        const activity = {
          followId: follow.id,
          receiverId: ('_' + followedId),
          action: 'follow',
          type: follow.isFollowing ? 'follow_you' : 'unfollow_you',
          cdate: (new Date()).toJSON()
        };
        app.models.Activity.create(activity);
        callback(null, entity);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: error,
          errorKey: 'server_post_error_add_follow',
          errorMessage: 'خطا در دنبال کردن. دوباره سعی کنید.'
        });
        return err;
      });
  };

  Model.followUser = (data, callback) => {
    const userId = data.userId;
    if (!userId) {
      callback(new Error('An error occurred'));
      return;
    }
    if (!data.followedId) {
      callback(new Error('followedId is requer'));
      return;
    }
    const followedId = data.followedId;
    const where = {and: [{followerId: data.userId}, {followedId: followedId}]};
    Model.find({where: where})
      .then(entityList => {
        return followUser(userId,followedId,entityList, callback);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_post_error_add_follow',
          errorMessage: 'خطا در دنبال کردن. دوباره سعی کنید.'
        });
      });
  };

  Model.remoteMethod(
    'followUser',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: {source: 'body'},
      }],
      returns: {arg: 'result', type: 'object', root: true},
      http: {
        path: '/followUser',
        verb: 'POST',
      },
    }
  );

  Model.getUserFollowers = function (params, callback) {
    const userId = params.userId;
    const memberId = params.memberId;

    if (!userId) {
      callback(new Error('An error occurred'));
      return;
    }

    params.where = {and: [{followedId: memberId}, {isFollowing: true}]};
    // params.fields=['id'],
    params.order = 'id DESC';
    params.include = {
      relation: 'follower',
      scope: {
        fields: ['id', 'fullName', 'userKey', 'profileImage', 'avatar','displayName'],
        /*include: {
          relation: 'orders',
            scope: {
            where: {orderId: 5}
          }
        }*/
      },
    };

    return Model.find(params)
      .then(res => {
        callback(null, res);
      }).catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_followers_error_get_followers',
          errorMessage: 'خطا در بارگذاری فالورها',
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
        http: {source: 'body'},
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
      },
      http: {
        path: '/getUserFollowers',
        verb: 'POST',
      },
    }
  );
};

