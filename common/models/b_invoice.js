'use strict';
var app = require('../../server/server');
var ObjectId = require('mongodb').ObjectId;
module.exports = function(Model) {
  Model.disableRemoteMethod("create", true);
  Model.disableRemoteMethod("upsert", true);
  Model.disableRemoteMethod("replaceOrCreate", true);
  Model.disableRemoteMethod("upsertWithWhere", true);
  Model.disableRemoteMethod("exists", true);
  Model.disableRemoteMethod("findById", true);
  Model.disableRemoteMethod("find", true);
  Model.disableRemoteMethod("findOne", true);
  Model.disableRemoteMethod("updateAll", true);
  Model.disableRemoteMethod("deleteById", true);
  Model.disableRemoteMethod("count", true);
  Model.disableRemoteMethod("updateAttributes", true);
  Model.disableRemoteMethod("createChangeStream", true);
  Model.disableRemoteMethod("confirm", true);
  Model.disableRemoteMethod("replaceById", true);
  Model.disableRemoteMethod("login", true);
  Model.disableRemoteMethod("resetPassword", true);
  Model.disableRemoteMethod('__count__accessTokens', true);
  Model.disableRemoteMethod('__create__accessTokens', true);
  Model.disableRemoteMethod('__delete__accessTokens', true);
  Model.disableRemoteMethod('__destroyById__accessTokens', true);
  Model.disableRemoteMethod('__findById__accessTokens', true);
  Model.disableRemoteMethod('__get__accessTokens', true);
  Model.disableRemoteMethod('__updateById__accessTokens', true);

  const addUnitInvoiceCost=(invoice,costList,callback)=>{
    //ابتدا بر طبق فرمول واحدهای خالی یا پر یا همه انتخاب می شوند و سپس لیست ساکنین و مالکین جدا می شود
    const building_unit_members=[
      {id:1,buildingId:1, memberId:'5fde1c8913e5103b3c605e5c',unitId:1,role:'owner',number:2,meters:100,floor:1,empty:true},
      {id:2,buildingId:1,memberId:'5fde1c8913e5103b3c605e5c',unitId:2,role:'resident',number:3,meters:100,floor:2,empty:true},
      {id:3,buildingId:1,memberId:'60117286bfbaed4c5c160f1d',unitId:3,role:'resident',number:1,meters:100,floor:3,empty:true},
      {id:4,buildingId:1,memberId:'60117286bfbaed4c5c160f1d',unitId:4,role:'resident',number:4,meters:100,floor:4,empty:true}
    ];
    const unit_owners=[
      {id:1,buildingId:1, memberId:'5fde1c8913e5103b3c605e5c',unitId:1,role:'owner',number:2,meters:100,floor:1,empty:true},
    ];
    const unit_residents=[
      {id:2,buildingId:1,memberId:'5fde1c8913e5103b3c605e5c',unitId:2,role:'resident',number:3,meters:100,floor:2,empty:true},
      {id:3,buildingId:1,memberId:'60117286bfbaed4c5c160f1d',unitId:3,role:'resident',number:1,meters:100,floor:3,empty:true},
      {id:4,buildingId:1,memberId:'60117286bfbaed4c5c160f1d',unitId:4,role:'resident',number:4,meters:100,floor:4,empty:true}
    ];

    //هزینه های هر مالک یا ساکن طبق فرمول هر هزینه استخراج شده و لیست تشکیل می شود
    let memberInvoiceList=[];
    costList.map(cost=>{

      const heading=cost.heading;
      const amount=cost.amount;
      const buildingFloorCount=4;
      const buildingSumFloorCount=11;
      const buildingUnitCount=4;
      const buildingPeopleNumber=4;
      const buildingAllUnitMeters=400;


      const buildingId=heading.buildingId;
      const payerKey=heading.payerKey;
      const ownerFactor=heading.ownerFactor;
      const ownerUnitFactor=heading.ownerUnitFactor;
      const ownerNumberFactor=heading.ownerNumberFactor;
      const ownerMetersFactor=heading.ownerMetersFactor;
      const ownerFloorFactor=heading.ownerFloorFactor;
      const residentFactor=heading.residentFactor;
      const residentUnitFactor=heading.residentUnitFactor;
      const residentNumberFactor=heading.residentNumberFactor;
      const residentMetersFactor=heading.residentMetersFactor;
      const residentFloorFactor=heading.residentFloorFactor;

      if(residentFactor>0){
        const residentUnitShare=(amount/buildingUnitCount)*(residentUnitFactor/100);
        const residentNumberShare=(amount/buildingPeopleNumber)*(residentNumberFactor/100);
        const residentMeterShare=(amount/buildingAllUnitMeters)*(residentMetersFactor/100);
        const residentFloorShare=(amount/buildingFloorCount)*(1/buildingSumFloorCount)*(residentFloorFactor/100);
        console.log('residentUnitShare',residentUnitShare);
        console.log('residentNumberShare',residentNumberShare);
        console.log('residentMeterShare',residentMeterShare);
        console.log('residentFloorShare',residentFloorShare);

        unit_residents.map(unit_resident=>{
          const residentShare=residentUnitShare+residentNumberShare*unit_resident.number+residentMeterShare*unit_resident.meters+residentFloorShare*unit_resident.floor;
          if(residentShare>0){
            let memberInvoice=memberInvoiceList.find(item=>item.memberId===unit_resident.memberId);
            if(!memberInvoice){
              memberInvoice={
                invoiceId:invoice.id ,
                memberId:unit_resident.memberId,
                details:[],
                cdate:new Date(),
              };
              memberInvoiceList.push(memberInvoice);
            }
            memberInvoice.details.push({
              unitmemberId: unit_resident.id,
              role:'resident',
              cost:cost,
              amount:residentShare,
            });
          }

        })
      }
      console.log('ownerFactor',ownerFactor);
      console.log('ownerNumberFactor',ownerNumberFactor);
      if(ownerFactor>0){

        console.log(amount);
        const ownerUnitShare=(amount/buildingUnitCount)*(ownerUnitFactor/100);
        const ownerNumberShare=(amount/buildingPeopleNumber)*(ownerNumberFactor/100);
        const ownerMeterShare=(amount/buildingAllUnitMeters)*(ownerMetersFactor/100);
        const ownerFloorShare=(amount/buildingFloorCount)*(1/buildingSumFloorCount)*(ownerFloorFactor/100);
        unit_owners.map(unit_owner=>{
          const ownerShare=ownerUnitShare+ownerNumberShare*unit_owner.number+ownerMeterShare*unit_owner.meters+ownerFloorShare*unit_owner.floor;
          if(ownerShare>0){
            let memberInvoice=memberInvoiceList.find(item=>item.memberId===unit_owner.memberId);
            if(!memberInvoice){
              memberInvoice={
                invoiceId:invoice.id ,
                memberId:unit_owner.memberId,
                details:[],
                cdate:new Date(),
              };
              memberInvoiceList.push(memberInvoice);
            }
            memberInvoice.details.push({
              unitmemberId: unit_owner.id,
              role:'owner',
              cost:cost,
              amount:Math.round(ownerShare) ,
            });

          }

        })
      }


    })

    app.models.b_member_invoice.create(memberInvoiceList, function(err, res) {
      if(err){
        console.log(err);
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا، دوباره سعی کنید.',errorMessage:'خطا، دوباره سعی کنید.'});
      }else{
        callback(null,res);
      }
    })
  }
  Model.add =  (data, callback)=>{
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    const costList=data.costList;
    let invoic={
      id:data.id,
      buildingId: 1,
      title: data.title,
      lateFees:data.lateFees,
      deadlineDate:data.deadlineDate,
      description:data.description,
      costList:costList,
      cdate:new Date(),
      udate:new Date()
    };


    Model.updateOrCreate(invoic, function(err, res) {
      if(err){
        callback(null,{errorCode:17, lbError:err, errorKey:'خطا، دوباره سعی کنید.',errorMessage:'خطا، دوباره سعی کنید.'});
      }else{
        addUnitInvoiceCost(res,costList,callback)
      }
    })

  };

  Model.remoteMethod(
    'add',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/add',
        verb: 'POST',
      },
    }
  );

  Model.getList = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  [{
      relation: 'b_member_invoice',
      scope: {
        //fields: ['id', 'title','text',],
      }
    }]
    //params.where={buildingId:1};
    //params.order='title DESC';
    return Model.find(params)
      .then(res => {
        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در بارگذاری لیست اعلانات'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getList',
    {
      accepts: {
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        path: '/getList',
        verb: 'POST',
      },
    }
  );

  Model.removeNumber =  (data, callback)=> {
    const userId=data.userId;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }

    return Model.destroyById(data.id)
      .then(res=>{
        callback(null,res);
      })
      .catch(err=>{
        callback(null,{errorCode:17, lbError:err, errorKey:'server_public_error',errorMessage:'خطا در حذف شماره. دوباره سعی کنید.'});
        return err;
      });
  };

  Model.remoteMethod(
    'removeNumber',
    {
      accepts: [{
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      }],
      returns: {arg: 'result', type: 'object',root:true },
      http: {
        path: '/removeNumber',
        verb: 'POST',
      },
    }
  );



  Model.isWhite = function (data, callback) {
    const invitationCode=data.invitationCode ;
    let params={};
    params.where={invitationCode:invitationCode};
    params.fields=['number'];
    return Model.find(params)
      .then(res => {

        let white=res.find(item=>item.number===data.number.trim())

        if(white)
         callback(null, true);
        else
          callback(null, false);
      })
      .catch(err => {

        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا '
        });
        return err;
      });
  };
  Model.remoteMethod(
    'isWhite',
    {
      accepts: {
        arg: 'data',
        type: 'object',
        http: { source: 'body' }
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        path: '/isWhite',
        verb: 'POST',
      },
    }
  );



};


