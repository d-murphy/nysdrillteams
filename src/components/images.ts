import multer, { FileFilterCallback }  from 'multer';
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3" ;
import { awsS3AccessKey, awsS3SecretAccessKey } from "./importedEnv";


const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
export const upload = multer({ storage: storage, fileFilter: fileFilter as unknown as multer.Options['fileFilter'] });


export const s3Client = new S3Client({
    region: 'us-east-2',
    credentials: {
      accessKeyId: awsS3AccessKey,
      secretAccessKey: awsS3SecretAccessKey,
    },
} as S3ClientConfig);


