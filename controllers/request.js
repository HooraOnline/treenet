const express = require('express'),
    router = express.Router();
const sql = require('mssql');
// dbConfig for your database

const config = require('config');
const dbConfig = config.get('APAMAN.dbConfig');
const serverConfig = config.get('APAMAN.serverConfig');

//_______________PhoneBook Crud______________

router.post('/', function (req, res) {
    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set');
    }

    console.log('request');
    //connect to your database
    //sp
    const shema = 'dbo';
    const sp = 'Request_InsertOrUpdate';

    // create Request object
    const request = new sql.Request(pool);
    const id = req.body.id;
    if (id) {
        request.input('ID', sql.Int, id);
    }

    if (req.body.isDisabled) {
        request.input('IsDisabled', sql.Bit, req.body.isDisabled);
    }
    request.input('Apartment_ID', sql.Int, req.body.apartment_ID);
    request.input('Facility_ID', sql.Int, req.body.facility_ID);
    request.input('RequestDate', sql.Date, req.body.requestDate);
    request.input('From_Time', sql.NVarChar(5), req.body.fromTime);
    request.input('To_Time', sql.NVarChar(5), req.body.toTime);
    request.input('HasConfirmed', sql.Bit, req.body.hasConfirmed);
    request.input('Price', sql.BigInt, req.body.price);
    request.input('Description', sql.NVarChar(500), req.body.description);
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
        return res.status(400).send('x-access-token not set');
    }

    //connect to your database
    //sp
    const shema = 'dbo';
    const sp = 'Request_Select';

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

module.exports = router;
