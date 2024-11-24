import "dotenv/config";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const USER_STORAGE_KEY = process.env.NEXT_PUBLIC_USER_STORAGE_KEY;

export { SERVER_URL, USER_STORAGE_KEY };
