var crypto = require('crypto');
const excelToJson = require('convert-excel-to-json');

module.exports = {
    isXssScripts: function (model={}) {
        let inputStr = JSON.stringify(model);
        inputStr = inputStr.replace('&amp', "").replace('&amp', '').replace('&lt', '').replace('&gt', '').replace('&amp', '').replace('&amp', '').replace('&amp', '');
        return /(<([^>]+)>)/ig.test(inputStr);
    },
    cipher: function (salt) {
        let textToChars = text => text.split('').map(c => c.charCodeAt(0))
        let byteHex = n => ("0" + Number(n).toString(16)).substr(-2)
        let applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code)
        return text => text.split('')
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join('');
    },
    decipher: function (salt) {
        let textToChars = text => text.split('').map(c => c.charCodeAt(0))
        let saltChars = textToChars(salt);
        let applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code)
        return encoded => encoded.match(/.{1,2}/g)
            .map(hex => parseInt(hex, 16))
            .map(applySaltToChar)
            .map(charCode => String.fromCharCode(charCode))
            .join('')
    },
    postRestApi: function (url, data, headers) {
        return fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: headers,
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify(data),
        })
            .then(response => response.json());
    },
    callRestApi: function (url, methode, body, headers) {
        let params = {
            method: methode,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: headers,
            redirect: 'follow',
            referrer: 'no-referrer',
        };
        if (body)
            params.body = JSON.stringify(body);
        return fetch(url, params)
            .then(response => {
                if(response.status === 200){
                    return response.json();
                }else{
                    throw response;
                }

            })
            .catch(error => {
                throw  error;
            });
    },
    encrypt : function (message, method, secret, hmac) {
        //var iv = crypto.randomBytes(16).toString('hex').substr(0,16);    //use this in production
        var iv = secret.substr(0, 16);    //using this for testing purposes (to have the same encryption IV in PHP and Node encryptors)
        var encryptor = crypto.createCipheriv(method, secret, iv);
        var encrypted = new Buffer(iv).toString('base64') + encryptor.update(message, 'utf8', 'base64') + encryptor.final('base64');
        hmac.value = crypto.createHmac('md5', secret).update(encrypted).digest('hex');
        return encrypted;
    },
 decrypt: function (encrypted, method, secret, hmac) {
    if (crypto.createHmac('md5', secret).update(encrypted).digest('hex') == hmac.value) {
        var iv = new Buffer(encrypted.substr(0, 24), 'base64').toString();
        var decryptor = crypto.createDecipheriv(method, secret, iv);
        return decryptor.update(encrypted.substr(24), 'base64', 'utf8') + decryptor.final('utf8');
    }
},
    encryptWithTSValidation: function (message, method, secret, hmac) {
        var messageTS = new Date().toISOString().substr(0, 19) + message;
        return encrypt(messageTS, method, secret, hmac);
    },
    decryptWithTSValidation: function (encrypted, method, secret, hmac, intervalThreshold) {
        var decrypted = decrypt(encrypted, method, secret, hmac);
        var now = new Date();
        var year = parseInt(decrypted.substr(0, 4)), month = parseInt(decrypted.substr(5, 2)) - 1,
            day = parseInt(decrypted.substr(8, 2)), hour = parseInt(decrypted.substr(11, 2)),
            minute = parseInt(decrypted.substr(14, 2)), second = parseInt(decrypted.substr(17, 2));
        var msgDate = new Date(Date.UTC(year, month, day, hour, minute, second))
        if (Math.round((now - msgDate) / 1000) <= intervalThreshold) {
            return decrypted.substr(19);
        }
    },
    convertExceltoJson: function (path,headerFormat,columnToKey) {
        const info = excelToJson({
            sourceFile: path,
            header:headerFormat || {
                rows: 1
            },
            columnToKey: columnToKey || {
                '*': '{{columnHeader}}'
            }
        });
        //console.log(info);
        return info;
    }
};
