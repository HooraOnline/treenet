
module.exports = function(Files) {
    Files.beforeRemote('upload22', function(context, comment, next) {

        // if (context.req.body.fileName ) {
        //     context.res.statusCode = 401;
        //     next(new Error('Filename is too short!'));
        // } else {
        //     next();
        // }

        next();
    });
    Files.afterRemote('upload',function(ctx, modelInstance, next){

        let isForbidden=false;
        let files=modelInstance.result.files;
        let file;
        let fileformat;
        for (x in files) {
            file=fileformat=files[x][0];
            fileformat=file.type;
        }
        const ImageMimeTypes = [
            'image/png','image/jpeg','image/gif','image/svg+xml','image/bmp'
        ];
        const VideoMimeTypes = [
            'video/mpeg','video/quicktime','video/x-msvideo','video/webm','video/x-matroska','video/x-ms-wmv','video/mp4'
        ];
        const Alll = [
            'image/png','image/jpeg','image/gif','image/svg+xml','image/bmp',
            'video/avi','video/mpeg','video/mp4','video/mkv','video/quicktime',
            'application/pdf','application/zip','application/octet-stream','application/x-rar-compressed','text/csv','text/plain',
            'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'audio/mpeg','audio/x-wav',
        ];
        const acceptableFormats = [
            'image/png','image/jpeg','video/avi','video/mpeg','video/mp4','video/mkv', 'application/pdf'
        ];
        if(acceptableFormats.indexOf(fileformat)<0){
            // Files.app.models.container.removeFile( file.container,file.name,function (err,res) {
            //
            // });
            //return فرمت_قابل_آپلود_نیست();
        }


        next();
    });
    Files.uploadBiglFile = function (ctx,options,callback) {

        if(!options) options = {};
        let fileSize=Number(ctx.req.headers['content-length']);

        ctx.req.params.container = 'member';

        Files.app.models.container.upload(ctx.req,ctx.result,options,function (err,fileObj) {
            if(err) {
                 app.models.Bug.create({err:err}); callback(err);
            } else {
                var fileInfo = fileObj.files.content[0];//.file[0];
                let fileMime=fileInfo.name.split('.');
                fileMime=fileMime[fileMime.length-1];
                if(fileMime=='mp4' || fileMime=='mkv' || fileMime=='pdf' || fileMime=='png' || fileMime=='jpeg' || fileMime=='jpg'){
                    callback(null, fileInfo);
                }
                else {

                    Files.app.models.container.removeFile( ctx.req.params.container,fileInfo.name,function (err,res) {

                    });
                    callback(new Error("فقط فایل های تصویری jpeg و png قابل آپلود است."));
                    //return فرمت_قابل_آپلود_نیست();
                }


            }
        });
    };
    Files.remoteMethod(
        'uploadBiglFile',
        {
            description: 'Uploads a file',
            accepts: [
                { arg: 'ctx', type: 'object', http: { source:'context' } },
                { arg: 'options', type: 'object', http:{ source: 'query'} }
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {verb: 'post'}
        }
    );



    Files.uploadPublicFile = function (ctx,options,callback) {
      const req=ctx.req;
      const userId=req.userId ;
      if(!userId){
        callback(new Error('token expier'));
        return
      }

      if(!options) options = {};
        let fileSize=Number(ctx.req.headers['content-length']);
        console.log('fileSize',fileSize);

      if(fileSize>500000)
            return  callback(null,{errorCode:17, lbError:{}, errorKey:'حجم فایل شما نباید بیشتر از 500 کیلو بایت باشد.',errorMessage:'حجم فایل شما نباید بیشتر از 500 کیلو بایت باشد.'});



        ctx.req.params.container = 'post';

        Files.app.models.container.upload(ctx.req,ctx.result,options,function (err,fileObj) {
            options={
                container: 'post',
                maxFileSize: 10 * 1024 * 1024,
                allowedContentTypes: ['image/png'],
                acl: 'public-read',
                getFilename: function(fileInfo) {
                    return 'image-' + fileInfo.name;
                }
            };

            if(err) {
                 console.log('err',err);
                 app.models.Bug.create({err:err}); callback(err);
            } else {
              console.log('fileObj',fileObj);
             // var fileInfo = fileObj.files.content[0];//.file[0];
               const fileName=userId+'_'+fileObj.fields.name[0];
                let fileMime=fileName.split('.');
                fileMime=fileMime[fileMime.length-1];
                if(fileMime=='png' || fileMime=='jpeg' || fileMime=='jpg'){
                  console.log(fileMime);
                  callback(null, fileObj);
                }
                else {

                    Files.app.models.container.removeFile( ctx.req.params.container,fileName,function (err,res) {

                    });

                    callback(null,{errorCode:17, lbError:{}, errorKey:'فقط فایل های تصویری jpeg و png قابل آپلود است.',errorMessage:'فقط فایل های تصویری jpeg و png قابل آپلود است.'});
                    //return فرمت_قابل_آپلود_نیست();
                }


            }
        });
    };

    Files.remoteMethod(
        'uploadPublicFile',
        {
            description: 'Uploads a file',
            accepts: [
                { arg: 'ctx', type: 'object', http: { source:'context' } },
                { arg: 'options', type: 'object', http:{ source: 'query'} }
            ],
            returns: {
                arg: 'fileObject', type: 'object', root: true
            },
            http: {verb: 'post'}
        }
    );



  Files.uploadProfileImage = function (ctx,options,callback) {
    const req=ctx.req;
    const userId=req.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    if(!options) options = {};
    let fileSize=Number(ctx.req.headers['content-length']);
    console.log('fileSize',fileSize);

    if(fileSize>300000)
      return  callback(null,{errorCode:17, lbError:{}, errorKey:'حجم فایل شما نباید بیشتر از 300 کیلو بایت باشد.',errorMessage:'حجم فایل شما نباید بیشتر از 300 کیلو بایت باشد.'});

    ctx.req.params.container = 'member';

    Files.app.models.container.upload(ctx.req,ctx.result,options,function (err,fileObj) {
      options={
        container: 'post_image',
        maxFileSize: 10 * 1024 * 1024,
        allowedContentTypes: ['image/png'],
        acl: 'public-read',
        getFilename: function(fileInfo) {
          return 'image-' + fileInfo.name;
        }
      };

      if(err) {
        console.log('err',err);
        app.models.Bug.create({err:err}); callback(err);
      } else {
        console.log('fileObj',fileObj);
        // var fileInfo = fileObj.files.content[0];//.file[0];
        const fileName=fileObj.fields.name[0];
        let fileMime=fileName.split('.');
        fileMime=fileMime[fileMime.length-1];
        if(fileMime.toLocaleLowerCase()==='png' || fileMime.toLocaleLowerCase()==='jpeg' || fileMime.toLocaleLowerCase()==='jpg'){
          console.log(fileMime);
          callback(null, fileObj);
        }
        else {

          Files.app.models.container.removeFile( ctx.req.params.container,fileName,function (err,res) {

          });

          callback(null,{errorCode:17, lbError:{}, errorKey:'فقط فایل های تصویری jpeg و png قابل آپلود است.',errorMessage:'فقط فایل های تصویری jpeg و png قابل آپلود است.'});
          //return فرمت_قابل_آپلود_نیست();
        }
      }
    });
  };

  Files.remoteMethod(
    'uploadProfileImage',
    {
      description: 'Uploads a file',
      accepts: [
        { arg: 'ctx', type: 'object', http: { source:'context' } },
        { arg: 'options', type: 'object', http:{ source: 'query'} }
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true
      },
      http: {verb: 'post'}
    }
  );



  Files.uploadPostImage = function (ctx,options,callback) {
    const req=ctx.req;
    const userId=req.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    if(!options) options = {};
    let fileSize=Number(ctx.req.headers['content-length']);
    console.log('fileSize',fileSize);

    if(fileSize>300000)
      return  callback(null,{errorCode:17, lbError:{}, errorKey:'حجم فایل شما نباید بیشتر از 300 کیلو بایت باشد.',errorMessage:'حجم فایل شما نباید بیشتر از 300 کیلو بایت باشد.'});

    ctx.req.params.container = 'post_image';

    Files.app.models.container.upload(ctx.req,ctx.result,options,function (err,fileObj) {
      options={
        container: 'post_image',
        maxFileSize: 10 * 1024 * 1024,
        allowedContentTypes: ['image/png'],
        acl: 'public-read',
        getFilename: function(fileInfo) {
          return 'image-' + fileInfo.name;
        }
      };

      if(err) {
        console.log('err',err);
        app.models.Bug.create({err:err}); callback(err);
      } else {
        console.log('fileObj',fileObj);
        // var fileInfo = fileObj.files.content[0];//.file[0];
        const fileName=fileObj.fields.name[0];
        let fileMime=fileName.split('.');
        fileMime=fileMime[fileMime.length-1];
        if(fileMime.toLocaleLowerCase()==='png' || fileMime.toLocaleLowerCase()==='jpeg' || fileMime.toLocaleLowerCase()==='jpg'){
          console.log(fileMime);
          callback(null, fileObj);
        }
        else {
          Files.app.models.container.removeFile( ctx.req.params.container,fileName,function (err,res) { });
          callback(null,{errorCode:17, lbError:{}, errorKey:'فقط فایل های تصویری jpeg و png قابل آپلود است.',errorMessage:'فقط فایل های تصویری jpeg و png قابل آپلود است.'});
          //return فرمت_قابل_آپلود_نیست();
        }
      }
    });
  };

  Files.remoteMethod(
    'uploadPostImage',
    {
      description: 'Uploads a file',
      accepts: [
        { arg: 'ctx', type: 'object', http: { source:'context' } },
        { arg: 'options', type: 'object', http:{ source: 'query'} }
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true
      },
      http: {verb: 'post'}
    }
  );



  Files.uploadPostVideo = function (ctx,options,callback) {
    const req=ctx.req;
    const userId=req.userId ;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    if(!options) options = {};
    let fileSize=Number(ctx.req.headers['content-length']);
    console.log('fileSize',fileSize);

    if(fileSize>20000000)
      return  callback(null,{errorCode:17, lbError:{}, errorKey:'حجم ویدئوی شما نباید بیشتر از 20 مگا بایت باشد.',errorMessage:'حجم ویدئوی شما نباید بیشتر از  10 مگا بایت باشد.'});

    ctx.req.params.container = 'post_video';

    Files.app.models.container.upload(ctx.req,ctx.result,options,function (err,fileObj) {
      options={
        container: 'post',
        maxFileSize: 10 * 1024 * 1024,
        allowedContentTypes: ['video/jp4'],
        acl: 'public-read',
        getFilename: function(fileInfo) {
          return 'video-' + fileInfo.name;
        }
      };

      if(err) {
        console.log('err',err);
        app.models.Bug.create({err:err}); callback(err);
      } else {
        console.log('fileObj',fileObj);
        // var fileInfo = fileObj.files.content[0];//.file[0];
        const fileName=fileObj.fields.name[0];
        let fileMime=fileName.split('.');
        fileMime=fileMime[fileMime.length-1];
        if(fileMime.toLocaleLowerCase()==='mp4'){
          console.log(fileMime);
          callback(null, fileObj);
        }
        else {

          Files.app.models.container.removeFile(ctx.req.params.container,fileName);

          callback(null,{errorCode:17, lbError:{}, errorKey:'فقط فایل های ویدئویی با فرمت mp4 قابل آپلود است.',errorMessage:'فقط فایل های ویدئویی با فرمت jp4 قابل آپلود است.'});
          //return فرمت_قابل_آپلود_نیست();
        }


      }
    });
  };

  Files.remoteMethod(
    'uploadPostVideo',
    {
      description: 'Uploads a file',
      accepts: [
        { arg: 'ctx', type: 'object', http: { source:'context' } },
        { arg: 'options', type: 'object', http:{ source: 'query'} }
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true
      },
      http: {verb: 'post'}
    }
  );

  Files.removeProfileImage = async (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('token expier'));
      return
    }
    const folder=('member');
    Files.app.models.container.removeFile(folder,data.file)
      .then(res=>{
        callback(null,res)
      }).then(err=>{
      //callback(null,{errorCode:7, lbError:error, errorKey:'server_file_error_on_delete',message:'Error on delete file',errorMessage:'خطا در ارسال کد دعوت'});
      callback(err);
      return err;
    });
  };
 /* Files.remoteMethod(
    'removeProfileImage',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/removeProfileImage',
        verb: 'POST',
      },
    }
  );*/


};
