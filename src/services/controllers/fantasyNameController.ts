import express, {Request, Response, NextFunction} from 'express'; 

import { FantasyNameMethods, FantasyName } from '../../types/types';
import FantasyNameService from '../dataService/fantasyNameService'; 
import { awsCognitoAuthMiddleware } from './awsCognitoMdw';

export function fantasyNameRouter(fantasyNameDataSource: FantasyNameMethods) {
    const fantasyNameService = new FantasyNameService(fantasyNameDataSource); 

    const router = express.Router();

    // Get fantasy team names for multiple emails
    router.post('/getFantasyTeamNames', async (req: Request, res: Response) => {
        const { emails } = req.body;
        
        if (!emails || !Array.isArray(emails)) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'emails must be an array' 
            });
        }

        if (emails.length === 0) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'emails array cannot be empty' 
            });
        }

        const teamNames = await fantasyNameService.getFantasyTeamNames(emails);
        res.status(200).send(teamNames);
    });

    router.post('/getFantasyTeamNamePossiblyNew', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const { email } = req.body;
        const teamName = await fantasyNameService.getFantasyTeamNamePossiblyNew(email);
        res.status(200).send(teamName);
    });

    // Check if a fantasy team name is available
    router.get('/isFantasyTeamNameAvailable', async (req: Request, res: Response) => {
        const { town, name } = req.query;
        
        if (!town || !name) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'town and name parameters are required' 
            });
        }

        const isAvailable = await fantasyNameService.isFantasyTeamNameAvailable(town as string, name as string);
        res.status(200).send({ available: isAvailable });
    });

    // Create or update a fantasy team name
    router.post('/upsertFantasyTeamName', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const { email, town, name } = req.body;
        const userEmail = req.user?.email as string;
        
        if (!email || !town || !name) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'email, town, and name are required' 
            });
        }

        if(userEmail.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'email does not match user email' 
            });
        }

        const isAvailable = await fantasyNameService.isFantasyTeamNameAvailable(town as string, name as string);
        if(!isAvailable) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'Team name is already taken.' 
            });
        }

        const result = await fantasyNameService.upsertFantasyTeamName(email, town, name);
        res.status(200).send(result);
    });

    // Get town suggestions
    router.get('/getFantasyTeamTowns', async (req: Request, res: Response) => {
        const searchString = req.query.search as string || '';
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        
        const towns = await fantasyNameService.getFantasyTeamTowns(searchString, limit, offset);
        res.status(200).send(towns);
    });

    // Get team name suggestions for a town
    router.get('/getTeamNameSuggestions', async (req: Request, res: Response) => {
        const { town } = req.query;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        
        if (!town) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'town parameter is required' 
            });
        }

        const suggestions = await fantasyNameService.getTeamNameSuggestions(town as string, limit, offset);
        res.status(200).send(suggestions);
    });

    router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err) {
            res.status(500);
            res.json("Internal server error.");
        }       
        next(err);
    });

    return router; 
}
