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
exports.switchSubscriptionTier = exports.closeSubscriptionAccount = exports.cancelSubscription = exports.subscribeToTier = void 0;
var config_1 = require("../config/config");
var constants_1 = require("../../../shared/utils/constants");
var pda_derivations_1 = require("../../../shared/utils/pda-derivations");
var program = (0, config_1.getProgram)();
function subscribeToTier(subscriber, subscriberAta, app, tier, appTreasury) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, subscription, subscriptionBump, thread, subscribeIx, completePaymentIx;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, pda_derivations_1.subscriptionAccountKey)(subscriber, app), subscription = _a[0], subscriptionBump = _a[1];
                    thread = (0, pda_derivations_1.subscriptionThreadKey)(subscription);
                    return [4 /*yield*/, program.methods
                            .createSubscription()
                            .accounts({
                            threadProgram: constants_1.THREAD_PROGRAM_ID,
                            subscriptionThread: thread,
                            app: app,
                            tier: tier,
                            subscriber: subscriber,
                            subscriberAta: subscriberAta,
                        })
                            .instruction()];
                case 1:
                    subscribeIx = _b.sent();
                    return [4 /*yield*/, program.methods
                            .completePayment()
                            .accounts({
                            app: app,
                            tier: tier,
                            destination: appTreasury,
                            subscriberAta: subscriberAta,
                            subscription: subscription,
                            subscriptionThread: thread,
                        })
                            .instruction()];
                case 2:
                    completePaymentIx = _b.sent();
                    return [2 /*return*/, {
                            instructions: [subscribeIx, completePaymentIx],
                            subscription: subscription,
                            subscriptionBump: subscriptionBump,
                        }];
            }
        });
    });
}
exports.subscribeToTier = subscribeToTier;
function cancelSubscription(app, tier, subscriber, subscriberAta) {
    return __awaiter(this, void 0, void 0, function () {
        var subscription, thread, instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscription = (0, pda_derivations_1.subscriptionAccountKey)(subscriber, app)[0];
                    thread = (0, pda_derivations_1.subscriptionThreadKey)(subscription);
                    return [4 /*yield*/, program.methods
                            .cancelSubscription()
                            .accounts({
                            app: app,
                            tier: tier,
                            subscriber: subscriber,
                            subscriberAta: subscriberAta,
                            subscriptionThread: thread,
                            threadProgram: constants_1.THREAD_PROGRAM_ID,
                        })
                            .instruction()];
                case 1:
                    instruction = _a.sent();
                    return [2 /*return*/, { instruction: instruction }];
            }
        });
    });
}
exports.cancelSubscription = cancelSubscription;
function closeSubscriptionAccount(app, subscriber) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, subscription, bump, thread, instruction;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, pda_derivations_1.subscriptionAccountKey)(subscriber, app), subscription = _a[0], bump = _a[1];
                    thread = (0, pda_derivations_1.subscriptionThreadKey)(subscription);
                    return [4 /*yield*/, program.methods
                            .closeSubscriptionAccount(bump)
                            .accounts({
                            app: app,
                            subscription: subscription,
                            subscriber: subscriber,
                            subscriptionThread: thread,
                            threadProgram: constants_1.THREAD_PROGRAM_ID,
                        })
                            .instruction()];
                case 1:
                    instruction = _b.sent();
                    return [2 /*return*/, { instruction: instruction }];
            }
        });
    });
}
exports.closeSubscriptionAccount = closeSubscriptionAccount;
function switchSubscriptionTier(oldTier, newTier, app, subscriber, subscriberAta) {
    return __awaiter(this, void 0, void 0, function () {
        var subscription, thread, instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscription = (0, pda_derivations_1.subscriptionAccountKey)(subscriber, app)[0];
                    thread = (0, pda_derivations_1.subscriptionThreadKey)(subscription);
                    return [4 /*yield*/, program.methods
                            .switchSubscriptionTier()
                            .accounts({
                            oldTier: oldTier,
                            newTier: newTier,
                            app: app,
                            subscriber: subscriber,
                            subscriberAta: subscriberAta,
                            subscriptionThread: thread,
                            threadProgram: constants_1.THREAD_PROGRAM_ID,
                        })
                            .instruction()];
                case 1:
                    instruction = _a.sent();
                    return [2 /*return*/, { instruction: instruction }];
            }
        });
    });
}
exports.switchSubscriptionTier = switchSubscriptionTier;
