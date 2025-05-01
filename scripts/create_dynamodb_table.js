
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });

const dynamodb = new AWS.DynamoDB();

const params = {
    TableName: process.env.DYNAMO_TABLE,
    KeySchema: [
        { AttributeName: 'shortCode', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
        { AttributeName: 'shortCode', AttributeType: 'S' }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};

dynamodb.createTable(params, (err, data) => {
    if (err) {
        console.error("Unable to create table:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table:", JSON.stringify(data, null, 2));
    }
});
