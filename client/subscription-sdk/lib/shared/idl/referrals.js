"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDL = void 0;
exports.IDL = {
    "version": "0.1.0",
    "name": "referrals",
    "instructions": [
        {
            "name": "createReferralship",
            "accounts": [
                {
                    "name": "referralship",
                    "isMut": true,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "REFERRALSHIP"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            }
                        ]
                    }
                },
                {
                    "name": "app",
                    "isMut": false,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "APP"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "path": "app_authority"
                            },
                            {
                                "kind": "arg",
                                "type": "u8",
                                "path": "app_id"
                            }
                        ],
                        "programId": {
                            "kind": "account",
                            "type": "publicKey",
                            "path": "plege_program"
                        }
                    }
                },
                {
                    "name": "treasuryTokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "REFERRALSHIP"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            },
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "TREASURY"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "Mint",
                                "path": "treasury_mint"
                            }
                        ]
                    }
                },
                {
                    "name": "treasuryMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralAgentsCollectionNftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralAgentsCollectionNftMetadata",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "appAuthority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "plegeProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "appId",
                    "type": "u8"
                },
                {
                    "name": "referralAgentSplit",
                    "type": "u8"
                },
                {
                    "name": "splits",
                    "type": {
                        "vec": {
                            "defined": "PubkeyWithWeight"
                        }
                    }
                }
            ]
        },
        {
            "name": "subscribeWithReferral",
            "accounts": [
                {
                    "name": "referral",
                    "isMut": true,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "REFERRAL"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "path": "subscription"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "Mint",
                                "path": "referral_agent_nft_mint"
                            }
                        ]
                    }
                },
                {
                    "name": "referralship",
                    "isMut": false,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "REFERRALSHIP"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            }
                        ]
                    }
                },
                {
                    "name": "referralAgentNftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralAgentNftMetadata",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralshipCollectionNftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralAgentsCollectionNftMetadata",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "treasuryMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "app",
                    "isMut": false,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "APP"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "path": "app_authority"
                            },
                            {
                                "kind": "account",
                                "type": "u8",
                                "account": "Referralship",
                                "path": "referralship.app_id"
                            }
                        ],
                        "programId": {
                            "kind": "account",
                            "type": "publicKey",
                            "path": "plege_program"
                        }
                    }
                },
                {
                    "name": "subscription",
                    "isMut": true,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "SUBSCRIPTION"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "path": "subscriber"
                            }
                        ],
                        "programId": {
                            "kind": "account",
                            "type": "publicKey",
                            "path": "plege_program"
                        }
                    }
                },
                {
                    "name": "subscriber",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "subscriberTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tier",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "appAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "plegeProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "subscriptionThread",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "threadProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "splitPayment",
            "accounts": [
                {
                    "name": "app",
                    "isMut": false,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "APP"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "path": "app_authority"
                            },
                            {
                                "kind": "account",
                                "type": "u8",
                                "account": "Referralship",
                                "path": "referralship.app_id"
                            }
                        ],
                        "programId": {
                            "kind": "account",
                            "type": "publicKey",
                            "path": "plege_program"
                        }
                    }
                },
                {
                    "name": "appAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "subscription",
                    "isMut": false,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "SUBSCRIPTION"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "path": "subscriber"
                            }
                        ],
                        "programId": {
                            "kind": "account",
                            "type": "publicKey",
                            "path": "plege_program"
                        }
                    }
                },
                {
                    "name": "subscriber",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tier",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referral",
                    "isMut": false,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "REFERRAL"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "Subscription",
                                "path": "subscription"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "Mint",
                                "path": "referral_agent_nft_mint"
                            }
                        ]
                    }
                },
                {
                    "name": "referralship",
                    "isMut": false,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "REFERRALSHIP"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            }
                        ]
                    }
                },
                {
                    "name": "referralAgentNftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralAgentNftMetadata",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralAgentNftTokenAccount",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralAgentTreasuryTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "referralAgentsCollectionNftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "referralAgentsCollectionNftMetadata",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "treasuryMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "treasuryTokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "REFERRALSHIP"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "App",
                                "path": "app"
                            },
                            {
                                "kind": "const",
                                "type": "string",
                                "value": "TREASURY"
                            },
                            {
                                "kind": "account",
                                "type": "publicKey",
                                "account": "Mint",
                                "path": "treasury_mint"
                            }
                        ]
                    }
                },
                {
                    "name": "plegeProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "referral",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "app",
                        "type": "publicKey"
                    },
                    {
                        "name": "referralAgentNftMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "subscription",
                        "type": "publicKey"
                    }
                ]
            }
        },
        {
            "name": "referralship",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "app",
                        "type": "publicKey"
                    },
                    {
                        "name": "appId",
                        "type": "u8"
                    },
                    {
                        "name": "treasuryMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "referralAgentsCollectionNftMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "splits",
                        "type": {
                            "defined": "Splits8"
                        }
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "PubkeyWithWeight",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "address",
                        "type": "publicKey"
                    },
                    {
                        "name": "weight",
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "Splits8",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "referralAgent",
                        "type": "u8"
                    },
                    {
                        "name": "slot1",
                        "type": {
                            "option": {
                                "defined": "PubkeyWithWeight"
                            }
                        }
                    },
                    {
                        "name": "slot2",
                        "type": {
                            "option": {
                                "defined": "PubkeyWithWeight"
                            }
                        }
                    },
                    {
                        "name": "slot3",
                        "type": {
                            "option": {
                                "defined": "PubkeyWithWeight"
                            }
                        }
                    },
                    {
                        "name": "slot4",
                        "type": {
                            "option": {
                                "defined": "PubkeyWithWeight"
                            }
                        }
                    },
                    {
                        "name": "slot5",
                        "type": {
                            "option": {
                                "defined": "PubkeyWithWeight"
                            }
                        }
                    },
                    {
                        "name": "slot6",
                        "type": {
                            "option": {
                                "defined": "PubkeyWithWeight"
                            }
                        }
                    },
                    {
                        "name": "slot7",
                        "type": {
                            "option": {
                                "defined": "PubkeyWithWeight"
                            }
                        }
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidAppAuthority"
        },
        {
            "code": 6001,
            "name": "InvalidTreasuryMint"
        },
        {
            "code": 6002,
            "name": "InvalidSubscriberTokenAccount"
        },
        {
            "code": 6003,
            "name": "InvalidTier"
        },
        {
            "code": 6004,
            "name": "ReferralAgentSplitNotSet"
        },
        {
            "code": 6005,
            "name": "TooManySplitsProvided"
        },
        {
            "code": 6006,
            "name": "TotalWeightIsNot100"
        },
        {
            "code": 6007,
            "name": "InvalidCollection"
        },
        {
            "code": 6008,
            "name": "InvalidCollectionMetadata"
        },
        {
            "code": 6009,
            "name": "CollectionMetadataMintMismatch"
        },
        {
            "code": 6010,
            "name": "InvalidReferralAgentMetadata"
        },
        {
            "code": 6011,
            "name": "InvalidReferralAgentNftTokenAccount"
        },
        {
            "code": 6012,
            "name": "InvalidReferralAgentTreasuryTokenAccount"
        },
        {
            "code": 6013,
            "name": "ReferralAgentNFTMintMismatch"
        },
        {
            "code": 6014,
            "name": "InvalidSplitRecipientTreasuryTokenAccount"
        },
        {
            "code": 6015,
            "name": "InvalidSplit"
        },
        {
            "code": 6016,
            "name": "DuplicateSplit"
        },
        {
            "code": 6017,
            "name": "InvalidBump"
        }
    ]
};
