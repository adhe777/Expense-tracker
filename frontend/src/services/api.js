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

// Group Services
export const groupService = {
    createGroup: async (groupData) => {
        const response = await axios.post(`${API_URL}/group/create`, groupData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },
    inviteMember: async (inviteData) => {
        const response = await axios.post(`${API_URL}/group/invite`, inviteData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },
    getGroupDetails: async (groupId) => {
        const response = await axios.get(`${API_URL}/group/${groupId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },
    leaveGroup: async (groupId) => {
        const response = await axios.post(`${API_URL}/group/leave/${groupId}`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },
    addGroupExpense: async (expenseData) => {
        const response = await axios.post(`${API_URL}/group/expense`, expenseData, {
            headers: getAuthHeaders()
        });
        return response.data;
    },
    getSplitSummary: async (groupId) => {
        const response = await axios.get(`${API_URL}/group/split-summary/${groupId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },
    getSettlements: async (groupId) => {
        const response = await axios.get(`${API_URL}/group/settlement/${groupId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

export const profileService = {
    getProfile: async () => {
        const response = await axios.get(`${API_URL}/profile`, { headers: getAuthHeaders() });
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await axios.put(`${API_URL}/profile/update`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    changePassword: async (data) => {
        const response = await axios.put(`${API_URL}/profile/change-password`, data, { headers: getAuthHeaders() });
        return response.data;
    },
    uploadAvatar: async (data) => {
        const response = await axios.post(`${API_URL}/profile/upload-avatar`, data, { headers: getAuthHeaders() });
        return response.data;
    }
};
