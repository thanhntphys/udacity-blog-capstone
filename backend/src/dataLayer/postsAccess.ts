import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { PostItem } from '../models/PostItem'
import { PostUpdate } from '../models/PostUpdate'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

// TODO: Implement the dataLayer logic

const logger = createLogger('PostsAccess')

export class PostsAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly postsTable = process.env.POSTS_TABLE) {
    }

    async getAllPosts(userId: string): Promise<PostItem[]> {
        const result = await this.docClient.query({
            TableName: this.postsTable,
            KeyConditionExpression: '#userId =:i',
            ExpressionAttributeNames: {
                '#userId': 'userId'
            },
            ExpressionAttributeValues: {
                ':i': userId
            }
        }).promise();

        const items = result.Items
        return items as PostItem[]
    }

    async searchPosts(userId: string, keyword: string): Promise<PostItem[]> {
        console.log('search all Posts for user ', userId, ' with keyword ', keyword)

        const result = await this.docClient.query({
            TableName: this.postsTable,
            KeyConditionExpression: '#userId =:i',
            ExpressionAttributeNames: {
                '#userId': 'userId'
            },
            ExpressionAttributeValues: {
                ':i': userId
            }
        }).promise();

        let items = result.Items as PostItem[]
        items = items.filter(item => item.title.includes(keyword))
        return items
    }

    async createPost(post: PostItem): Promise<PostItem> {
        await this.docClient.put({
            TableName: this.postsTable,
            Item: post
        }).promise()
        return post
    }

    async deletePost(postId: string, userId: string) {
    
        await this.docClient.delete({
          TableName: this.postsTable,
          Key: {
            userId: userId,
            postId: postId
          }
        }).promise();
    
        logger.info('Deleted Post successfully');
    }

    async updatePost(post: PostUpdate, userId: string, postId: string): Promise<PostUpdate> {
        const params = {
            TableName: this.postsTable,
            Key: {
                userId: userId,
                postId: postId
            },
            ExpressionAttributeNames: {
                '#post_title': 'title',
            },
            ExpressionAttributeValues: {
                ':title': post.title,
                ':dueDate': post.dueDate,
            },
            UpdateExpression: 'SET #post_title = :title, dueDate = :dueDate',
            ReturnValues: 'ALL_NEW',
        };

        const result = await this.docClient.update(params).promise();

        logger.info('Result of update statement', { result: result });

        return result.Attributes as PostUpdate;
    }

    async updateAttachmentUrl(userId: string, postId: string, attachmentUrl: string) {
        const params = {
            TableName: this.postsTable,
            Key: {
                userId: userId,
                postId: postId
            },
            ExpressionAttributeNames: {
                '#post_attachmentUrl': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            },
            UpdateExpression: 'SET #post_attachmentUrl = :attachmentUrl',
            ReturnValues: 'ALL_NEW',
        };

        const result = await this.docClient.update(params).promise();
        logger.info('Result of update statement', { result: result });
    }

}

function createDynamoDBClient(): DocumentClient {
    const service = new AWS.DynamoDB();
    const client = new AWS.DynamoDB.DocumentClient({
        service: service
    });
    AWSXRay.captureAWSClient(service);
    return client;
}
