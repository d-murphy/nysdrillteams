import { Collection, Db, UpdateResult } from 'mongodb';
import { Article, ArticleMethods } from '../../types/types';
import { getCollectionPromise } from '../../library/db';

export async function articlesDbFactory(dbPromise: Promise<Db>, collectionName: string): Promise<ArticleMethods | undefined> {
    let collection = await getCollectionPromise(dbPromise, collectionName);
    if (collection) return new ArticlesDb(collection);
    return undefined;
}

class ArticlesDb implements ArticleMethods {
    _dbCollection: Collection;

    constructor(collection: Collection) {
        this._dbCollection = collection;
    }

    async upsertArticle(article: Article): Promise<UpdateResult> {
        const filter = { id: article.id };
        const update = { $set: article };
        return this._dbCollection.updateOne(filter, update, { upsert: true });
    }

    async getArticle(articleId: number): Promise<Article | undefined> {
        const query = { id: articleId };
        const result = await this._dbCollection.findOne(query) as unknown as Article;
        return result || undefined;
    }

    async getArticles(
        limit: number,
        offset: number,
        isPublished?: boolean,
        isFeatured?: boolean,
        tag?: string
    ): Promise<Article[]> {
        const query: {
            isPublished?: boolean;
            isFeatured?: boolean;
            tags?: string;
        } = {};
        if (isPublished !== undefined) query.isPublished = isPublished;
        if (isFeatured !== undefined) query.isFeatured = isFeatured;
        if (tag !== undefined) query.tags = tag;

        return this._dbCollection
            .find(query)
            .sort({ sortOrder: 1, title: 1 })
            .skip(offset)
            .limit(limit)
            .toArray() as unknown as Article[];
    }
}
