const http = require('http');

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function verifyRestrictions() {
    const host = 'localhost';
    const port = 8081;

    try {
        // 1. Login as John to get a real group ID
        console.log('Logging in as John to find a group...');
        const johnLogin = await request({
            host, port, path: '/api/users/login', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'john@petco.com', password: 'password123' });

        let groupId = null;
        if (johnLogin.status === 200) {
            const profile = await request({
                host, port, path: '/api/users/me', method: 'GET',
                headers: { 'Authorization': `Bearer ${johnLogin.data.token}` }
            });
            if (profile.data.groups && profile.data.groups.length > 0) {
                const group = profile.data.groups[0];
                groupId = typeof group === 'string' ? group : group._id;
                console.log('Found Group ID:', groupId);
            }
        }

        // 2. Login as Admin
        console.log('\nLogging in as Admin...');
        const adminLogin = await request({
            host, port, path: '/api/users/login', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: 'admin@petco.com', password: 'admin123' });

        if (adminLogin.status !== 200) {
            console.error('Admin Login failed:', adminLogin.data);
            return;
        }

        const token = adminLogin.data.token;
        const authHeader = `Bearer ${token}`;
        console.log('Admin Login successful. Role:', adminLogin.data.role);

        // 3. Try to add a personal expense
        console.log('\n--- Testing Personal Expense Restriction ---');
        const personalRes = await request({
            host, port, path: '/api/transactions', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }
        }, { title: 'Malicious Admin Expense', amount: 1000, category: 'Food', type: 'expense' });

        if (personalRes.status === 403) {
            console.log('SUCCESS: Admin blocked from adding personal expense. Msg:', personalRes.data.message);
        } else {
            console.error('FAILED: Admin was not blocked correctly. Status:', personalRes.status, 'Data:', personalRes.data);
        }

        if (groupId) {
            // 4. Try to add a group expense
            console.log('\n--- Testing Group Expense Restriction ---');
            const groupExpRes = await request({
                host, port, path: '/api/group/expense', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }
            }, { groupId, title: 'Admin Group Expense', amount: 500, category: 'Food', splitType: 'equal' });

            if (groupExpRes.status === 403) {
                console.log('SUCCESS: Admin blocked from adding group expense. Msg:', groupExpRes.data.message);
            } else {
                console.error('FAILED: Admin was not blocked from group expense! Status:', groupExpRes.status, 'Data:', groupExpRes.data);
            }

            // 5. Try to settle a debt
            console.log('\n--- Testing Settle Debt Restriction ---');
            const settleRes = await request({
                host, port, path: '/api/group/settle', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }
            }, { groupId, toUserId: johnLogin.data._id, amount: 100 });

            if (settleRes.status === 403) {
                console.log('SUCCESS: Admin blocked from settling debt. Msg:', settleRes.data.message);
            } else {
                console.error('FAILED: Admin was not blocked from settling! Status:', settleRes.status, 'Data:', settleRes.data);
            }
        }

        // 6. Test Avatar Upload Endpoint (Status Check)
        console.log('\n--- Testing Avatar Upload Endpoint ---');
        // We just check if the endpoint exists (it should return 400 if no file is provided, but not 404)
        const avatarRes = await request({
            host, port, path: '/api/profile/upload-avatar', method: 'POST',
            headers: { 'Authorization': authHeader }
        });
        
        if (avatarRes.status !== 404) {
             console.log('SUCCESS: Avatar upload endpoint found. Status (expected failure without file):', avatarRes.status);
        } else {
             console.error('FAILED: Avatar upload endpoint NOT found (404)!');
        }

    } catch (err) {
        console.error('Verification script failed:', err.message);
    }
}

verifyRestrictions();
