const PaymentPec = require('./PaymentPec');
const logger = require('./winstonLogger');

function PaymentFactory(gateway) {
    const factoryName = gateway;
    logger.info("************ PaymentFactory Start gateway: %s ", gateway);
    const getPecGateway = function (amount, orderId, urlResponse, callBack) {
        return PaymentPec;
    };

    const getAsanGateway = function (invoiceId, price, date, description, callBackUrl) {
        return {}
    };

    const getName = function () {
        return factoryName;
    };

    const findGateway = function (name) {
        switch (name) {
            case 'pec':
                return getPecGateway;
            case 'asanPay':
                return getAsanGateway;
            default:
                logger.info("************ Sorry, not find Gateway %s: ", name);
        }
    };

    return {
        getPecPayment: getPecGateway,//findGateway(getName()),
        getAsanPayment: getAsanGateway,
        getName: getName
    }
}

module.exports = {getInstance: PaymentFactory};