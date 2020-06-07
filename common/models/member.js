'use strict';
var app = require('../../server/server');
const jwtRun = require('../../utils/jwtRun');
const uuidV4 = require('uuid/v4')
module.exports = function(Model) {
  //Model.disableRemoteMethod("create", true);
  Model.disableRemoteMethod("upsert", true);
  Model.disableRemoteMethod("replaceOrCreate", true);
  Model.disableRemoteMethod("upsertWithWhere", true);
  Model.disableRemoteMethod("exists", true);
  Model.disableRemoteMethod("findById", true);
  //Model.disableRemoteMethod("find", true);
  Model.disableRemoteMethod("findOne", true);
  Model.disableRemoteMethod("updateAll", true);
  Model.disableRemoteMethod("deleteById", true);
  //Model.disableRemoteMethod("count", true);
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
  const checkRegentCode =async (regentCode,entity)=> {

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
    let mobileConfirmCode =Math.random().toString().substring(2,6);
    entity.mobileConfirmCode = mobileConfirmCode;
    entity.password = mobileConfirmCode;
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
    entity.emailVerify=false;
    entity.role='normalUser'
    entity.cdate = new Date().toJSON();
    entity.udate = new Date().toJSON();
    return entity;
  };

  const initUpdateUserEntity = (entity,data)=> {
    let mobileConfirmCode = Math.random().toString().substring(2,6);
    entity.mobileConfirmCode = mobileConfirmCode;
    entity.numberOfMobileRegister = entity.numberOfMobileRegister+1 ;
    entity.udate = [new Date().toJSON()];
    return entity;
  };


  const sendSmsCode =async (mobile,confirmCode,callback)=> {
    console.log('smscode was  sended=',confirmCode)
  };
  Model.registerMe = async (data, callback)=> {
    /* if(helper.isXssScripts(data))
       return  callback(new Error("not secure"));*/

    if(!data.mobile){
      return callback({code:122,key:'enter_your_phone_number',message:'required regent Code',pmessage:'شماره موبایل وارد نشده است.'});
    }
    let entity={};
    let regentStatue;
    const userList=await checkMobileExist(data.mobile);
    console.log('&&&&&&&&&&&&&&&&&&&&=',userList);
    if(userList.length>0 ){
      entity=userList[0];
      regentStatue=await checkRegentCode(data.regentCode,entity);
      entity=initUpdateUserEntity(entity,data);
    }else{
      regentStatue=await checkRegentCode(data.regentCode,entity);
      entity=initAddUserEntity(entity,data);
    }


    return Model.updateOrCreate(entity)
      .then(res=>{
        if(regentStatue=='no_regentCode'){
          return callback({code:122,key:'required_invitationLink',message:'required regent Code',pmessage:'ثبت نام بدون کد دعوت امکانپذیر نیست'});
        }
        if(regentStatue=='invalid_regentcode'){
          return callback({code:122,key:'invalid_invitation_link',message:'invalid regent Code',pmessage:'این لینک دعوت معتبر نیست'});
        }

        callback(null,entity)
        sendSmsCode(entity.mobile,entity.mobileConfirmCode);
        setTimeout(()=>Model.updateOrCreate({id:res.id,mobileConfirmCode:'expired'}),60000*3)
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
        path: '/me/register',
        verb: 'POST',
      },
    }
  );


  Model.confirmMobile = async (data, callback)=> {
    /* if(helper.isXssScripts(data))
       return  callback(new Error("not secure"));*/

    if(!data.mobile){
      callback(new Error('mobile is require'));
      return
    }
    if(!data.mobileConfirmCode){
       callback(new Error('confirmCode is require'));
       return
    }
    if(!data.regentCode){
      callback(new Error('regentCode  is require'));
      return
    }
    const userList= await Model.find({where: {mobile:data.mobile}});
    if(!userList || !userList[0]){
      callback(new Error('invalid mobile.'));
      return;
    }
    const user=userList[0];

    if(user.mobileVerified){
      callback(new Error('mobile was verified before.'));
      return;
    }
    if(user.mobileConfirmCode=='expired'){
      callback({code:127,key:'expired_confirmation_code',message:'invalid confirm Code',pmessage:'کد تایید منقضی شده است'});
      return;
    }
    if(user.mobileConfirmCode!==data.mobileConfirmCode){
      callback({code:443,key:'invalid_mobile_confirmation_code',message:'invalid confirm Code',pmessage:'کد تایید موبایل اشتباه است'});
      return;
    }
    const regentList= await Model.find({where: {invitationCode: data.regentCode}});
    if(!regentList || !regentList[0]){
      callback(new Error('regentCode code is invalid'));
      return
    }
    const regent=regentList[0];
    let entity={id:user.id, regentCode:regent.invitationCode,regentId:regent.id ,  mobileVerified:true,state:'confirmRegistration'};
    callback(null, {mobileVerified:true});
    return Model.updateOrCreate(entity);
  };
  Model.remoteMethod(
    'confirmMobile',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/confirmMobile',
        verb: 'POST',
      },
    }
  );

  Model.initMyProfile = async (data, callback)=> {
    /* if(helper.isXssScripts(data))
       return  callback(new Error("not secure"));*/
    if(!data.mobile){
      callback(new Error('mobile is require'));
      return
    }
    const userList= await Model.find({where: {mobile:data.mobile}});
    if(!userList || !userList[0]){
      callback(new Error('invalid mobile.'));
      return;
    }
    const user=userList[0];
    const currentDate=new Date();
    let entity={
      id:user.id,
      firstName:data.firstName,
      lastName:data.lastName,
      gender:data.gender,
      age:data.gender,
      biarthdate: currentDate.setYear(currentDate.getFullYear()-Number(data.age)),
      state:'confirmRegistrationStep2'
    };
    callback(null, {invitationCode:user.invitationCode});
    return Model.updateOrCreate(entity);
  };
  Model.remoteMethod(
    'initMyProfile',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/initProfile',
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
          delete member.mobileConfirmCode;
          delete member.oldPassword;
          member.mobileConfirmCode="";
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
