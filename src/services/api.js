const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Generic API request handler
 * @param {string} endpoint - The API endpoint (e.g., '/users')
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */



// async function request(endpoint, options = {}) {
//     const { timeout = 10000, ...fetchOptions } = options; // Default 10s timeout

//     const controller = new AbortController();
//     const id = setTimeout(() => controller.abort(), timeout);

//     const config = {
//         headers: {
//             'Content-Type': 'application/json',
//             ...fetchOptions.headers,
//         },
//         signal: controller.signal,
//         ...fetchOptions,
//     };

//     try {
//         const url = `${API_BASE_URL}${endpoint}`;
//         const response = await fetch(url, config);
//         clearTimeout(id);

//         if (response.status === 401) {
//             console.warn('Unauthorized access.');
//         }

//         if (!response.ok) {
//             const errorBody = await response.json().catch(() => ({}));
//             throw new Error(errorBody.message || `API Error: ${response.statusText}`);
//         }

//         if (response.status === 204) {
//             return null;
//         }

//         return await response.json();
//     } catch (error) {
//         clearTimeout(id);
//         console.error('API Request Failed:', error);
//         throw error;
//     }
// }
async function request(endpoint, options = {}) {
    const { timeout = 10000, body, headers = {}, ...rest } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const isFormData = body instanceof FormData;

    const config = {
    ...rest,
    body: isFormData ? body : (body && typeof body === 'object' ? JSON.stringify(body) : body),
    headers: {
        ...headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json;charset=UTF-8' }),
    },
    credentials: 'include',
    signal: controller.signal,
};


    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        clearTimeout(id);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || response.statusText);
        }

        return response.status === 204 ? null : await response.json();
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}


export const api = {
    get: (endpoint, headers = {}, options = {}) => request(endpoint, { method: 'GET', headers, ...options }),
    post: (endpoint, body, headers = {}, options = {}) => request(endpoint, { method: 'POST', body, headers, ...options }),
    put: (endpoint, body, headers = {}, options = {}) => request(endpoint, { method: 'PUT', body, headers, ...options }),
    patch: (endpoint, body, headers = {}, options = {}) => request(endpoint, { method: 'PATCH', body, headers, ...options }),
    delete: (endpoint, headers = {}, options = {}) => request(endpoint, { method: 'DELETE', headers, ...options }),
};
