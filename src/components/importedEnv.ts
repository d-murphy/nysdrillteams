import * as dotenv from 'dotenv'

dotenv.config(); 
const { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME } = process.env; 

if(!AWS_S3_ACCESS_KEY || !AWS_S3_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) throw new Error('Missing AWS S3 credentials');

export const awsS3AccessKey = AWS_S3_ACCESS_KEY;
export const awsS3SecretAccessKey = AWS_S3_SECRET_ACCESS_KEY;
export const s3BucketName = AWS_S3_BUCKET_NAME;