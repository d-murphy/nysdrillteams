import { UpdateResult } from 'mongodb';
import { Article, ArticleMethods } from '../../types/types';

class ArticlesService {
    constructor(private dataSource: ArticleMethods) {}

    public upsertArticle(article: Article): Promise<UpdateResult> {
        return this.dataSource.upsertArticle(article);
    }

    public getArticle(articleId: number): Promise<Article | undefined> {
        return this.dataSource.getArticle(articleId);
    }

    public getArticles(
        limit: number,
        offset: number,
        isPublished?: boolean,
        isFeatured?: boolean,
        tag?: string
    ): Promise<Article[]> {
        return this.dataSource.getArticles(limit, offset, isPublished, isFeatured, tag);
    }
}

export default ArticlesService;
