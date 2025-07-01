import dotenv from "dotenv";
dotenv.config();
const key = process.env.KEY;
// Middleware to validate API key
export const isSecure = async (req, res, next) => {

    const apiKey = req.header('Authorization');
    if (!apiKey) {
        return res.status(401).json({ error: 'No API key provided' });
    }

    // Replace `findApiKeyInDatabase` with your method to check the database
    findApiKeyInDatabase(apiKey, (err, isValid) => {
        if (err || !isValid) {
            return res.status(403).json({ error: 'Invalid API key' });
        }
        next();
    });
};

function findApiKeyInDatabase(apiKey, callback) {
    // Your database check here
    // For example:
    const isValid = (apiKey === key); // Simulate DB check
    callback(null, isValid);
}

