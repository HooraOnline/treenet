
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
    Files.uploadSmallFile = function (ctx,options,callback) {
        if(!options) options = {};
        let fileSize=Number(ctx.req.headers['content-length']);



        if(fileSize>500000)
            return   callback(new Error("حجم فایل شما نباید بیشتر از 500 کیلو بایت باشد."));


        ctx.req.params.container = 'member';

        Files.app.models.container.upload(ctx.req,ctx.result,options,function (err,fileObj) {
            options={
                container: 'member',
                maxFileSize: 10 * 1024 * 1024,
                allowedContentTypes: ['image/png'],
                acl: 'public-read',
                getFilename: function(fileInfo) {
                    return 'image-' + fileInfo.name;
                }
            };
            if(err) {
                 app.models.Bug.create({err:err}); callback(err);
            } else {
                var fileInfo = fileObj.files.content[0];//.file[0];
                let fileMime=fileInfo.name.split('.');
                fileMime=fileMime[fileMime.length-1];
                if(fileMime=='png' || fileMime=='jpeg' || fileMime=='jpg'){
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
        'uploadSmallFile',
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
    Files.deleteProfileImage = function (fileName,callback) {
        Files.app.models.container.removeFile( 'member',fileName.fileName,function (err,res) {
            if(err) {
                 app.models.Bug.create({err:err}); callback(err);
            } else {

                callback(null, res);
            }
        });
    };
    Files.remoteMethod(
        'deleteProfileImage',
        {
            description: 'remove a file from member',
            accepts: [
                {
                    arg: 'fileName',
                    type: 'object',
                    http: { source: 'body' }
                }
            ],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {verb: 'post'}
        }
    );
};