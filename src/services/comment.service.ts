import client from "../config/database";
import { CommentProps } from "../types/comment.types";

export const getAllComments = async (): Promise<CommentProps[]> => {
    const result = await client.query('SELECT * FROM "comment" ORDER BY "createdat" DESC');
    return result.rows;
};

export const getComment = async (id: number): Promise<CommentProps | null> => {
    const result = await client.query('SELECT * FROM "comment" WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const getCommentsByBookContent = async (bookContentId: number, page: number = 1, limit: number = 10): Promise<{ comments: any[], total: number }> => {
    const offset = (page - 1) * limit;
    
    // Requête pour obtenir le total
    const countResult = await client.query(
        'SELECT COUNT(*) FROM "comment" WHERE "bookcontent_id" = $1',
        [bookContentId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Requête pour obtenir les commentaires avec les informations associées
    const result = await client.query(
        `SELECT 
            c.*,
            u.username as user_username,
            u.id as user_id,
            bc.content as book_content,
            ch.id as chapter_id,
            ch.title as chapter_title
        FROM "comment" c
        LEFT JOIN "user" u ON c.user_id = u.id
        LEFT JOIN "bookcontent" bc ON c.bookcontent_id = bc.id
        LEFT JOIN "chapter" ch ON bc.chapter_id = ch.id
        WHERE c.bookcontent_id = $1
        ORDER BY c.createdat DESC
        LIMIT $2 OFFSET $3`,
        [bookContentId, limit, offset]
    );

    return {
        comments: result.rows,
        total
    };
};

export const getCommentsByChapter = async (chapterId: number): Promise<CommentProps[]> => {
    const result = await client.query(
        'SELECT * FROM "comment" WHERE chapter_id = $1 ORDER BY "createdat" DESC',
        [chapterId]
    );
    return result.rows;
};

export const createComment = async (comment: CommentProps): Promise<CommentProps> => {
    const { bookContent_id, chapter_id, user_id, content, parentComment_id } = comment;
    const result = await client.query(
        `INSERT INTO "comment" ("bookcontent_id", chapter_id, user_id, content, "parentcomment_id")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [bookContent_id, chapter_id, user_id, content, parentComment_id]
    );
    return result.rows[0];
};

export const updateComment = async (id: number, comment: Partial<CommentProps>): Promise<CommentProps | null> => {
    const fields = Object.keys(comment)
        .map((key, index) => `"${key}" = $${index + 2}`)
        .join(', ');
    
    const values = Object.values(comment);
    
    const result = await client.query(
        `UPDATE "comment" SET ${fields} WHERE id = $1 RETURNING *`,
        [id, ...values]
    );
    return result.rows[0] || null;
};

export const deleteComment = async (id: number): Promise<boolean> => {
    const result = await client.query('DELETE FROM "comment" WHERE id = $1 RETURNING id', [id]);
    return result.rowCount !== null && result.rowCount > 0;
};

export const toggleCommentVisibility = async (id: number, visible: boolean): Promise<CommentProps | null> => {
    const result = await client.query(
        'UPDATE "comment" SET visible = $2 WHERE id = $1 RETURNING *',
        [id, visible]
    );
    return result.rows[0] || null;
};

export const incrementLike = async (id: number): Promise<CommentProps | null> => {
    const result = await client.query(
        'UPDATE "comment" SET "like" = "like" + 1 WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
};

export const decrementLike = async (id: number): Promise<CommentProps | null> => {
    const result = await client.query(
        'UPDATE "comment" SET "like" = GREATEST("like" - 1, 0) WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0] || null;
}; 