export type Plege = {
  "version": "0.1.0",
  "name": "plege",
  "instructions": [
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "userMeta",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "USER_META"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "auth"
              }
            ]
          }
        },
        {
          "name": "auth",
          "isMut": true,
          "isSigner": true
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
      "name": "createApp",
      "accounts": [
        {
          "name": "app",
          "isMut": true,
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
                "path": "auth"
              },
              {
                "kind": "arg",
                "type": "u8",
                "path": "app_id"
              }
            ]
          }
        },
        {
          "name": "userMeta",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "USER_META"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "auth"
              }
            ]
          }
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
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
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "createTier",
      "accounts": [
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "SUBSCRIPTION_TIER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "App",
                "path": "app"
              },
              {
                "kind": "arg",
                "type": "u8",
                "path": "tier_id"
              }
            ]
          }
        },
        {
          "name": "app",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tierId",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "interval",
          "type": {
            "defined": "Interval"
          }
        }
      ]
    },
    {
      "name": "createSubscription",
      "accounts": [
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tier",
          "isMut": false,
          "isSigner": false
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
            ]
          }
        },
        {
          "name": "subscriber",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "subscriberAta",
          "isMut": true,
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
      "name": "cancelSubscription",
      "accounts": [
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
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
            ]
          }
        },
        {
          "name": "subscriber",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "subscriberAta",
          "isMut": true,
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
      "name": "closeSubscriptionAccount",
      "accounts": [
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "subscription",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "subscriber",
          "isMut": true,
          "isSigner": true
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "subscriptionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "completePayment",
      "accounts": [
        {
          "name": "subscription",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "app",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "subscriberAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "subscriptionThread",
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
      "args": [],
      "returns": {
        "defined": "ThreadResponse"
      }
    },
    {
      "name": "disallowNewSubscribers",
      "accounts": [
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": true
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
      "name": "allowNewSubscribers",
      "accounts": [
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": true
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
      "name": "disableTier",
      "accounts": [
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": true
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
      "name": "switchSubscriptionTier",
      "accounts": [
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oldTier",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newTier",
          "isMut": false,
          "isSigner": false
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
            ]
          }
        },
        {
          "name": "subscriber",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "subscriberAta",
          "isMut": true,
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
    }
  ],
  "accounts": [
    {
      "name": "app",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auth",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "numTiers",
            "type": "u8"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "subscription",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "app",
            "type": "publicKey"
          },
          {
            "name": "tier",
            "type": "publicKey"
          },
          {
            "name": "subscriber",
            "type": "publicKey"
          },
          {
            "name": "start",
            "type": "i64"
          },
          {
            "name": "lastPaymentTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "payPeriodStart",
            "type": "i64"
          },
          {
            "name": "payPeriodExpiration",
            "type": "i64"
          },
          {
            "name": "acceptNewPayments",
            "type": "bool"
          },
          {
            "name": "credits",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "app",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "interval",
            "type": {
              "defined": "Interval"
            }
          },
          {
            "name": "acceptingNewSubs",
            "type": "bool"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userMeta",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auth",
            "type": "publicKey"
          },
          {
            "name": "numApps",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Interval",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Month"
          },
          {
            "name": "Year"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAppId",
      "msg": "Invalid tier id"
    },
    {
      "code": 6001,
      "name": "InvalidTierId",
      "msg": "Invalid tier id"
    },
    {
      "code": 6002,
      "name": "MissedPayment",
      "msg": "Payment interval skipped"
    },
    {
      "code": 6003,
      "name": "InactiveSubscription"
    },
    {
      "code": 6004,
      "name": "SubscriptionNotExpired"
    }
  ]
};

export const IDL: Plege = {
  "version": "0.1.0",
  "name": "plege",
  "instructions": [
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "userMeta",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "USER_META"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "auth"
              }
            ]
          }
        },
        {
          "name": "auth",
          "isMut": true,
          "isSigner": true
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
      "name": "createApp",
      "accounts": [
        {
          "name": "app",
          "isMut": true,
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
                "path": "auth"
              },
              {
                "kind": "arg",
                "type": "u8",
                "path": "app_id"
              }
            ]
          }
        },
        {
          "name": "userMeta",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "USER_META"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "auth"
              }
            ]
          }
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
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
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "createTier",
      "accounts": [
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "SUBSCRIPTION_TIER"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "App",
                "path": "app"
              },
              {
                "kind": "arg",
                "type": "u8",
                "path": "tier_id"
              }
            ]
          }
        },
        {
          "name": "app",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tierId",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "interval",
          "type": {
            "defined": "Interval"
          }
        }
      ]
    },
    {
      "name": "createSubscription",
      "accounts": [
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tier",
          "isMut": false,
          "isSigner": false
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
            ]
          }
        },
        {
          "name": "subscriber",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "subscriberAta",
          "isMut": true,
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
      "name": "cancelSubscription",
      "accounts": [
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
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
            ]
          }
        },
        {
          "name": "subscriber",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "subscriberAta",
          "isMut": true,
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
      "name": "closeSubscriptionAccount",
      "accounts": [
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "subscription",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "subscriber",
          "isMut": true,
          "isSigner": true
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "subscriptionBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "completePayment",
      "accounts": [
        {
          "name": "subscription",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "app",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "subscriberAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "subscriptionThread",
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
      "args": [],
      "returns": {
        "defined": "ThreadResponse"
      }
    },
    {
      "name": "disallowNewSubscribers",
      "accounts": [
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": true
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
      "name": "allowNewSubscribers",
      "accounts": [
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": true
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
      "name": "disableTier",
      "accounts": [
        {
          "name": "tier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "auth",
          "isMut": false,
          "isSigner": true
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
      "name": "switchSubscriptionTier",
      "accounts": [
        {
          "name": "app",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oldTier",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newTier",
          "isMut": false,
          "isSigner": false
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
            ]
          }
        },
        {
          "name": "subscriber",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "subscriberAta",
          "isMut": true,
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
    }
  ],
  "accounts": [
    {
      "name": "app",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auth",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "numTiers",
            "type": "u8"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "subscription",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "app",
            "type": "publicKey"
          },
          {
            "name": "tier",
            "type": "publicKey"
          },
          {
            "name": "subscriber",
            "type": "publicKey"
          },
          {
            "name": "start",
            "type": "i64"
          },
          {
            "name": "lastPaymentTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "payPeriodStart",
            "type": "i64"
          },
          {
            "name": "payPeriodExpiration",
            "type": "i64"
          },
          {
            "name": "acceptNewPayments",
            "type": "bool"
          },
          {
            "name": "credits",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "app",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "interval",
            "type": {
              "defined": "Interval"
            }
          },
          {
            "name": "acceptingNewSubs",
            "type": "bool"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userMeta",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auth",
            "type": "publicKey"
          },
          {
            "name": "numApps",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Interval",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Month"
          },
          {
            "name": "Year"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAppId",
      "msg": "Invalid tier id"
    },
    {
      "code": 6001,
      "name": "InvalidTierId",
      "msg": "Invalid tier id"
    },
    {
      "code": 6002,
      "name": "MissedPayment",
      "msg": "Payment interval skipped"
    },
    {
      "code": 6003,
      "name": "InactiveSubscription"
    },
    {
      "code": 6004,
      "name": "SubscriptionNotExpired"
    }
  ]
};
