// Google Drive API operations
const { OAuth2Client } = require("google-auth-library");
const keys = require("../keys.json");

module.exports.getCallbackTokens = async (event) => {
  const oAuth2Client = new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
  );

  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
};

module.exports.generateAuthUrl = async () => {
  const oAuth2Client = new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/drive",
  });
  return authorizeUrl;
};

module.exports.refreshToken = async (tokens) => {
  const oAuth2Client = new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[0]
  );

  oAuth2Client.setCredentials(tokens);
  const newTokens = await oAuth2Client.refreshAccessToken();
  console.log("newTokens", newTokens);
  return newTokens.credentials;
};

module.exports.listFilesInFoler = async (folderId, tokens) => {
  console.log("listFilesInFoler", folderId, tokens.access_token);
  // TODO: pagination for large folders
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents`,
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  );
  const result = await response.json();
  return result;
};

module.exports.fetchFile = async (id, tokens) => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  );
  return response;
};
