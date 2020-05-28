const express = require('express')
    , router = express.Router();
const sql = require("mssql");

const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');
const PushNotification = require('../utils/PushNotification');

//______________________Notic Board Insert,Rmove,Update_____________________//
router.post('/', function (req, res) {

    logger.info('API: noticBoard/cud %j', {body: req.body, token_userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "BuildingNoticeBoard_InsertOrUpdate";


    // create Request object
    const request = new sql.Request(pool);


    //fields
    const id = req.body.ID;
    if (id) {
        //edit stage
        request.input('ID', sql.BigInt, id);
        const isDisabled = req.body.isDisabled;
        if (isDisabled) {
            logger.info('API: noticBoard/Delete %j', {id: id, isDisabled: isDisabled});
            //delete stage
            request.input('IsDisabled', sql.Bit, isDisabled);
        } else {
            logger.info('API: noticBoard/Update %j', {id: id});

            request.input('Title', sql.NVarChar(200), req.body.title);
            request.input('Description', sql.NVarChar(1000), req.body.description);
            request.input('DestinationBuildingID', sql.NVarChar(500), JSON.stringify(req.body.DestinationBuildingID));
            request.input('DestinationRoleID', sql.NVarChar(500), req.body.DestinationRoleID ? JSON.stringify(req.body.DestinationRoleID) : null);
        }
    } else {
        logger.info('*** API: noticBoard/Insert');

        request.input('Title', sql.NVarChar(200), req.body.title);
        request.input('Description', sql.NVarChar(1000), req.body.description);
        request.input('DestinationBuildingID', sql.NVarChar(500), JSON.stringify(req.body.DestinationBuildingID));
        request.input('DestinationRoleID', sql.NVarChar(500), req.body.DestinationRoleID ? JSON.stringify(req.body.DestinationRoleID) : null);
    }

    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UnitID', sql.BigInt, req.body.UnitID);
    request.input('UserID', sql.BigInt, req.userId);


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: noticBoard Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset
        }

        logger.info('API: noticBoard/cud Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
        // call _get from PushNotification then send fcmMessage
        PushNotification.getSend();
    });
});


//______________________Notic Board Select_____________________//
router.get('/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: noticBoard/Select %j', {body: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "BuildingNoticeBoard_Select";


    // create Request object
    const request = new sql.Request(pool);

    const UnitID = req.params.UnitID;
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    if (UnitID != null && UnitID !== "null") {
        logger.info("*************** UnitId: %s", UnitID);
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: noticBoard/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: noticBoard/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

module.exports = router;
