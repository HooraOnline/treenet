const express = require('express')
    , router = express.Router();
const sql = require("mssql");

const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');


//______________________ContactUs Insert,Remove,Update_____________________//
router.post('/', function (req, res) {

    logger.info('API: ContactUs/cud %j', {body: req.body, token_userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "BuildingContactUs_InsertOrUpdate";


    // create Request object
    const request = new sql.Request(pool);

    //fields
    const id = req.body.ID;
    if (id) {
        //edit stage
        request.input('ID', sql.BigInt, id);
        const isDisabled = req.body.isDisabled;
        if (isDisabled) {
            logger.info('API: ContactUs/Delete %j', {id: id, isDisabled: isDisabled});
            //delete stage
            request.input('IsDisabled', sql.Bit, isDisabled);
        } else {
            logger.info('API: ContactUs/Update %j', {id: id});

            request.input('TitleID', sql.BigInt, req.body.TitleID);
            request.input('TitleUserID', sql.BigInt, req.body.TitleUserID);
            request.input('Mobile', sql.NVarChar(50), req.body.Mobile);
        }
    } else {
        logger.info('*** API: ContactUs/Insert');

        request.input('TitleID', sql.BigInt, req.body.TitleID);
        request.input('TitleUserID', sql.BigInt, req.body.TitleUserID);
        request.input('Mobile', sql.NVarChar(50), req.body.Mobile);
    }

    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UnitID', sql.BigInt, req.body.UnitID);
    request.input('UserID', sql.BigInt, req.userId);


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: ContactUs Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset
        }

        logger.info('API: ContactUs/cud Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});


//______________________ContactUs Select_____________________//
router.get('/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: ContactUs/Select %j', {body: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "BuildingContactUs_Select";


    // create Request object
    const request = new sql.Request(pool);

    const UnitID = req.params.UnitID;
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    if (UnitID != null && UnitID !== "null") {
        logger.info("*************** UnitId: %s", UnitID);
        request.input('UnitID', sql.BigInt, req.params.UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: ContactUs/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: ContactUs/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);


    });
});


//______________________ContactUs Title Select_____________________//
router.get('/title', function (req, res) {

    logger.info('API: ContactUs/Title');
    //sp
    const shema = 'dbo';
    const sp = 'Title_Select';

    // create Request object
    const request = new sql.Request(pool);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: ContactUs/Title Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: ContactUs/Title Resul: %j', {code: 200, Response: result});
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});

//______________________ContactUs Delete_____________________//
router.delete('/:id.:BuildingID.:UnitID', function (req, res) {
    // check header or url parameters or post parameters for token

    logger.info('API: ContactUs/delete %j', {params: req.params, userId: req.userId});


    //connect to your database
    //sp
    const shema = 'dbo';
    const sp = 'BuildingContactUs_InsertOrUpdate';

    // create Request object
    const request = new sql.Request(pool);

    const UnitID = req.params.UnitID;

    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }

    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('ID', sql.BigInt, req.params.id);
    request.input('IsDisabled', sql.Bit, true);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);

        // send data as a response
        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: ContactUs/delete Resul: %j', {code: 200, Response: result});
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});

module.exports = router;
