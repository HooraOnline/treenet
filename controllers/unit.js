const express = require('express')
    , router = express.Router();
const sql = require("mssql");
// dbConfig for your database

const logger = require('../utils/winstonLogger');

const config = require('config');
const dbConfig = config.get('APAMAN.dbConfig');
const serverConfig = config.get('APAMAN.serverConfig');

const CheckException = require('../utils/CheckException');

//______________________Create Unit_____________________//
router.post('/add/:Is/:RoleID.:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Unit/Create %j', {params: req.params, body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Marketing";
    const sp = "Unit_InsertOrUpdate";


    // create Request object
    const request = new sql.Request(pool);

    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);

    request.input('RoleID', sql.BigInt, req.params.RoleID);
    request.input('UnitData', sql.NVarChar(sql.MAX), JSON.stringify(req.body.UnitData));
    if (req.params.IsMyUnit === "true") {
        request.input('IsMyUnit', sql.Bit, req.params.IsMyUnit);
        request.input('FeatureData', sql.NVarChar(sql.MAX), JSON.stringify(req.body.FeatureData));
    }

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Unit/Create Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Unit/Create Result: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});

//______________________Unit Set Resident_____________________//
router.post('/resident/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Unit/Set Resident %j', {params: req.params, body: req.body, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Marketing";
    const sp = "UserUnit_InsertOrUpdate";


    // create Request object
    const request = new sql.Request(pool);

    //fields
    request.input('Data', sql.VARCHAR(1000), JSON.stringify(req.body.Data));

    //fields
    request.input('RoleID', sql.VARCHAR(1000), JSON.stringify(req.body.RoleID));

    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.BigInt, UnitID);
    }

    // request.input('UserID', sql.BigInt, 19);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Unit/Set Resident Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Unit/Set Resident Result: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});

//______________________Unit Get Resident_____________________//
router.get('/resident/:ResidentUnitID/:RoleID.:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Unit/Get Resident %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Marketing";
    const sp = "UserUnit_Select";


    // create Request object
    const request = new sql.Request(pool);

    request.input('UnitID', sql.BigInt, req.params.ResidentUnitID);

    request.input('CallerBuildingID', sql.BigInt, req.params.BuildingID);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('CallerUnitID', sql.BigInt, UnitID);
    }

    // request.input('UserID', sql.BigInt, 15);
    request.input('UserID', sql.BigInt, req.userId);
    request.input('RoleID', sql.BigInt, req.params.RoleID);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Unit/Get Resident Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Unit/Get Resident Result: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});

router.post('/', function (req, res) {

    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set')
    }
    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "Unit_InsertOrUpdate";

    // create Request object
    const request = new sql.Request(pool);
    const id = req.body.id;
    if (id) {
        // edit stage
        request.input('Id', sql.Int, id);
    }
    const isDisabled = req.body.isDisabled;
    if (isDisabled) {
        //delete stage
        request.input('IsDisabled', sql.Bit, isDisabled);
    }
    request.input('Apartment_ID', sql.Int, req.body.apartment_ID);
    request.input('UnitNumber', sql.VarChar(50), req.body.unitNumber);
    request.input('FloorNumber', sql.TinyInt, req.body.floorNumber);
    request.input('OwnerName', sql.NVarChar(200), req.body.ownerName);
    request.input('OwnerTel', sql.NVarChar(200), req.body.ownerTel);
    request.input('TenantName', sql.NVarChar(200), req.body.tenantName);
    request.input('TenantTel', sql.NVarChar(50), req.body.tenantTel);
    request.input('Area', sql.Int, req.body.area);
    request.input('ParkingCount', sql.TinyInt, req.body.parkingCount);
    request.input('ParkingNumber', sql.NVarChar(50), req.body.parkingNumber);
    request.input('Tel', sql.NVarChar(50), req.body.tel);
    request.input('NumberOfPeople', sql.TinyInt, req.body.numberOfPeople);
    request.input('IsSame', sql.Bit, req.body.isSame);
    request.input('IsEmpty', sql.Bit, req.body.isEmpty);
    request.input('OwnerPassword', sql.NVarChar(50), req.body.ownerPassword);
    request.input('OwnerSalt', sql.NVarChar(50), req.body.ownerSalt);
    request.input('TenantPassword', sql.NVarChar(50), req.body.tenantPassword);
    request.input('TenantSalt', sql.NVarChar(50), req.body.TenantSalt);
    request.input('Token', sql.UniqueIdentifier, token);
    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);

        let result = null;
        if (recordset) {
            result = recordset.recordset
        }
        // send data as a response
        res.status(200).send(result);
    });
});

//______________________Unit Select All Feature Enums_____________________//
router.get('/features', function (req, res) {

    logger.info('API: Unit/Select All Feature Enums %j', {params: req.params, token_userId: req.userId});

    //connect to your database
    //sp
    const shema = "Marketing";
    const sp = "EnumFeature_Select";

    // create Request object
    const request = new sql.Request(pool);
    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);
        let result = null;
        if (recordset) {
            result = recordset.recordset
        }
        logger.info('API: Unit/Select All Feature Enums %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________Unit Select All Feature Detail Enums_____________________//
router.get('/featureDetails/:FeatureId', function (req, res) {

    logger.info('API: Unit/Select All Feature Detail Enums %j', {params: req.params, token_userId: req.userId});

    //connect to your database
    //sp
    const shema = "Marketing";
    const sp = "EnumFeatureDetail_Select";

    // create Request object
    const request = new sql.Request(pool);
    request.input('FeatureId', sql.BigInt, req.params.FeatureId);
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);
        let result = null;
        if (recordset) {
            result = recordset.recordset
        }
        logger.info('API: Unit/Select All Feature Enums %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________Unit  Select All_____________________//
router.get('/:buildingId.:UnitID', function (req, res) {

    logger.info('API: Unit/Unit_Select_All %j', {params: req.params, token_userId: req.userId});

    //connect to your database
    //sp
    const shema = "Marketing";
    const sp = "Unit_SelectAll";

    // create Request object
    const request = new sql.Request(pool);
    // request.input('Id', sql.Int, req.body.id);
    request.input('BuildingID', sql.Int, req.params.buildingId);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        request.input('UnitID', sql.Int, UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);
        let result = null;
        if (recordset) {
            result = recordset.recordset
        }
        logger.info('API: Unit/Unit_Select_All Result %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);
    });
});

//______________________Unit  Select By Id _____________________//
router.get('/info/:IsMyUnit/:BuildingId.:UnitID/:RoleID.:CallerUnitID', function (req, res) {

    logger.info('API: Unit/Unit_SelectWithID %j', {params: req.params, token_userId: req.userId});

    //connect to your database
    //sp
    const shema = "Marketing";
    const sp = "Unit_SelectWithID";

    // create Request object
    const request = new sql.Request(pool);
    // request.input('Id', sql.Int, req.body.id);
    request.input('BuildingID', sql.BigInt, req.params.BuildingId);
    request.input('UnitID', sql.BigInt, req.params.UnitID);
    request.input('RoleID', sql.BigInt, req.params.RoleID);
    request.input('IsMyUnit', sql.Bit, req.params.IsMyUnit);

    const CallerUnitID = req.params.CallerUnitID;
    if (CallerUnitID != null && CallerUnitID !== "null") {
        request.input('CallerUnitID', sql.BigInt, CallerUnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);
    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Unit/Unit_SelectWithID Error: %s", err);
        let result = null;
        if (recordset) {
            result = recordset.recordset
        }

        // send data as a response
        // res.status(200).send(result);
        logger.info('API: Unit/Unit_SelectWithID Resul: %j', {code: 200, Response: result});
        CheckException.handler(res, result);
    });
});

//______________________unitPhoto Insert,Rmove,Update_____________________//
router.post('/photo', function (req, res) {

    logger.info('API: UnitPhoto/cud %j', {body: req.body, token_userId: req.userId});

    //connect to your database

    //sp
    const shema = "Marketing";
    const sp = "UnitPhoto_InsertOrUpdate";

    // create Request object
    const request = new sql.Request(pool);


    //fields
    const ID = req.body.ID;
    if (ID) {
        //edit stage
        request.input('ID', sql.BigInt, ID);
        const isDisabled = req.body.IsDisabled;
        if (isDisabled) {
            logger.info('API: UnitPhoto/Delete %j', {id: ID, isDisabled: isDisabled});
            //delete stage
            request.input('IsDisabled', sql.Bit, isDisabled);
        } else {
            logger.info('API: UnitPhoto/Update %j', {id: ID});
            request.input('Image', sql.NVarChar(500), req.body.Image);
            request.input('Description', sql.NVarChar(1000), req.body.Description);
        }
    } else {
        logger.info('*** API: UnitPhoto/Insert');
        request.input('Image', sql.NVarChar(500), req.body.Image);
        request.input('Description', sql.NVarChar(1000), req.body.Description);
    }

    request.input('CallerUnitID', sql.BigInt, req.body.CallerUnitID);
    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UnitID', sql.BigInt, req.body.UnitID);
    request.input('UserID', sql.BigInt, req.userId);
    request.input('RoleID', sql.BigInt, req.body.RoleID);

    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) {
            logger.error("API: UnitPhoto/cud Error: %s", err);
        } else {
            let result = null;
            if (recordset) {
                result = recordset.recordset;
            }
            logger.info('API: UnitPhoto/CRU Resul: %j', {code: 200, Response: result});
            CheckException.handler(res, result);
        }
    });
});


/*--Insert
exec Marketing.UnitPhoto_InsertOrUpdate
@BuildingID					=	9									,
    @CallerUnitID				=	NULL								,
    @ID							=	NULL								,
    @UnitID						=	1145								,
    @Image						=	'["C:/Test/jpg","C:/Test2.jpg"]'	,
    @Title						=	NULL								,
    @Description				=	NULL								,
    @IsDisabled					=	0									,
    @RoleID						=	1									,
    @UserID						=	1



--Update
exec Marketing.UnitPhoto_InsertOrUpdate
@BuildingID					=	9					,
    @CallerUnitID				=	NULL				,
    @ID							=	1					,
    @UnitID						=	1145				,
    @Image						=	'C:/Test1/jpg'		,
    @Title						=	NULL				,
    @Description				=	NULL				,
    @IsDisabled					=	0					,
    @RoleID						=	1					,
    @UserID						=	1


--Delete
exec Marketing.UnitPhoto_InsertOrUpdate
@BuildingID					=	9					,
    @CallerUnitID				=	NULL				,
    @ID							=	1					,
    @UnitID						=	NULL				,
    @Image						=	NULL				,
    @Title						=	NULL				,
    @Description				=	NULL				,
    @IsDisabled					=	1					,
    @RoleID						=	1					,
    @UserID						=	1*/

module.exports = router;
