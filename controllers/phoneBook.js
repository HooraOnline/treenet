const express = require('express')
    , router = express.Router();
const sql = require("mssql");
// dbConfig for your database

const config = require('config');
const dbConfig = config.get('APAMAN.dbConfig');
const serverConfig = config.get('APAMAN.serverConfig');

//_______________PhoneBook Crud______________//

router.post('/', function (req, res) {

    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set')
    }

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "PhoneBook_InsertOrUpdate";

    // create Request object
    const request = new sql.Request(pool);
    const id = req.body.id;
    if (id) {
        // edit stage
        request.input('Id', sql.Int, id);
    }
    request.input('Apartment_ID', sql.Int, req.body.apartment_ID);
    request.input('Name', sql.NVarChar(200), req.body.name);
    request.input('Address', sql.NVarChar(500), req.body.address);
    request.input('Tel', sql.NVarChar(50), req.body.tel);
    request.input('Lat', sql.VarChar(50), req.body.lat);
    request.input('Lng', sql.VarChar(50), req.body.lng);
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

router.get('/:apartment_ID', function (req, res) {

    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set')
    }

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "PhoneBook_Select";
    // create Request object
    const request = new sql.Request(pool);
    // request.input('Id', sql.Int, req.body.id);
    request.input('Apartment_ID', sql.Int, req.params.apartment_ID);
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


router.delete('/:id', function (req, res) {

    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set')
    }

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "PhoneBook_Delete";

    // create Request object
    const request = new sql.Request(pool);

    // request.input('Id', sql.Int, req.body.id);
    request.input('ID', sql.Int, req.params.id);
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

module.exports = router;
