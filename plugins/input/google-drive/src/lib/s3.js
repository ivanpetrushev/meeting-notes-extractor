const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

module.exports.streamingUpload = async (params) => {
  const upload = new Upload({
    client: s3Client,
    params,
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
  });

  await upload.done();
};
