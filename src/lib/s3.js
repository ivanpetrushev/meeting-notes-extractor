const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({ region: process.env.AWS_REGION });

module.exports.get = async (params) => {
  console.log("s3.get", params.Bucket, params.Key);
  const command = new GetObjectCommand(params);
  return s3Client.send(command);
};

module.exports.put = async (params) => {
  console.log("s3.put", params.Bucket, params.Key);
  const command = new PutObjectCommand(params);
  return s3Client.send(command);
};

module.exports.getFileContent = async (params) => {
  const s3response = await this.get(params);
  // s3response.Body is streaming buffer
  const chunks = [];
  const content = await new Promise((resolve, reject) => {
    s3response.Body.on("data", (chunk) => chunks.push(chunk));
    s3response.Body.on("error", reject);
    s3response.Body.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return content;
};
