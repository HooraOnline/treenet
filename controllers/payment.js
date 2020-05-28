const express = require('express')
    , router = express.Router();
const sql = require("mssql");


const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');
const PushNotification = require('../utils/PushNotification');

const PaymentFactory = require('../utils/PaymentFactory');

//______________________Select Announce for Pay________________//			,
router.get('/:BuildingID/:FormID.:UnitID.:PayUserID.:PayUnitID.:RoleID', function (req, res) {

    logger.info('API: Payment/Select Announce for Pay %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Announce_SelectForPay";


    // create Request object
    const request = new sql.Request(pool);

    // request.input('HasPaid', sql.BigInt, req.params.HasPaid);
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('FormID', sql.BigInt, req.params.FormID);
    request.input('UserID', sql.BigInt, req.userId);
    request.input('RoleID', sql.BigInt, req.params.RoleID);


    if (req.params.UnitID && req.params.UnitID !== "null")
        request.input('UnitID', sql.BigInt, req.params.UnitID);

    if (req.params.PayUserID && req.params.PayUserID !== "null")
        request.input('PayUserID', sql.BigInt, req.params.PayUserID);

    if (req.params.PayUnitID && req.params.PayUnitID !== "null")
        request.input('PayUnitID', sql.BigInt, req.params.PayUnitID);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/Select Announce for Pay Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Payment/Select Announce for Pay Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________Select Announce for Pay Detail________________//			,
router.get('/detail/:BuildingID/:FormID.:UnitID.:AnnounceDetailID.:RoleID', function (req, res) {

    logger.info('API: Payment/Select Announce for Pay Detail %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Announce_SelectForPayDetail";


    // create Request object
    const request = new sql.Request(pool);

    // request.input('HasPaid', sql.BigInt, req.params.HasPaid);
    request.input('AnnounceDetailID', sql.BigInt, req.params.AnnounceDetailID);
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('FormID', sql.BigInt, req.params.FormID);
    request.input('UserID', sql.BigInt, req.userId);
    request.input('RoleID', sql.BigInt, req.params.RoleID);


    if (req.params.UnitID && req.params.UnitID !== "null")
        request.input('UnitID', sql.BigInt, req.params.UnitID);


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/Select Announce for Pay Detail Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Payment/Select Announce for Pay Detail Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________Payment Insert________________//
router.post('/', function (req, res) {

    logger.info('API: Payment/Insert %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Payment_Insert";

    // create Request object
    const request = new sql.Request(pool);

    // request.input('AnnounceDetailID', sql.BigInt, req.body.AnnounceDetailID);
    request.input('BankGatewayID', sql.BigInt, req.body.BankGatewayID);
    // request.input('BuildingAccountID', sql.BigInt, req.body.BuildingAccountID);
    request.input('PaymentTypeID', sql.BigInt, req.body.PaymentTypeID);
    request.input('TotalPrice', sql.BigInt, req.body.TotalPrice);
    request.input('Description', sql.VarChar(500), req.body.Description);
    request.input('RoleID', sql.BigInt, req.body.RoleID);

    /*request.input('CallerBuildingID', sql.BigInt, req.body.BuildingID);
    request.input('CallerUserID', sql.BigInt, req.userId);
    if (req.body.UnitID && req.body.UnitID !== "null") {
        request.input('CallerUnitID', sql.BigInt, req.body.UnitID);
    }*/

    request.input('CallerBuildingID', sql.BigInt, req.body.CallerBuildingID);
    request.input('CallerUnitID', sql.BigInt, req.body.CallerUnitID ? req.body.CallerUnitID : null);
    request.input('CallerUserID', sql.BigInt, req.userId);

    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);
    request.input('UnitID', sql.BigInt, req.body.UnitID);

    //facility
    request.input('HasCalled', sql.BIT, false);
    request.input('CallerUserID', sql.BigInt,  req.userId);
    request.input('CallerUserID', sql.BigInt, req.userId);
    request.input('PurchaseTypeID', sql.BigInt, req.body.PurchaseTypeID ? req.body.PurchaseTypeID : 1);
    request.input('ReserveDate', sql.DATE, req.body.ReserveDate ? req.body.ReserveDate : null);
    request.input('OwnerCount', sql.BigInt, req.body.OwnerCount ? req.body.OwnerCount : null);
    request.input('GuestCount', sql.BigInt, req.body.GuestCount ? req.body.GuestCount : 0);
    request.input('TempID', sql.BigInt, req.body.TempID ? req.body.TempID : null);
    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) {
            logger.error("API: Payment/Insert Error222: %s", err);
            CheckException.handler(res, null);
        } else {
            let result = null;
            if (recordset) {
                result = recordset.recordset;
            }
            if( result[0].ResultCode=="-9"){
                CheckException.handler(res, result);
                return;
            }
            logger.info('API: Payment/Insert Resul5555: %j', {code: 200, Response: result});
            const updatePaymentData = {
                ID: result[0].PaymentID,
                Status: 0,
            };

            gatewayMultiplexTokenPayment(updatePaymentData, {
                amount: req.body.TotalPrice,
                orderId: result[0].PaymentID,
                shebaNo: result[0].ShebaNo,
            }, 'pec', (err, payRequestResult) => {

                if (err) {
                    logger.error("API: Payment/Insert gatewayTokenPayment Error333: %s", err);
                    res.set({
                        errMessage: toUnicode(err),
                    }).status(204).send();
                } else {
                    result[0] = Object.assign(result[0], {payRequestResult});
                    CheckException.handler(res, result);
                    // res.type('application/json').status(200).send(result);
                }
                logger.info('API: Payment/Insert Resul: %j', {code: 200, Response: result});
            });
        }
    });
});

router.post('/delete', function (req, res) {

    logger.info('API: Payment/delete %j', {body: req.body, userId: req.userId});

    const shema = "Accounting";
    const sp = "Payment_Delete";


    // create Request object
    const request = new sql.Request(pool);



    // request.input('AnnounceDetailID', sql.BigInt, req.body.AnnounceDetailID);
    request.input('ID', sql.BigInt, req.body.ID);
    request.input('CallerBuildingID', sql.BigInt, req.body.CallerBuildingID);
    request.input('CallerRoleID', sql.BigInt, req.body.CallerRoleID);
    if (req.body.CallerUnitID && req.body.CallerUnitID !== "null")
        request.input('CallerUnitID', sql.BigInt, req.body.CallerUnitID);
    request.input('CallerUserID', sql.BigInt, req.userId);
    // query to the database and get the data

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/delete Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }

        logger.info('API: Payment/delete Resul: %j', {code: 200, Response: result});
        CheckException.handler(res, result);

    });
});
//______________________Select payment Summary________________//			,
router.get('/summary/:PaymentID', function (req, res) {

    logger.info('API: Payment/Select Summary %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Payment_ShowSummery";


    // create Request object
    const request = new sql.Request(pool);

    request.input('PaymentID', sql.BigInt, req.params.PaymentID);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/Select Summary Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Payment/Select Summary Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________Payment manually________________//
router.post('/manually', function (req, res) {

    logger.info('API: Payment/manually %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Payment_Manual";


    // create Request object
    const request = new sql.Request(pool);



    // request.input('AnnounceDetailID', sql.BigInt, req.body.AnnounceDetailID);
    request.input('RoleID', sql.BigInt, req.body.RoleID);
    request.input('PaymentTypeID', sql.BigInt, req.body.PaymentTypeID);
    request.input('TotalPrice', sql.BigInt, req.body.TotalPrice);
    request.input('Description', sql.NVarChar(500), req.body.Description);

    //Card Data
    request.input('BuildingAccountID', sql.BigInt, req.body.BuildingAccountID ? req.body.BuildingAccountID : null);
    request.input('BankReference', sql.VarChar(50), req.body.BankReference ? req.body.BankReference : null);
    request.input('CardNo', sql.VarChar(50), req.body.CardNo ? req.body.CardNo : null);

    // Check Data
    request.input('ChequeBankID', sql.BigInt, req.body.ChequeBankID ? req.body.ChequeBankID : null);
    request.input('ChequeName', sql.NVarChar(200), req.body.ChequeName ? req.body.ChequeName : null);
    request.input('ChequeDate', sql.DATE, req.body.ChequeDate ? req.body.ChequeDate : null);
    request.input('ChequeNo', sql.VARCHAR(50), req.body.ChequeNo ? req.body.ChequeNo : null); //*

    //Image in Check & Card
    request.input('Image', sql.NVarChar(1000), req.body.Image ? req.body.Image : null);


    request.input('CallerBuildingID', sql.BigInt, req.body.CallerBuildingID);
    request.input('CallerUnitID', sql.BigInt, req.body.CallerUnitID ? req.body.CallerUnitID : null);
    request.input('CallerUserID', sql.BigInt, req.userId);

    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UserID', sql.BigInt, req.body.UserID);
    request.input('UnitID', sql.BigInt, req.body.UnitID);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/manually Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }

        logger.info('API: Payment/manually Resul: %j', {code: 200, Response: result});
        CheckException.handler(res, result);
        PushNotification.getSend()
    });
});
router.post('/manuallyUpdate', function (req, res) {

    logger.info('API: Payment/manuallyUpdate %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Payment_ManualUpdate";

    // create Request object
    const request = new sql.Request(pool);

    request.input('ID', sql.BigInt, req.body.ID);
    request.input('PaymentTypeID', sql.BigInt, req.body.PaymentTypeID);
    //request.input('TotalPrice', sql.BigInt, req.body.TotalPrice);
    request.input('Description', sql.NVarChar(500), req.body.Description);

    //Card Data
    request.input('BuildingAccountID', sql.BigInt, req.body.BuildingAccountID ? req.body.BuildingAccountID : null);
    request.input('BankReference', sql.VarChar(50), req.body.BankReference ? req.body.BankReference : null);
    request.input('CardNo', sql.VarChar(50), req.body.CardNo ? req.body.CardNo : null);

    // Check Data
    request.input('ChequeBankID', sql.BigInt, req.body.ChequeBankID ? req.body.ChequeBankID : null);
    request.input('ChequeName', sql.NVarChar(200), req.body.ChequeName ? req.body.ChequeName : null);
    request.input('ChequeDate', sql.DATE, req.body.ChequeDate ? req.body.ChequeDate : null);
    request.input('ChequeNo', sql.VARCHAR(50), req.body.ChequeNo ? req.body.ChequeNo : null); //*

    //Image in Check & Card
    request.input('Image', sql.NVarChar(1000), req.body.Image ? req.body.Image : null);

    request.input('CallerRoleID', sql.BigInt, req.body.CallerRoleID);
    request.input('CallerBuildingID', sql.BigInt, req.body.CallerBuildingID);
    request.input('CallerUnitID', sql.BigInt, req.body.CallerUnitID ? req.body.CallerUnitID : null);
    request.input('CallerUserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/manuallyUpdate Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }

        logger.info('API: Payment/manuallyUpdate Resul: %j', {code: 200, Response: result});
        CheckException.handler(res, result);
        PushNotification.getSend()
    });
});
//______________________Payment Update________________//
router.put('/', function (req, res) {

    logger.info('API: Payment/Update %j', {body: req.body, userId: req.userId});

    const updateBody = Object.assign(req.body, {UserID: req.userId});

    updatePayment(updateBody)
        .then(result => {
            logger.info('API: Payment/Update Resul: %j', {code: 200, Response: result});
            CheckException.handler(res, result);
        })
        .catch(e => {
            logger.error("API: Payment/Update Error: %s", e);
            CheckException.handler(res, [{dbErr: e}]);
        })
});

exports.updatePayment = updatePayment;

async function updatePayment(body) {
    logger.info('API: Payment/update function %j', {body: body});
    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Payment_Update";

    // create Request object
    const request = new sql.Request(pool);

    request.input('ID', sql.BigInt, body.ID);
    request.input('BankReference', sql.VARCHAR(50), body.BankReference);
    // request.input('RefID', sql.VARCHAR(50), body.RefID);
    request.input('Status', sql.BigInt, body.Status);                   //; صفر= پیش فرض ; یک = موفق ; منهای یک = ناموفق
    request.input('CardNo', sql.VARCHAR(16), body.CardNo);

    request.input('ChequeNo', sql.VARCHAR(50), body.ChequeNo ? body.ChequeNo : null); //*
    request.input('ChequeName', sql.NVARCHAR(200), body.ChequeName ? body.ChequeName : null); //*
    request.input('ChequeDate', sql.DATE, body.ChequeDate ? body.ChequeDate : null); //*
    request.input('ChequeBankID', sql.BigInt, body.ChequeBankID ? body.ChequeBankID : null); //*

    request.input('PaymentRequestToken', sql.BigInt, body.PaymentRequestToken); //*
    request.input('PaymentRequestStatusID', sql.BigInt, body.PaymentRequestStatusID); //*
    request.input('CallBackStatusID', sql.BigInt, body.CallBackStatusID); //*
    request.input('ConfirmStatusID', sql.BigInt, body.ConfirmStatusID); //*
    request.input('TerminalNo', sql.BigInt, body.TerminalNo); //*

    request.input('PayGateID', sql.BigInt, body.PayGateID);
    request.input('HasCalled', sql.Bit, body.HasCalled ? body.HasCalled : 0);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) throw err;

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        if (body.Status === 1) {PushNotification.getSend()}
        logger.info('API: Payment/update function result %j', result);
        return result;
    });
}

//______________________Payment URL Callback____________________//
router.post('/result', async function (req, res) {
    logger.info('API: Payment/result Post %j', {body: req.body, userId: req.userId});
    let bankData = req.body;

    const status = Number(req.body.status);
    const token = Number(req.body.Token);
    const orderId = req.body.OrderId;
    const terminalNo = Number(req.body.TerminalNo);

    const callBackUrlUpdatePaymentData = {
        ID: orderId,
        Status: (status === 0 && token > 0) ? 0 : -1,
        PayGateID: 1,
        CallBackStatusID: status,
        PaymentRequestToken: token,
        TerminalNo: terminalNo
    };
    await updatePayment(callBackUrlUpdatePaymentData)
        .then(upResult => {
            logger.info('API: Payment/Update CallBackUrl Resul: %j', {code: 200, Response: upResult});
            if (status === 0 && token > 0) {
                gatewayConfirmPayment({ID: orderId}, {tokenPay: token}, 'pec', (err, confirmRequestResult) => {
                    if (err) {
                        logger.error("API: Payment/Confirm gatewayConfirmPayment Error: %s", err);
                        bankData = Object.assign(bankData, {err});
                    } else {

                        bankData = Object.assign(bankData, {confirmResult: confirmRequestResult.ConfirmPaymentResult});

                        logger.info('API: Payment/Confirm Resul: %j', {
                            code: 200,
                            Response: confirmRequestResult.ConfirmPaymentResult,
                        });
                        logger.info('API: Payment/result Post3333333 %j', {body: req.body, userId: req.userId});

                    }
                });
            }
        })
        .catch(e => {
            logger.error("API: Payment/Update CallBackUrl Error: %s", e);
        });

    logger.info('API: Payment/result Post44444 %j', {body: bankData});

   /* res.render("pages/paymentResult", {
        payResult: bankData,
    });*/
    if(bankData.status==0  ){
        res.render("pages/bankPaymentSucsess", {
            payResult:bankData ,
        });
    }else if(bankData.status==-138){
        res.render("pages/bankPaymentCancel", {
            payResult:bankData ,
        });
    }else{
        res.render("pages/bankPaymentError", {
            payResult:bankData ,
        });
    }
});


//______________________Payment Get Result//
router.get('/result2', function (req, res) {
    logger.info('API: Payment/result %j', {body: req.body, userId: req.userId});
    let bankData={status:-138,Token:100,OrderId:1500,RRN:1110006660101,Amount:42000};
    if(bankData.status==0 ){
        res.render("pages/bankPaymentSucsess", {
            payResult:bankData ,
        });
    }else if(bankData.status==-138){
        res.render("pages/bankPaymentCancel", {
            payResult:bankData ,
        });
    }else{
        res.render("pages/bankPaymentError", {
            payResult:bankData ,
        });
    }
});

//______________________Test Payment ________________//
router.post('/test', function (req, res) {

    logger.info('API: Payment/Test %j', {body: req.body, userId: req.userId});

    var paymentFactory = PaymentFactory.getInstance('pec');

    const pecPayment = paymentFactory.getPecPayment();
    const payRequest = pecPayment.createPaymentRequest({
        amount: req.body.amount,
        orderId: req.body.orderId
    });
    pecPayment.requestPayment(payRequest, result => {
        console.log("%%%%%%%%%%%%%%%%%%paymentInsert requestPayment result: ", result);
        const token = Number(result.SalePaymentRequestResult.Token);
        const status = Number(result.SalePaymentRequestResult.Status);
        if (token > 0 && status === 0) {
            const resultObj = {
                tokenPay: token,
                urlPay: result.urlPayment
            };
            res.send(resultObj);
        } else {
            res.set({
                errMessage: toUnicode(result.SalePaymentRequestResult.Message),
                enErrMessage: 'payment Err'
            }).status(204).send();
        }
    });
});

//______________________Confirm Payment ________________//
router.post('/confirm', function (req, res) {

    logger.info('API: Payment/Confirm gateway %j', {body: req.body, userId: req.userId});

    const updatePaymentData = Object.assign(req.body, {UserID: req.userId});

    updatePayment(updatePaymentData)
        .then(upResult => {
            logger.info('API: Payment/Update CallBackUrl Resul: %j', {code: 200, Response: upResult});
        })
        .catch(e => {
            logger.error("API: Payment/Update CallBackUrl Error: %s", e);
        });

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Payment_ShowSummery";


    // create Request object
    const request = new sql.Request(pool);

    request.input('PaymentID', sql.BigInt, req.body.PaymentID);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/Select Summary Error: %s", err);

        let summaryResult = null;
        if (recordset) {
            summaryResult = recordset.recordset;
        }
        logger.info('API: Payment/Select Summary Resul: %j', {code: 200, Response: summaryResult});

        const updatePaymentData = {
            ID: req.body.ID,
            UserID: req.userId,
            BuildingID: req.body.BuildingID,
            UnitID: req.body.UnitID,
            Status: 1,
            RoleID: req.body.RoleID,
        };

        gatewayConfirmPayment(updatePaymentData, {tokenPay: req.body.tokenPay}, 'pec', (err, confirmRequestResult) => {
            if (err) {
                logger.error("API: Payment/Confirm gatewayConfirmPayment Error: %s", err);
                res.set({
                    errMessage: toUnicode(err),
                }).status(409).send();
            } else {
                const payDetail = Object.assign(confirmRequestResult.ConfirmPaymentResult, {summaryResult: summaryResult[0]});
                res.type('application/json').status(200).send(payDetail);
                logger.info('API: Payment/Confirm Resul: %j', {code: 200, Response: payDetail});
            }
        });
    });

});

//______________________Detail Payment________________//
router.get('/detail/:paymentId', function (req, res) {

    logger.info('API: Payment/detail %j', {body: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Payment_ShowSummery";


    // create Request object
    const request = new sql.Request(pool);

    request.input('PaymentID', sql.BigInt, req.params.paymentId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/detail Summary Error: %s", err);

        let summaryResult = null;
        if (recordset) {
            summaryResult = recordset.recordset;
        }
        logger.info('API: Payment/Select Summary Resul: %j', {code: 200, Response: summaryResult});
        CheckException.handler(res, summaryResult)
    });
});

//______________________Test Reverse Payment ________________//
router.post('/reverse', function (req, res) {

    logger.info('API: Payment/Test %j', {body: req.body, userId: req.userId});

    const pecConfirm = PaymentFactory.getInstance('pec').getPecPayment();

    const confirmRequest = pecConfirm.createConfirmReverseRequest(req.body.tokenPay);
    pecConfirm.requestReversePayment(confirmRequest, result => {
        console.log("%%%%%%%%%%%%%%%%%%Confirm payment requestPayment result: ", result);
        const status = Number(result.ReversalRequestResult.Status);
        if (status === 0) {
            res.send(result.ConfirmPaymentResult);
        } else {
            res.set({
                errMessage: toUnicode(result.ReversalRequestResult.Message),
                enErrMessage: 'Confirm payment Err'
            }).status(204).send();
        }
    });
});

module.exports = router;

function toUnicode(str) {
    if (str)
        return str.split('').map(function (value, index, array) {
            var temp = value.charCodeAt(0).toString(16).padStart(4, '0');
            if (temp.length > 2) {
                return '\\u' + temp;
            }
            return value;
        }).join('');
    else return '';
}

function gatewayTokenPayment(params, gatewayType, callBack) {
    logger.info('**** gatewayTokenPayment %j', {params, gatewayType});

    var paymentFactory = PaymentFactory.getInstance(gatewayType);

    const pecPayment = paymentFactory.getPecPayment();
    const payRequest = pecPayment.createPaymentRequest({
        amount: params.amount,
        orderId: params.orderId,
    });
    pecPayment.requestPayment(payRequest, (err, result) => {
        if (err) return callBack(err);
        console.log("**********  paymentInsert requestPayment result: ", result);
        return callBack(false, result);
    });
}

function gatewayMultiplexTokenPayment(updatePaymentData, params, gatewayType, callBack) {
    logger.info('**** gatewayTokenPayment %j', {params, gatewayType});

    var paymentFactory = PaymentFactory.getInstance(gatewayType);

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
    ]);
    pecPayment.requestMultiplexPayment(updatePaymentData, payRequest, (err, result) => {
        if (err) return callBack(err);
        console.log("**********  paymentInsert requestPayment result: ", result);
        return callBack(false, result);
    });
}

function gatewayConfirmPayment(updatePaymentData, params, gatewayType, callBack) {
    logger.info('**** gatewayConfirmPayment %j', {params, gatewayType});

    const pecConfirm = PaymentFactory.getInstance('pec').getPecPayment();

    const confirmRequest = pecConfirm.createConfirmReverseRequest(params.tokenPay);
    pecConfirm.requestConfirmPayment(updatePaymentData, confirmRequest, (err, result) => {
        logger.info('**** gatewayConfirmPayment result %j', result);
        if (err) return callBack(err);
        return callBack(null, result);
    });
}

router.get('/paymentDetail/:BuildingID/:UnitID.:RoleID.:AnnounceDetailID.:ViewUserID.:ViewUnitID', function (req, res) {

    logger.info('API: Payment/Select paymentDetail %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "SelectDetail";

    // create Request object
    const request = new sql.Request(pool);

    request.input('AnnounceDetailID', sql.BigInt, req.params.AnnounceDetailID);
    request.input('ViewUserID', sql.BigInt, req.params.ViewUserID);
    request.input('ViewUnitID', sql.BigInt, req.params.ViewUnitID);
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('RoleID', sql.BigInt, req.params.RoleID);
    if (req.params.UnitID && req.params.UnitID !== "null")
        request.input('UnitID', sql.BigInt, req.params.UnitID);
    request.input('UserID', sql.BigInt, req.userId);


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/paymentDetail Error: %s", err);
        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Payment/paymentDetail Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});


router.get('/calculationPaymentDetail/:CallerBuildingID/:CallerUnitID.:CallerRoleID.:PeriodDetailID.:CostClassID.:ViewUserID.:ViewUnitID', function (req, res) {

    logger.info('API: Payment/Select calculationPaymentDetail %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "CalculationSelectDetail";

    // create Request object
    const request = new sql.Request(pool);

    request.input('PeriodDetailID', sql.BigInt, req.params.PeriodDetailID);
    request.input('CostClassID', sql.BigInt, req.params.CostClassID);
    request.input('ViewUserID', sql.BigInt, req.params.ViewUserID);
    request.input('ViewUnitID', sql.BigInt, req.params.ViewUnitID);


    request.input('CallerBuildingID', sql.BigInt, req.params.CallerBuildingID);
    request.input('CallerRoleID', sql.BigInt, req.params.CallerRoleID);
    if (req.params.CallerUnitID && req.params.CallerUnitID !== "null")
        request.input('CallerUnitID', sql.BigInt, req.params.CallerUnitID);
    request.input('CallerUserID', sql.BigInt, req.userId);


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/calculationPaymentDetail Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Payment/calculationPaymentDetail Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});



router.get('/costTypeList/:BuildingID.:CostClassID', function (req, res) {
    logger.info('API: rent/costTypeList %j', {body: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "EnumCostType_Select";

    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('CostClassID', sql.BigInt,  req.params.CostClassID);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Payment/costTypeList Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Payment/costTypeList Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

