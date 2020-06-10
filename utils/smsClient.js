class smsClient {

  constructor(username, password)
  {
    const rp = require('request-promise');
    const soap = require('soap');
    let buffer = new Buffer(username + ":" + password);

    this.rp = rp;
    this.soap = soap;
    this.username = username;
    this.password = password;
    this.auth = "Basic " + buffer.toString("base64");
    this.baseUrl = "https://smspanel.trez.ir/api/smsAPI";
    this.soapUrl = "http://smspanel.trez.ir/FastSend.asmx?wsdl";
  }

  autoSendCode(number, footer)
  {
    let $this = this;
    const args = {
      ReciptionNumber: number,
      Footer: footer
    };

    return new Promise((resolve, reject) => {
      $this
        .toSoap("AutoSendCode", args)
        .then((result) => {
          resolve(result.AutoSendCodeResult);
        })
        .catch((error) => {
          reject(error);
        })
    });
  }

  manualSendCode(number, textWithCode)
  {
    let $this = this;
    const args = {
      ReciptionNumber: number,
      Code: textWithCode
    };


    return new Promise((resolve, reject) => {
      $this
        .toSoap("SendMessageWithCode", args)
        .then((result) => {
          resolve(result.SendMessageWithCodeResult);
        })
        .catch((error) => {
          reject(error);
        })
    });
  }

  checkCode(number, userCode)
  {
    let $this = this;
    const args = {
      Username: this.username,
      Password: this.password,
      ReciptionNumber: number,
      Code: userCode
    };


    return new Promise((resolve, reject) => {
      $this
        .toSoap("CheckSendCode", args)
        .then((result) => {
          resolve(result.CheckSendCodeResult == "true");
        })
        .catch((error) => {
          reject(error);
        })
    });
  }

  sendMessage(sender, numbers, message, groupId, time)
  {
    let $this = this;
    time = time || this.getCurrentTimestamp();

    if (!Array.isArray(numbers) && typeof numbers == "string") {
      numbers = numbers.split(",");
    }

    const data = {
      "PhoneNumber": sender,
      "Message": message,
      "Mobiles": numbers,
      "UserGroupId": groupId,
      "SendDateInTimeStamp": time
    };

    return new Promise((resolve, reject) => {
      $this
        .to("SendMessage", data)
        .then((response) => {
          if (response.Code == 0) {
            resolve(response.Result);
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }

  sendBatchMessage(sender, numbersMessage, groupId)
  {
    let $this = this;

    if (!Array.isArray(numbersMessage)) {
      numbersMessage = [numbersMessage];
    }

    const data = {
      "PhoneNumber": sender,
      "numbersMessage": numbersMessage,
      "UserGroupId": groupId
    };

    return new Promise((resolve, reject) => {
      $this
        .to("SendCorrespondingMessage", data)
        .then((response) => {
          if (response.Code == 0) {
            resolve(response.Result);
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }

  sendBatchMessageToPort(sender, recievePort, sendPort, numbersMessage, groupId)
  {
    let $this = this;

    if (!Array.isArray(numbersMessage)) {
      numbersMessage = [numbersMessage];
    }

    const data = {
      "PhoneNumber": sender,
      "recievePortNumber": recievePort,
      "sendPortNumber": sendPort,
      "numbersMessage": numbersMessage,
      "UserGroupId": groupId
    };

    return new Promise((resolve, reject) => {
      $this
        .to("SendMessageToPort", data)
        .then((response) => {
          if (response.Code == 0) {
            resolve(response.Result);
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }


  messageStatus(groupId)
  {
    let $this = this;
    const data = {
      "GroupMessageId": groupId,
    };

    return new Promise((resolve, reject) => {
      $this
        .to("GroupMessageStatus", data)
        .then((response) => {
          if (response.Code == 0) {
            let resolveResult = [];
            const iterateMessagesList = response.Result.MessagesListState;
            for (let ptr in iterateMessagesList) {
              resolveResult.push({
                recieved: (iterateMessagesList[ptr].Status == 1),
                status: iterateMessagesList[ptr].Status,
                message: $this.getMessageStatus(iterateMessagesList[ptr].Status),
                number: iterateMessagesList[ptr].Mobile,
              });
            }
            resolve(resolveResult);
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }


  batchMessageStatus(messageIds)
  {
    let $this = this;

    if (!Array.isArray(messageIds)) {
      messageIds = [messageIds];
    }

    const data = {
      "messageId": messageIds,
    };

    return new Promise((resolve, reject) => {
      $this
        .to("CorrespondingMessageStatus", data)
        .then((response) => {
          if (response.Code == 0) {
            let resolveResult = [];
            const iterateMessagesList = response.Result;
            for (let ptr in iterateMessagesList) {
              resolveResult.push({
                id: iterateMessagesList[ptr].MsgId,
                recieved: (iterateMessagesList[ptr].Status == 1),
                status: iterateMessagesList[ptr].Status,
                message: $this.getMessageStatus(iterateMessagesList[ptr].Status)
              });
            }
            resolve(resolveResult);
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }

  receivedMessages(receiver, from, to, page)
  {
    let $this = this;
    page = page || 1;

    const data = {
      "PhoneNumber": receiver,
      "StartDate": from,
      "EndDate": to,
      "Page": page
    };

    return new Promise((resolve, reject) => {
      $this
        .to("ReceiveMessages", data)
        .then((response) => {
          if (response.Code == 0) {
            let resolveResult = [];
            const iterateMessagesList = response.Result.ReceivedMsgs;
            for (let ptr in iterateMessagesList) {
              resolveResult.push({
                from: iterateMessagesList[ptr].Mobile,
                date: iterateMessagesList[ptr].Date,
                message: iterateMessagesList[ptr].MsgBody
              });
            }
            console.log(resolveResult);
            resolve({
              totalPages: response.Result.TotalPage,
              currentPage: response.Result.Page,
              messages: resolveResult
            });
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }

  accountCredit()
  {
    let $this = this;

    return new Promise((resolve, reject) => {
      $this
        .to("GetCredit")
        .then((response) => {
          if (response.Code == 0) {
            resolve(response.Result);
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }

  prices()
  {
    let $this = this;

    return new Promise((resolve, reject) => {
      $this
        .to("GetPrices")
        .then((response) => {
          if (response.Code == 0) {
            resolve({fa: response.Result.Fa_Price, en: response.Result.En_Price});
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }

  checkBlackList(numbers)
  {
    const $this = this;

    if (!Array.isArray(numbers) && typeof numbers == "string") {
      numbers = numbers.split(",");
    }

    const data = {
      Mobiles: numbers
    }

    return new Promise((resolve, reject) => {
      $this
        .to("GetPrices", data)
        .then((response) => {
          if (response.Code == 0) {
            resolve(response.Result);
          }
          else {
            reject({isHttpException: false, code: response.Code, message: response.Message});
          }
        })
        .catch((error) => {
          reject({isHttpException: true, code: error.statusCode, message: error.message});
        });
    });
  }

  createRecipientObject(id, number, message)
  {
    return {Id: id, Mobile: number, Message: message};
  }

  to(endpoint, data, method)
  {
    method = method || "POST";
    data = data || {};
    return this.makeRequest(this.baseUrl+"/"+endpoint, method, data);
  }

  toSoap(method, data)
  {
    const credentials = {
      Username: this.username,
      Password: this.password
    }
    data = {...credentials, ...data};

    return new Promise((resolve, reject) => {
      this.soap.createClient(this.soapUrl, (error, client) => {
        if (error) {
          reject(error);
        }
        else {
          client[method](data, (secondError, result) => {
            if (secondError) {
              reject(error);
            }
            else {
              resolve(result);
            }
          });
        }
      });
    });
  }

  makeRequest(url, method, data)
  {
    const options = {
      url,
      method,
      body: data,
      headers: {
        'Authorization': this.auth
      },
      json: true
    };
    return this.rp(options);
  }

  getRandomGroupId()
  {
    return parseInt(Math.random() * (999999999 - 100000000) + 100000000);
  }

  getCurrentTimestamp()
  {
    return Math.floor(Date.now() / 1000) - 1;
  }

  getMessageStatus(code)
  {
    const messages = {
      1: 'رسیده به گوشی',
      2: 'نرسیده به گوشی',
      8: 'رسیده به مخابرات',
      16: 'نرسیده به مخابرات',
      23: 'امکان ارسال پیام به شماره مورد نظر وجود ندارد',
      27: 'به دلیل ترافیک بالا سرور امکان ارسال پیام جدید را ندارد',
    }

    if (code in messages) {
      return messages[code];
    }

    return "وضعیت نامشخص";
  }

  getCodeMessage(code)
  {
    const messages = {
      0   : 'عملیات با موفقیت انجام شد',
      1001: 'فرمت سند ارسالی صحیح نمی باشد',
      1002: 'شماره اختصاصی وارد شده معتبر نمی باشد',
      1003: 'فرمت تاریخ ارسالی صحیح نمی باشد',
      1004: 'پارامتر های ارسالی برای درخواست مورد نظر معتبر نمی باشد',
      2001: 'مالکیت شماره اختصاصی مورد نظر برای کاربری وارد شده معتبر نمی باشد',
      2002: 'کاربری مورد نظر مجوز استفاده از وب سرویس را ندارد',
      2003: 'آدرس آی پی درخواست دهنده غیر مجاز می باشد',
      2004: 'تاریخ ارسال در نظر گرفته شده در محدوده مجاز نمی باشد',
      2005: 'تعداد مخاطبین حداکثر می تواند 500 عدد باشد',
      2006: 'طول پیام نمی تواند بیش از 10 پیام باشد ',
      2007: 'مقدار وارد شده برای شماره پورت غیر مجاز می باشد',
      2008: 'مقدار وارد شده برای شماره صفحه غیر مجاز می باشد',
      2009: 'خطا در واکشی اطلاعات کاربری',
      3001: 'خطا در ثبت اطلاعات',
      3002: 'خطا در دریافت گروه پیام',
      3003: 'اعتبار کافی نمی باشد',
      3004: 'سرویس مورد نظر برای اپراتور مد نظر تعریف نشده است',
      5001: 'به دلیل خطای داخلی، سرور قادر به پاسخگویی نیست',
      5002: 'در هنگام ارسال پیام خطایی رخ داده است',
      5003: 'در هنگام دریافت نتیجه ارسال پیام خطایی رخ داده است',
      5004: 'برخی پیام ها در هنگام ارسال با خطا مواجه شده اند',
    };


    if (code in messages) {
      return messages[code];
    }

    return "وضعیت نامشخص";
  }
}

module.exports = smsClient;
