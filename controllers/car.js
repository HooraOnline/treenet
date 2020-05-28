const express = require('express')
    , router = express.Router();
const sql = require("mssql");

const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');

//______________________Car Insert,Rmove,Update_____________________//
router.post('/', function (req, res) {

    logger.info('API: car/cud %j', {body: req.body, token_userId: req.userId});

    //connect to your database
    //sp
    const shema = "car";
    const sp = "UnitCar_InsertOrUpdate";


    // create Request object
    const request = new sql.Request(pool);


    //fields
    const id = req.body.ID;
    if (id) {
        //edit stage
        request.input('ID', sql.BigInt, id);
        const isDisabled = req.body.isDisabled;
        if (isDisabled) {
            logger.info('API: car/Delete %j', {id: id, isDisabled: isDisabled});
            //delete stage
            request.input('IsDisabled', sql.Bit, isDisabled);
        } else {
            logger.info('API: car/Update %j', {id: id});
            request.input('BrandID', sql.BigInt, req.body.BrandID);
            request.input('ModelID', sql.BigInt, req.body.ModelID);
            request.input('ColorID', sql.BigInt, req.body.ColorID);
            request.input('TagOne', sql.Char(2), req.body.TagOne);
            request.input('TagCharacter', sql.NVarChar(50), req.body.TagCharacter);
            request.input('TagTwo', sql.Char(3), req.body.TagTwo);
            request.input('TagIran',sql.Char(2), req.body.TagIran);
        }
    } else {
        logger.info('*** API: car/Insert');
        request.input('BrandID', sql.BigInt, req.body.BrandID);
        request.input('ModelID', sql.BigInt, req.body.ModelID);
        request.input('ColorID', sql.BigInt, req.body.ColorID);
        request.input('TagOne', sql.Char(2), req.body.TagOne);
        request.input('TagCharacter', sql.NVarChar(50), req.body.TagCharacter);
        request.input('TagTwo', sql.Char(3), req.body.TagTwo);
        request.input('TagIran',sql.Char(2), req.body.TagIran);
    }

    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UnitID', sql.BigInt, req.body.UnitID);
    request.input('UserID', sql.BigInt, req.userId);
    request.input('RoleID', sql.BigInt, req.body.RoleID);
    request.input('CreatedUnitID', sql.BigInt, req.body.CreatedUnitID);


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: car Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset
        }

        logger.info('API: car/cud Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});


//______________________Car Select_____________________//
router.get('/:BuildingID.:UnitID.:RoleID.:CallerUnitID.:AllCar', function (req, res) {

    logger.info('API: car/Select %j', {body: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "car";
    const sp = "UnitCar_Select";


    // create Request object
    const request = new sql.Request(pool);

    const UnitID = req.params.UnitID;
    const RoleID = req.params.RoleID;
    const AllCar = req.params.AllCar;
    const CallerUnitID = req.params.CallerUnitID;

    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);

    if (AllCar != null && AllCar !== "null") {
        request.input('AllCar', sql.Bit, AllCar);

    }
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    if (CallerUnitID != null && CallerUnitID !== "null") {
        request.input('CallerUnitID', sql.BigInt, CallerUnitID);
    }
    if (RoleID != null && RoleID !== "null") {
        logger.info("*************** RoleID: %s", RoleID);
        request.input('RoleID', sql.BigInt, RoleID);
    }

    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: car/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: car/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________car color Select_____________________//
router.get('/colorList', function (req, res) {

    logger.info('API: colorList/Select %j', {body: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "car";
    const sp = "EnumColor_Select";

    // create Request object
    const request = new sql.Request(pool);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: colorList/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: colorList/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________car tagCharacter Select_____________________//
router.get('/tagCharacterList', function (req, res) {

    logger.info('API: tagCharacterList/Select %j', {userId: req.userId});

    //connect to your database
    //sp
    const shema = "car";
    const sp = "EnumTagCharacter_Select";

    // create Request object
    const request = new sql.Request(pool);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: tagCharacterList/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: tagCharacterList/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});
//______________________car brand Select_____________________//
router.get('/brandList', function (req, res) {

    logger.info('API: brandList/Select %j', {userId: req.userId});

    //connect to your database
    //sp
    const shema = "car";
    const sp = "EnumBrand_Select";

    // create Request object
    const request = new sql.Request(pool);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: brandList/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: brandList/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________car model Select_____________________//
router.get('/modelList/:BrandID', function (req, res) {

    logger.info('API: modelList/Select %j', {body: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "car";
    const sp = "EnumModel_Select";

    // create Request object
    const request = new sql.Request(pool);
    const BrandID = req.params.BrandID;
    //fields
    request.input('BrandID', sql.BigInt, req.params.BrandID ? req.params.BrandID : null);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: modelList/Select Error: %s", err);
        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: modelList/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});



module.exports = router;
