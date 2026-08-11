const configuredApiUrl = import.meta.env.VITE_API_URL;

const apiBaseUrl = configuredApiUrl === undefined
    ? "http://127.0.0.1:5000"
    : configuredApiUrl.replace(/\/$/, "");

export const apiUrl = (path) => `${apiBaseUrl}${path}`;
