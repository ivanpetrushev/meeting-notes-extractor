// higher level abstractions of DynamoDB operations
const dynamoDb = require("../lib/dynamodb");

// generic

module.exports.getTimeLastSynced = async () => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Key: {
      pk: "global",
      sk: "lastSynced",
    },
  };

  const result = await dynamoDb.get(params);
  return result.Item;
};

module.exports.putTimeLastSynced = async () => {
  // store in iso format
  const time = new Date().toISOString();
  const params = {
    TableName: process.env.DDB_TABLE,
    Item: {
      pk: "global",
      sk: "lastSynced",
      updatedAt: time,
    },
  };
  await dynamoDb.put(params);
};

// tokens

module.exports.getTokens = async () => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Key: {
      pk: "global",
      sk: "tokens",
    },
  };

  const result = await dynamoDb.get(params);
  return result.Item;
};

module.exports.storeTokens = async (tokens) => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Item: {
      pk: "global",
      sk: "tokens",
      ...tokens,
    },
  };

  await dynamoDb.put(params);
};

// files operations

module.exports.storeFileMeta = async (id, fileName) => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Item: {
      pk: id,
      sk: fileName,
      createdAt: new Date().toISOString(),
    },
  };

  await dynamoDb.put(params);
};

module.exports.getFileMeta = async (id, fileName) => {
  const params = {
    TableName: process.env.DDB_TABLE,
    Key: {
      pk: id,
      sk: fileName,
    },
  };

  const result = await dynamoDb.get(params);
  return result.Item;
};
