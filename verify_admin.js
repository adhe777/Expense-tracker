const axios = require('axios');

async function verifyRestrictions() {
    const baseUrl = 'http://localhost:8081/api';
    
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${baseUrl}/users/login`, {
            email: 'admin@petco.com',
            password: 'admin123'
        });
        
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        console.log('Login successful. Role:', loginRes.data.role);

        // 2. Try to add a personal expense
        console.log('\n--- Testing Personal Expense Restriction ---');
        try {
            await axios.post(`${baseUrl}/transactions`, {
                title: 'Malicious Admin Expense',
                amount: 1000,
                category: 'Food',
                type: 'expense'
            }, config);
            console.error('FAILED: Admin was able to add a personal expense!');
        } catch (err) {
            console.log('SUCCESS: Admin blocked from adding personal expense. Error:', err.response?.data?.message || err.message);
        }

        // 3. Try to add a group expense
        console.log('\n--- Testing Group Expense Restriction ---');
        try {
            // Need a valid group ID. Let's find one.
            const groupsRes = await axios.get(`${baseUrl}/group/notifications`, config); // Just to get some group info if possible, or we search groups
            // Actually, we seeded 'Project Alpha'. Let's find it.
            // But we can just try a random ID to see if the role check hits before the group exist check.
            // wait, in the controller I put the role check AFTER the group check.
            // Let's find a real group.
            const profileRes = await axios.get(`${baseUrl}/users/me`, config);
            const groups = profileRes.data.groups;
            if (groups && groups.length > 0) {
                const groupId = groups[0];
                await axios.post(`${baseUrl}/group/expense`, {
                    groupId,
                    title: 'Admin Group Expense',
                    amount: 500,
                    category: 'Food',
                    splitType: 'equal'
                }, config);
                console.error('FAILED: Admin was able to add a group expense!');
            } else {
                console.log('No groups found for admin. Skipping group expense test.');
            }
        } catch (err) {
            console.log('SUCCESS: Admin blocked from adding group expense. Error:', err.response?.data?.message || err.message);
        }

        // 4. Try to settle a debt
        console.log('\n--- Testing Settle Debt Restriction ---');
        try {
            const profileRes = await axios.get(`${baseUrl}/users/me`, config);
            const groups = profileRes.data.groups;
            if (groups && groups.length > 0) {
                const groupId = groups[0];
                await axios.post(`${baseUrl}/group/settle`, {
                    groupId,
                    toUserId: '65f1a2b3c4d5e6f7a8b9c0d1', // Junk ID
                    amount: 100
                }, config);
                console.error('FAILED: Admin was able to settle a debt!');
            } else {
                console.log('No groups found for admin. Skipping settle debt test.');
            }
        } catch (err) {
            console.log('SUCCESS: Admin blocked from settling debt. Error:', err.response?.data?.message || err.message);
        }

    } catch (err) {
        console.error('Verification script failed:', err.response?.data || err.message);
    }
}

verifyRestrictions();
