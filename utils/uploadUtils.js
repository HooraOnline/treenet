const express = require('express')
    , router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// var mime = require('mime-types');

const logger = require('../utils/winstonLogger');

const config = require('config');
const fileConfig = config.get('TREENET.fileConfig');
const uploadPath = process.env.PWD + fileConfig.uploadPath;

const unit = require('../controllers/unit');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

let fileName = '';
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadPath)
    },
    filename: function (req, file, callback) {
        logger.info('API: UploadFile filename %j', {name: file.originalname});
        console.log(file);

        // Check if the file exists in the current directory.
        fs.access(uploadPath + '/' + file.originalname, fs.constants.F_OK, (err) => {
            if (err) {
                fileName = Date.now() + path.extname(file.originalname);
            } else {
                fileName = file.originalname;
            }
            console.log(fileName);
            callback(null, fileName)
        });
    }
});

/*
* UploadImage and save in SP
* type is number and equals:
* 1: profile
* 2: lobby
* 3: units
* 4: facility
* */
router.post('/', function (req, res) {
    logger.info('************* API: UploadFile %j', {body: req.body, params: req.params, token_userId: req.userId});

    const upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            const ext = path.extname(file.originalname);
            console.log(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                logger.error('API: UploadFile format Image Don`t currect');
                return callback(res.end('Only images are allowed'), null)
            }
            callback(null, true)
        }
    }).single('userFile');
    upload(req, res, function (err) {
        if (err) {
            logger.error('API: UploadFile Error uploading file. %s', err);
            return res.end("Error uploading file.");
        }
        logger.info('API: UploadFile fileName: %s', fileName);
        /*storeInDB(parseInt(req.params.type), req.body, fileName, req.userId)
            .then(result => {
                fileName = '';
                CheckException.handler(res, result);
            })
            .catch(e => null);*/
        res.send({fileName: fileName});


    })
});

async function storeInDB(type, obj, fileName, userId) {
    switch (type) {
        case 1:
            return await unit.photo(obj, userId);
        case 2:
            return;
        case 3:
            return await unit.photo(obj, fileName, userId);
        case 4:
            return;
        default:
            logger.info("!!!!!!!!!!!!!! Sorry, not find Sp equals: ", type);
    }
}

router.get('/:fileName', function (req, res) {

    logger.info('API: DownloadFile/getFile %j', {params: req.params/*, token_userId:token*/});

    const file = uploadPath + path.sep + req.params.fileName;
    const filename = path.basename(file);
    logger.info('API: DownloadFile/getFile: %j', {file: file, fileName: filename});
    // var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'inline; filename=' + filename);
    // ToDo For Show in Browser
    // res.setHeader('Content-type', mimetype);


    const filestream = fs.createReadStream(file);
    filestream.on('error', function (err) {
        logger.error('API: DownloadFile/getFile Error!!! %s', err);
        res.status(404).send();
    });
    // This will wait until we know the readable stream is actually valid before piping
    filestream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        filestream.pipe(res);
    });

});

module.exports = router;
