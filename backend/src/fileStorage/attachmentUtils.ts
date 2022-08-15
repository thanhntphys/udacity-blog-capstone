import * as AWS from 'aws-sdk'
import { S3 } from 'aws-sdk'
import { createLogger } from '../utils/logger'

// TODO: Implement the fileStogare logic
const logger = createLogger('AttachmentUtils')


export class AttachmentUtils {
    
    constructor(
        private readonly s3: S3 = createS3Client(),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }

    async getUploadUrl(postId: string): Promise<string> {
        logger.info(`Get presigned URL url for Post ${postId} with bucket ${this.bucketName}`)
        const url =this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: postId,
            Expires: parseInt(this.urlExpiration)
        })
        return url;
    }

    getAttachmentUrl(postId: string): string {
        logger.info(`Get attachment URL for Post ${postId} on bucket ${this.bucketName}`)
        return `https://${this.bucketName}.s3.amazonaws.com/${postId}`;
    }
}

function createS3Client() : S3 {
    
    const s3 = new AWS.S3({
        signatureVersion: 'v4'
    });
    return s3;
}