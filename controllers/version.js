const express = require('express')
    , router = express.Router();

const logger = require('../utils/winstonLogger');

/*------Android Version-------*/
const ANDROID_VERSION = {
    //***********APAMAN********************
    bazzar      : 118,
    myket       : 118,
    apamanSite  : 126,

    //*******NASIM********
    nasim_bazzar      : 118,
    nasim_myket       : 118,
    nasim_site  : 118,

};
const ANDROID_LINK = {
    //********************APAMAN************************
    bazzar      : 'https://cafebazaar.ir/app/ir.monta.montaman',
    myket       : 'https://myket.ir/app/ir.monta.montaman',
    apamanSite  : 'https://www.monta.ir/apaman',


    //**********NASIM*************
    nasim_site        : 'https://www.nasimasayesh.co',
    nasim_bazzar      : 'https://cafebazaar.ir/app/ir.monta.nasim',
    nasim_myket       : 'https://myket.ir/app/ir.monta.nasim',

};

/*------IOS Version-------*/
const IOS_VERSION = {
    //for apaman
    sibApp      : 118,
    anardoni    : 118,
    iapps       : 116,
    apamanSite  : 122,
    //for nasim
    nasim_sibApp      : 118,
    nasim_anardoni    : 118,
    nasim_iapps       : 116,
    nasim_site  : 122
};
const IOS_LINK = {

    //********************APAMAN************************
    apamanSite  : 'https://www.monta.ir/apaman',
    sibApp      : 'https://sibapp.com/applications/%D8%A7%D9%BE%D8%A7%D9%85%D9%86',
    anardoni    : 'https://anardoni.com/ios/app/0WXAccz6',
    iapps       : 'https://iapps.ir/app/%D8%A7%D9%BE%D8%A7%D9%85%D9%86/7d9e298d-5adf-4e7a-9643-2285749bbfa5-1c2bae23-005c-4e1c-a497-a3cea86ae7f2',


    //**********NASIM*************
    nasim_site        : 'https://www.nasimasayesh.co',
    nasim_sibApp      : 'https://sibapp.com/applications/nasim-1',
    nasim_anardoni    : 'https://anardoni.com/ios/app/0WXAccz6',
    nasim_iapps       : 'https://iapps.ir/app/%D8%A7%D9%BE%D8%A7%D9%85%D9%86/7d9e298d-5adf-4e7a-9643-2285749bbfa5-1c2bae23-005c-4e1c-a497-a3cea86ae7f2',

};


router.get('/android/:storeName/:currentVersion', function (req, res) {
    logger.info('API: version/Android %j', {params: req.params});
    if (parseInt(req.params.currentVersion) < ANDROID_VERSION[req.params.storeName]) {
        res.set({newVersion: 1, url: ANDROID_LINK[req.params.storeName]}).send();
    } else {
        res.set({newVersion: 0}).send();
    }
});

router.get('/ios/:storeName/:currentVersion', function (req, res) {
    logger.info('API: version/IOS %j', {body: req.params});
    if (parseInt(req.params.currentVersion) < IOS_VERSION[req.params.storeName]) {
        res.set({newVersion: 1, url: IOS_LINK[req.params.storeName]}).send();
    } else {
        res.set({newVersion: 0}).send();
    }
});


module.exports = router;
