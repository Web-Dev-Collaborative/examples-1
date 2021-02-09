import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sst from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create the table
    const table = new sst.Table(this, "Notes", {
      fields: {
        userId: dynamodb.AttributeType.STRING,
        noteId: dynamodb.AttributeType.STRING,
      },
      primaryIndex: { partitionKey: "userId", sortKey: "noteId" },
    });

    // Create the HTTP API
    const api = new sst.Api(this, "Api", {
      defaultFunctionProps: {
        // Pass in the table name to our API
        environment: {
          tableName: table.dynamodbTable.tableName,
        },
      },
      routes: {
        "GET    /notes": "src/list.main",
        "POST   /notes": "src/create.main",
        "GET    /notes/{id}": "src/get.main",
        "PUT    /notes/{id}": "src/update.main",
        "DELETE /notes/{id}": "src/delete.main",
      },
    });

    // Allow the API to access the table
    api.attachPermissions([table]);

    // Show API endpoint in output
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.httpApi.apiEndpoint,
    });
  }
}