import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

// Create instance with auth header from localStorage
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const chatService = {
    sendMessage: async (message) => {
        const response = await axios.post(`${API_URL}/chat`, { message }, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

export const predictionService = {
    getPrediction: async () => {
        const response = await axios.get(`${API_URL}/ai/predict-expense`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

export const budgetService = {
    getBudgets: async () => {
        const response = await axios.get(`${API_URL}/budgets`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

