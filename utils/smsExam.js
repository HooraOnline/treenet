const smsClient = require("./smsClient"); // Or simply `require("trez-sms-client")`, if you have installed from NPM
const client = new smsClient("horraonline", "hoora434343");

const sender   = "5000248889";
const receiver = "5000248889";
const groupId  = client.getRandomGroupId();

// ========== OTP Mobile Authentication ============
// Send a random code automatically to a mobile number
client.autoSendCode("09301234567", "Signiture Footer For Branding")
  .then((messageId) => {
    console.log("Sent Message ID: " + messageId);
  })
  .catch(error => console.log(error));

// Validate a code which was sent to a number by autoSendCode
client.checkCode("09301234567", "595783")
  .then((isValid) => {
    if (isValid) {
      console.log("Code 595783 for this number 09301234567 is valid and verified.");
    }
    else {
      console.log("Provided code for that number is not valid!");
    }
  })
  .catch(error => console.log(error));

// Send a code manually to a mobile number
client.manualSendCode("09301234567", "Verification Code: 595783")
  .then((messageId) => {
    console.log("Sent Message ID: " + messageId);
  })
  .catch(error => console.log(error));

// ======== END OTP Method Examples ===========

// Sending a message to a number or a list of numbers
client.sendMessage(sender, "0936xxxxxxx,0912xxxxxxx,0930xxxxxxx", "Hello World!", groupId)
  .then((receipt) => {
    console.log("Receipt: " + receipt);
  })
  .catch((error) => {
    // If there is an error, we'll catch that
    console.log(error.isHttpException, error.code, error.message);
  });

// Sending corresponding (batch) message to a list of recipients
// It sends a bunch of messages withing an API Call
const recipients = [
  client.createRecipientObject("11445599", "09123456789", "This is a message"), // ID, Mobile Number, Message
  client.createRecipientObject("99854710", "09301234567", "This is another message"),
];
client.sendBatchMessage(sender, recipients, groupId)
  .then((result) => {
    console.log("Result: " + result); // [{"Id":11445599,"Mobile":"09123456789","Result":2000}, {"Id":99854710,"Mobile":"09301234567","Result":2001}]
  })
  .catch((error) => {
    // If there is an error, we'll catch that
    console.log(error.isHttpException, error.code, error.message);
  });

// Getting the previously sent message status
client.messageStatus(groupId)
  .then((result) => {
    console.log(result.received, result.status, result.message, result.number);
  })
  .catch((error) => {
    // If there is an error, we'll catch that
    console.log(error.isHttpException, error.code, error.message);
  });

// Getting the previously sent batch message status
client.batchMessageStatus(["11445599", "99854710"]) // recipients' ID
  .then((result) => {
    console.log(result.received, result.status, result.message, result.number);
  })
  .catch((error) => {
    // If there is an error, we'll catch that
    console.log(error.isHttpException, error.code, error.message);
  });

// Getting the list of received messages
const from = 1557695398; // from date in timestamp
const to   = 1557868230; // till date in timestamp
const page = 1;
client.receivedMessages(receiver, from, to, page)
  .then((result) => {
    console.log(result.totalPages, result.currentPage, result.messages); // 10, 1, [{from: 09381234567, date: 1557695511, message: 'سلام'}]
  })
  .catch((error) => {
    // If there is an error, we'll catch that
    console.log(error.isHttpException, error.code, error.message);
  });

// Getting the account credit
client.accountCredit()
  .then((credit) => {
    console.log(credit + " Rials"); // 500000 Rials
  })
  .catch((error) => {
    // If there is an error, we'll catch that
    console.log(error.isHttpException, error.code, error.message);
  });

// Getting the SMS prices (Fa and En)
client.prices()
  .then((prices) => {
    console.log("Farsi: " + prices.fa + " Rials, English: " + prices.en + " Rials"); // Farsi: 129 Rials, English: 295 Rials
  })
  .catch((error) => {
    // If there is an error, we'll catch that
    console.log(error.isHttpException, error.code, error.message);
  });

// Check white numbers (those are not in the Black List will be returned)
client.checkBlackList([09123456789,09301234567,0911234567])
  .then((whiteNumbers) => {
    console.log(whiteNumbers); // [09123456789, 0911234567]
  })
  .catch((error) => {
    // If there is an error, we'll catch that
    console.log(error.isHttpException, error.code, error.message);
  });
