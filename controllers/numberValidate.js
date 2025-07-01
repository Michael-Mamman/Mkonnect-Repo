import logger from "./logs.js";

const telcos = [
    { prefix: "0701", name: "AIRTEL" },
    { prefix: "07020", name: "SMILE" },
    { prefix: "07025", name: "MTN" },
    { prefix: "07026", name: "MTN" },
    { prefix: "07027", name: "MULTI-LINKS" },
    { prefix: "07028", name: "STARCOMMS" },
    { prefix: "07029", name: "STARCOMMS" },
    { prefix: "0703", name: "MTN" },
    { prefix: "0704", name: "MTN" },
    { prefix: "0705", name: "GLO" },
    { prefix: "0706", name: "MTN" },
    { prefix: "0707", name: "MTN" },
    { prefix: "0708", name: "AIRTEL" },
    { prefix: "0709", name: "MULTI-LINKS" },
    { prefix: "0802", name: "AIRTEL" },
    { prefix: "0803", name: "MTN" },
    { prefix: "0804", name: "NTEL" },
    { prefix: "0805", name: "GLO" },
    { prefix: "0806", name: "MTN" },
    { prefix: "0807", name: "GLO" },
    { prefix: "0808", name: "AIRTEL" },
    { prefix: "0809", name: "9MOBILE" },
    { prefix: "0810", name: "MTN" },
    { prefix: "0811", name: "GLO" },
    { prefix: "0812", name: "AIRTEL" },
    { prefix: "0813", name: "MTN" },
    { prefix: "0814", name: "MTN" },
    { prefix: "0815", name: "GLO" },
    { prefix: "0816", name: "MTN" },
    { prefix: "0817", name: "9MOBILE" },
    { prefix: "0818", name: "9MOBILE" },
    { prefix: "0819", name: "STARCOMMS" },
    { prefix: "0909", name: "9MOBILE" },
    { prefix: "0908", name: "9MOBILE" },
    { prefix: "0901", name: "AIRTEL" },
    { prefix: "0902", name: "AIRTEL" },
    { prefix: "0912", name: "AIRTEL" },
    { prefix: "0911", name: "AIRTEL" },
    { prefix: "0903", name: "MTN" },
    { prefix: "0904", name: "AIRTEL" },
    { prefix: "0905", name: "GLO" },
    { prefix: "0906", name: "MTN" },
    { prefix: "0907", name: "AIRTEL" },
    { prefix: "0915", name: "GLO" },
    { prefix: "0913", name: "MTN" },
    { prefix: "0916", name: "MTN" },
];


var removeCountryCode = function (phoneNumber) {
    if (("" + phoneNumber).slice(0, 3) === "234") {
        phoneNumber = "0" + phoneNumber.slice(3);
    }
    else if (("" + phoneNumber).slice(0, 4) === "+234") {
        phoneNumber = "0" + phoneNumber.slice(4);
    }
    return phoneNumber;
};


export const validatePhoneNumber =  (phoneNumber) => {

    var errors = [];
    phoneNumber = removeCountryCode(phoneNumber);
    var telcoType = telcos.find(function (telco) { return telco.prefix === ("" + phoneNumber).slice(0, telco.prefix.length); });
    var isValidLength = ("" + phoneNumber).length === 11;
    var isNumber = /^[0-9]*$/.test(phoneNumber);
    if (!telcoType) {
        errors.push('Phone number doesn\'t match a valid service provider');

    }
    if (!isValidLength) {
        errors.push('Phone number should be 11 characters long');

    }
    if (!isNumber) {
        errors.push('Invalid number character detected');

    }
    var allChecksPass = [!!telcoType, isNumber, isValidLength].every(function (val) { return val === true; });
    var errorConstruct = {
        errors: errors,
        isValid: false,
    };
    var successConstruct = {
        telco: telcoType === null || telcoType === void 0 ? void 0 : telcoType.name,
        isValid: true,
    };

    if(errorConstruct){
       let c =1
    }
    return allChecksPass ? successConstruct : errorConstruct;
};

