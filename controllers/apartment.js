const express = require('express'),
    router = express.Router();
const sql = require('mssql');


const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');

router.post('/', function (req, res) {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.status(400).send('bad data');
    }

    // check header or url parameters or post parameters for token
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).send('Authorization Failed!!!!!!!');
    }

    //connect to your database

    //sp
    const shema = 'dbo';
    const sp = 'Apartment_InsertOrUpdate';

    // create Request object
    const request = new sql.Request(pool);

    //fields
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
    request.input('Name', sql.NVarChar(200), req.body.name);
    request.input('Address', sql.NVarChar(500), req.body.address);
    request.input('PostalCode', sql.NVarChar(50), req.body.postalCode);
    request.input('NumberOfFloors', sql.TinyInt, req.body.numberOfFloors);
    request.input('NumberOfUnits', sql.TinyInt, req.body.numberOfUnits);
    request.input('LobbyTel', sql.NVarChar(50), req.body.lobbyTel);
    request.input('Image', sql.NVarChar(200), req.body.image);
    request.input('Token', sql.UniqueIdentifier, token);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);
        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        // send data as a response
        res.status(200).send(result);
    });
});

router.get('/', function (req, res) {
    // check header or url parameters or post parameters for token
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).send('Authorization Failed!!!!!!!');
    }

    //connect to your database
    //sp
    const shema = 'dbo';
    const sp = 'Apartment_Select';

    // create Request object
    const request = new sql.Request(pool);

    //fields
    request.input('Token', sql.UniqueIdentifier, token);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);

        let result = null;
        if (recordset) {
            result = recordset.recordset[0];
        }
        // send data as a response
        res.status(200).send(result);
    });
});

router.get('/all', function (req, res) {
    // check header or url parameters or post parameters for token
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).send('Authorization Failed!!!!!!!');
    }

    //connect to your database

    //sp
    const shema = 'dbo';
    const sp = 'Apartment_SelectALL';

    // create Request object
    const request = new sql.Request(pool);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);

        let result = null;
        if (recordset) {
            result = recordset.recordset[0];
        }
        // send data as a response
        res.status(200).send(result);
    });
});

//______________________Lobby Insert,Rmove,Update_____________________//
router.post('/lobby', function (req, res) {

    logger.info('API: Lobby/cud %j', {body: req.body, token_userId: req.userId});
    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "BuildingLobby_Update";


    // create Request object
    const request = new sql.Request(pool);


    request.input('LobbyPhoto', sql.NVarChar(500), req.body.LobbyPhoto);
    request.input('BuildingID', sql.BigInt, req.body.BuildingID);
    request.input('UnitID', sql.BigInt, req.body.UnitID);
    request.input('UserID', sql.BigInt, req.userId);


    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Lobby Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset
        }

        logger.info('API: Lobby/cud Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});


//______________________Lobby Select_____________________//
router.get('/lobby/:BuildingID.:UnitID', function (req, res) {

    logger.info('API: Lobby/Select %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "BuildingContact_Select";


    // create Request object
    const request = new sql.Request(pool);

    const UnitID = req.params.UnitID;
    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    if (UnitID != null && UnitID != "null") {
        logger.info("*************** UnitId: %s", UnitID);
        request.input('UnitID', sql.BigInt, req.params.UnitID);
    }
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Lobby/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Lobby/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});

//______________________Members Building Select_____________________//
router.get('/members/:BuildingID', function (req, res) {

    logger.info('API: Building/Members %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Security";
    const sp = "User_SelectWithBuildingID";


    // create Request object
    const request = new sql.Request(pool);

    //fields
    request.input('BuildingID', sql.BigInt, req.params.BuildingID);
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Building/Members Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Building/Members Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});

//______________________List Document types_____________________//
router.get('/documentTypes', function (req, res) {

    logger.info('API: Apartment/GetDocumentTypes %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "Marketing";
    const sp = "UnitDocumnetType_Select";


    // create Request object
    const request = new sql.Request(pool);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Apartment/GetDocumentTypes Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Apartment/GetDocumentTypes Resul: %j', {code: 200, Response: result});
        // send data as a response
        // res.status(200).send(result);
        CheckException.handler(res, result);

    });
});
router.get('/suppliers/:BuildingID.:UnitID.:RoleID', function (req, res) {
    logger.info('API: Apartment/suppliers %j', {params: req.params, userId: req.userId});
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).send('Authorization Failed!!!!!!!');
    }

    //connect to your database

    //sp
    const shema = 'dbo';
    const sp = 'Supplier_Select';

    // create Request object
    const request = new sql.Request(pool);
    const UnitID = req.params.UnitID;
    if (UnitID != null && UnitID !== "null") {
        logger.info("*************** UnitId: %s", UnitID);
        request.input('UnitID', sql.BigInt, UnitID);
    }
    request.input('BuildingID', sql.BigInt, req.params.BuildingID); //
    request.input('UserID', sql.BigInt, req.userId);//
    request.input('RoleID', sql.BigInt, req.params.RoleID);
    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Apartment/suppliers Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Apartment/suppliers Resul: %j', {code: 200, Response: result});
        res.status(200).send(result);
    });
});

module.exports = router;
