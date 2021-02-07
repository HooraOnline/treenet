module.exports = function(app) {
  var router = app.loopback.Router();
  router.get('/ping', function(req, res) {
    res.send('pongaroo');
  });
  router.post('/parsianbankdata22', function (req, res) {
    console.log(1111111111111111);
    console.log('parsianbankdata===',req.body);
    res.send('parsianbankdata');
  });
  app.use(router);
}
