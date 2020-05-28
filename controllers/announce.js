const express = require('express')
    , router = express.Router();
const sql = require("mssql");

const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');
const PushNotification = require('../utils/PushNotification');

//______________________ Select Announcement ________________//
router.get('/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Announcement/SelectAnnouncement %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const schema = "Accounting";
    const sp = "Announce_Select";


    // create Request object
    const request = new sql.Request(pool);


    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }


    // query to the database and get the data
    request.execute(`${schema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Announcement/SelectAnnouncement Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Announcement/SelectAnnouncement Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
    });
});

//______________________ Select Announcement With Id ________________//
router.get('/:ID/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Announcement/SelectAnnouncementWithId %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "Announce_SelectWithID";


    // create Request object
    const request = new sql.Request(pool);


    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('ID', sql.BigInt, req.params.ID);
    request.input('UserID', sql.BigInt, req.userId);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Announcement/SelectAnnouncementWithId Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Announcement/SelectAnnouncementWithId Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
    });
});


//______________________ Select For Announcement - Default Charge ________________//
router.get('/forAnnouncement/defaultCharge/:PeriodDetailID.:FormID.:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Announcement/SelectForAnnouncement_DefaultCharge %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Setting";
    const sp = "DefaultCharge_SelectForAnnounce";


    // create Request object
    const request = new sql.Request(pool);


    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('PeriodDetailID', sql.BigInt, req.params.PeriodDetailID);
    request.input('UserID', sql.BigInt, req.userId);
    const FormID = req.params.FormID;
    if (FormID != null && FormID !== "null") {
        request.input('FormID', sql.BigInt, FormID);
    }
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Announcement/SelectForAnnouncement_DefaultCharge Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Announcement/SelectForAnnouncement_DefaultCharge Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
    });
});

//______________________ Select For Announcement - Calculation Header  ________________//
router.get('/forAnnouncement/calculationHeader/:CostClassID/:PeriodDetailID.:CalculationHeaderIDs.:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Announcement/SelectForAnnouncement_CalculationHeader %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Accounting";
    const sp = "CalculationHeader_SelectForAnnounce";


    // create Request object
    const request = new sql.Request(pool);


    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('CostClassID', sql.BigInt, req.params.CostClassID);
    request.input('UserID', sql.BigInt, req.userId);
    const PeriodDetailID = req.params.PeriodDetailID;
    if (PeriodDetailID != null && PeriodDetailID !== "null") {
        request.input('PeriodDetailID', sql.BigInt, PeriodDetailID);
    }
    const CalculationHeaderIDs = req.params.CalculationHeaderIDs;
    if (CalculationHeaderIDs != null && CalculationHeaderIDs !== "null") {
        request.input('CalculationHeaderIDs', sql.VarChar(500), CalculationHeaderIDs);
    }
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Announcement/SelectForAnnouncement_CalculationHeader Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Announcement/SelectForAnnouncement_CalculationHeader Result: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
    });
});

//______________________ Add Announcement ________________//
router.post('/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Announcement/AddAnnouncement %j', {params: req.params, body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const schema = "Accounting";
    const sp = "Announce";


    // create Request object
    const request = new sql.Request(pool);


    //fields

    request.input('CostClassID', sql.BigInt, req.body.CostClassID);


    request.input('Title', sql.NVARCHAR(100), req.body.Title);
    request.input('LastPayDate', sql.DATE, req.body.LastPayDate);

    const PeriodDetailID = req.body.PeriodDetailID;
    if (PeriodDetailID != null && PeriodDetailID !== "null") {
        request.input('PeriodDetailID', sql.BigInt, PeriodDetailID);
    }

    const IsDefault = req.body.IsDefault;
    if (IsDefault != null && IsDefault !== "null") {
        request.input('IsDefault', sql.Bit, IsDefault);
    }

    const CalculationHeaderIDs = req.body.CalculationHeaderIDs;
    if (CalculationHeaderIDs != null && CalculationHeaderIDs !== "null") {
        request.input('CalculationHeaderIDs', sql.VARCHAR(500), CalculationHeaderIDs);
    }

    const RecordNumber = req.body.RecordNumber;
    if (RecordNumber != null && RecordNumber !== "null") {
        request.input('RecordNumber', sql.VARCHAR(50), RecordNumber);
    }

    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }


    // query to the database and get the data
    request.execute(`${schema}.${sp}`, function (err, recordset) {
        if (err){
            logger.error("API: Announcement/AddAnnouncement Error: %s", err);
        } else{
            let result = null;
            if (recordset) {
                result = recordset.recordset;
            }
            logger.info('API: Announcement/AddAnnouncement Result: %j', {code: 200, Response: result});
            // send data as a response
            CheckException.handler(res, result);
            PushNotification.getSend();
        }
    });
});

//______________________ Add Announcement ________________//
router.post('/delete', function (req, res) {

    logger.info('API: Announcement/DeleteAnnouncement %j', {params: req.params, body: req.body, userId: req.userId});

    const schema = "Accounting";
    const sp = "Announce_Delete";
    const request = new sql.Request(pool);

    request.input('ID', sql.BigInt, req.body.ID);
    request.input('CallerBuildingID', sql.BigInt, req.body.CallerBuildingID);
    request.input('CallerRoleID', sql.BigInt, req.body.CallerRoleID);
    request.input('CallerUserID', sql.BigInt, req.userId);
    const CallerUnitID = req.body.CallerUnitID;
    if (CallerUnitID != null && CallerUnitID !== "null") {
        request.input('CallerUnitID', sql.BigInt, CallerUnitID);
    }

    request.execute(`${schema}.${sp}`, function (err, recordset) {
        if (err){
            logger.error("API: Announcement/DeleteAnnouncement Error: %s", err);
        } else{
            let result = null;
            if (recordset) {
                result = recordset.recordset;
            }
            logger.info('API: Announcement/DeleteAnnouncement Result: %j', {code: 200, Response: result});
            // send data as a response
            CheckException.handler(res, result);
        }
    });
});



module.exports = router;
