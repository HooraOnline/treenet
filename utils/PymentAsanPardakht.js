var soap = require('soap');
const config = require('config');
const asanPardakht = config.get('TREENET.asanPardakhtConfig');

var CryptoJS = require('crypto-js');

var crypto = require('crypto'),
    // algorithm = 'AES-128-ECB',
    algorithm = 'aes-256-cbc',
    // _key = asanPardakht.EncryptionKey.split('').map(toByte),
    _key = Uint8Array.from(Buffer.from(asanPardakht.EncryptionKey)),
    // __key = Buffer.from(asanPardakht.EncryptionKey, 'base64').toString('ascii'),
    _iv = Uint8Array.from(Buffer.from(asanPardakht.EncryptionVector)),

    keyBuf = Buffer.alloc(32, asanPardakht.EncryptionKey, 'base64'),
    ivBuf = Buffer.alloc(16, asanPardakht.EncryptionVector, 'base64'),

    key = Buffer.from(asanPardakht.EncryptionKey, 'base64').toString('utf8'),
    iv = Buffer.from(asanPardakht.EncryptionVector, 'base64').toString('utf8');

// let buff = new Buffer(data, 'base64');
// let text = buff.toString('ascii');

let key1 = crypto.randomBytes(32);
const iv1 = crypto.randomBytes(16);

// function toByte(x) {return x.charCodeAt(0);}

module.exports = {

    _encrypt: (text) => {
        var key = CryptoJS.enc.Utf8.parse(Buffer.from(asanPardakht.EncryptionKey, 'base64').toString('utf8', 0, 32));
        var iv = CryptoJS.enc.Utf8.parse(Buffer.from(asanPardakht.EncryptionVector, 'base64').toString('utf8', 0, 16));
        // var pw = CryptoJS.enc.Utf8.parse('mydepositapppassword');
        console.log("************encrypt key: ", Buffer.from(asanPardakht.EncryptionKey, 'base64').toString('utf8', 0, 32));
        console.log("************encrypt iv: ", iv);
        var encrypted = CryptoJS.AES.encrypt(text, key,

            {
                keySize: 256 / 32,
                iv: iv,//Buffer.from(asanPardakht.EncryptionVector, 'base64').toString('utf8',0,16),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

        var encryptedString = encrypted.toString();
        console.log("************encrypt encryptedString: ", encryptedString);
        return encryptedString;
    },

    encrypt: (text) => {
        // var buf = new Buffer(cryptoStr, 'base64');
        // var iv = buf.toString('binary', 0, 16);
        // var crypt = buf.toString('base64', 16);
        // asanPardakht.EncryptionVector.toString('hex').slice(0, 16) // ascii


        // let ivBuffer = Buffer.alloc(0);

        // var iv = new Buffer(crypto.randomBytes(16));
        // var ivstring = iv.toString().slice(0, 16);
        // var ivstring = iv.toString('hex');
        // var str = "سلام ي s^l^M m^n k@b^m:b&";
        //
        // const  str2B64 = Buffer.from(str, 'utf8').toString('base64');
        // console.log("************encrypt str2B64: ", str2B64);
        // const b642Str = Buffer.from(str2B64, 'base64').toString('utf8');
        // console.log("************encrypt b642Str: ", b642Str);


        console.log("************encrypt _key: ", _key);
        // console.log("************encrypt __key: ", __key);
        console.log("************encrypt key: ", keyBuf);
        console.log("************encrypt _iv: ", _iv);
        console.log("************encrypt iv: ", ivBuf);
        var cipher = crypto.createCipheriv(algorithm, keyBuf.toString('utf8'), ivBuf.toString('utf8').slice(0, 16));
        // cipher.setAutoPadding(true);
        cipher.update(text, 'utf8', 'base64');
        return cipher.final('base64');
    },

    decrypt: (text) => {
        var decipher = crypto.createDecipheriv(algorithm, asanPardakht.EncryptionKey, asanPardakht.EncryptionVector);
        var dec = decipher.update(text, 'base64', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    },

    createRequest: (codyType = 1,   //Buy is 1
                    invoiceId,      //uniq & number
                    price,          // Rial
                    date,           //format: ‫‪YYYYMMDD‬‬ ‫‪HHMMSS‬‬ (‫‪GetPaymentServerTime‬‬)
                    description,    // length 100
                    callBackUrl,    //can null if init
                    payId = 0,      //if null set 0
    ) => {
        var serverDate = '';


        return codyType + ',' +  // P1
            asanPardakht.USERNAME + ',' +  // P2
            asanPardakht.PASSWORD + ',' +  // P3
            invoiceId + ',' +  // P4
            price + ',' +  // P5
            serverDate + ',' +  // P6
            description + ',' +  // P7
            callBackUrl + ',' +  // P8
            payId                            // P9
    },
    requestOperation: (encryptedRequest, callBack) => {
        const args = {merchantConfigurationID: asanPardakht.MERCHANT_CONFIG_ID, encryptedRequest: encryptedRequest};
        soap.createClient(asanPardakht.URL_SERVICE, function (err, client) {
            if (err) console.error("************createClient ERR: ", err);
            else {
                client.RequestOperation(args, function (err, response) {
                    if (err) console.error("************RequestOperation ERR: ", err);
                    else {
                        console.log("************RequestOperation response: ", response);
                        return callBack(response)
                    }
                });
            }
        });
    }
};