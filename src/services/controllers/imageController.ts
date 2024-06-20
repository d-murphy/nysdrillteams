import express, { Request, Response} from 'express'; 
import { upload } from '../../components/images'; 
import { ImageMethods } from '../../types/types';
import { createAuthMdw, checkSessionsMdw } from './createSessionAndAuthMdw';
import SessionAdmin from '../dataService/session';


export function makeImagesRouter(imageMethods: ImageMethods, sessionAdmin:SessionAdmin ) {
    var imageRouter = express.Router();

    const sessionsMdw = checkSessionsMdw(sessionAdmin); 
    const authMdw = createAuthMdw(['admin', 'scorekeeper']); 

    imageRouter.get('/test', (req: Request, res: Response) => {res.status(200).send('test')})

    imageRouter.post('/uploadImage', [sessionsMdw, authMdw], upload.single('file'), async (req: Request, res: Response): Promise<any> => {
        const { track, imageName } = req.body; 

        if(!req.file) return res.status(400).send('No file provided'); 
        if(!imageName) return res.status(400).send('No imageName provided');
        if(!track) return res.status(400).send('No track provided');

        const fileName = track + '-' + imageName;
        const imageNameUnique = await imageMethods.uniqueImageName(fileName);
        if(!imageNameUnique) return res.status(400).send('Image name already exists')

        const [compressedImage, thumbnail] = await imageMethods.compressImage(req.file);
        const result = await imageMethods.uploadImage(compressedImage, thumbnail, fileName, track);

        res.status(200).send(result);
    })

    imageRouter.get('/getImages', [sessionsMdw, authMdw], async (req: Request, res: Response): Promise<any> => {
        const track = req.query.track as string;
        const page = req.query.page as string | undefined;
        const pageSize = req.query.pageSize as string | undefined;
        const images = await imageMethods.getImageList(track, page ? parseInt(page) : undefined, pageSize ? parseInt(pageSize) : undefined);
        res.status(200).send(images);
    })

    imageRouter.post('/deleteImage', [sessionsMdw, authMdw], async (req: Request, res: Response): Promise<any> => {
        const imageName = req.body.imageName as string;
        if(!imageName) return res.status(400).send('imageName required');         
        const result = await imageMethods.deleteImage(imageName);
        if(!result) return res.status(400).send('Image delete failed'); 
        res.status(200).send(result);
    })

    return imageRouter; 
}

