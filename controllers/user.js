const express = require('express')
    , router = express.Router();
const sql = require("mssql");

const logger = require('../utils/winstonLogger');

const crypto = require('crypto');
const jwtRun = require('../utils/jwtRun');

const CheckException = require('../utils/CheckException');


//______________________USER_LOGIN_____________________
router.post('/login', function (req, res) {

    let passBinBuff = null;
    if (req.body.password) {
        const password = crypto.createHash('sha256').update(req.body.password).digest('hex');
        passBinBuff = Buffer.from(password, 'hex');
    }


    logger.info('API: user/login %j', {body: req.body, password: passBinBuff});

    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        logger.error('API: user/login %j', {message: 'bad data', response: 400});
        return res.status(400).send('bad data');
    }

    //sp
    const shema = "Security";
    const sp = "Users_Authenticate";

    // create Request object
    const request = new sql.Request(pool);
    request.input('Mobile', sql.NVarChar(50), req.body.username);
    request.input('Password', sql.Binary(32), passBinBuff);
    request.input('DeviceID', sql.VarChar(100), req.body.DeviceID);
    request.input('HasAuthenticated', sql.BIT, req.body.HasAuthenticated);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) {
            logger.error("API: user/login DB Error: %s", err);
            CheckException.handler(res, [{dbErr: err}])
        } else {
            if (recordset && recordset.recordset[0].ResultCode == 1) {
                let result = null;
                if (recordset) {
                    result = recordset.recordset
                }
                const token = jwtRun.sign({userId: result[0].UserID});
                const responseObject = {token: token, data: result};
                // send data as a response
                logger.info('API: user/login Resul: %j', {code: 200, Response: responseObject});

                const message = CheckException.getErrMessage(recordset.recordset[0].ResultCode)
                // res.setHeader('Content-Type', 'application/json');
                // CheckException.handler(res, responseObject);
                res.set({
                    errCode: recordset.recordset[0].ResultCode,
                    errMessage: message,
                }).type('application/json').status(200).send(responseObject);
            } else {
                CheckException.handler(res, recordset.recordset);
            }
        }
    });
});

//______________________USER_PushToken_____________________
router.post('/pushToken', function (req, res) {

    logger.info('API: user/pushToken %j', {body: req.body, userId: req.userId});


    //sp
    const shema = "Security";
    const sp = "Users_PushUpdate";

    // create Request object
    const request = new sql.Request(pool);
    request.input('PushID', sql.VarChar(250), req.body.PushID);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) {
            logger.error("API: user/pushToken Error: %s", err);
            CheckException.handler(res, [{dbErr: err}])
        } else {
            let result = null;
            if (recordset) {
                result = recordset.recordset;
            }
            logger.info('API: User/pushToken Resul: %j', {code: 200, Response: result});
            CheckException.handler(res, result);
        }
    });
});

//______________________Select user Balance________________//
router.get('/balance/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: User/Select Balance %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Security";
    const sp = "User_SelectBalance";


    // create Request object
    const request = new sql.Request(pool);

    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);

    if (req.params.UnitID && req.params.UnitID !== "null") {
        request.input('UnitID', sql.BigInt, req.params.UnitID);
    }

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: User/Select Balance Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: User/Select Balance Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________find User________________//
router.get('/search/:BuildingID/:Mobile.:Name.:UnitNumber', function (req, res) {

    logger.info('API: User/Search %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Security";
    const sp = "User_Search";


    // create Request object
    const request = new sql.Request(pool);

    if (req.params.Mobile && req.params.Mobile !== "null")
        request.input('Mobile', sql.NVarChar(50), req.params.Mobile);
    if (req.params.Name && req.params.Name !== "null")
        request.input('Name', sql.NVarChar(200), req.params.Name);
    if (req.params.UnitNumber && req.params.UnitNumber !== "null")
        request.input('UnitNumber', sql.NVarChar(50), req.params.UnitNumber);

    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: User/Search Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: User/Search Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________USER_CHANGE_PROFILE_____________________
router.post('/changeProfile/:BuildingID.:UnitID', function (req, res) {
    logger.info('API: user/changeProfile %j', {body: req.body});

    //sp
    const schema = "Security";
    const sp = "User_ChangeProfile";

    // create Request object
    const request = new sql.Request(pool);
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    request.input('Sex', sql.Bit, req.body.sex);
    request.input('NationalCode', sql.Char(10), req.body.nationalCode);
    request.input('BirthDate', sql.DATE, req.body.birthDate);

    // query to the database and get the data
    request.execute(`${schema}.${sp}`, function (err, recordset) {
        //ToDo please don`t forgot logger => if (err)  logger.error("API: user/changeProfile Error: %s", err);
        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: user/changeProfile result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
    });
});

//______________________USER_CHANGE_PASSWORD_____________________
router.post('/changePassword/:BuildingID.:UnitID', function (req, res) {
    logger.info('API: user/changePassword %j', {body: req.body});


    // const oldPassword = crypto.createHash('sha256').update(req.body.oldPassword).digest('hex');
    // let oldPassBinBuff = Buffer.from(oldPassword, 'hex');

    const newPassword = crypto.createHash('sha256').update(req.body.newPassword).digest('hex');
    let newPassBinBuff = Buffer.from(newPassword, 'hex');

    //sp
    const schema = "Security";
    const sp = "User_ChangePassword";

    // create Request object
    const request = new sql.Request(pool);
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    request.input('CreatedBy', sql.BigInt, req.userId);
    // request.input('OldPassword', sql.Binary(32), oldPassBinBuff);
    request.input('NewPassword', sql.Binary(32), newPassBinBuff);

    // query to the database and get the data
    request.execute(`${schema}.${sp}`, function (err, recordset) {
        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: user/changePassword result: %j', {code: result[0].ResultCode, Response: result[0].ResultText});
        // send data as a response
        CheckException.handler(res, result);
    });
});

//______________________USER_CHANGE_AVATAR_____________________
router.post('/changePhoto/:BuildingID.:UnitID', function (req, res) {
    logger.info('API: user/changePhoto %j', {body: req.body});

    //sp
    const schema = "Security";
    const sp = "User_ChangePhoto";

    // create Request object
    const request = new sql.Request(pool);

    const IsDisabled = req.body.IsDisabled;
    if (IsDisabled) {
        logger.info('API: user/changePhoto Delete');
        request.input('IsDisabled', sql.Bit, IsDisabled);
    }

    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    request.input('Image', sql.NVarChar(1000), req.body.Image);

    // query to the database and get the data
    request.execute(`${schema}.${sp}`, function (err, recordset) {
        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: user/changePhoto result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
    });
});

//______________________USER_INFO_____________________//
router.get('/info', function (req, res) {
    logger.info('API: user/info %j', {token: req.headers['x-access-token']});

    //sp
    const shema = "Security";
    const sp = "Users_ReturnInformation";

    // create Request object
    const request = new sql.Request(pool);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error(err);

        let result = null;
        if (recordset) {
            result = recordset.recordset
        }

        logger.info('API: user/role %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

router.get('/Title', function (req, res) {

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "Title_Select";

    // create Request object
    const request = new sql.Request(pool);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);

        let result = null;
        if (recordset) {
            result = recordset.recordset
        }
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________Role Select_____________________//
router.get('/role', function (req, res) {

    logger.info('API: user/Role Select userId %s', req.userId);
    //sp
    const shema = "Security";
    const sp = "Role_Select";

    // create Request object
    const request = new sql.Request(pool);
    // request.input('UserID', sql.BigInt, token);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: user/role Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset[0]
        }

        // send data as a response
        logger.info('API: user/Role Resul: %j', {code: 200, Response: result});
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________First User Balance Select_____________________//
router.get('/firstUserBalance/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: First_User_Balance/Select %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "FirstUserBalance_Select";

    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: First_User_Balance/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: First_User_Balance/Select Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});
router.get('/firstUserBalanceNew/:BuildingID.:UnitID.:RoleID', function (req, res) {
    logger.info('API: First_User_Balance/Select %j', {params: req.params, userId: req.userId});
    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "FirstUserBalance_SelectNew";
    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    const RoleID = req.params.RoleID;
    request.input('RoleID', sql.BigInt, RoleID);
    // const RowsCount = req.params.RowsCount || 10;
    // const Offset = req.params.Offset || 0;
    // request.input('RowsCount', sql.BigInt, RowsCount);
    // request.input('Offset', sql.BigInt, Offset);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: First_User_Balance/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: First_User_Balance/Select Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________Search User By Mobile Number_____________________//
router.get('/searchByMobile/:MobileNumber', function (req, res) {

    logger.info('API: Search user by mobile number %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Security";
    const sp = "User_Search";

    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('Mobile', sql.NVARCHAR(50), req.params.MobileNumber);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Search user by mobile number Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Search user by mobile number Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________First User Balance Insert Or Update_____________________//
router.post('/firstUserBalance/:BuildingID.:UnitID.:RoleID', function (req, res)  {
    logger.info('API: FirstUserBalance/Insert %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const scheme = "Accounting";
    const sp = "FirstUserBalance_InsertOrUpdate";
    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('Datas', sql.VarChar(1000), JSON.stringify(req.body.Data));
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('RoleID', sql.BigInt, req.params.RoleID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    request.input('LastPayDate', sql.DATE, req.body.LastPayDate);

    // query to the database and get the data
    request.execute(`${scheme}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: FirstUserBalance/Insert Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: FirstUserBalance/Insert Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________Create User_____________________//
router.post('/:BuildingID.:UnitID', function (req, res)  {
    logger.info('API: Create user %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const scheme = "Security";
    const sp = "Users_InsertOrUpdate";
    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('Name', sql.NVARCHAR(200), req.body.Name);
    request.input('Mobile', sql.NVARCHAR(50), req.body.Mobile);
    // request.input('Password', sql.BINARY(32), '12345678');

    const Sex = req.body.Sex;
    if (Sex != null && Sex !== "null") {
        request.input('Sex', sql.Bit, req.body.Sex);
    }

    const NationalCode = req.body.NationalCode;
    if (NationalCode != null && NationalCode !== "null") {
        request.input('NationalCode', sql.CHAR(10), req.body.NationalCode);
    }

    const BirthDate = req.body.BirthDate;
    if (BirthDate != null && BirthDate !== "null") {
        request.input('BirthDate', sql.DATE, req.body.BirthDate);
    }

    request.input('RoleID', sql.BigInt, req.body.RoleID);

    request.input('UserID', sql.BigInt, req.userId);

    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }

    // query to the database and get the data
    request.execute(`${scheme}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Create user Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Create user Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

router.get('/biuldingOrUserBankAccount/:BuildingID.:UserID', function (req, res) {

    logger.info('API: User/Select selectAccountWithUserID %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Security";
    const sp = "UserAccount_SelectWithUserID";

    // create Request object
    const request = new sql.Request(pool);

    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    if (req.params.UserID && req.params.UserID !== "null") {
        request.input('UserID', sql.BigInt, req.params.UserID);
    }

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: User/selectAccountWithUserID Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: User/selectAccountWithUserID Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

module.exports = router;
