'use strict';
var app = require('../../server/server');
const jwtRun = require('../../utils/jwtRun');
const uuidV4 = require('uuid/v4')
const request = require('request');
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

  const getUniqId =(mask)=> {
    return mask.replace(/[x]/gi, () => { return Math.random().toString(26)[5]; });
  }
  const checkMobileExist =async (mobile)=> {
    const res= await Model.find({where: {mobile: mobile}})
    return res;
  };

  let regentStatus;
  const checkRegentCode =async (regentCode,entity)=> {
    if(entity.userVerified){
      return 'regentcode_setbefore';
    }
    if(!regentCode){
      return 'no_regentCode';
    }
    const res= await Model.find({where: {invitationCode: regentCode}});
    if(!res[0]){
      return 'invalid_regentcode';
    }
    entity.regentId=res[0].id;
    entity.regentCode=regentCode;
    return 'valid_regentcode';
  };


  const initAddUserEntity =  (entity,data)=> {
    if(data.mobile){
      entity.mobile=data.mobile;
    }
    if(data.email){
      entity.email=data.email;
    }
    let mobileConfirmCode =Math.random().toString().substring(2,6);
    entity.mobileConfirmCode = mobileConfirmCode;
    entity.password = getUniqId('xxxxxxxx');
    entity.tempPassword = entity.password;
    let username=getUniqId('xxxxxxxxxxxxxxxxxxxxxxxx');
    entity.username=username;
    entity.username =username.toLowerCase();
    entity.state = 'registermobile';
    entity.userVerified=false;
    entity.numberOfMobileRegister=0;
    entity.profileImage = data.profileImage || 'defaultProfileImage.png';
    entity.invitationCode=getUniqId('xxxxxxxxxxxxxxxxxxxxxxxx');
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
    if(data.mobile){
      entity.mobile=data.mobile;
    }
    if(data.email){
      entity.email=data.email;
    }
    entity.mobileConfirmCode = mobileConfirmCode;
    entity.numberOfMobileRegister = entity.numberOfMobileRegister+1 ;
    entity.udate = [new Date().toJSON()];
    return entity;
  };

  const sendSmsCode =async (mobile,confirmCode,callback)=> {
    SmsTools.autoSendCode(mobile, "treenetgram.com")
      .then((messageId) => {

      })
      .catch(error => console.log(error));



    request.post({
      url: 'http://ippanel.com/api/select',
      body: {
        "op" : "send",
        "uname" : "YOUR_USERNAME",
        "pass":  "YOUR_PASSWORD",
        "message" : "salam",
        "from": "1000XXX",
        "to" : ["936xxxxx","912xxxx"],

      },
      json: true,
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(response.body);
      } else {
        console.log("whatever you want====",error, response);
      }
    });

  };
  Model.sendConfirmCode = async (data, callback)=> {
    SmsTools.autoSendCode(data.mobile, "treenetgram.com")
      .then((messageId) => {
        console.log(`Sent to ${data.mobile} Message ID: ` + messageId);
      })
      .catch(error => console.log(error));
  };
  Model.remoteMethod(
    'sendConfirmCode',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/sendConfirmCode',
        verb: 'POST',
      },
    }
  );

  Model.beforeRemote('*', function (context, user, next) {
    var req = context.req;
    /* if(helper.isXssScripts(req.body)){
        return  callback(new Error("not secure"));
     }*/
    //req.params.userId=req.userId;
    console.log('ttttttttt==req.userId',req.userId);
    if(req.body){
      req.body.userId=req.userId;
    }
    next();
  });

  const initNewUser =  (regent,geo,geoInfo)=> {
    const user={geo,geoInfo};
    const username=getUniqId('xxxxxxxxx');
    user.username =username.toLowerCase();
    const password = Math.random().toString().substring(2,8);
    user.password =password;
    user.tempPassword = password;
    user.state = 'register';
    user.regentCode=regent.invitationCode;
    user.regentId=regent.id;
    user.invitationCode=getUniqId('xxxxxxxxxxxxxxxxxxxxxxxx');
    user.profileImage = 'defaultProfileImage.png';
    user.loginDate="";
    user.logOutDate="";
    user.beforloginDate="";
    user.permissions=[];
    user.mobileVerify=false;
    user.emailVerify=false;
    user.role='normalUser'
    user.cdate = new Date().toJSON();
    user.udate = new Date().toJSON();

    return user;
  };

  Model.registerMe = async (data, callback)=> {
    if(!data.regentCode){
      return callback({code:1,key:'server_member_required_regent_code',message:'required regent Code',pmessage:'برای ثبت نام باید از طریق لینک دعوت وارد شوید.'});
    }
    const regentList=await Model.find({where: {invitationCode: data.regentCode}});
    if(!regentList){
      callback({code:1,key:'server_public_error',pmessage:'خطایی رخ داد، دوباره تلاش کنید.'});
      return
    }
    if(regentList.length==0){
      callback({code:3,key:'server_member_invalid_invitation_link',pmessage:'این لینک دعوت معتبر نیست'});
      return ;
    }

    let user=initNewUser(regentList[0],data.geo,data.geoInfo);
   // user.forTest=1
    return Model.updateOrCreate(user)
      .then(res=>{
        callback(null,res);
      }).then(err=>{
        callback({code:1,key:'server_public_error',pmessage:'خطایی رخ داد، دوباره تلاش کنید.'});;
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
  Model.checkUserNameExist = async (data, callback)=> {
    if(!data.username){
      callback(new Error('username is require'));
      return
    }
    return Model.find({where: {username:data.username}})
      .then(res=>{
        if(res && res[0])
          callback(null,true);
        else
          callback(null,false);
      }).then(err=>{
        callback({code:7, lbError:error, key:'server_member_error_tryAgain',message:'Error,Pleas try again.',pmessage:'خطایی رخ داد. دوباره تلاش کنید'});
        return err;
      })
  };
  Model.remoteMethod(
    'checkUserNameExist',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/checkUserNameExist',
        verb: 'POST',
      },
    }
  );
  Model.updateUsernameAndPassword = async (data, callback)=> {

    const userId=data.userId;
    if(!userId){
      callback({code:7, lbError:error, key:'server_your_token_expier',pmessage:'کد امنیتی شما منقضی شده است. دوباره لاگین کنید.'});
      return
    }

    if(!data.username){
      callback(new Error('username is require'));
      return
    }
    if(!data.password){
      callback(new Error('password is require'));
      return
    }

    //ObjectId("5444349871af283b92c440cc")
    const currentDate=new Date();
    let entity={
      id:userId,
      username:data.username,
      password:data.password,
      state:'changeUsername',
      isVerify:true,
      udate:new Date(),
    };
    if(data.mobile){
      entity.mobile=data.mobile;
    }
    if(data.email){
      entity.email=data.email;
    }
    if(data.firstName){
      entity.firstName=data.firstName;
    }
    if(data.lastName){
      entity.lastName=data.lastName;
    }
    if(data.age){
      entity.age=data.age;
      entity.biarthDate= currentDate.setYear(currentDate.getFullYear()-Number(data.age));
    }
    if(data.gender){
      entity.gender=data.gender;
    }
    return Model.updateAttributes(entity)
      .then(res=>{
        callback(null,res)
      }).then(err=>{
        if(err.statusCode= 422){
          callback({code:442, lbError:error, key:'server_member_email_is_exist',pmessage:'ایمیل تکراری'});
          return
        }
        callback({code:7, lbError:error, key:'server_public_error',pmessage:'خطایی رخ داد. دوباره تلاش کنید.'});
        return err;
      })
  };
  Model.remoteMethod(
    'updateUsernameAndPassword',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/updateUsernameAndPassword',
        verb: 'POST',
      },
    }
  );

  Model.registerMe_Old = async (data, callback,params)=> {
    if(!data.mobile && !data.email){
      return callback({code:1,key:'server_member_enter_your_phone_number_or_email',message:'required regent Code',pmessage:'شماره موبایل یا ایمیل وارد نشده است.'});
    }
    let filter={or: []};
    if(data.mobile){
      filter.or.push({mobile: data.mobile})
    }
    if(data.email){
      filter.or.push({email: data.email})
    }
    let entity={};
    let regentStatue;
    if(filter.or.length>0){
      const userList= await Model.find({where:filter});
      if(userList && userList.length>0 ){
        if(userList[0].userVerified){
          return callback({code:2,key:'server_member_user_was_verified_before',message:'user was verified before',pmessage:'این موبایل قبلا ثبت شده است.'});
          return;
        }
        entity=userList[0];
        regentStatue=await checkRegentCode(data.regentCode,entity);
        entity=initUpdateUserEntity(entity,data);
      }else{
        regentStatue=await checkRegentCode(data.regentCode,entity);
        entity=initAddUserEntity(entity,data);
      }

    }
    if(regentStatue=='no_regentCode'){
      return callback({code:2,key:'server_member_required_invitationLink',message:'required regent Code',pmessage:'برای شبکه سازی، باید از طریق لینک دعوت وارد سایت شوید.'});
    }
    if(regentStatue=='invalid_regentcode'){
      return callback({code:3,key:'server_member_invalid_invitation_link',pmessage:'این لینک دعوت معتبر نیست'});
    }
    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,res);
        //sendSmsCode(entity.mobile,entity.mobileConfirmCode);
        //setTimeout(()=>Model.updateOrCreate({id:res.id,mobileConfirmCode:'expired'}),60000*3)
      }).then(err=>{
        app.models.Bug.create({err:err});
        return err;
      })

  };



  Model.setProfileImage = async (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    if(!data.profileImage){
      callback(new Error('image is require'));
      return
    }

    let entity={id:userId,profileImage:data.profileImage};
    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,entity);
      }).then(err=>{
        app.models.Bug.create({err:err});
        callback({code:7, lbError:error, key:'server_member_error_update_profileImage',message:'Error update profileImage',pmessage:'خطا در ذخیره تصویر پروفایل'});
        return err;
      })
  };
  Model.remoteMethod(
    'setProfileImage',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/setProfileImage',
        verb: 'POST',
      },
    }
  );
  Model.initMyProfile = async (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    const currentDate=new Date();
    let entity={
      id:userId,
      firstName:data.firstName,
      lastName:data.lastName,
      gender:data.gender,
      age:data.age,
      biarthDate: currentDate.setYear(currentDate.getFullYear()-Number(data.age)),
      state:'initMyProfile'
    };

    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,res)
      }).then(err=>{
        app.models.Bug.create({err:err});
        callback({code:7, lbError:error, key:'server_member_error_on_send_ivitation_code',message:'Error on send ivitation code',pmessage:'خطا در ارسال کد دعوت'});
        return err;
      });
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

    if(user.userVerified){
      callback(new Error('mobile was verified before.'));
      return;
    }
    if(user.mobileConfirmCode=='expired'){
      callback({code:4,key:'fa_server_member_expired_confirmation_code',message:'invalid confirm Code',pmessage:'کد تایید منقضی شده است'});
      return;
    }
    if(user.mobileConfirmCode!==data.mobileConfirmCode){
      callback({code:5,key:'server_member_invalid_mobile_confirmation_code',message:'invalid confirm Code',pmessage:'کد تایید موبایل اشتباه است'});
      return;
    }
    const regentList= await Model.find({where: {invitationCode: data.regentCode}});
    if(!regentList || !regentList[0]){
      callback(new Error('regentCode code is invalid'));
      return
    }
    const regent=regentList[0];
    let entity={id:user.id, regentCode:regent.invitationCode,regentId:regent.id ,  userVerified:true,state:'confirmRegistration'};
    callback(null, {userVerified:true});
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



  //برای لینکهای دعوتی که بدون اجازه صاحب موبایل توسط دوست او در ترینت ثبت شده
  //این لینک به موبایل کاربر ارسال می شود و کاربر با کلیک آن وارد پنل خود می شود
  Model.confirmMeByLink = async (data, callback)=> {
    /* if(helper.isXssScripts(data))
       return  callback(new Error("not secure"));*/


  };
  Model.remoteMethod(
    'confirmByLink',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/confirmByLink',
        verb: 'POST',
      },
    }
  );

  const unsucsessLoginNumber={};
  const unsucsessLoginNumberFlag={};
  const unsucsessLoginTime={};
  Model.loginMember = function(data, callback) {
    //data.username=data.username.toLowerCase();
    if(unsucsessLoginNumber[data.username] && unsucsessLoginNumber[data.username]>2){
      if(!unsucsessLoginNumberFlag[data.username]){
        setTimeout(()=>{
          delete unsucsessLoginNumberFlag[data.username];
          delete  unsucsessLoginNumber[data.username];
        },180000);
      }
      unsucsessLoginNumberFlag[data.username]=true;
      return callback({code:5,key:'server_login_multi_login',pmessage:'لاگین ناموفق بصورت پی در پی، حداقل 3 دقیقه صبر کرده و دوباره امتحان کنید'});

    }
    Model.login(data, function(err, res) {
      if (err){
        unsucsessLoginNumber[data.username]=unsucsessLoginNumber[data.username]?++unsucsessLoginNumber[data.username]:1;
        unsucsessLoginTime[data.username]=new Date();
        return callback({code:5,key:'server_login_unsuccess',pmessage:'ورود ناموفق، نام کاربری یا پسورد اشتباه است.'});

      }
      delete unsucsessLoginNumber[data.username];
      delete unsucsessLoginTime[data.username];
      if (res.id) {
        return Model.findById(res.userId, {}, function(err2, member) {
          //خطا در لود اطلاعات کاربر'
          if(err2 || !member)
            return callback(new Error('ورود ناموفق1'));
          //'اکانت شما توسط مدیر سیستم غیر فعال شده است'
          if (member.disable)
            return callback(new Error("ورود ناموفق2"));

          delete member.password;
          delete member.mobileConfirmCode;
          delete member.tempPassword;
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
      arg: 'data',
      type: 'object',
      http: { source: 'body' }
    },],
    returns: {
      arg: 'result',
      type: 'object',
      root: true
    },
    http: {
      path: '/me/login',
      verb: 'POST',
    },
  });

  Model.getProfile = function (cUser,params={}, callback) {
    console.log(99999999999999);
    const userId=cUser.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    return Model.findById(userId,params.filter, function (err, res) {
      if (err) {
        app.models.Bug.create({err:err}); callback(err);
      } else {
        callback(err, res);
      }
    });
  };
  Model.remoteMethod(
    'getProfile',
    {
      accepts: [{
        arg: 'cUser',
        type: 'object',
        http: { source: 'body' }
      },
        {
          arg: 'params',
          type: 'string',
        }
      ],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/getProfile',
        verb: 'GET'
      }
    }
  );


  Model.getSubsetList = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }

    params.include= {"subsets":{"subsets":{"subsets":"subsets"}}}
    params.where={regentId:userId};
    return Model.find(params, function (err, res) {
      if (err) {
        app.models.Bug.create({err:err}); callback(err);
      } else {
        callback(err, res);
      }
    });
  };
  Model.remoteMethod(
    'getSubsetList',
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
        path: '/me/getSubsetList',
        verb: 'POST',
      },
    }
  );


};
