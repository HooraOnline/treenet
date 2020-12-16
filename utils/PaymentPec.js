var soap = require('soap');
const config = require('config');
const pecPardakht = config.get('TREENET.payPecConfig');
const logger = require('./winstonLogger');
const payment = require("../controllers/payment");

module.exports = {
    createPaymentRequest: (params, callBackUrl = 'https://treenetgram/api/pay/result') => {
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

    createMultiplexRequest: (params, multiplex, callBackUrl = 'https://treenetgram/api/pay/result') => {
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
    requestPayment: (requestParams, callBack) => {
        logger.info("************PaymentPec requestPayment Start %j: ", requestParams);
        soap.createClient(pecPardakht.URL_SERVICE, function (err, client) {
            if (err) logger.error("************PaymentPec createClient ERR %s: ", err);
            else {
                client.SalePaymentRequest(requestParams, function (err, response) {
                    if (err) logger.error("************PaymentPec SalePaymentRequest ERR %s: ", err);
                    else {
                        logger.info("************PaymentPec SalePaymentRequest response: %j: ", response);
                        response = Object.assign(response, {urlPayment: pecPardakht.URL_PAYMENT});

                        const token = Number(response.SalePaymentRequestResult.Token);
                        const status = Number(response.SalePaymentRequestResult.Status);
                        if (token > 0 && status === 0) {
                            return callBack(false, {
                                tokenPay: token,
                                urlPay: pecPardakht.URL_PAYMENT
                            });
                        } else {
                            // if (status === -112) this.requestReversePayment(this.createConfirmReverseRequest())
                            return callBack(" درگاه پرداخت: " + response.SalePaymentRequestResult.Message);
                        }
                    }
                });
            }
        });


    },

    requestMultiplexPayment: (updatePaymentData, requestParams, callBack) => {
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


                        let upBody = Object.assign(updatePaymentData, {
                            PaymentRequestToken: token,
                            PaymentRequestStatusID: status,
                        });
                        payment.updatePayment(upBody)
                            .then(upResult => {
                                logger.info('>>>requestMultiplexPayment Payment/Update Resul: %j', {code: 200, Response: upResult});
                            })
                            .catch(e => {
                                logger.error(">>>requestMultiplexPayment Payment/Update Error: %s", e);
                            });

                        if (token > 0 && status === 0) {
                            return callBack(false, {
                                tokenPay: token,
                                urlPay: pecPardakht.URL_PAYMENT
                            });
                        } else {
                            // if (status === -112) this.requestReversePayment(this.createConfirmReverseRequest())
                            return callBack(" درگاه پرداخت: " + message);
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
    requestConfirmPayment: (updatePaymentData, requestParams, callBack) => {
        logger.info("************PaymentPec requestConfirmPayment Start %j: ", requestParams);
        soap.createClient(pecPardakht.URL_CONFIRM, function (err, client) {
            if (err) logger.error("************PaymentPec createClient ERR %s: ", err);
            else {
                client.ConfirmPayment(requestParams, function (err, response) {
                    if (err) logger.error("************PaymentPec ConfirmPayment ERR %s: ", err);
                    else {
                        logger.info("************PaymentPec ConfirmPayment response: %j: ", response);
                        const status = Number(response.ConfirmPaymentResult.Status);
                        const token = Number(response.ConfirmPaymentResult.Token);
                        const RRN = Number(response.ConfirmPaymentResult.RRN);
                        const CardNumberMasked = response.ConfirmPaymentResult.CardNumberMasked;

                        let upBody = Object.assign(updatePaymentData, {
                            Status: 1,
                            PaymentRequestToken: token,
                            ConfirmStatusID: status,
                            BankReference: RRN,
                            CardNo: CardNumberMasked
                        });
                        payment.updatePayment(upBody)
                            .then(upResult => {
                                logger.info('>>>requestConfirmPayment Payment/Update Resul: %j', {code: 200, Response: upResult});
                            })
                            .catch(e => {
                                logger.error(">>>requestConfirmPayment Payment/Update Error: %s", e);
                            });


                        if (token > 0 && status === 0) {
                            return callBack(false, response)
                        } else {
                            let errMessage = status === -1533 ? "تراکنش قبلاً تایید شده است." : "خطا در ثبت نهایی تراکنش";
                            return callBack(" درگاه پرداخت: " + errMessage);
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
