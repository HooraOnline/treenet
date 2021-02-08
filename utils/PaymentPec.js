var soap = require('soap');
const config = require('config');
const pecPardakht = config.get('TREENET.payPecConfig');
const logger = require('./winstonLogger');
const payment = {};
var app = require('../server/server');
module.exports = {
    createPaymentRequest: (params, callBackUrl = 'https://localy.ir/treenetparsianbankdata') => {
        return {
            requestData: {
                LoginAccount: pecPardakht.LOGIN_ACCOUNT,
                Amount: Number(params.amount),
                OrderId: Number(params.orderId),
                CallBackUrl: callBackUrl,
                AdditionalData: "",
                Originator: "",
            }
        }
    },

    createMultiplexRequest: (params, multiplex, callBackUrl = 'https://localy.ir/treenetparsianbankdata') => {
      console.log(params);
      console.log(multiplex);
      return {
            requestData: {
                LoginAccount: pecPardakht.LOGIN_ACCOUNT,
                Amount: Number(params.amount),
                OrderId: Number(params.orderId),
                CallBackUrl: callBackUrl,
                MultiplexedAccounts: [{AccountWithIBAN: multiplex}]
            }
        };
        /*MultiplexedAccounts: [
            {
                Amount: 1000, //long
                PayId: "",
                IBAN: ""
           }
        ]*/
    },


    requestPayment: (requestParams,erroreCallback ,successCallBack) => {
      console.log(requestParams,erroreCallback,successCallBack);
      logger.info("************PaymentPec requestPayment Start %j: ", requestParams);
        soap.createClient(pecPardakht.URL_SERVICE, function (err, client) {
            if (err) {
              logger.error("************PaymentPec createClient ERR %s: ", err)
              return erroreCallback('خطای اتصال به بانک');
            }
            else {
                client.SalePaymentRequest(requestParams, function (err, response) {
                    if (err) {
                      logger.error("************PaymentPec SalePaymentRequest ERR %s: ", err);
                      return erroreCallback('خطای اتصال به بانک')
                    }
                    else {

                        logger.info("************PaymentPec SalePaymentRequest response: %j: ", response);
                        response = Object.assign(response, {urlPayment: pecPardakht.URL_PAYMENT});
                      const token = Number(response.SalePaymentRequestResult.Token);
                        const status = Number(response.SalePaymentRequestResult.Status);
                      if (token > 0 && status === 0) {
                        return successCallBack({
                                tokenPay: token,
                                urlPay: pecPardakht.URL_PAYMENT+token
                            });
                        } else {

                        // if (status === -112) this.requestReversePayment(this.createConfirmReverseRequest())
                            return erroreCallback(" خطای درگاه بانکی: " + response.SalePaymentRequestResult.Message);
                        }
                    }
                });
            }
        });


    },

    requestMultiplexPayment: (requestParams, callBack) => {
        logger.info("************PaymentPec requestMultiplexPayment Start %j: ", requestParams);
        soap.createClient(pecPardakht.URL_MULTIPLEX, function (err, client) {
            if (err) logger.error("!!!!!!!!!!!!!!PaymentPec createClient ERR %s: ", err);
            else {
                // client.setSecurity()
                client.MultiplexedSaleWithIBANPaymentRequest(requestParams, function (err, response) { //MultiplexedSaleWithIBANPaymentRequest
                    if (err) logger.error("!!!!!!!!!!PaymentPec MultiplexedSaleWithIBANPaymentRequest ERR %s: ", err);
                    else {
                        logger.info("$$$$$$$$$$$$*********PaymentPec MultiplexedSaleWithIBANPaymentRequest response: %j: ", response);
                        response = Object.assign(response, {urlPayment: pecPardakht.URL_PAYMENT});


                        const token = Number(response.MultiplexedSaleWithIBANPaymentRequestResult.Token);
                        const status = Number(response.MultiplexedSaleWithIBANPaymentRequestResult.Status);
                        const message = response.MultiplexedSaleWithIBANPaymentRequestResult.Message;

                        if (token > 0 && status === 0) {
                            return callBack(false, {
                                tokenPay: token,
                                urlPay: pecPardakht.URL_PAYMENT+token
                            },response.MultiplexedSaleWithIBANPaymentRequestResult);
                        } else {
                            // if (status === -112) this.requestReversePayment(this.createConfirmReverseRequest())
                            return callBack(" درگاه پرداخت: " + message,response.MultiplexedSaleWithIBANPaymentRequestResult);
                        }
                    }
                });
            }
        });


    },

    createConfirmReverseRequest: (token) => {
        return {
            requestData: {
                LoginAccount: pecPardakht.LOGIN_ACCOUNT,
                Token: token
            }
        }
    },
    requestConfirmPayment: (updatePaymentData, requestParams,Model, callBack) => {
      logger.info("************PaymentPec requestConfirmPayment Start %j: ", requestParams);
        soap.createClient(pecPardakht.URL_CONFIRM, function (err, client) {
          if (err) {
              logger.error("************PaymentPec createClient ERR %s: ", err);
              callBack({errorCode:100, lbError:err, errorKey:'خطا در ارتباط با بانک جهت تایید',errorMessage:'خطا در ارتباط با بانک جهت تایید .'});
          } else {
            client.ConfirmPayment(requestParams, function (err, response) {
              if (err) {
                      console.log(22222222222222);
                      logger.error("************PaymentPec ConfirmPayment ERR %s: ", err);
                      callBack({errorCode:100, lbError:err, errorKey:'خطا در ارتباط با بانک جهت تایید',errorMessage:'خطا در ارتباط با بانک جهت تایید .'});
                    }else {
                        console.log(333333333333333);
                        logger.info("************PaymentPec ConfirmPayment response: %j: ", response);
                        const status = Number(response.ConfirmPaymentResult.Status);
                        const token = Number(response.ConfirmPaymentResult.Token);
                        const RRN = Number(response.ConfirmPaymentResult.RRN);
                        const CardNumberMasked = response.ConfirmPaymentResult.CardNumberMasked;
                        const orderId = Number(updatePaymentData.orderId);
                        console.log(44444444444444444);
                        let upBody = Object.assign(updatePaymentData, {
                          Status: status,
                          PaymentRequestToken: token,
                          ConfirmStatusID: status,
                          BankReference: RRN,
                          CardNo: CardNumberMasked,
                          OrderId:orderId,
                          successConfirm:false,
                        });

                        const where={orderId:orderId};
                        console.log(where);
                        if (token > 0 && status === 0 || status === -1533) {
                          upBody.successConfirm=true;
                          if(status === -1533){
                            console.log('تراکنش قبلا تایید شده است');
                            upBody.confirmBefore=true;
                          }
                          Model.updateAll(where,{bankPaymentConfirm:upBody,bankPaymentConfirmSuccess:true,}, function(err, upResult) {
                            if(err){
                              callBack({errorCode:147, lbError:err, errorKey:'خطا در به روزآوری تایید پرداخت',errorMessage:'خطا در به روزآوری تایید پرداخت .'});
                            }else{
                              callBack(null,upBody);
                            }
                          })
                        } else {
                            upBody.successConfirm=false;
                            Model.updateAll(where,{bankPaymentConfirm:upBody,bankPaymentConfirmSuccess:false,});
                            callBack({errorCode:100, lbError:err, errorKey:'خطا در تایید نهایی تراکنش.',errorMessage:'خطا در تایید نهایی تراکنش.'});
                        }

                    }
                });
            }
        });
    },



    requestReversePayment: (requestParams, callBack) => {
        logger.info("************PaymentPec request ReversePayment Start %j: ", requestParams);
        soap.createClient(pecPardakht.URL_REVERS, function (err, client) {
            if (err) logger.error("************PaymentPec createClient ERR %s: ", err);
            else {
                // console.error("************createClient client: ", client);
                client.ReversalRequest(requestParams, function (err, response) {
                    if (err) logger.error("************PaymentPec ReversePayment ERR %s: ", err);
                    else {
                        logger.info("************PaymentPec ReversePayment response: %j: ", response);
                        return callBack(response)
                    }
                });
            }
        });
    }
};
