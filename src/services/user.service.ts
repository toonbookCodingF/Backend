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

export const getUser = async (email: string) => {
    const query = `SELECT * FROM "User" WHERE email = $1;`;
    const values = [email];

    try {
        const result = await client.query(query, values);
        return result.rows[0]; // ✅ Retourne l'objet utilisateur
    } catch (error) {
        console.error("Error getting user:", error);
        throw new Error("Database error");
    }
}

export const postUser = async (user: UserProps) => {
    // Query to check if the email already exists
    const checkEmailQuery = `
        SELECT * FROM "User" WHERE email = $1;
    `;

    try {
        const checkEmailResult = await client.query(checkEmailQuery, [user.email]);
        if (checkEmailResult.rows.length > 0) {
            throw new Error("Email already exists");
        }

        // SQL query to insert a new user into the "User" table
        const query = `
            INSERT INTO "User" 
            (username, password, email, "createdAt", role, name, "lastName") 
            VALUES 
            ($1, $2, $3, NOW(), 'free', $4, $5)
            RETURNING *;
        `;

        // Values to be inserted into the database
        const values = [
            user.username,
            user.password,
            user.email,
            user.name,
            user.lastName
        ];

        const result = await client.query(query, values);
        return result.rows[0]; // Return the inserted user object
    } catch (error) {
        console.error("Error inserting user:", error);
        if (error instanceof Error) {
            throw new Error(error.message || "Database error");
        } else {
            throw new Error("Database error");
        }
    }
};
