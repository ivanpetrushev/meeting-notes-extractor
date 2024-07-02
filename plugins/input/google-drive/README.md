https://developers.google.com/identity/sign-in/web/server-side-flow#step_1_create_a_client_id_and_client_secret

scopes: https://www.googleapis.com/auth/drive

test users: add your user

authorized javascript origins: will get back to this later

<!-- download keys to ./src/keys.json -->

- "Enabled APIs and services" - enable Google Drive API


make apply

get the function URL and go back to credentials:
add redirect URL: https://ewnhlkohl2l6lphojtxr5kf4da0yqufj.lambda-url.eu-central-1.on.aws/callback

download keys to ./src/keys.json