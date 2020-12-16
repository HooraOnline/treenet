const config = require('config');
const fcmConfig = config.get('TREENET.fcmConfig');

var http = require("http");

const sql = require("mssql");
const logger = require('./winstonLogger');

var admin = require("firebase-admin");

module.exports = {
    getSend: async () => {
        logger.info('get All Push Notification from DB');
        //connect to your database
        //sp
        const shema = "dbo";
        const sp = "PushNotification_Select";

        // create Request object
        const request = new sql.Request(pool);
        // query to the database and get the data
        request.execute(`${shema}.${sp}`, function (err, recordset) {
            if (err) logger.error("Error get All Push Notification: ", err);

            let result = [];
            if (recordset) {
                result = recordset.recordset;
            }
            logger.info('get All Push Notification Resul: %j', {Response: result});
            const messages = [];
            result.map(o => {
                if (o.PushID)
                    messages.push({notification: {title: o.Title, body: o.Text}, token: o.PushID});
            });
            _sendAll(messages);
        });
    },
    sendMulti: async (title, text, tokens) => _sendMulti(title, text, tokens)
};

/*
* send Multiple message to Multiple users
* */
async function _sendAll(messages) {
    logger.info('_sendAll Start Push Notification prams: %j', messages);
    try {
        admin.messaging().sendAll(messages)
            .then((response) => {
                logger.info('_sendAll All Push Notification on end %j', {response: response});
                console.log(response.successCount + ' messages were sent successfully');
            })
            .catch((error) => {
                logger.error('!!!!!!!! _sendAll Error PushNotification message catch:', error);
            });
    } catch (e) {
        logger.error('!!!!!!!! _sendAll Error catch e:', e);
    }
}

/*
* Send one Message to Multiple User
* */
function _sendMulti(title, text, registrationTokens) {
    const multiMessage = {
        notification: {
            title: title,
            body: text,
            // "image": string
        },
        tokens: registrationTokens,
    };
    admin.messaging().sendMulticast(multiMessage)
        .then((response) => {
            logger.info('_sendMulti Push Notification on end %j', {response: response});
            if (response.failureCount > 0) {
                logger.info('_sendMulti Push Notification FailureCount %s', response.failureCount);
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(registrationTokens[idx]);
                    }
                });
                console.log('List of tokens that caused failures: ' + failedTokens);
                return {successCount: response.multiMessage,failureCount: response.failureCount}
            }
        })
        .catch((error) => {
            logger.error('!!!!!!!! Error sending PushNotification message catch:', error);
        });
}

/*
* send one message to one user
* */
function _send(title, text, registrationToken) {
    logger.info('_send Start Push Notification pram: %j', {
        title: title,
        text: text,
        pushID: registrationToken
    });

    if (registrationToken) {
        try {
            const message = {
                notification: {
                    title: title,
                    body: text,
                    // "image": string
                },
                token: registrationToken,
            };
            admin.messaging().send(message)
                .then((response) => {
                    logger.info('_send Push Notification on end %j', {response: response});
                })
                .catch((error) => {
                    logger.error('!!!!!!!! Error sending PushNotification message catch:', error);
                })
        } catch (e) {
            logger.error('!!!!!!!! _send(queue) Error catch e:', e);
        }
    }
}
