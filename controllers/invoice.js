const express = require('express'),
    router = express.Router();
const sql = require('mssql');
// dbConfig for your database

const config = require('config');
const dbConfig = config.get('APAMAN.dbConfig');
const serverConfig = config.get('APAMAN.serverConfig');

router.get('/', function (req, res) {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set');
    }

    // connect to your database
    //sp
    const shema = 'dbo';
    const sp = 'Invoice_Select';

    // create Request object
    const request = new sql.Request(pool);
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

router.get('/:id', function (req, res) {
    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set');
    }

    //connect to your database
    //sp
    const shema = 'dbo';
    const sp = 'Invoice_Select_Detail';
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

router.get('/bank/:invoiceId', function (req, res) {
    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set');
    }

    //connect to your database
    //sp
    const shema = 'dbo';
    const sp = 'Invoice_GetBankUrl';
    // create Request object
    const request = new sql.Request(pool);
    // request.input('Id', sql.Int, req.body.id);
    request.input('InvoiceID', sql.Int, req.params.invoiceId);

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
