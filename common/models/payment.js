'use strict';
var app = require('../../server/server');
const PaymentFactory = require("../../utils/PaymentFactory");
const logger = require("../../utils/winstonLogger");
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
  app.get('/client1', function(req, res) {
    console.log(__dirname);
    res.sendFile(__dirname + "/html/cancel.html");
    /*  res.render("views/apamanWeb/bankPaymentSucsess", {
        payResult:{} ,
      });*/
  });
  const gatewayConfirmPayment=(updatePaymentData, params, gatewayType, callBack)=> {
    logger.info('**** gatewayConfirmPayment %j', {params, gatewayType});
    console.log('ppppppp');
    const pecConfirm = PaymentFactory.getInstance('pec').getPecPayment();
    console.log('yyyyyyyyyy');
    const confirmRequest = pecConfirm.createConfirmReverseRequest(params.tokenPay);
    pecConfirm.requestConfirmPayment(updatePaymentData, confirmRequest, (err, result) => {
      logger.info('**** gatewayConfirmPayment result %j', result);
      if (err) return callBack(err);
      return callBack(null, result);
    });
  }
  const confirmPayment=(bankPaymentData,callback)=>{
    logger.info('API: Payment/Update CallBackUrl Resul: %j', {code: 200, Response: bankPaymentData});
    console.log(555555555);
    if (bankPaymentData.status === 0 && bankPaymentData.token > 0) {
      console.log(6666666666);
      gatewayConfirmPayment({ID: bankPaymentData.orderId}, {tokenPay: bankPaymentData.token}, 'pec', (err, confirmRequestResult) => {
        if (err) {
          console.log(777777777777);
          logger.error("API: Payment/Confirm gatewayConfirmPayment Error: %s", err);
          callback({errorCode:197, lbError:err, errorKey:'خطا در تایید پرداخت.  .',errorMessage:'خطا در تایید پرداخت.  .'});
        } else {
          console.log(88888888888);
          const bankData = Object.assign(bankPaymentData, {confirmResult: confirmRequestResult.ConfirmPaymentResult});
          logger.info('API: Payment/result bankData3333333 %j', {bankData: bankData, });
          console.log(999999999999);
          callback(null,bankData);
        }
      });
    }else{
      callback(null,bankPaymentData);
    }
  }

  const updatePaymentAfterBankReturn=async function(bankResultBody,callback){
    /*   body=== {
      Token: '115985982491618',
      OrderId: '1612612734200',
      TerminalNo: '44481453',
      RRN: '723753131045',شماره پیگیری
      status: '0',
      TspToken: '00000000-0000-0000-0000-000000000000',
      HashCardNumber: '0102C833A86E2EA299639DEA3288B2E10383938AD95B84400BEBE77AD3099865',
      Amount: '1,000',
      SwAmount: '1,000',
      STraceNo: '269675'
    }*/
    console.log(1111111);
    logger.info('API: Payment/result Post %j', {bankResultBody: bankResultBody});


    const status = Number(bankResultBody.status);
    const token = Number(bankResultBody.Token);
    const orderId = bankResultBody.OrderId;
    const terminalNo = Number(bankResultBody.TerminalNo);

    const bankPaymentData = {
      orderId: orderId,
      Status: (status === 0 && token > 0) ? 0 : -1,
      PayGateID: 1,
      CallBackStatusID: status,
      PaymentRequestToken: token,
      TerminalNo: terminalNo
    };
    bankResultBody.success=(status === 0 && token > 0);
    console.log(2222222222);
    const where={orderId:Number(bankResultBody.OrderId)};
    console.log(where);
    Model.updateAll(where,{bankPayment:bankResultBody}, function(err, upResult) {
      if(err){
        console.log(3333333333);
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در ثبت پرداخت .'});
      }else{
        console.log(44444444);
        console.log(upResult);
        confirmPayment(bankPaymentData,callback);
      }
    })
  };

  Model.bankResoult = (data,calback)=> {
    console.log('bankResoult===',data);
/*    bankResoult888888888=== {
      Token: '115985982491618',
      OrderId: '1612612734200',
      TerminalNo: '44481453',
      RRN: '723753131045',شماره پیگیری
      status: '0',
      TspToken: '00000000-0000-0000-0000-000000000000',
      HashCardNumber: '0102C833A86E2EA299639DEA3288B2E10383938AD95B84400BEBE77AD3099865',
      Amount: '1,000',
      SwAmount: '1,000',
      STraceNo: '269675'
    }*/
    console.log('aaaaaaaaaaaaaaaaaaaa');
    updatePaymentAfterBankReturn(data,(err,resoult)=>{
      console.log('aaaaaaaaaaaaaaaaaaaa',resoult);
      console.log('bbbbbbbbbbbbbb',err);

      if(data.status==='-138'){
        console.log('انصراف از پرداخت')
        //res.sendFile(__dirname + "/html/cancel.html");
      }else if(data.status==='0'){
        if(Number(data.RRN)>0){
          console.log('تراکنش موفق');
        }else{
          console.log('تراکنش ناموفق')
        }
      }else{
        console.log('تراکنش ناموفق2')
      }
    });
  };
  Model.remoteMethod(
    'bankResoult',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/bankResoult',
        verb: 'POST',
      },
    }
  );



  const createBankPaymentRequest = (paymentId,amount,orderId ,callback)=> {

    var paymentFactory = PaymentFactory.getInstance('pec');
    const pecPayment = paymentFactory.getPecPayment();
    amount=1000 //temp code
    const payRequest = pecPayment.createPaymentRequest({
      amount: amount,
      orderId: orderId,
    });

    pecPayment.requestPayment(payRequest,(errorMsg)=>{
      console.log('errorMsg=',errorMsg);
      callback(null,{errorCode:204, lbError:{
          errMessage: errorMsg,
          enErrMessage: 'payment Err'
        }, errorKey:errorMsg,errorMessage:'خطا در اتصال به بانک . دوباره سعی کنید.'});
    },(resultObj)=>{
      console.log('resultObj44444444=',resultObj);
      const token=resultObj.token;
      const urlPayment=resultObj.urlPayment;
      callback(null,resultObj);
    })
  };


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
            orderId:Date.now(),
            bankPayment:{},
            cdate:new Date(),
            udate:new Date()
        };
        Model.updateOrCreate(entity, function(err, res) {
          if(err){
            callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در ثبت پرداخت . دوباره سعی کنید.'});
          }else{
            createBankPaymentRequest(res.id,res.totalPrice,res.orderId,callback)

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


