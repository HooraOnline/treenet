'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId;
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

  Model.add =  (data, callback)=> {
    const userId = data.userId;
    if (!userId) {
      callback(new Error('An error occurred'));
      return
    }
    const params={};
    params.where={buyerId:userId};
    //params.order='cdate DESC';
    params.include=  {
      relation: 'marketerproduct',
      scope: {
        //fields: ['id', 'title','text',],
        include:[{
            relation: 'product',
            scope: {
              //fields: ['id','memberId', 'title','text','file','fileType','fileExtention',price','commission','userKey'],
              include: [{
                relation: 'member',
                scope: {
                  fields: ['id','mobile', 'fullName','userKey','storeName'],

                }
              }]
            }
          },
          {
            relation: 'marketer',
            scope: {
              fields: ['id','mobile', 'firstName','lastName','userKey','storeName'],
            }
          }
        ]
      }
    }
    app.models.Basket.find(params)
      .then((basket) => {

        const orders=[];
        basket.map(o=>{

          let product=o['__data'].marketerproduct['__data'].product['__data'];
          let marketer=o['__data'].marketerproduct['__data'].marketer['__data'];
          let seller=product.member['__data'];
          delete product.member;

          let order={
             marketerProductId:o.marketerProductId,
             number:o.number,
             cdate:o.cdate,
             marketerproductId:o.marketerproduct.id,
             product:product,
             marketer:marketer,
             seller:seller,
             isClearBySeller:false,
           }
          orders.push(order);
        })

        let entity={
            id:data.id,
            buyerId:userId,
            basket:orders,
            paymentFor:'buy_product',
            totalPrice:data.totalPrice,
            bankReference:0,
            status:0,
            description:data.description || 'بدون توضیح',
            paymentType:'online',
            cardNumber:0,
            cdate:new Date(),
            udate:new Date()
        };
        Model.updateOrCreate(entity, function(err, res) {
          if(err){
            callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در ثبت پرداخت . دوباره سعی کنید.'});
          }else{
            callback(null, {paymentId:res.id});
          }
        })
      })
      .catch(err => {

        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در ثبت پرداخت . دوباره سعی کنید.'
        });
      })
  }

  Model.remoteMethod(
    'add',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/add',
        verb: 'POST',
      },
    }
  );


  Model.edit =  (data, callback)=> {
    const userId = data.userId;
    if (!userId) {
      callback(new Error('An error occurred'));
      return
    }
    data.status=1;
    let entity={
      id:data.id,
      bankReference:data.bankReference,
      status:data.status,
      cardNumber:data. cardNumber,
      udate:new Date()
    };
    Model.updateOrCreate(entity, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا در ثبت پرداخت ',errorMessage:'خطا در ثبت پرداخت .'});
      }else{
        if(data.status===1){
          app.models.Basket.destroyAll({buyerId:userId});
          app.models.Commission.addPaymentCommission(res)

        }

        callback(null,{paymentId:res.id});
      }
    })

  }


  Model.remoteMethod(
    'edit',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/edit',
        verb: 'POST',
      },
    }
  );


  Model.getUserPayments = function (params, callback) {

    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    params.where={buyerId:userId};
    params.order='id DESC';

    return Model.find(params)
      .then(res => {
        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در بارگذاری سفارشات'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserPayments',
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
        path: '/getUserPayments',
        verb: 'POST',
      },
    }
  );

  Model.getUserOrders = function (params, callback) {

    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    //params.where={'basket.1.product.memberId':userId};
    params.where= { "basket.product.memberId":  userId} ;
    params.order='id DESC';

    return Model.find(params)
      .then(payment => {
        payment.map(paymentItem=>{
          paymentItem.basket=paymentItem.basket.filter(item=>item.product.memberId.toString()===userId.toString());
          let totalPrice=0;
          let unClearPrice=0;
          let totalCommission=0;
          let unClearCommission=0;
          paymentItem.basket.map(o=> {
            totalPrice = totalPrice + o.product.price;
            totalCommission=Math.round(totalCommission + o.product.price*o.product.commission/100);
            if(!o.isClearBySeller){
              unClearPrice = unClearPrice + o.product.price;
              unClearCommission=Math.round(unClearCommission + o.product.price*o.product.commission/100);
            }

          });
          paymentItem.totalPrice=totalPrice;
          paymentItem.unClearPrice=unClearPrice;
          paymentItem.totalCommission=totalCommission;
          paymentItem.unClearCommission=unClearCommission;
        })
        callback(null, payment);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در بارگذاری سفارشات'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserOrders',
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
        path: '/getUserOrders',
        verb: 'POST',
      },
    }
  );

//جهت تسویه با فروشنده
  Model.clearSellPrice = function (params, callback) {

    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    //params.where={'basket.1.product.memberId':userId};
    params.where= { "basket.product.memberId":  userId} ;
    params.order='id DESC';

    return Model.find(params)
      .then(payment => {
        payment.map(paymentItem=>{
          paymentItem.basket=paymentItem.basket.filter(item=>item.product.memberId.toString()===userId.toString());
          paymentItem.basket.map(basketItem=>{
            basketItem.isClearBySeller=true;
            Model.update(paymentItem);
          })

        })
        callback(null, payment);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در بارگذاری سفارشات'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'clearSellPrice',
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
        path: '/clearSellPrice',
        verb: 'POST',
      },
    }
  );

};


