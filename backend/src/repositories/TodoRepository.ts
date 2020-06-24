import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import 'source-map-support/register';
import { TodoItem } from '../models/TodoItem';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const XAWS = AWSXRay.captureAWS(AWS);

export class TodoRepository {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucket = process.env.IMAGES_S3_BUCKET,
    private readonly index = process.env.INDEX_NAME,
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getTodos(userId: String): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: process.env.INDEX_NAME,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false,
      })
      .promise();

    return result.Items as TodoItem[];
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    console.log('Todo created!');
    //todo.attachmentUrl = `https://${this.bucket}.s3.amazonaws.com/${todo.todoId}`
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo,
      })
      .promise();

    return todo;
  }

  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    const key = {
      userId: todo.userId,
      createdAt: todo.createdAt,
    };

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: key,
        UpdateExpression: 'set #n = :n, dueDate = :dd, done = :d',
        ExpressionAttributeValues: {
          ':n': todo.name,
          ':dd': todo.dueDate,
          ':d': todo.done,
        },
        ExpressionAttributeNames: {
          '#n': 'name',
        },
      })
      .promise();

    return todo;
  }

  async getTodoById(todoId, userId): Promise<TodoItem> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.index,
        KeyConditionExpression: 'todoId = :todoId and userId = :userId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
          ':userId': userId,
        },
      })
      .promise();
    return result.Items[0] as TodoItem;
  }

  async deleteTodo(todo: TodoItem): Promise<TodoItem> {
    const key = {
      userId: todo.userId,
      createdAt: todo.createdAt,
    };
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: key,
      })
      .promise();

    return todo;
  }

  async generateUploadUrl(todo: TodoItem) {
    const key = {
      userId: todo.userId,
      createdAt: todo.createdAt,
    };
    console.log('Url generated!');

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: key,
        UpdateExpression: 'set attachmentUrl = :a',
        ExpressionAttributeValues: {
          ':a': `https://${this.bucket}.s3.amazonaws.com/${todo.todoId}`,
        },
      })
      .promise();

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucket,
      Key: todo.todoId,
      Expires: parseInt(this.urlExpiration),
    });
  }
}
