import { S3Client, PutObjectCommand, PutObjectCommandOutput, DeleteObjectCommand, DeleteObjectCommandOutput } from "@aws-sdk/client-s3";
import { ImageDbEntry, ImageMethods, ImageS3Methods } from "../../../src/types/types";
import { getCollectionPromise } from "../../library/db";
import { Db } from "mongodb";
import sharp from 'sharp';

export function makeImageS3Methods(s3Client: S3Client, bucketName: string): ImageS3Methods {

    return (
        {
            uploadImage: async (buffer: Buffer, fileName: string): Promise<PutObjectCommandOutput> => {
                const params = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: buffer,
                    ContentType: 'image/jpeg'
                  };
                  
                const command = new PutObjectCommand(params);
                return await s3Client.send(command);
            },
            deleteImage: async (fileName: string): Promise<DeleteObjectCommandOutput> => {
                const params = {
                    Bucket: bucketName,
                    Key: fileName
                };
                const command = new DeleteObjectCommand(params);
                return await s3Client.send(command);
            }
        }
    )
}

// imageS3Methods would be better passed into a service function but lazy.  

export async function makeImageMethods(dbPromise: Promise<Db>, collectionName: string, imageS3Methods: ImageS3Methods, bucketName: string): Promise<ImageMethods> {
    const imagesCollection = await getCollectionPromise(dbPromise, collectionName);
    return {
        getImageList: async function(track: string, page?: number, pageSize = 100) {
            const query = { track };
            const skip = page ? (page - 1) * pageSize : 0;
            const limit = pageSize ? pageSize : 0;
            const resultCount = await imagesCollection?.countDocuments(query);
            const results = await imagesCollection?.find(query).skip(skip).limit(limit).toArray() as unknown as ImageDbEntry[];
            return {results: results, resultCount: resultCount || 0};
        },
        uniqueImageName: async function(fileName: string) {
            const result = await imagesCollection?.findOne({ fileName });
            return !result;
        },
        uploadImage: async function(file: Buffer, thumbnail: Buffer, fileName: string, track: string, sortOrder: number) {
            await imageS3Methods.uploadImage(file, fileName);
            await imageS3Methods.uploadImage(thumbnail, fileName+'-thumbnail');
            const url = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
            const thumbnailUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}-thumbnail`;
            const imageDbEntry = { fileName, url, thumbnailUrl, track, sortOrder };
            await imagesCollection?.insertOne(imageDbEntry);
            return true;
        },
        updateSortOrder: async function(fileName: string, sortOrder: number) {
            const result = await imagesCollection?.updateOne({ fileName }, { $set: { sortOrder } });
            return result?.modifiedCount === 1;
        },
        compressImage: async function(file: Express.Multer.File) {
            const firstResize = sharp(file.buffer); 
            const secondResize = sharp(file.buffer);
            const metadata = await firstResize.metadata();
            const format = metadata.format as 'jpeg' | 'png';
            const formatOptions = metadata.format === 'jpeg' ? { mozjpeg: true } : {}; 
            const isPotrait = metadata.height && metadata.width ? metadata.height > metadata.width : true; 
            const resizeOption = isPotrait ? {height: 900} : { width: 1200 };
            // if resize has only height or only width, then don't resize if resize specs are larger.  
            if(!resizeOption?.height || !resizeOption?.width) {
                if(resizeOption?.height && metadata.height && metadata.height < resizeOption.height) resizeOption.height = metadata.height;
                else if(resizeOption?.width && metadata.width && metadata.width < resizeOption.width) resizeOption.width = metadata.width;
            }
            const thumbnailResizeOption = isPotrait ? { height: 188 } : { width: 250 }; 
            const newFile = await firstResize
                .resize(resizeOption)
                .toFormat(format, formatOptions)
                .toBuffer(); 
            const thumbnail = await secondResize
                .resize(thumbnailResizeOption)
                .toFormat(format, formatOptions)
                .toBuffer(); 
            return [newFile, thumbnail]; 
        },
        deleteImage: async function(fileName: string) {
            const result = await imageS3Methods.deleteImage(fileName);
            const thumbnailResult = await imageS3Methods.deleteImage(fileName+'-thumbnail');
            if(result && thumbnailResult){
                const result2 = await imagesCollection?.deleteOne({ fileName });
                return result2?.deletedCount === 1;
            }
            return false;
        }
    }
}