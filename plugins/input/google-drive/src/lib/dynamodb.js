const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  paginateQuery
} = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.REGION
});
const dynamoDb = DynamoDBDocumentClient.from(client);

const put = (params) => {
  console.log('dynamodb.put', JSON.stringify(params, null, 2));
  const command = new PutCommand(params);
  return dynamoDb.send(command);
};

const get = (params) => {
  console.log('dynamodb.get', JSON.stringify(params, null, 2));
  const command = new GetCommand(params);
  return dynamoDb.send(command);
};

const query = async (params) => {
  console.log('dynamodb.query', JSON.stringify(params, null, 2));

  let items = [];
  for await (const page of paginateQuery({ client: dynamoDb }, params)) {
    console.log('query page', page);
    items.push(...page.Items);
  }
  return {
    Items: items
  };
};

const remove = (params) => {
  console.log('dynamodb.delete', JSON.stringify(params, null, 2));
  const command = new DeleteCommand(params);
  return dynamoDb.send(command);
};

const update = (params) => {
  console.log('dynamodb.update', JSON.stringify(params, null, 2));
  const command = new UpdateCommand(params);
  return dynamoDb.send(command);
};

module.exports = {
  put,
  get,
  query,
  remove,
  update,
};
