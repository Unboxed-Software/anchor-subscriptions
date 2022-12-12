export type Payment = {
  "version": "0.1.0",
  "name": "payment",
  "instructions": [
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MissingAccount"
    },
    {
      "code": 6001,
      "name": "TooManyAccounts"
    },
    {
      "code": 6002,
      "name": "WrongReferralsProgram"
    }
  ]
};

export const IDL: Payment = {
  "version": "0.1.0",
  "name": "payment",
  "instructions": [
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MissingAccount"
    },
    {
      "code": 6001,
      "name": "TooManyAccounts"
    },
    {
      "code": 6002,
      "name": "WrongReferralsProgram"
    }
  ]
};
