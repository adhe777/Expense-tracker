import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

// Request interceptor for adding the JWT token to headers
API.interceptors.request.use((config) => {
    const user = sessionStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for handling common errors (like 401 Unauthorized)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem('user');
            // Check if not already on login page to avoid loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Group Services
export const groupService = {
    createGroup: async (data) => (await API.post('/group/create', data)).data,
    getGroupDetails: async (id) => (await API.get(`/group/${id}`)).data,
    addGroupExpense: async (data) => (await API.post('/group/expense', data)).data,
    getSettlements: async (groupId) => (await API.get(`/group/settlement/${groupId}`)).data,
    settleDebt: async (data) => (await API.post('/group/settle', data)).data,
    getGroupMembers: async (groupId) => (await API.get(`/group/${groupId}/members`)).data,
    getGroupExpenses: async (groupId) => (await API.get(`/group/${groupId}/expenses`)).data,
    getSplitSummary: async (groupId) => (await API.get(`/group/split-summary/${groupId}`)).data,
    inviteMember: async (data) => (await API.post('/group/invite', data)).data, // Placeholder if needed
    addMember: async (data) => (await API.post(`/group/${data.groupId}/add-member`, data)).data,
    removeMember: async (groupId, memberId) => (await API.delete(`/group/${groupId}/remove-member/${memberId}`)).data,
    leaveGroup: async (id) => (await API.post(`/group/leave/${id}`)).data,
    getNotifications: async () => (await API.get('/group/notifications')).data,
    acceptInvite: async (id) => (await API.post(`/group/invite/accept/${id}`)).data,
    rejectInvite: async (id) => (await API.post(`/group/invite/reject/${id}`)).data,
    transferAdmin: async (data) => (await API.post('/group/transfer-admin', data)).data,
};

// Budget Services
export const budgetService = {
    getBudgets: async () => (await API.get('/budgets')).data,
    setBudget: async (data) => (await API.post('/budgets', data)).data,
    deleteBudget: async (id) => (await API.delete(`/budgets/${id}`)).data,
};

// Profile Services
export const profileService = {
    getProfile: async () => (await API.get('/users/me')).data,
    updateProfile: async (data) => (await API.put('/users/profile', data)).data,
    changePassword: async (data) => (await API.put('/users/password', data)).data,
    uploadAvatar: async (data) => (await API.post('/profile/upload-avatar', data)).data,
    searchUsers: async (query) => (await API.get(`/users/search?query=${query}`)).data,
};

// Transaction Services
export const transactionService = {
    getTransactions: async () => (await API.get('/transactions')).data,
    addTransaction: async (data) => (await API.post('/transactions', data)).data,
    deleteTransaction: async (id) => (await API.delete(`/transactions/${id}`)).data,
    getStats: async () => (await API.get('/transactions/stats')).data,
};

// AI Services
export const aiService = {
    getPredictSpending: async (groupId = null) => {
        const url = groupId ? `/ai/predict?groupId=${groupId}` : '/ai/predict';
        return (await API.get(url)).data;
    },
    getPredictExpense: async (groupId = null) => {
        const url = groupId ? `/ai/predict-expense?groupId=${groupId}` : '/ai/predict-expense';
        return (await API.get(url)).data;
    },
    getAIInsights: async () => (await API.get('/ai/insights')).data,
    processChat: async (message) => (await API.post('/chat', { message })).data,
};

// Chat Services
export const chatService = {
    sendMessage: async (message) => (await API.post('/chat', { message })).data,
};

// Group Analytics Services
export const groupAnalyticsService = {
    getAnalytics: async (groupId) => (await API.get(`/group-analytics/${groupId}/analytics`)).data,
    getAIInsights: async (groupId) => (await API.get(`/group-analytics/${groupId}/ai-insights`)).data,
};

// Admin Services
export const adminService = {
    getStats: async () => (await API.get('/admin/dashboard')).data,
    getUsers: async () => (await API.get('/admin/users')).data,
    getGroups: async () => (await API.get('/admin/groups')).data,
    deleteUser: async (id) => (await API.delete(`/admin/user/${id}`)).data,
    deleteGroup: async (id) => (await API.delete(`/admin/group/${id}`)).data,
};

export default API;
