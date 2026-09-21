// An empty base URL keeps API requests on the current Netlify origin. Local or
// externally hosted backends can still be selected with VITE_BACKEND_URL.
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
export default BACKEND_URL;
