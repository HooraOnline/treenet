const express = require('express')
    , router = express.Router();
const sql = require("mssql");

const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');


//______________________Cost Setting Select_____________________//
router.get('/:BuildingID', function (req, res) {

    logger.info('API: Setting_Cost/Select %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "Cost_Select";

    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Setting_Cost/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_Cost/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________Cost Setting Update_____________________//
router.put('/', function (req, res) {

    logger.info('API: Setting_Cost/Update %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "Cost_Insert";


    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('CostTypeID', sql.BigInt, req.body.CostTypeID);
    request.input('CostClassID', sql.BigInt, req.body.CostClassID);
    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);
    const UnitID = req.body.UnitID;
    if (UnitID != null && UnitID !== "null") {
        logger.info("*************** UnitId: %s", UnitID);
        request.input('UnitID', sql.BigInt, UnitID);
    }

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Setting_Cost/Update Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_Cost/Update Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________Cost Calc Insert_________________//
router.put('/calc', function (req, res) {

    logger.info('API: Setting_Cost/Calc_Insert %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "CostCalc_InsertNew";


    // create Request object
    const request = new sql.Request(pool);

    request.input('Data', sql.VarChar(1000), JSON.stringify(req.body.Data));
    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);
    const UnitID = req.body.UnitID;
    if (UnitID != null && UnitID !== "null") {
        logger.info("*************** UnitId: %s", UnitID);
        request.input('UnitID', sql.BigInt, UnitID);
    }

    request.input('CostTypeID', sql.BigInt, req.body.CostTypeID);
    request.input('CostClassID', sql.BigInt, req.body.CostClassID);
    request.input('Name', sql.NVarChar(100), req.body.Name);
    request.input('IsPeriodical', sql.Bit, req.body.IsPeriodical);
    request.input('UserRoleID', sql.BIGINT, req.body.UserRoleID);
    request.input('Description', sql.NVarChar(100), req.body.Description);


    request.input('OccupationTypeID', sql.BigInt, req.body.OccupationTypeID);
    request.input('NumberOfPeopleForEmptyUnit', sql.BigInt, req.body.NumberOfPeopleForEmptyUnit);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Setting_Cost/Calc_Insert Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_Cost/Calc_Insert Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________Cost Setting Detail Select_____________________//
router.get('/calc/:BuildingID.:CostTypeID', function (req, res) {

    logger.info('API: Setting_CostDetail/Select %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "CostCalc_Select";

    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('CostTypeID', sql.BigInt, req.params.CostTypeID);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Setting_CostDetail/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_CostDetail/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________Period Select_____________________//
router.get('/period/:BuildingID.:UnitID.:Year.:Type', function (req, res) {

    logger.info('API: Setting_Period/Select %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "Period_Select";

    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    if (req.params.Type != null && req.params.Type !== "null") {
        request.input('Type', sql.BigInt, req.params.Type);
    }
    request.input('Year', sql.BigInt, req.params.Year);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Setting_Period/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_Period/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

router.post('/period', function (req, res)  {
    logger.info('API: Setting_Period/Insert %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "Period_Insert";
    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('Data', sql.NVarChar(2000), JSON.stringify(req.body.Data));
    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);
    const UnitID = req.body.UnitID;
    if (UnitID != null && UnitID !== "null") {
        logger.info("*************** UnitId: %s", UnitID);
        request.input('UnitID', sql.BigInt, UnitID);
    }

    request.input('PenaltyPerDay', sql.Decimal(18,2), req.body.PenaltyPerDay);
    request.input('Year', sql.BigInt, req.body.Year);
    request.input('PeriodCount', sql.BigInt, req.body.PeriodCount);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Setting_Period/Insert Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_Period/Insert Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________Default charge insert of update_____________________//
router.post('/defaultCharge', function (req, res)  {
    logger.info('API: Setting_DefaultCharge/Insert %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const scheme = "Setting";
    const sp = "DefaultCharge_InsertOrUpdate";
    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('Data', sql.VarChar(1000), JSON.stringify(req.body.Data));
    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);
    const UnitID = req.body.UnitID;
    if (UnitID != null && UnitID !== "null") {
        logger.info("*************** UnitId: %s", UnitID);
        request.input('UnitID', sql.BigInt, UnitID);
    }

    // query to the database and get the data
    request.execute(`${scheme}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Setting_DefaultCharge/Insert Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_DefaultCharge/Insert Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});


//______________________Year Period Select_____________________//
router.get('/year/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Setting_Year/Select %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "Year_Select";

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
        if (err) logger.error("API: Setting_Year/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_Year/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//______________________set Fiscal Year_____________________//
router.put('/fiscalYear', function (req, res) {

    logger.info('API: Setting_FiscalYear/Select %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "BuildingYearDefault_InsertOrUpdate";

    // create Request object
    const request = new sql.Request(pool);
    //fields
    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    const UnitID = req.body.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    request.input('Year', sql.BigInt, req.body.Year);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Setting_FiscalYear/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Setting_FiscalYear/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

module.exports = router;
