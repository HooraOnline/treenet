'use strict';
var app = require('../../server/server');
const jwtRun = require('../../utils/jwtRun');
const uuidV4 = require('uuid/v4')
const request = require('request');
const subsetinclude=[
  {
    relation: 'followers',
    scope: {
      fields: ['id','followedId','followerId','isFollowing'],
      where: {isFollowing: true},
    }
  },
  {
    relation: 'subsets',
    scope: {
      fields: ['id'],

      include:{
        relation: 'subsets',
        scope: {
          fields: ['id'],
          include:{relation: 'subsets',
            scope: {
              fields: ['id'],
              include:{relation: 'subsets',
                scope: {
                  fields: ['id'],
                  include:{relation: 'subsets',
                    scope: {
                      fields: ['id'],
                      include:{relation: 'subsets',
                        scope: {
                          fields: ['id'],
                          include:{relation: 'subsets',
                            scope: {
                              fields: ['id'],
                              include:{relation: 'subsets',
                                scope: {
                                  fields: ['id'],
                                  include:{relation: 'subsets',
                                    scope: {
                                      fields: ['id'],
                                      include:{relation: 'subsets',
                                        scope: {
                                          fields: ['id'],
                                          include:{relation: 'subsets',
                                            scope: {
                                              fields: ['id'],
                                              include:{relation: 'subsets',
                                                scope: {
                                                  fields: ['id'],
                                                  include:{relation: 'subsets',
                                                    scope: {
                                                      fields: ['id'],
                                                      include:{relation: 'subsets',
                                                        scope: {
                                                          fields: ['id'],

                                                        }}
                                                    }}
                                                }}
                                            }}
                                        }}
                                    }}
                                }}
                            }}
                        }}
                    }}
                }}
            }}
        }
      }
    }
  }
]
const includeFields=['id','cdate','displayName','fullName','profileImage','gender','userKey','avatar'];
const subsetincludeFull=[
  {
    relation: 'subsets',
    scope: {
      fields: includeFields,

      include:{
        relation: 'subsets',
        scope: {
          fields: includeFields,
          include:{relation: 'subsets',
            scope: {
              fields: includeFields,
              include:{relation: 'subsets',
                scope: {
                  fields: includeFields,
                  include:{relation: 'subsets',
                    scope: {
                      fields: includeFields,
                      include:{relation: 'subsets',
                        scope: {
                          fields: includeFields,
                          include:{relation: 'subsets',
                            scope: {
                              fields: includeFields,
                              include:{relation: 'subsets',
                                scope: {
                                  fields: includeFields,
                                  include:{relation: 'subsets',
                                    scope: {
                                      fields: includeFields,
                                      include:{relation: 'subsets',
                                        scope: {
                                          fields: includeFields,
                                          include:{relation: 'subsets',
                                            scope: {
                                              fields: includeFields,
                                              include:{relation: 'subsets',
                                                scope: {
                                                  fields: includeFields,
                                                  include:{relation: 'subsets',
                                                    scope: {
                                                      fields: includeFields,
                                                      include:{relation: 'subsets',
                                                        scope: {
                                                          fields: includeFields,

                                                        }}
                                                    }}
                                                }}
                                            }}
                                        }}
                                    }}
                                }}
                            }}
                        }}
                    }}
                }}
            }}
        }
      }
    }
  }
]


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
  //var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //Model.validate('email', function (err) { if (!re.test(this.email) && this.email !== undefined) err(); }, {message: 'Email format is invalid'});

  // Adds email uniqueness validation
  //Model.validatesUniquenessOf('email', {message: 'Email already exists'});

  const getUniqId =(mask)=> {
    //return mask.replace(/[x]/gi, () => { return Math.random().toString(26)[5]; });
    return Date.now().toString().replace('0','a').replace('1','b').replace('2','c').replace('3','d').replace('4','e').replace('5','f').replace('6','g').replace('7','h').replace('8','k').replace('9','l').replace('0','a').replace('1','b').replace('2','c').replace('3','d').replace('4','e').replace('5','f').replace('6','g').replace('7','h').replace('8','k').replace('9','l');
  }
  const getUnikNumber =(mask)=> {
    //return mask.replace(/[x]/gi, () => { return Math.random().toString(26)[5]; });
    return Date.now().toString();
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

    const initNewUser =  (data,regent)=> {
      const countryCode=data.countryCode || '98';
      const user={geo:data.geo,geoInfo:data.geoInfo};
      let userKey=getUniqId('xxxxxxxxxxxxxxxx');
      userKey=userKey.toLowerCase();
      const username=countryCode+data.mobile || userKey;
      user.ip=user.geoInfo?user.geoInfo.ip:'noip';
      user.countryCode=countryCode;
      user.computerIp=data.computerIp;
      user.browser=data.browser;
      user.os=data.os;
      user.mobile=data.mobile || '';
      user.username =username.toLowerCase();
      user.userKey=userKey;
      user.storeName=data.firstName;
      user.password =data.password || Math.random().toString().substring(2, 8);
      user.state = 'register';
      user.regentCode=regent.invitationCode;
      user.regentId=regent.id;
      let parentsList=regent.parentsList;
      parentsList.push(regent.id);
      user.parentsList=parentsList;

      user.invitationCode=  getUnikNumber();
      user.profileImage = 'defaultProfileImage.png';
      user.inviteProfileImage= 'defaultProfileImage.png';
      user.avatar='عضو فعال ترینتگرام';
      user.loginDate="";
      user.logOutDate="";
      user.beforloginDate="";
      user.permissions=[];
      user.mobileVerify=false;
      user.emailVerify=false;
      user.role='normalUser'
      user.notChangePassword=true;
      user.changedDefaultUserKey=false;

      user.cdate = new Date().toJSON();
      user.udate = new Date().toJSON();
      return user;
  };

  Model.checkMobileExist =  (data, callback)=> {
    if(!data.mobile){
      callback(new Error('mobile is require'));
      return
    }
    return Model.find({where: {mobile:data.mobile}})
      .then(res=>{
        if(res && res[0])
          callback(null,true);
        else
          callback(null,false);
      }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_member_error_tryAgain',
          message: 'Error,Pleas try again.',
          pMessage: 'خطایی رخ داد. دوباره تلاش کنید'
        });
        return err;
      })
  };

  Model.remoteMethod(
    'checkMobileExist',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/checkMobileExist',
        verb: 'POST',
      },
    }
  );


  Model.getRegentInfo =  (data, callback)=> {
    if(!data.invitationCode){
      callback(new Error('invitationCode is require'));
      return
    }


    let params={};
    params.where={invitationCode:data.invitationCode};
    params.fields=['id','fullName','userKey','profileImage','avatar','displayName'];
    params.include= subsetinclude;

  //  {"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":"subsets"}}}}}}}}}}}}}}}}}}}}}
    return Model.find(params)
      .then(res=>{

        if(res && res[0]){
          let regent={
            fullName:res[0].fullName,
            userKey:res[0].userKey,
            displayName: res[0].displayName,
            avatar: res[0].avatar,
            profileImage: res[0].profileImage,
            followers: res[0].followers.length,
            subsets: res[0].subsets,
          }

          callback(null,res[0]);
        }

        else
          callback(null,false);
      }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_member_error_tryAgain',
          message: 'Error,Pleas try again.',
          errorMessage: 'خطایی رخ داد. دوباره تلاش کنید'
        });
        return err;
      })
  };
  Model.remoteMethod(
    'getRegentInfo',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/getRegentInfo',
        verb: 'POST',
      },
    }

  );

  const registerUserFunc=(data,regentList,callback)=>{
    if(!regentList){
      callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
      return
    }
    if(regentList.length===0){
      callback(null,{errorCode:3,errorKey:'server_member_invalid_invitation_link',errorMessage:'این لینک دعوت معتبر نیست'});
      return ;
    }
    const regent=regentList[0];
    let user=initNewUser(data,regent);
    // user.forTest=1
    user.host=data.host;
    return Model.updateOrCreate(user)
      .then(res=>{
        const token = jwtRun.sign({userId: user.id,userPermissions:user.permissions});

        res.token=token;
        let inviteProfileImage=regent.inviteProfileImage;
        if(!inviteProfileImage || inviteProfileImage==='defaultProfileImage.png'){
          inviteProfileImage=regent.profileImage;
        }
        res.regent={
          id:regent.id,
          username:regent.username,
          name:(regent.firstName || '')+' '+(regent.lastName || ''),
          inviteProfileImage:inviteProfileImage,
          avatar:regent.avatar,
        };
        //start add activity**********

        let activity={joinId:regent.id,receiverId:('_'+res.id),action:'join',type:'join_to_network',cdate:(new Date()).toJSON()};
        app.models.Activity.create(activity);
        res.parentsList.map((parentId,index)=>{
          activity={joinId:res.id,receiverId:('_'+parentId),action:'join',type:index===0?'join_to_your_braches':'join_to_your_leaves',cdate:(new Date()).toJSON()};
          app.models.Activity.create(activity);
        });
        //end add activity************
        callback(null,res);
      }).catch(err=>{
        callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
      })
  }

  Model.registerUser =  (data, callback)=> {

    if(!data.regentCode){
      return callback(null,{errorCode:1,errorKey:'برای ثبت نام باید از طریق لینک دعوت وارد شوید.',message:'required regent Code',errorMessage:'برای ثبت نام باید از طریق لینک دعوت وارد شوید.'});
    }

    if(!data.os || !data.browser || !data.computerIp || !data.mobile || !data.countryCode || !data.password){
      callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
    }

    Model.find({where: {invitationCode: data.regentCode}})
      .then(regentList=>{
        return registerUserFunc(data,regentList,callback)
      })
      .catch(err=>{
        callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
        return err;
      });
  };
  Model.remoteMethod(
    'registerUser',
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

  const transferMySubset=(member,callback)=>{
   Model.find({fields:['id','invitationCode',''], limit:1})
     .then((root)=>{
       const rootUser=root[0];
       member.regentCodeOld= member.regentCode;
       member.regentIdOld= member.regentId;
       member.regentCode=rootUser.invitationCode;
       member.regentId=rootUser.id;
       const activity={joinId:member.id,receiverId:('_'+rootUser.id),action:'join',type:'join_to_your_braches',cdate:(new Date()).toJSON()};
       Model.updateOrCreate(member)
         .then((res)=>{
           callback({})
           app.models.Activity.create(activity)
         })
         .catch(err=>{
           callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
           return err;
         });
     })
     .catch(err=>{
       callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
       return err;
     });
  }

  Model.transferMySubset =  (data, callback)=> {

    const userId = data.userId;
    const memberId = data.memberId;

    if (!userId || !memberId) {
      callback(new Error('An error occurred'));
      return;
    }

    Model.findById(memberId, {fields:['id','regentId']})
      .then(member=>{
        if(userId!==member.regentId){
          callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد.'});
        }else{
          transferMySubset(member,callback);
        }
      })
      .catch(err=>{
        callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
        return err;
      });
  };
  Model.remoteMethod(
    'transferMySubset',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/transferMySubset',
        verb: 'POST',
      },
    }
  );

  const unsucsessLoginNumber={};
  const unsucsessLoginNumberFlag={};
  const unsucsessLoginTime={};
  Model.loginMember = function(data, callback) {
    //data.username=data.username.toLowerCase();
    // if(unsucsessLoginNumber[data.username] && unsucsessLoginNumber[data.username]>2){
    //   if(!unsucsessLoginNumberFlag[data.username]){
    //     setTimeout(()=>{
    //       delete unsucsessLoginNumberFlag[data.username];
    //       delete  unsucsessLoginNumber[data.username];
    //     },180000);
    //   }
    //   unsucsessLoginNumberFlag[data.username]=true;
    //   return callback(null,{errorCode:5,errorKey:'server_login_multi_login',errorMessage:'لاگین ناموفق بصورت پی در پی، حداقل 3 دقیقه صبر کرده و دوباره امتحان کنید'});
    //
    // }

    Model.login({username:data.username,password:data.password}, function(err, res) {

      if (err){

        unsucsessLoginNumber[data.username]=unsucsessLoginNumber[data.username]?++unsucsessLoginNumber[data.username]:1;
        unsucsessLoginTime[data.username]=new Date();
        return callback(null,{isError:true,errorCode:5,errorKey:'server_login_unsuccess',errorMessage:'ورود ناموفق، نام کاربری یا پسورد اشتباه است.'});
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
          const token = jwtRun.sign({userId: member.id,userPermissions:member.permissions});
          let tokenObj={token:token};

          callback(err2,tokenObj );

          let user={id:res.userId,beforloginDate:member.loginDate,loginDate: new Date().toJSON(),succeesLogin:true, isLogin:true,}
          if(data.mobile){
            user.username=data.mobile;
          }
          Model.updateOrCreate(user);
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


  Model.checkUserNameExist =  (data, callback)=> {
    if(!data.username){
      callback(new Error('username is require'));
      return
    }
    if(data.currentUsername==data.username){
      callback(null,false);
      return
    }
    return Model.find({where: {username:data.username,}})
      .then(res=>{
        if(res && res[0] && res[0]){
          callback(null,true);
        }

        else
          callback(null,false);
      }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_member_error_tryAgain',
          message: 'Error,Pleas try again.',
          errorMessage: 'خطایی رخ داد. دوباره تلاش کنید'
        });
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

  Model.checkUserKeyExist =  (data, callback)=> {
    if(!data.userKey){
      callback(new Error('userKey is require'));
      return
    }
    if(data.currentUserKey===data.userKey.toLowerCase()){
      callback(null,false);
      return
    }
    return Model.find({where: {userKey:data.userKey.toLowerCase()}})
      .then(res=>{
        if(res && res[0])
          callback(null,true);
        else
          callback(null,false);
      }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_member_error_tryAgain',
          message: 'Error,Pleas try again.',
          errorMessage: 'خطایی رخ داد. دوباره تلاش کنید'
        });
        return err;
      })
  };
  Model.remoteMethod(
    'checkUserKeyExist',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/checkUserKeyExist',
        verb: 'POST',
      },
    }
  );

  Model.updateUserKey =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(null, {
        errorCode: 7,
        errorKey: 'server_your_token_expier',
        errorMessage: 'کد امنیتی شما منقضی شده است. دوباره لاگین کنید.'
      });
      return
    }
    if(!data.userKey){
      callback(new Error('userKey is require'));
      return
    }
    let entity={
      id:userId,
      userKey:data.userKey.toLowerCase(),
      state:'updateUserKey',
      changedDefaultUserKey:true,
      udate:new Date(),
    };
    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,res)
      }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطایی رخ داد. دوباره تلاش کنید.'
        });
        return err;
      })
  };
  Model.remoteMethod(
    'updateUserKey',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/updateUserKey',
        verb: 'POST',
      },
    }
  );
  Model.updatePassword =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(null, {
        errorCode: 7,
        errorKey: 'server_your_token_expier',
        errorMessage: 'کد امنیتی شما منقضی شده است. دوباره لاگین کنید.'
      });
      return
    }
    if(!data.password){
      callback(new Error('password is require'));
      return
    }
    let entity={
      id:userId,
      password:data.password,
      state:'updatePassword',
      notChangePassword:false,
      udate:new Date(),
    };
    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,res)
      }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطایی رخ داد. دوباره تلاش کنید.'
        });
        return err;
      })
  };
  Model.remoteMethod(
    'updatePassword',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/updatePassword',
        verb: 'POST',
      },
    }
  );

  const setProfileImage=(userId,data,oldProfileImage,callback)=>{

    let entity={id:userId,profileImage:data.profileImage};

    return Model.updateOrCreate(entity)
      .then(res=>{

        if(oldProfileImage){
          Model.app.models.container.removeFile('member',oldProfileImage);
        }

        callback(null,entity);
      }).catch(err=>{

        callback(null,{errorCode:7, lbError:err, errorKey:'server_member_error_update_profileImage',message:'Error update profileImage',errorMessage:'خطا در ذخیره تصویر پروفایل'});
        return err;
      })
  }

  Model.setProfileImage =  (data, callback)=> {
    const userId=data.userId;
      if(!userId){
        callback(new Error('An error occurred'));
      return
    }

    if(!data.profileImage){
      callback(new Error('image is require'));
      return
    }

    Model.findById(userId,{fields:['profileImage']})
      .then((res)=>{
        setProfileImage(userId,data,res.profileImage,callback);
      })
      .catch((err)=>{

        callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
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
  Model.setInviteProfileImage =  (data, callback)=> {

    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    if(!data.inviteProfileImage){
      callback(new Error('image is require'));
      return
    }

    let entity={id:userId,inviteProfileImage:data.inviteProfileImage};
    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,entity);
      }).catch(err=>{

        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_member_error_update_profileImage',
          message: 'Error update profileImage',
          errorMessage: 'خطا در ذخیره تصویر پروفایل'
        });
        return err;
      })
  };
  Model.remoteMethod(
    'setInviteProfileImage',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/setInviteProfileImage',
        verb: 'POST',
      },
    }
  );
  Model.editProfile =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    const now=new Date();
    let year=now.getFullYear()-Number(data.age);
    let birthDate=now.setYear(year);
    let entity={
      id:userId,
      firstName:data.firstName,
      lastName:data.lastName,
      fullName:data.firstName+' '+data.lastName,

      gender:data.gender,
      age:data.age,
      birthDate:birthDate ,
      avatar:data.avatar ,
      story:data.story ,
    };
    if(data.userKey){
      entity.userKey=data.userKey.toLowerCase();
    }
    if(data.mobile){
      entity.mobile=data.mobile;
    }
    if(data.email){
      entity.email=data.email;
    }
    if(data.displayName){
      entity.displayName=data.displayName;
    }else{
      entity.displayName=entity.fullName;
    }

    return Model.updateOrCreate(entity)
      .then(res=>{
        callback(null,res)
      }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_member_error_on_send_ivitation_code',
          message: 'Error on send ivitation errorCode',
          errorMessage: 'خطا در ارسال کد دعوت'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'editProfile',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/me/editProfile',
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
      callback(null,{errorCode:4,errorKey:'fa_server_member_expired_confirmation_code',message:'invalid confirm Code',errorMessage:'کد تایید منقضی شده است'});
      return;
    }
    if(user.mobileConfirmCode!==data.mobileConfirmCode){
      callback(null,{errorCode:5,errorKey:'server_member_invalid_mobile_confirmation_code',message:'invalid confirm Code',errorMessage:'کد تایید موبایل اشتباه است'});
      return;
    }
    const regentList= await Model.find({where: {invitationCode: data.regentCode}});
    if(!regentList || !regentList[0]){
      callback(new Error('regentCode errorCode is invalid'));
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
  Model.confirmMeByLink =  (data, callback)=> {
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



  Model.getProfile = function (cUser,params={}, callback) {
    const userId=cUser.userId;
    //return callback(null,{isError:true,errorCode:5,errorKey:'server_lockSite',errorMessage:'به دلیل تغییرات ساختاری فعلا امکان ورود وجود ندارد، لطفا چند روز دیگر مراجعه فرمایید.'});
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  [
      {
        relation: 'unConfirmSubsets',
        scope: {
          fields: ['id','fullName','userKey','profileImage','avatar','displayName'],

          /*include: {
            relation: 'comments',
              scope: {
              where: {orderId: 5}
            }
          }*/
        }
      },
    {
      relation: 'followers',
      scope: {
        fields: ['id','followedId','followerId','isFollowing'],
        where: {isFollowing: true},
        /*include: {
          relation: 'comments',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    },
    {
      relation: 'followeds',
      scope: {
        fields: ['id','followedId','followerId','isFollowing'],
        where: {isFollowing: true},
        /*include: {
          relation: 'comments',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }
  ]
    return Model.findById(userId,params, function (err, res) {
      console.log(res);
      if (err) {

         callback(err);
      }

    else if(!res || !res.username) {

        callback(null,{errorCode:4,errorKey:'fa_server_member_user_notExist',errorMessage:'اکانت قبلی شما به دلیل عدم تغییر رمز موقت به مدت طولانی توسط سیستم حذف شده است. لطفا با لینک دعوت وارد شده و تا اکانت جدید بگیرید.  .'});
      }
      else {

        let user=res;
        let birthYear=user.birthDate?new Date(user.birthDate).getFullYear():'';
        user.invitationLink=`https://treenetgram.com/?invitationCode=${res.invitationCode}`;
        user.age=user.birthDate?(new Date()).getFullYear()-birthYear:'';
        user.shortMobile=user.mobile?user.mobile.split('-')[1]:'';
        callback(err, user);
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

  Model.getMemberProfile = function (params, callback) {
    const userId=params.userId;

    //return callback(null,{isError:true,errorCode:5,errorKey:'server_lockSite',errorMessage:'به دلیل تغییرات ساختاری فعلا امکان ورود وجود ندارد، لطفا چند روز دیگر مراجعه فرمایید.'});
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    let memberId=params.memberId || userId;
    const userKey=params.userKey;
   // params.where={userKey:userKey};
    params.include=  [
      {
        relation: 'unConfirmSubsets',
        scope: {
          fields: ['id','fullName','userKey','profileImage','avatar','displayName'],

          /*include: {
            relation: 'comments',
              scope: {
              where: {orderId: 5}
            }
          }*/
        }
      },
      {
        relation: 'followers',
        scope: {
          fields: ['id','followedId','followerId','isFollowing'],
          where: {isFollowing: true},
          /*include: {
            relation: 'comments',
              scope: {
              where: {orderId: 5}
            }
          }*/
        }
      },
      {
        relation: 'followeds',
        scope: {
          fields: ['id','followedId','followerId','isFollowing'],
          where: {isFollowing: true},
          /*include: {
            relation: 'comments',
              scope: {
              where: {orderId: 5}
            }
          }*/
        }
      }
    ]
    return Model.findById(memberId,params, function (err, res) {
      if (err) {

        callback(err);
      }
      else if(!res) {

        callback(null,{errorCode:4,errorKey:'fa_server_member_user_notExist',errorMessage:'اکانت قبلی شما به دلیل عدم تغییر رمز موقت به مدت طولانی توسط سیستم حذف شده است. لطفا با لینک دعوت وارد شده و تا اکانت جدید بگیرید.  .'});
      }
      else {

        let user=res;
        let birthYear=user.birthDate?new Date(user.birthDate).getFullYear():'';
        user.invitationLink=`https://treenetgram.com/?invitationCode=${res.invitationCode}`;
        user.age=user.birthDate?(new Date()).getFullYear()-birthYear:'';
        user.shortMobile=user.mobile?user.mobile.split('-')[1]:'';
        callback(err, user);
      }
    });
  };
  Model.remoteMethod(
    'getMemberProfile',
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
        path: '/getMemberProfile',
        verb: 'POST',
      },
    }
  );



  Model.getSubsetList = function (params, callback) {

    let userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    userId=params.memberId || userId;
    params.include= subsetincludeFull;
    //params.include= {"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":"subsets"}}}}}}
    params.where={regentId:userId,} ;
    return Model.find(params, function (err, res) {
      if (err) {
         callback(err);
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
        path: '/getSubsetList',
        verb: 'POST',
      },
    }
  );

  Model.getUnconfirmSubsetList = function (params, callback) {
    let userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    userId=params.memberId || userId;
    //params.include= {"subsets":{"subsets":{"subsets":{"subsets":{"subsets":{"subsets":"subsets"}}}}}}
    params.where={regentId:userId};
    params.fields=['id','fullName','userKey','profileImage','avatar','displayName','cdate'];
    return Model.find(params, function (err, res) {
      if (err) {
        callback(err);
      } else {
        callback(err, res);
      }
    });
  };
  Model.remoteMethod(
    'getUnconfirmSubsetList',
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
        path: '/getUnconfirmSubsetList',
        verb: 'POST',
      },
    }
  );
  Model.getUserPage = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    let userKey=params.userKey ;
    if(!userKey){
      callback(new Error('An error occurred'));
      return
    }
    userKey=userKey.toLowerCase();
    params.where={userKey:userKey,};
    params.fields=['id','fullName','userKey','profileImage','avatar','displayName'];
    params.order='id DESC';
    params.include=  [{
      relation: 'posts',

      scope: {
        fields: ['id','message','file','fileType','fileExtention','type'],
        where:{isDeleted:{neq: true },type:'post'},
        order:'id DESC',
        include: {//for like by me
          relation: 'myLike',
            scope: {
                where: {memberId: userId}
           }
        }
      }
    },
    {
      relation: 'followers',
      scope: {
        fields: ['id','followedId','followerId','isFollowing'],
        where: {isFollowing: true},
        /*include: {
          relation: 'comments',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    },
    {
      relation: 'followeds',
      scope: {
        fields: ['id','followedId','followerId','isFollowing'],
        where: {isFollowing: true},
        /*include: {
          relation: 'comments',
            scope: {
            where: {orderId: 5}
          }
        }*/
      }
    }
  ]


    return  Model.find(params)
      .then(res => {

        res.cUserId=userId;
        const useers=Object.assign({cUserId:userId},res)
        callback(null,useers);

      }).catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_post_error_get_my_posts',
          errorMessage: 'خطا در بارگذاری پستها'
        });
        return err;
      });
  };


  Model.remoteMethod(
    'getUserPage',
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
        path: '/getUserPage',
        verb: 'POST',
      },
    }
  );


  Model.getMarketerProducts = function (data, callback) {

    const userId = data.userId;
    if (!userId) {
      callback(new Error('An error occurred'));
      return
    }
    let params = {};

    params.include = [{
      relation: 'marketerproducts',
      scope: {
        //fields: ['id','memberId','productId'],
        order: 'id DESC',
        include:{
            relation: 'product',
            scope: {
              fields: ['id', 'memberId', 'title', 'text', 'file', 'fileType','fileExtention', 'price', 'commission'],
              //where: {orderId: 5}
              include: {
                  relation: 'member',
                  scope: {
                    fields: ['id','firstName', 'lastName','userKey','profileImage','displayName'],
                    //where: {orderId: 5}
                  }
                }
            }
        }

      }
    },
    ]

    params.where= {userKey: data.userKey};
    params.fields= ['id','firstName', 'lastName','userKey','profileImage','displayName'];
    Model.find(params)
      .then(res => {
        if(res && res[0]){
          callback(null,res[0]);
        }else{
          callback(null, {
            errorCode: 17,
            lbError: err,
            errorKey: 'خطا در بارگذاری کالاها',
            errorMessage: 'خطا در بارگذاری کالاها'
          });
        }
      })
      .catch(err => {

        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'خطا در بارگذاری کالاها',
          errorMessage: 'خطا در بارگذاری کالاها'
        });

      });

  };
  Model.remoteMethod(
    'getMarketerProducts',
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
        path: '/getMarketerProducts',
        verb: 'POST',
      },
    }
  );


  Model.searchByKeyword = (data, callback) => {
    if (!data.userId) {
      callback(new Error('token is require'));
      return
    }
    // if(!data.keyword || data.keyword.length<3){
    //   callback(new Error('keyword is require or less than 3'));
    //   return
    // }
    data.keyword=data.keyword || '';
    const keyword=data.keyword.replace('@','').toLowerCase();

    const filter={where: {or:[
      {fullName: {
        like: keyword,
        options: "i"
      }},
      {displayName: {
        like: keyword,
        options: "i"
      }},
      {userKey: {
        like: keyword,
        options: "i"
      }}]}};
    filter.fields=['id','userKey','fullName','profileImage','displayName'];

    return Model.find(filter)
      .then(res=>{

          callback(null,res);
      }).catch(err=>{
        callback(null, {
          errorCode: 7,
          lbError: err,
          errorKey: 'server_member_search_tryAgain',
          message: 'Error,Pleas try again.',
          errorMessage: 'خطایی رخ داد. دوباره تلاش کنید'
        });
        return err;
      })
  };
  Model.remoteMethod(
    'searchByKeyword',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/searchByKeyword',
        verb: 'POST',
      },
    }
  );


  const confirmSubset=(member,isConfirm,callback)=>{
    member.regentConfirmState=isConfirm?'confirm':'unconfirm';
    Model.updateOrCreate(member)
      .then((res)=>{

        callback(null,{});
      })
      .catch(err=>{

        callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
        return err;
      });
  }

  Model.confirmSubset =  (data, callback)=> {

    const userId = data.userId;
    const memberId = data.memberId;

    if (!userId || !memberId) {
      callback(new Error('An error occurred'));
      return;
    }

    Model.findById(memberId, {fields:['id','regentId']})
      .then(member=>{

        const isRegent=userId.toString().trim()===member.regentId.toString().trim();

        if(isRegent){

          confirmSubset(member,data.isConfirm,callback);
        }else{

          callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد.'});
        }
      })
      .catch(err=>{
        callback(null,{errorCode:1,errorKey:'server_public_error',errorMessage:'خطایی رخ داد، دوباره تلاش کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'confirmSubset',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/confirmSubset',
        verb: 'POST',
      },
    }
  );
};
