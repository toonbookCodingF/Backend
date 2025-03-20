import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'API
const API_URL = 'http://localhost:3000';

// Configuration de base pour les requêtes fetch
const defaultConfig = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

// Fonction utilitaire pour gérer les réponses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Une erreur est survenue');
    }
    return response.json();
};

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        // autres informations utilisateur
    };
}

export const authService = {
    // Login
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Construire l'URL avec les paramètres de requête
            const queryParams = new URLSearchParams({
                email: credentials.email,
                password: credentials.password
            });

            console.log('Tentative de connexion à:', `${API_URL}/api/users/login?${queryParams}`);

            const response = await fetch(`${API_URL}/api/users/login?${queryParams}`, {
                ...defaultConfig,
                method: 'GET',
            });

            const data = await handleResponse(response);
            const { token, user } = data;
            
            // Stocker le token
            await AsyncStorage.setItem('userToken', token);
            
            return { token, user };
        } catch (error) {
            console.error('Erreur de login:', error);
            throw error;
        }
    },

    // Logout
    async logout(): Promise<void> {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/api/users/logout`, {
                ...defaultConfig,
                method: 'POST',
                headers: {
                    ...defaultConfig.headers,
                    'Authorization': `Bearer ${token}`,
                },
            });

            await handleResponse(response);
            await AsyncStorage.removeItem('userToken');
        } catch (error) {
            console.error('Erreur de logout:', error);
            throw error;
        }
    },

    // Vérifier si l'utilisateur est connecté
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return false;

            const response = await fetch(`${API_URL}/api/users/me`, {
                ...defaultConfig,
                method: 'GET',
                headers: {
                    ...defaultConfig.headers,
                    'Authorization': `Bearer ${token}`,
                },
            });

            await handleResponse(response);
            return true;
        } catch (error) {
            return false;
        }
    },

    // Récupérer le token
    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem('userToken');
    },

    // Fonction utilitaire pour faire des requêtes authentifiées
    async authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await AsyncStorage.getItem('userToken');
        
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...defaultConfig,
            ...options,
            headers: {
                ...defaultConfig.headers,
                ...options.headers,
                'Authorization': `Bearer ${token}`,
            },
        });

        return handleResponse(response);
    }
}; 