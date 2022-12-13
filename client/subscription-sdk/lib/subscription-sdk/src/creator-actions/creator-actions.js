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
exports.Interval = exports.disableTier = exports.unpauseTier = exports.pauseTier = exports.createTier = exports.createApp = exports.createUser = void 0;
var anchor_1 = require("@project-serum/anchor");
var config_1 = require("../config/config");
var pda_derivations_1 = require("../../../shared/utils/pda-derivations");
var program = (0, config_1.getProgram)();
function createUser(auth) {
    return __awaiter(this, void 0, void 0, function () {
        var instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.methods
                        .createUser()
                        .accounts({
                        auth: auth,
                    })
                        .instruction()];
                case 1:
                    instruction = _a.sent();
                    return [2 /*return*/, {
                            instruction: instruction,
                        }];
            }
        });
    });
}
exports.createUser = createUser;
function createApp(name, auth, mint, treasury, appId) {
    return __awaiter(this, void 0, void 0, function () {
        var userKey, user, app, instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userKey = (0, pda_derivations_1.userAccountKeyFromPubkey)(auth);
                    if (!!appId) return [3 /*break*/, 2];
                    return [4 /*yield*/, program.account.userMeta.fetch(userKey)];
                case 1:
                    user = _a.sent();
                    appId = user.numApps + 1;
                    _a.label = 2;
                case 2:
                    app = (0, pda_derivations_1.appAccountKey)(auth, appId);
                    return [4 /*yield*/, program.methods
                            .createApp(appId, name)
                            .accounts({
                            auth: auth,
                            mint: mint,
                            treasury: treasury,
                        })
                            .instruction()];
                case 3:
                    instruction = _a.sent();
                    return [2 /*return*/, {
                            instruction: instruction,
                            app: app,
                        }];
            }
        });
    });
}
exports.createApp = createApp;
function createTier(name, app, price, interval, auth, tierId) {
    return __awaiter(this, void 0, void 0, function () {
        var appPDA, tier, instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!tierId) return [3 /*break*/, 2];
                    return [4 /*yield*/, program.account.app.fetch(app)];
                case 1:
                    appPDA = _a.sent();
                    tierId = appPDA.numTiers + 1;
                    _a.label = 2;
                case 2:
                    tier = (0, pda_derivations_1.tierAccountKey)(app, tierId);
                    return [4 /*yield*/, program.methods
                            .createTier(tierId, name, new anchor_1.BN(price), intervalValueInternal(interval)) // intervalValueInternal(interval))
                            .accounts({
                            app: app,
                            signer: auth,
                        })
                            .instruction()];
                case 3:
                    instruction = _a.sent();
                    return [2 /*return*/, {
                            instruction: instruction,
                            tier: tier,
                        }];
            }
        });
    });
}
exports.createTier = createTier;
function pauseTier(app, tier, auth) {
    return __awaiter(this, void 0, void 0, function () {
        var instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.methods
                        .disallowNewSubscribers()
                        .accounts({
                        app: app,
                        tier: tier,
                        auth: auth,
                    })
                        .instruction()];
                case 1:
                    instruction = _a.sent();
                    return [2 /*return*/, { instruction: instruction }];
            }
        });
    });
}
exports.pauseTier = pauseTier;
function unpauseTier(app, tier, auth) {
    return __awaiter(this, void 0, void 0, function () {
        var instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.methods
                        .allowNewSubscribers()
                        .accounts({ app: app, tier: tier, auth: auth })
                        .instruction()];
                case 1:
                    instruction = _a.sent();
                    return [2 /*return*/, { instruction: instruction }];
            }
        });
    });
}
exports.unpauseTier = unpauseTier;
function disableTier(app, tier, auth) {
    return __awaiter(this, void 0, void 0, function () {
        var instruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, program.methods
                        .disableTier()
                        .accounts({
                        app: app,
                        tier: tier,
                        auth: auth,
                    })
                        .instruction()];
                case 1:
                    instruction = _a.sent();
                    return [2 /*return*/, { instruction: instruction }];
            }
        });
    });
}
exports.disableTier = disableTier;
function intervalValueInternal(interval) {
    switch (interval) {
        case Interval.Monthly:
            return { month: {} };
        case Interval.Yearly:
            return { year: {} };
    }
}
var Interval;
(function (Interval) {
    Interval[Interval["Monthly"] = 0] = "Monthly";
    Interval[Interval["Yearly"] = 1] = "Yearly";
})(Interval = exports.Interval || (exports.Interval = {}));
