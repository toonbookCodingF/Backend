import client from "../config/database";

interface UserProps{
    username: string,
    password: string,
    email: string,
    name:string,
    lastName: string

}
export const getAllUsers = async () => {
    const result = await client.query("SELECT * FROM \"User\"");
    return result.rows;
};

export const postUser = async (user: UserProps) => {
    const query = `
        INSERT INTO "User" 
        (username, password, email, "createdAt", role, name, "lastName") 
        VALUES 
        ($1, $2, $3, NOW(), 'free', $4, $5)
        RETURNING *;
    `;

    const values = [
        user.username,
        user.password,
        user.email,
        user.name,
        user.lastName
    ];

    try {
        const result = await client.query(query, values);
        return result.rows[0]; // ✅ Retourne l'objet utilisateur
    } catch (error) {
        console.error("Error inserting user:", error);
        throw new Error("Database error");
    }
};
