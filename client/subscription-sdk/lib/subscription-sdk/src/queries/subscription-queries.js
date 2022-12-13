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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscription = exports.isActiveSubscriber = exports.getActiveSubscriptionsForUser = exports.getAllSubscriptionsForUser = exports.getActiveSubscriptionsToAppGroupedByTier = exports.getActiveSubscriptionCountForApp = exports.getActiveSubscriptionCountForTier = exports.getAllActiveSubscriptionsToTier = exports.getAllSubscriptionsToTier = exports.getAllActiveSubscriptionsToApp = exports.getAllSubscriptionsToApp = void 0;
var config_1 = require("../config/config");
var pda_derivations_1 = require("../../../shared/utils/pda-derivations");
var conversions_1 = require("../../../shared/utils/conversions");
var program = (0, config_1.getProgram)();
function getAllSubscriptionsToApp(app) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.account.subscription.all([
                        { memcmp: { offset: 8, bytes: app.toBase58() } },
                    ])];
                case 1:
                    subscriptions = _a.sent();
                    return [2 /*return*/, subscriptions.map(function (s) { return (0, conversions_1.convertSubscription)(s.account, s.publicKey); })];
            }
        });
    });
}
exports.getAllSubscriptionsToApp = getAllSubscriptionsToApp;
function getAllActiveSubscriptionsToApp(app) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions, now;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllSubscriptionsToApp(app)];
                case 1:
                    subscriptions = _a.sent();
                    now = new Date().getTime();
                    subscriptions = subscriptions.filter(function (sub) {
                        return sub.payPeriodExpiration.getTime() > now;
                    });
                    return [2 /*return*/, subscriptions];
            }
        });
    });
}
exports.getAllActiveSubscriptionsToApp = getAllActiveSubscriptionsToApp;
function getAllSubscriptionsToTier(tier) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.account.subscription.all([
                        { memcmp: { offset: 40, bytes: tier.toBase58() } },
                    ])];
                case 1:
                    subscriptions = _a.sent();
                    return [2 /*return*/, subscriptions.map(function (s) { return (0, conversions_1.convertSubscription)(s.account, s.publicKey); })];
            }
        });
    });
}
exports.getAllSubscriptionsToTier = getAllSubscriptionsToTier;
function getAllActiveSubscriptionsToTier(tier) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions, now;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllSubscriptionsToTier(tier)];
                case 1:
                    subscriptions = _a.sent();
                    now = new Date().getTime();
                    subscriptions = subscriptions.filter(function (sub) {
                        return sub.payPeriodExpiration.getTime() > now;
                    });
                    return [2 /*return*/, subscriptions];
            }
        });
    });
}
exports.getAllActiveSubscriptionsToTier = getAllActiveSubscriptionsToTier;
function getActiveSubscriptionCountForTier(tier) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllActiveSubscriptionsToTier(tier)];
                case 1:
                    subscriptions = _a.sent();
                    return [2 /*return*/, subscriptions.length];
            }
        });
    });
}
exports.getActiveSubscriptionCountForTier = getActiveSubscriptionCountForTier;
function getActiveSubscriptionCountForApp(app) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllActiveSubscriptionsToApp(app)];
                case 1:
                    subscriptions = _a.sent();
                    return [2 /*return*/, subscriptions.length];
            }
        });
    });
}
exports.getActiveSubscriptionCountForApp = getActiveSubscriptionCountForApp;
function getActiveSubscriptionsToAppGroupedByTier(app) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions, grouped;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllActiveSubscriptionsToApp(app)];
                case 1:
                    subscriptions = _a.sent();
                    grouped = {};
                    subscriptions.map(function (sub) {
                        // @ts-ignore
                        if (grouped[sub.account.tier.toBase58()]) {
                            // @ts-ignore
                            grouped[sub.account.tier.toBase58()].push(sub);
                        }
                        else {
                            // @ts-ignore
                            grouped[sub.account.tier.toBase58()] = [sub];
                        }
                    });
                    return [2 /*return*/, grouped];
            }
        });
    });
}
exports.getActiveSubscriptionsToAppGroupedByTier = getActiveSubscriptionsToAppGroupedByTier;
function getAllSubscriptionsForUser(user) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.account.subscription.all([
                        { memcmp: { offset: 72, bytes: user.toBase58() } },
                    ])];
                case 1:
                    subscriptions = _a.sent();
                    return [2 /*return*/, subscriptions.map(function (s) { return (0, conversions_1.convertSubscription)(s.account, s.publicKey); })];
            }
        });
    });
}
exports.getAllSubscriptionsForUser = getAllSubscriptionsForUser;
function getActiveSubscriptionsForUser(user) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptions, now;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllSubscriptionsForUser(user)];
                case 1:
                    subscriptions = _a.sent();
                    now = new Date().getTime();
                    subscriptions = subscriptions.filter(function (sub) {
                        return sub.payPeriodExpiration.getTime() > now;
                    });
                    return [2 /*return*/, subscriptions];
            }
        });
    });
}
exports.getActiveSubscriptionsForUser = getActiveSubscriptionsForUser;
function isActiveSubscriber(subscriber, app, tier) {
    if (tier === void 0) { tier = null; }
    return __awaiter(this, void 0, void 0, function () {
        var subscription, now;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSubscription(subscriber, app)];
                case 1:
                    subscription = _a.sent();
                    if (tier && subscription.tier !== tier) {
                        return [2 /*return*/];
                    }
                    now = new Date().getTime();
                    return [2 /*return*/, subscription.payPeriodExpiration.getTime() > now];
            }
        });
    });
}
exports.isActiveSubscriber = isActiveSubscriber;
function getSubscription(subscriber, app) {
    return __awaiter(this, void 0, void 0, function () {
        var key, subscription;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    key = (0, pda_derivations_1.subscriptionAccountKey)(subscriber, app)[0];
                    return [4 /*yield*/, program.account.subscription.fetch(key)];
                case 1:
                    subscription = _a.sent();
                    return [2 /*return*/, (0, conversions_1.convertSubscription)(subscription, key)];
            }
        });
    });
}
exports.getSubscription = getSubscription;
