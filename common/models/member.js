'use strict';
var app = require('../../server/server');
const jwtRun = require('../../utils/jwtRun');

module.exports = function(Model) {
  //Model.disableRemoteMethod("create", true);
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

  delete Model.validations.email;

  // Adds email format validation
  // Note custom validator because validatesFormat with regex will return false on a null value
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  Model.validate('email', function (err) { if (!re.test(this.email) && this.email !== undefined) err(); }, {message: 'Email format is invalid'});

  // Adds email uniqueness validation
  Model.validatesUniquenessOf('email', {message: 'Email already exists'});




  const unsucsessLoginNumber={};
  const unsucsessLoginNumberFlag={};
  const unsucsessLoginTime={};
  Model.loginMember = function(params, callback) {
    console.log(22222222222222222222);
    console.log(params);
    params.username=params.username.toLowerCase();
    if(unsucsessLoginNumber[params.username] && unsucsessLoginNumber[params.username]>2){
      if(!unsucsessLoginNumberFlag[params.username]){
        setTimeout(()=>{
          delete unsucsessLoginNumberFlag[params.username];
          delete  unsucsessLoginNumber[params.username];
        },1800000);
      }
      unsucsessLoginNumberFlag[params.username]=true;
      return callback(new Error('لاگین ناموفق بصورت پی در پی، حداقل 30 دقیقه صبر کرده و دوباره امتحان کنید'));
    }
    console.log(params);
    Model.login(params, function(err, res) {
      if (err){
        console.log(err);
        unsucsessLoginNumber[params.username]=unsucsessLoginNumber[params.username]?++unsucsessLoginNumber[params.username]:1;
        unsucsessLoginTime[params.username]=new Date();
        return callback(new Error('ورود ناموفق'));
      }
      delete unsucsessLoginNumber[params.username];
      delete unsucsessLoginTime[params.username];
      if (res.id) {
        return Model.findById(res.userId, {}, function(err2, member) {
          //خطا در لود اطلاعات کاربر'
          if(err2 || !member)
            return callback(new Error('ورود ناموفق1'));
          //'اکانت شما توسط مدیر سیستم غیر فعال شده است'
          if (!member.isActive)
            return callback(new Error("ورود ناموفق2"));

          delete member.password;
          delete member.tempPassword;
          delete member.oldPassword;
          member.tempPassword="";
          member.beforloginDate = member.loginDate;
          member.loginDate = new Date().toJSON();
          member.state = 'login';
          const token = jwtRun.sign({userId: member.id});
          delete member.id;
          const responseObject =Object.assign(member,{token: token}) ;
          callback(err2, responseObject);
          Model.updateOrCreate(member, (err3, res3)=> {

          });

        });
      }
    });
  };
  Model.remoteMethod('loginMember', {
    accepts: [{
      arg: 'params',
      type: 'object',
      http: { source: 'body' }
    },],
    returns: {
      arg: 'result',
      type: 'object',
      root: true
    },
    http: {
      path: '/loginMember',
      verb: 'POST',
    },
  });
};
