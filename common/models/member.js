'use strict';
var app = require('../../server/server');
const jwtRun = require('../../utils/jwtRun');
const uuidV4 = require('uuid/v4')
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

  delete Model.validations.email;

  // Adds email format validation
  // Note custom validator because validatesFormat with regex will return false on a null value
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  Model.validate('email', function (err) { if (!re.test(this.email) && this.email !== undefined) err(); }, {message: 'Email format is invalid'});

  // Adds email uniqueness validation
  Model.validatesUniquenessOf('email', {message: 'Email already exists'});

  const getUniqid =(mask)=> {
    return mask.replace(/[x]/gi, () => { return Math.random().toString(26)[5]; });
  }
  const checkMobileExist =async (mobile)=> {
    const res= await Model.find({where: {mobile: mobile}})
    return res;
  };

  let regentStatus;
  const setTempRegentCode =async (regentCode,entity)=> {

    if(entity.mobileVerified){
      return 'regentcode_setbefore';
    }

    if(!regentCode){
      return 'no_regentCode';
    }
    const res= await Model.find({where: {invitationCode: regentCode}});
    if(!res[0]){
      return 'invalid_regentcode';
    }
    entity.tempRegentCode=regentCode;
    return 'valid_regentcode';
  };


  const initAddUserEntity =  (entity,data)=> {
    entity.mobile=data.mobile;
    let smsCode = Math.floor((Math.random() * 100000) + 1).toString();
    entity.smsCode = smsCode;
    entity.password = smsCode;
    let username=entity.mobile.replace('+','');
    entity.username=username;
    entity.username =username.toLowerCase();
    entity.state = 'registermobile';
    entity.mobileVerified=false;
    entity.numberOfMobileRegister=0;
    entity.profileImage = data.profileImage || 'no-image.png';
    entity.invitationCode=getUniqid('xxxxxxxxxxxxxxxxxxxxxxxx');
    entity.loginDate="";
    entity.logOutDate="";
    entity.beforloginDate="";
    entity.permissions=[];
    entity.phoneNumberVerify=false;
    entity.role='normalUser'
    entity.cdate = new Date().toJSON();
    entity.udate = new Date().toJSON();
    return entity;
  };

  const initUpdateUserEntity = (entity,data)=> {
    let smsCode = Math.floor((Math.random() * 100000) + 1).toString();
    entity.smsCode = smsCode;
    entity.numberOfMobileRegister = entity.numberOfMobileRegister+1 ;
    entity.udate = [new Date().toJSON()];
    return entity;
  };


  const sendSmsCode =async (mobile,confirmCode,callback)=> {
    return
  };
  Model.registerMe = async (data, callback)=> {
    /* if(helper.isXssScripts(data))
       return  callback(new Error("not secure"));*/

    if(!data.mobile){
      return callback(new Error('شماره موبایل وارد نشده'));

    }
    let entity={};
    let regentStatue;
    const userList=await checkMobileExist(data.mobile);
    console.log('&&&&&&&&&&&&&&&&&&&&=',userList);
    if(userList.length>0 ){
      entity=userList[0];
      regentStatue=await setTempRegentCode(data.regentCode,entity);
      entity=initUpdateUserEntity(entity,data);
    }else{
      regentStatue=await setTempRegentCode(data.regentCode,entity);
      entity=initAddUserEntity(entity,data);
    }


    return Model.updateOrCreate(entity)
      .then(res=>{
        if(regentStatue=='no_regentCode'){
          //return callback(new Error('ثبت نام بدون کد دعوت امکانپذیر نیست'));
          return callback({code:122,key:'required_regentCode',message:'required regent Code',pmessage:'ثبت نام بدون کد دعوت امکانپذیر نیست'});
        }
        if(regentStatue=='invalid_regentcode'){
          return callback({code:122,key:'invalid_regentCode',message:'invalid regent Code',pmessage:'این لینک دعوت معتبر نیست'});
        }

        callback(null,entity)
        //sendSmsCode(entity.mobile,entity.smsCode,callback);
      }).then(err=>{
        app.models.Bug.create({err:err});
        return err;
      })

  };
  Model.remoteMethod(
    'registerMe',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/registerMe',
        verb: 'POST',
      },
    }
  );

  Model.confirmMe = async (data, callback)=> {
    /* if(helper.isXssScripts(data))
       return  callback(new Error("not secure"));*/

    if(!data.mobile){
      return callback(new Error('mobile is require'));

    }
    let entity={};


    console.log(entity);
    return Model.updateOrCreate(entity, function (err, res) {
      if (err) {
        app.models.Bug.create({err:err}); callback(err);
      } else {
        callback(err, res);
        sendSmsCode(entity.mobile,entity.smsCode);
      }
    });
  };
  Model.remoteMethod(
    'registerMe',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/registerMe',
        verb: 'POST',
      },
    }
  );


  //برای لینکهای دعوتی که بدون اجازه صاحب موبایل توسط دوست او در ترینت ثبت شده
  //این لینک به موبایل کاربر ارسال می شود و کاربر با کلیک آن وارد پنل خود می شود
  Model.confirmMeByLink = async (data, callback)=> {
    /* if(helper.isXssScripts(data))
       return  callback(new Error("not secure"));*/


  };
  Model.remoteMethod(
    'registerMe',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/registerMe',
        verb: 'POST',
      },
    }
  );

  const unsucsessLoginNumber={};
  const unsucsessLoginNumberFlag={};
  const unsucsessLoginTime={};
  Model.loginMember = function(params, callback) {
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
    Model.login(params, function(err, res) {
      if (err){
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
          delete member.smsCode;
          delete member.oldPassword;
          member.smsCode="";
          member.beforloginDate = member.loginDate;
          member.loginDate = new Date().toJSON();
          member.state = 'login';
          const token = jwtRun.sign({userId: member.id});
          delete member.id;
          const responseObject =Object.assign(member,{token: token}) ;
          callback(err2, responseObject);
          delete member.token;
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
