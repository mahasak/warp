## How to install

### Webhook URL for Messenger App
prod_webhook=https://<firebase-function-base-url>/webhook
dev_webhook=https://<firebase-emulator-host>>/us-central1/webhook

### Setup environment and logging
firebase functions:config:set warp.env=env
firebase functions:config:set warp.log_level=info

### reset pages config/add new page
firebase functions:config:unset warp.facebook

### setup pages config
firebase functions:config:set warp.facebook="$(cat .config.json)"
.config.json
```
{
    "pages":[2088619008054043,106045115633694],
    "pages_config": [
        {
            "page_id": "2088619008054043",
            "name": "BrotherBears Sticker",
            "features": {
                "pipeline": "false",
                "slip_detection_api": "false"
            },
            "access_token": "XXXX"
        },
        {
            "page_id": "106045115633694",
            "name": "NativeBear DEV",
            "features": {
                "pipeline": "false",
                "slip_detection_api": "true"
            },
            "access_token": "XXXX"
        }
    ],
    "page_id": "106045115633694",
    "verify_token": "ITSAGOODDAYTODIE",
    "access_token": "XXXX"
}
```

### cloud function 403 forbidden error
If you are getting 403 forbidden error like below

Error: Forbidden Your client does not have permission to get URL /api/test from this server.

Please follow below steps to grant access to all users. Basically this is to allow unauthenticated clients to access your api endpoint.

Go to https://console.cloud.google.com/functions/list
Select the function to which you want to give public access
Click on PERMISSIONS
Click on ADD MEMBER
Type allUsers
Select role Cloud Functions -> Cloud Functions Invoker
Save
That's it, now test your api.
see documentation: https://cloud.google.com/functions/docs/securing/managing-access-iam#allowing_unauthenticated_function_invocation