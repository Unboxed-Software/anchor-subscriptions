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
exports.createReferralApp = void 0;
var config_1 = require("./config/config");
var anchor_1 = require("@project-serum/anchor");
var pda_derivations_1 = require("../../shared/utils/pda-derivations");
var constants_1 = require("../../shared/utils/constants");
var src_1 = require("../../subscription-sdk/src");
var pda_derivations_2 = require("./utils/pda-derivations");
var js_1 = require("@metaplex-foundation/js");
var program = (0, config_1.getProgram)();
function createReferralApp(name, auth, appId, treasuryMint, referralPercent, additionalSplits, referralCollectionNFTMint) {
    return __awaiter(this, void 0, void 0, function () {
        var appKey, metaplex, collectionNFT, treasury, createAppIx, newApp, _a, instruction, app, error_1, referralshipAddress, enableReferralsIx;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appKey = (0, pda_derivations_1.appAccountKey)(auth, appId);
                    metaplex = js_1.Metaplex.make(program.provider.connection);
                    return [4 /*yield*/, metaplex
                            .nfts()
                            .findByMint({ mintAddress: referralCollectionNFTMint })];
                case 1:
                    collectionNFT = _b.sent();
                    treasury = (0, pda_derivations_2.findReferralshipTreasuryAccountAddress)(appKey, treasuryMint, program.programId)[0];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, src_1.app.create(name, auth, treasuryMint, treasury)];
                case 3:
                    _a = _b.sent(), instruction = _a.instruction, app = _a.app;
                    createAppIx = instruction;
                    newApp = app;
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.log("WHETE", error_1);
                    return [3 /*break*/, 5];
                case 5:
                    referralshipAddress = (0, pda_derivations_2.findReferralshipAddress)(appKey, program.programId)[0];
                    return [4 /*yield*/, program.methods
                            .createReferralship(appId, referralPercent, additionalSplits)
                            .accounts({
                            referralship: referralshipAddress,
                            app: appKey,
                            appAuthority: auth,
                            treasuryMint: treasuryMint,
                            referralAgentsCollectionNftMint: referralCollectionNFTMint,
                            referralAgentsCollectionNftMetadata: collectionNFT.metadataAddress,
                            plegeProgram: constants_1.SUBSCRIPTION_PROGRAM_ID,
                            systemProgram: anchor_1.web3.SystemProgram.programId,
                        })
                            .instruction()];
                case 6:
                    enableReferralsIx = _b.sent();
                    return [2 /*return*/, {
                            instructions: [createAppIx, enableReferralsIx],
                            app: newApp,
                        }];
            }
        });
    });
}
exports.createReferralApp = createReferralApp;
