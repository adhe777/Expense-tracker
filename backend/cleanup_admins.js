const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const userSchema = new mongoose.Schema({ name: String, email: String, role: String }, { timestamps: true });
const User = mongoose.model('User', userSchema, 'users');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const admins = await User.find({ role: 'system_admin' });
    console.log('Admins found:', JSON.stringify(admins.map(a => ({ id: a._id, name: a.name, email: a.email }))));

    if (admins.length > 1) {
        // Keep the first one, delete extras
        const toDelete = admins.slice(1);
        for (const a of toDelete) {
            await User.findByIdAndDelete(a._id);
            console.log(`Deleted extra admin: ${a.email}`);
        }
    }

    console.log('Done.');
    mongoose.disconnect();
}).catch(err => { console.error(err); process.exit(1); });
