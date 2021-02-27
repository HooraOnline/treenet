// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const verifyToken = require('../utils/VerifyToken');
const mongoose=require('mongoose')
const MongoClient = require('mongodb').MongoClient;
const errorHandler = require('strong-error-handler');

const app = module.exports = loopback();

app.get('/file/post_image', function (req, res) {

  res.sendFile(__dirname + "/storage/post_image/"+req.query.f);
});
app.get('/file/post_video', function (req, res) {

  res.sendFile(__dirname + "/storage/post_video/"+req.query.f);
});

app.get('/file/card', function (req, res) {

  res.sendFile(__dirname + "/storage/card/"+req.query.f);
});

app.get('/file/member', function (req, res) {

  res.sendFile(__dirname + "/storage/member/"+req.query.f);
});
app.set('view engine', 'ejs');

app.use('/', verifyToken);


/*app.use(errorHandler({
  debug: app.get('env') === 'development',
  log: true,
}));*/
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      console.log('success run treenet api')
    }
    //connetctDb();
  });
};

const connetctDb=async ()=>{
  //mongoose.connect('mongodb+srv://root:hoora434343@cluster0-hlfun.mongodb.net/dbTarget?retryWrites=true&w=majority',{ useUnifiedTopology: true });
  //mongoose.connection.on('connected',()=>console.log('running...'));

  const uri = "mongodb+srv://root:hoora434343@cluster0-hlfun.mongodb.net/dbTarget?retryWrites=true&w=majority";
  MongoClient.connect(uri, { useUnifiedTopology: true })
    .then(client => {
      console.log('Connected to mongo Database')
      logger.info('*** mongo Server Connection Success ***');
      const db=client.db('dbTarget');
      console.log('db is init for use');
    })
    .catch(err => {
      console.log("!!! mongo Server Connection Failed !!! %j", err);
      //setTimeout(connetctDb, 3000);
    });
}

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

boot(app, { "appRootDir": __dirname, "bootScripts" : [ "./boot/myscripts/public.js" ]});


app.use(`api/acssesses`, (req, res, next)=> {
  console.log(4444);
});


