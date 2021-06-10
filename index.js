"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
//imports
var telegraf_1 = require("telegraf");
//constants
var Session = require('telegraf-session-local/lib/session');
var bot = new telegraf_1.Telegraf('1887952507:AAGbuOkFNADN1pPCFS8Zk48Y9tLj4EbeoW4'); //insert bot token here
var telegram = new telegraf_1.Telegram('1887952507:AAGbuOkFNADN1pPCFS8Zk48Y9tLj4EbeoW4');
var session = new Session();
var fs = require('fs');
//setting session to the bot
bot.use(session);
//Commenly used commands
bot.start(function (ctx) {
    ctx.reply("Hello and welcome to MEE6 product quality check! Where you can give us your precious opinion on our products.\nTo start a new review use /review \n You can look at the list of commands in the /help menu");
    ctx.session.questionCounter = 0;
    ctx.session.nameOfUser = ctx.message.from.first_name;
    ctx.session.userID = ctx.from.id;
});
bot.help(function (ctx) {
    ctx.reply('Welcome to the /help Menu \nList of commands:\n/review : Starts a new review\n/exit : Exits the current review');
});
bot.hears('/exit', function (ctx) {
    if (ctx.session.questionCounter == 0) {
        ctx.reply('You are currently not in a review session');
    }
    else {
        ctx.session.questionCounter = 0;
        ctx.session.qualityOfProduct = '';
        ctx.session.priceOfProduct = 0;
        ctx.session.pictureOfProductLink = '';
        ctx.session.location = '';
        ctx.reply('Exited current review successfully to start a new one, use /review');
    }
});
bot.hears('/review', function (ctx) {
    if (ctx.session.questionCounter == 0) {
        ctx.reply("how did you find the quality of the product?", telegraf_1.Markup.keyboard(['Very good', 'Good', 'No opinion', 'Bad', 'Very bad']).oneTime().resize());
        ctx.session.questionCounter = 1;
    }
    else {
        ctx.reply("You are currently doing a review, if you want restart please use /exit and then /review");
    }
});
bot.on('photo', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(ctx.session.questionCounter == 3)) return [3 /*break*/, 6];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                _a = ctx.session;
                return [4 /*yield*/, telegram.getFileLink(ctx.message.photo[0].file_id)];
            case 2: return [4 /*yield*/, (_b.sent()).href];
            case 3:
                _a.pictureOfProductLink = (_b.sent());
                ctx.session.questionCounter = 4;
                ctx.reply('Please send us your current location');
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.log(error_1);
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 7];
            case 6:
                ctx.reply('You dont need to send a photo right now');
                _b.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); });
//chain of logical events
bot.on('text', function (ctx, next) {
    switch (ctx.session.questionCounter) {
        case 1:
            if (steralizeText(ctx.message.text)) {
                ctx.session.qualityOfProduct = ctx.message.text;
                ctx.session.questionCounter = 2;
                ctx.reply('Enter the cost of the product');
            }
            else {
                ctx.reply('Please reply with the given options (Very good, Good, No opinion, Bad, Very bad', telegraf_1.Markup.keyboard(['Very good', 'Good', 'No opinion', 'Bad', 'Very bad']).oneTime().resize());
            }
            break;
        case 2:
            try {
                //to check if its a number/ positive number
                if (Number(ctx.message.text) >= 0) {
                    ctx.session.priceOfProduct = Number(ctx.message.text);
                    ctx.reply('Please send a compressed picture of the product');
                    ctx.session.questionCounter = 3;
                }
                else {
                    ctx.reply('Please enter a positive number');
                }
            }
            catch (e) {
                ctx.reply('Please enter a posotive number');
            }
            break;
        case 4:
            if (ctx.message.text.includes('google.com/maps')) {
                ctx.session.location = ctx.message.text;
                next();
            }
            else {
                ctx.reply('This is not a google maps link');
            }
            break;
        default:
            ctx.reply('This is not an expected input');
            break;
    }
});
bot.on('location', function (ctx, next) {
    if (ctx.session.questionCounter == 4) {
        ctx.session.location = "https://www.google.com/maps/place/" + ctx.message.location.latitude + "," + ctx.message.location.longitude;
        next();
    }
    else {
        ctx.reply('You dont need to send the location right now');
    }
});
//saving info and ending the session with the customer
bot.use(function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(ctx.session.questionCounter == 4)) return [3 /*break*/, 2];
                if (ctx.session.numberOfReviewsForThisUser == null) {
                    ctx.session.numberOfReviewsForThisUser = 1;
                }
                else {
                    ctx.session.numberOfReviewsForThisUser++;
                }
                ctx.reply('Thank you for your review, you can always start a new /review and have a good day :D');
                return [4 /*yield*/, next()];
            case 1:
                _a.sent();
                ctx.session.questionCounter = 0;
                return [3 /*break*/, 3];
            case 2:
                ctx.reply('Please compress the picture');
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
bot.use(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            fs.writeFileSync("./userInfo/" + ctx.session.userID + " Review " + ctx.session.numberOfReviewsForThisUser + ".json", JSON.stringify(ctx.session));
        }
        catch (e) {
            console.log(e);
        }
        return [2 /*return*/];
    });
}); });
//Functions
function steralizeText(input) {
    //i can use an if statement but i think switch looks neater and cooler :D
    switch (input.toLowerCase()) {
        case 'very good':
        case 'good':
        case 'no opinion':
        case 'bad':
        case 'very bad':
            return true;
            break;
        default:
            return false;
            break;
    }
}
bot.launch();
