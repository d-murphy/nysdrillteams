import express, {Request, Response, NextFunction} from 'express'; 

import { FantasyNameMethods, FantasyName, TeamData } from '../../types/types';
import FantasyNameService from '../dataService/fantasyNameService'; 
import { awsCognitoAuthMiddleware } from './awsCognitoMdw';
import TeamsService from '../dataService/teamsService';

export function fantasyNameRouter(fantasyNameDataSource: FantasyNameMethods, teamsDataSource: TeamData) {
    const fantasyNameService = new FantasyNameService(fantasyNameDataSource); 
    const teamsService = new TeamsService(teamsDataSource); 
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
        const teamInfo = await fantasyNameService.getFantasyTeamNamePossiblyNew(email);
        res.status(200).send(teamInfo);
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
        if(!isAvailable) return res.status(200).send({ available: false });
        const nicknameIsAvailable = await teamsService.isNameAvailable(name as string);
        res.status(200).send({ available: nicknameIsAvailable });
    });

    // Create or update a fantasy team name
    router.post('/upsertFantasyTeamName', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const { email, town, name, insideColor, outsideColor } = req.body;
        const userEmail = req.user?.email as string;
        
        if (!email || !town || !name) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'email, town, and name are required' 
            });
        }

        if (insideColor !== undefined && typeof insideColor !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'insideColor must be a string when provided',
            });
        }
        if (outsideColor !== undefined && typeof outsideColor !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'outsideColor must be a string when provided',
            });
        }

        if(userEmail.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'email does not match user email' 
            });
        }

        const currentInfo = await fantasyNameService.getFantasyTeamNames([email]);
        const currentTeamTown = currentInfo[0]?.town || '';
        const currentTeamName = currentInfo[0]?.name || '';
        console.log(currentTeamTown, currentTeamName);
        console.log(town, name);

        const noNameChange = currentTeamTown.toLowerCase() === town.toLowerCase() && currentTeamName.toLowerCase() === name.toLowerCase();
        console.log(noNameChange);
        if(!noNameChange) {
            const isAvailable = await fantasyNameService.isFantasyTeamNameAvailable(town as string, name as string);
            if(!isAvailable) {
                return res.status(400).json({ 
                    error: 'Bad Request', 
                    message: 'Team name is already taken.' 
                });
            }    
        }

        const includeColors = insideColor !== undefined || outsideColor !== undefined;
        const result = await fantasyNameService.upsertFantasyTeamName(
            email,
            town,
            name,
            ...(includeColors
                ? [
                    typeof insideColor === 'string' ? insideColor.trim() : '',
                    typeof outsideColor === 'string' ? outsideColor.trim() : '',
                  ]
                : []),
        );
        res.status(200).send(result);
    });

    router.get('/getRandomFantasyTeamTown', async (req: Request, res: Response) => {
        const town = await fantasyNameService.getRandomFantasyTeamTown();
        res.status(200).send({ town });
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

    router.post('/setCodeUsed', awsCognitoAuthMiddleware, async (req: Request, res: Response) => {
        const { email, accessCode } = req.body;
        const result = await fantasyNameService.setCodeUsed(email as string, accessCode as string);
        if(result) {
            return res.status(200).send({ message: 'Code used successfully' });
        } else {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'Invalid access code' 
            });
        }
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
