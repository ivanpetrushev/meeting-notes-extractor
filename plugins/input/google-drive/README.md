# input plugin: google-drive

The goal of this plugin is to automatically sync Google Drive folders with meeting recordings to the `input` S3 bucket.

## Installation steps

This involves some going back and forth, so we are putting it in steps:

1. Create plugin config.

    ```bash
    cp src/config.js.example src/config.js
    ```

    Edit `src/config.js` and fill in the desired routing rules. 
    Each rule consists of Google Drive folder ID and S3 bucket key prefix.
    In this way you can route recordings from different folders to different prefixes in the input S3 bucket.

2. Install plugin infrastructure:
  
    ```bash
    make apply
    ```

    Note the output "google_redirect_url" - you will need it in the next step.

3. Google Drive API credentials

    Read the remarks below, but in general - follow the instructions from here: [create client id and client secret](https://developers.google.com/identity/sign-in/web/server-side-flow#step_1_create_a_client_id_and_client_secret)

    Remarks:

    - when asked for scopes, set: `https://www.googleapis.com/auth/drive`
    - test users: add your user email
    - authorized redirect URLs: set **google_auth_url** from the previous step
    -download keys to ./src/keys.json

    Go to the [Google Console](https://console.developers.google.com/)

    - "Enabled APIs and services" - enable Google Drive API

4. Re-install infrastructure with the new keys file:
  
      ```bash
      make apply
      ```

5. Initial authorization

    To get your access tokens for Google Drive access, you need to manually authorize the first time.
    Get the "initial_url" from outputs from step 1 and open it in your browser.
    You will be navigated to Google consent screen, where you need to authorize the app.
    After authorization, no further actions are required.

## Deployed infrastructure

![Google Drive plugin](./../../../docs/input-google-drive-landscape.png)

- Lambda function that reads Google Drive folders and syncs recordings to the `input` S3 bucket
- IAM role for Lambda
- DynamoDB table to keep track of already synced files and access tokens
- CloudWatch Event Rule to trigger the Lambda periodically (10 min)

## Usage

After the plugin is installed, upload a new file to the target Google Drive folder. It will be automatically synced with the `input` S3 bucket.

## Associated costs

- Lambda: since this plugin is triggered periodically, the cost is negligible
- DynamoDB: for less than thousands of files in Google Drive folders, the cost should be negligible

## Status

This plugin is implemented and working as expected.

TODO:

- [ ] Keep authorization tokens in AWS Secrets Manager instead of DynamoDB
- [ ] Implement pagination when browsing Google Drive folders

## Troubleshooting

### Token has been expired ot revoked

Delete the `token` object from DynamoDB.
Visit the Lambda function URL to go through the authorization process again.

TODO: refresh token is expected not to expire. To be verified.
