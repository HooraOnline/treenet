//This page was created by Saeed Yousefi for public action in models
// var es = require('event-stream');
module.exports = function (app) {
    let modelNames = Object.keys(app.models);
  console.log(modelNames);
  modelNames.forEach(function (m) {
        let Model = app.models[m];
        Model.beforeRemote('*', function (context, user, next) {
          var req = context.req;
          /* if(helper.isXssScripts(req.body)){
              return  callback(new Error("not secure"));
           }*/
          if(req.body && req.userId){
            req.body.userId=req.userId;
          }
          next();
        });
       /* Model.sharedClass.methods().forEach(function(method) {
            if(m=="member"){
                console.log(method.name);
                //Model.disableRemoteMethod(method.name, method.isStatic);
            }

        });*/


        /*Model.disableRemoteMethod("create", true);
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
        Model.disableRemoteMethod('__updateById__accessTokens', true);*/

        // if(m=="News"){
        //      console.log(Model)
        // }

        // Model.observe('after save', function beforeSave(ctx, next) {
        //     //by saeed yousefi:
        //     // for support delete & update by post method, I had to add this function and too change the core of Loopback fraimwork.
        //     // This change is in the  file  node_modules/loopback/lib/persisted-model.js in loopback node modules, lin 895
        //     //put=>post  895: updateAttributesOptions.http.unshift({ verb: 'put', path: '/' });=> updateAttributesOptions.http.unshift({ verb: 'post', path: '/' });
        //     if (ctx.instance && ctx.instance.deletebypost)
        //         return Model.destroyById(ctx.instance.id, function (err, entiy) {
        //             next();
        //         });
        //     else
        //       next();
        //
        //     // if (ctx.instance && ctx.instance.updatebypost){
        //     //     delete ctx.instance.updatebypost;
        //     //     return Model.upsert({id:ctx.instance.id},ctx.instance, function (err, entiy) {
        //     //         next();
        //     //return Promise.resolve();
        //     //     });
        //     // }
        //
        // });
        //
        // Model.observe('before save', function beforeSave(ctx, next) {
        //     if(ctx.instance && ctx.instance.getbypost)
        //         return Model.find({ where: { cc: 12 } }, function (err, res) {
        //             //next();
        //             console.log('saeed',ctx.rearqu);
        //             // return ctx.res.send(res);
        //             //return Promise.resolve();
        //             //return res //Promise.resolve();
        //         });
        //     return Promise.resolve();
        //
        //
        //     //next();
        // });

    });




};
