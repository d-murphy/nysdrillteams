import express, { Request, Response, NextFunction } from 'express';
import { Article, ArticleMethods } from '../../types/types';
import ArticlesService from '../dataService/articlesService';
import SessionAdmin from '../dataService/session';
import { checkSessionsMdw, createAuthMdw } from './createSessionAndAuthMdw';

function parseOptionalBoolean(value: unknown): boolean | undefined | 'invalid' {
    if (value === undefined || value === '') return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return 'invalid';
}

function parseLimitOffset(req: Request): { limit: number; offset: number } {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    return { limit, offset };
}

export function articlesRouter(articlesDataSource: ArticleMethods, sessionAdmin: SessionAdmin) {
    const Articles = new ArticlesService(articlesDataSource);
    const sessionsMdw = checkSessionsMdw(sessionAdmin);
    const authMdw = createAuthMdw(['admin', 'article']);

    const router = express.Router();

    router.post('/upsertArticle', [sessionsMdw, authMdw], async (req: Request, res: Response) => {
        const article = req.body.article as Article | undefined;
        if (
            !article ||
            typeof article.id !== 'number' ||
            !article.title ||
            !article.content ||
            !article.author
        ) {
            return res.status(400).send('malformed request');
        }

        const result = await Articles.upsertArticle(article);
        return res.status(200).send(result);
    });

    router.get('/getArticle/:articleId', async (req: Request, res: Response) => {
        const articleId = parseInt(req.params.articleId);
        if (Number.isNaN(articleId)) {
            return res.status(400).send('Invalid articleId');
        }

        const article = await Articles.getArticle(articleId);
        return res.status(200).send(article);
    });

    router.get('/getArticles', async (req: Request, res: Response) => {
        const { limit, offset } = parseLimitOffset(req);
        const isPublished = parseOptionalBoolean(req.query.isPublished);
        const isFeatured = parseOptionalBoolean(req.query.isFeatured);

        if (isPublished === 'invalid' || isFeatured === 'invalid') {
            return res.status(400).send('isPublished and isFeatured must be true or false');
        }

        const tag = typeof req.query.tag === 'string' && req.query.tag !== ''
            ? req.query.tag
            : undefined;

        const articles = await Articles.getArticles(limit, offset, isPublished, isFeatured, tag);
        return res.status(200).send(articles);
    });

    router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err) {
            res.status(500);
            res.json('Internal server error.');
        }
        next(err);
    });

    return router;
}
