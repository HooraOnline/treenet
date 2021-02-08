'use strict';
var app = require('../../server/server');
const PaymentFactory = require("../../utils/PaymentFactory");
const logger = require("../../utils/winstonLogger");
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



  Model.getList = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  [{
      relation: 'invoice',
      scope: {
        fields: ['title', 'deadlineDate','description','cdate'],
      }
    }]
    //params.where={memberId:userId};
    params.order=['bankPaymentConfirmSuccess ASC','id DESC'];
    return Model.find(params)
      .then(res => {
        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در بارگذاری لیست اعلانات '
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getList',
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
        path: '/getList',
        verb: 'POST',
      },
    }
  );
  const gatewayConfirmPayment=(updatePaymentData, params, gatewayType, callBack)=> {
    logger.info('**** gatewayConfirmPayment %j', {params, gatewayType});
    const pecConfirm = PaymentFactory.getInstance('pec').getPecPayment();
    const confirmRequest = pecConfirm.createConfirmReverseRequest(params.tokenPay);
    pecConfirm.requestConfirmPayment(updatePaymentData, confirmRequest, Model,(err, result) => {
      logger.info('**** gatewayConfirmPayment result %j', result);

      if (err) {
        if(err.errorCode===100){
          //عدم موفقیت در تایید در این حالت بهتر است سرویس تایید یک بار دیگر  صدا زده شود در غیر اینصورت پول بعد از نهایتا ۷۲ ساعت به حساب کاربر برمی گردد
        }
        return callBack(err)
      }
      return callBack(null, result);
    });
  }
  const confirmPayment=(bankPaymentData,callback)=>{
    logger.info('API: Payment/Update CallBackUrl Resul: %j', {code: 200, Response: bankPaymentData});
    if (bankPaymentData.status === 0 && Number(bankPaymentData.token) > 0) {
      gatewayConfirmPayment({orderId: bankPaymentData.orderId}, {tokenPay: bankPaymentData.token}, 'pec', (err, confirmRequestResult) => {
        if (err) {
          logger.error("API: Payment/Confirm gatewayConfirmPayment Error: %s", err);
          if(err.errorCode===100){
            callback({errorCode:100, lbError:err, errorKey:'خطا در تایید پرداخت. در صورتی که بعد از ۷۲ ساعت پول به حساب شما باز نگشت با شماره ۰۹۸۷ بانک پارسیان تماس بگیرید.',errorMessage:'خطا در تایید پرداخت.  .'});
          }else{
            Model.updateAll({orderId:bankPaymentData.orderId},{bankPaymentRegisterConfirmError:'تراکنش موفق و تایید آن نیز موفق است و فقط ثبت نشده..'});
            callback(null,confirmRequestResult);
          }
        } else {
          const confirmRequest = Object.assign(bankPaymentData, {confirmResult: confirmRequestResult});
          logger.info('API: Payment/result bankData3333333 %j', {confirmRequest: confirmRequest, });
          console.log(confirmRequestResult);
          callback(null,confirmRequest);
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
    logger.info('API: Payment/result Post %j', {bankResultBody: bankResultBody});
    const status = Number(bankResultBody.status);
    const token = Number(bankResultBody.Token);
    const orderId = bankResultBody.OrderId;
    const terminalNo = Number(bankResultBody.TerminalNo);

    const bankPaymentData = {
      orderId: orderId,
      status: (status === 0 && token > 0) ? 0 : -1,
      payGateID: 1,
      callBackStatusID: status,
      token: token,
      terminalNo: terminalNo
    };
    bankResultBody.success=(status === 0 && token > 0);
    bankResultBody.PayGateID='parsian';
    const where={orderId:Number(bankResultBody.OrderId)};
    console.log(where);
    Model.updateAll(where,{bankPayment:bankResultBody}, function(err, upResult) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در ثبت پرداخت .'});
      }else{
        confirmPayment(bankPaymentData,callback);
      }
    })
  };
  app.post('/uniquparsianbankdata', function (req, res) {
    const bankTransactionData=req.body;
    console.log(req.body);

    updatePaymentAfterBankReturn(bankTransactionData,function (confirmError,transactionConfirm){
      console.log('transactionConfirm',transactionConfirm);
      console.log('confirmError',confirmError);
      if(bankTransactionData.status==='-138'){
        console.log('انصراف از پرداخت')
        //res.send('شما از پرداخت انصراف دادید');
        res.render("bank/uniqu/bankCancel", {
          payResult:bankTransactionData ,
        });
      }else if(Number(bankTransactionData.status)===0 && Number(bankTransactionData.RRN)>0){
        if(confirmError && confirmError.errorCode===100){
          res.send('خطا در تایید تراکنش. درصورتی که بعد از ۷۲ ساعت پول به حساب شما بازنگشت لطفا با شماره پیگیری بالا با بانک پارسیان تماس بگیرید.');
        }else{
          //res.send('تراکنش موفق');
          res.render("bank/uniqu/bankSucsess", {
            payResult:bankTransactionData ,
          });
        }
      }else{
        //res.send('تراکنش ناموفق');
        res.render("bank/uniqu/bankError", {
          payResult:bankTransactionData ,
        });
      }
    });
  });

  function gatewayMultiplexTokenPayment(params, gatewayType, callBack) {
    logger.info('**** gatewayTokenPayment %j', {params, gatewayType});
    var paymentFactory = PaymentFactory.getInstance(gatewayType);

    let bankCallBackUrl;
    const pecPayment = paymentFactory.getPecPayment();
    const payRequest = pecPayment.createMultiplexRequest({
      amount: params.amount,
      orderId: params.orderId,
    }, [
      {
        Amount: params.amount,
        PayId: params.orderId,
        IBAN: params.shebaNo
      },
      /*{
          Amount: params.amount / 2,
          PayId: "0",
          IBAN: "IR270570024080013213284101" //"IR260560086680001727250001"
      }*/
    ],'https://localy.ir/uniquparsianbankdata');
    pecPayment.requestMultiplexPayment( payRequest, (err, result) => {
      if (err) return callBack(err);
      console.log("**********  paymentInsert requestPayment result: ", result);
      return callBack(false, result);
    });
  }
  //پرداخت بدون شبا
  const createBankPaymentRequest = (amount,orderId ,callback)=> {

    var paymentFactory = PaymentFactory.getInstance('pec');
    const pecPayment = paymentFactory.getPecPayment();
    amount=1000 //temp code
    const payRequest = pecPayment.createPaymentRequest({
      amount: amount,
      orderId: orderId,
    },'https://localy.ir/uniquparsianbankdata');

    pecPayment.requestPayment(payRequest,(errorMsg)=>{
      callback(null,{errorCode:204, lbError:{
          errMessage: errorMsg,
          enErrMessage: 'payment Err'
        }, errorKey:errorMsg,errorMessage:'خطا در اتصال به بانک . دوباره سعی کنید.'});
    },(resultObj)=>{
      const token=resultObj.token;
      const urlPayment=resultObj.urlPayment;
      callback(null,resultObj);
    })
  };


  Model.addPayment =  (data, callback)=> {

    const orderId=Date.now();
    const entity={id:data.id, orderId:orderId}
    console.log(entity);
    Model.updateOrCreate(entity)
      .then(res => {
        console.log(res);
        let amount=0
        res.details.map(item=>{
          amount+=item.amount;
        })
        //createBankPaymentRequest(amount,orderId,callback);
        const updatePaymentData = {
          id: res.id,
          Status: 0,
        };

        gatewayMultiplexTokenPayment({
          amount:1000,// amount,
          orderId: orderId,
          shebaNo:'IR040570028480001032720001', //res.ShebaNo,
        }, 'pec', (errorMsg, payRequestResult) => {

        if (errorMsg) {
          logger.error("API: Payment/Insert gatewayTokenPayment Error333: %s", err);
          callback(null,{errorCode:204, lbError:{
              errMessage: errorMsg,
              enErrMessage: 'payment Err'
            }, errorKey:errorMsg,errorMessage:'خطا در اتصال به بانک . دوباره سعی کنید.'});
        } else {
          console.log('payRequestResult===',payRequestResult);
          callback(null,payRequestResult)
          //result[0] = Object.assign(result[0], {payRequestResult});

        }

        });

      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در تخصیص شماره سفارش '
        });
      });
  }
  Model.remoteMethod(
    'addPayment',
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
        path: '/addPayment',
        verb: 'POST',
      },
    }
  );



};


