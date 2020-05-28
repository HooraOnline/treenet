const express = require('express')
    , router = express.Router();

const sql = require("mssql");

const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');
const PushNotification = require('../utils/PushNotification');
//______________________Survey Insert,Rmove,Update_____________________//
router.post('/', function (req, res) {

    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        logger.error('API: Survey/cud not have Token: x-access-token not set');
        return res.status(400).send('bad data');
    }

    logger.info('API: Survey/cud %j', {body: req.body, token_userId: req.userId});

    //connect to your database

    //sp
    const shema = "dbo";
    const sp = "BuildingSurvey_InsertOrUpdate";

    // create Request object
    const request = new sql.Request(pool);


    //fields
    const ID = req.body.ID;
    if (ID) {
        //edit stage
        request.input('ID', sql.BigInt, ID);
        const isDisabled = req.body.isDisabled;
        if (isDisabled) {
            logger.info('API: Survey/Delete %j', {id: ID, isDisabled: isDisabled});
            //delete stage
            request.input('IsDisabled', sql.Bit, isDisabled);
        } else {
            logger.info('API: Survey/Update %j', {id: ID});

            request.input('Question', sql.NVarChar(1000), req.body.Question);
            // request.input('Title', sql.NVarChar(100), req.body.Title);
            request.input('QuestionType', sql.Bit, req.body.QuestionType);
            request.input('AnswerOne', sql.NVarChar(1000), req.body.AnswerOne);
            request.input('AnswerTwo', sql.NVarChar(1000), req.body.AnswerTwo);
            request.input('AnswerThree', sql.NVarChar(1000), req.body.AnswerThree);
            request.input('AnswerFour', sql.NVarChar(1000), req.body.AnswerFour);
            request.input('StartFromDate', sql.DATE, req.body.StartFromDate);
            request.input('DestinationBuildingID', sql.NVarChar(500), JSON.stringify(req.body.DestinationBuildingID));
            request.input('DestinationRoleID', sql.NVarChar(500), req.body.DestinationRoleID ? JSON.stringify(req.body.DestinationRoleID) : null);
            request.input('ViewResultDestinationRoleID', sql.NVarChar(500), req.body.ViewResultDestinationRoleID ? JSON.stringify(req.body.ViewResultDestinationRoleID) : null);
        }
    } else {
        logger.info('*** API: Survey/Insert');

        request.input('Question', sql.NVarChar(1000), req.body.Question);
        // request.input('Title', sql.NVarChar(100), req.body.Title);
        request.input('QuestionType', sql.Bit, req.body.QuestionType);
        request.input('AnswerOne', sql.NVarChar(1000), req.body.AnswerOne);
        request.input('AnswerTwo', sql.NVarChar(1000), req.body.AnswerTwo);
        request.input('AnswerThree', sql.NVarChar(1000), req.body.AnswerThree);
        request.input('AnswerFour', sql.NVarChar(1000), req.body.AnswerFour);
        request.input('StartFromDate', sql.DATE, req.body.StartFromDate);
        request.input('DestinationBuildingID', sql.NVarChar(500), JSON.stringify(req.body.DestinationBuildingID));
        request.input('DestinationRoleID', sql.NVarChar(500), req.body.DestinationRoleID ? JSON.stringify(req.body.DestinationRoleID) : null);
        request.input('ViewResultDestinationRoleID', sql.NVarChar(500), req.body.ViewResultDestinationRoleID ? JSON.stringify(req.body.ViewResultDestinationRoleID) : null);
    }

    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UnitID', sql.BigInt, req.body.UnitID);
    request.input('UserID', sql.BigInt, req.userId);
    request.input('RoleId', sql.BigInt, req.body.RoleId);
    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) {
            logger.error("API: Survey/cud Error: %s", err);
        } else {
            let result = null;
            if (recordset) {
                result = recordset.recordset;
            }
            logger.info('API: Survey/CRU Resul: %j', {code: 200, Response: result});
            // send data as a response
            CheckException.handler(res, result);
            // res.status(200).send(result);
            PushNotification.getSend();
        }
    });
});

//______________________Survey Select_____________________//
router.get('/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Survey/Select %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "BuildingSurvey_Select";

    // create Request object
    const request = new sql.Request(pool);

    const UnitID = req.params.UnitID;

    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, req.params.UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Survey/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }

        logger.info('API: Survey/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________Submit Survey_____________________//
router.post('/opinion', function (req, res) {

    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        logger.error('API: Survey/Submit **********BadData**********');
        return res.status(400).send('bad data');
    }

    logger.info('API: Survey/Submit %j', {body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "BuildingSurvey_Opinion";

    // create Request object
    const request = new sql.Request(pool);


    //fields
    const UnitID = req.body.UnitID;
    logger.info('API: Survey/Submit UnitID %s', UnitID);
    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    if (UnitID != null && UnitID !== "null") {
        logger.info('API: Survey/Submit UnitID %s', UnitID);
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('BuildingSurveyID', sql.BigInt, req.body.BuildingSurveyID);
    request.input('Answer', sql.TinyInt, req.body.Answer);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Survey/Submit Error: %s", err);
        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }

        logger.info('API: Survey/Submit Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

module.exports = router;
