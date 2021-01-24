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

  Model.addPaymentCommission =  (payment)=>{
    //console.log(payment);
    const sellPercent=[50,25,12.5,6.5,3,1.5,1,0.25];
    let commissionList=[];

    payment.basket.map(order=>{
      const product=order.product;
      const marketer=order.marketer;
      const productCommisstion=product.price*order.number*product.commission/100;
      const marketerCommission=productCommisstion/2;
      const parentsCommission=productCommisstion/2;
      const parrent1_commission=parentsCommission*sellPercent[1];
      const parrent2_commission=parentsCommission*sellPercent[2];
      const parrent3_commission=parentsCommission*sellPercent[3];
      const parrent4_commission=parentsCommission*sellPercent[4];
      const parrent5_commission=parentsCommission*sellPercent[5];
      const parrent6_commission=parentsCommission*sellPercent[6];
      const parrent7_commission=parentsCommission*sellPercent[7];
      const parrent8_commission=parentsCommission*sellPercent[8];

      let marketingCommission={
          paymentId:payment.id,
          marketerId: marketer.id,
          productId:order.product.id,
          buyerId:payment.buyerId,
          sellerId:order.seller.id,
          marketerProductId:order.marketerProductId,
          amount:marketerCommission,
          commissionType:'marketing',
          isClear:false,
          number:order.number,
          cdate:new Date(),
      };

      console.log(marketingCommission);
      commissionList.push(marketingCommission);


      let netWorkCommission={
        paymentId:payment.id,
        marketerId: marketer.id,
        productId:order.product.id,
        buyerId:payment.buyerId,
        sellerId:order.seller.id,
        marketerProductId:order.marketerProductId,
        //amount:marketerCommission,
        commissionType:'network',
        isClear:false,
        number:order.number,
        cdate:new Date(),
      };
      app.models.Member.findById(payment.buyerId,{fields:['parentsList']})
        .then((res)=>{

          res.parentsList.map((parentId,index)=>{
            netWorkCommission.amount=Math.round(parentsCommission*sellPercent[index]/100);
            netWorkCommission.marketerId=parentId;
            netWorkCommission.level=index+1;
            netWorkCommission.levelCommision=sellPercent[index];
            Model.create(netWorkCommission)
          })
        })
        .catch(()=>{

        })

    })

    Model.create(commissionList);
  };


  Model.getUserCommissions = function (params, callback) {
    const userId=params.userId ;
    if(!userId){
      callback(new Error('An error occurred'));
      return
    }
    params.include=  [
      {
        relation: 'payment',
        scope: {
          //fields: ['id', 'title','text',],
        }
      },
      {
        relation: 'product',
        scope: {
          //fields: ['id', 'title','text',],

        }
      },
      {
        relation: 'buyer',
        scope: {
          fields: ['id','mobile', 'fullName','userKey','storeName','profileImage'],

        }
      },
      {
        relation: 'seller',
        scope: {
          fields: ['id','mobile', 'fullName','userKey','storeName','profileImage'],

        }
      },
      {
        relation: 'marketer',
        scope: {
          fields: ['id','mobile', 'fullName','userKey','storeName','profileImage'],

        }
      }
    ]



    params.where={marketerId:userId};
    params.order='id DESC';
    return Model.find(params)
      .then(res => {

        callback(null, res);
      })
      .catch(err => {
        callback(null, {
          errorCode: 17,
          lbError: err,
          errorKey: 'server_public_error',
          errorMessage: 'خطا در بارگذاری لیست پورسانت'
        });
        return err;
      });
  };
  Model.remoteMethod(
    'getUserCommissions',
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
        path: '/getUserCommissions',
        verb: 'POST',
      },
    }
  );

};


