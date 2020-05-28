const express = require('express')
    , router = express.Router();
const sql = require("mssql");

const logger = require('../utils/winstonLogger');
const CheckException = require('../utils/CheckException');


router.get('/', function (req, res) {

    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(400).send('x-access-token not set')
    }

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "Notification_Select";

    // create Request object
    const request = new sql.Request(pool);

    //fields
    request.input('Token', sql.UniqueIdentifier, token);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) console.log(err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }

        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//_____________________Get Last list Push notification_____________________//
router.get('/getAll', function (req, res) {

    logger.info('API: Push_Notification/Select %j', {params: req.params, userId: req.userId});

    //connect to your database
    //sp
    const shema = "dbo";
    const sp = "PushNotification_Select";

    // create Request object
    const request = new sql.Request(pool);

    //fields
    request.input('UserID', sql.BigInt, req.userId);

    // query to the database and get the data
    request.execute(`${shema}.${sp}`, function (err, recordset) {
        if (err) logger.error("API: Push_Notification/Select Error: %s", err);

        let result = null;
        if (recordset) {
            result = recordset.recordset;
        }
        logger.info('API: Push_Notification/Select Resul: %j', {code: 200, Response: result});
        // send data as a response
        CheckException.handler(res, result);
        // res.status(200).send(result);
    });
});

//PushNotification_Select

module.exports = router;

