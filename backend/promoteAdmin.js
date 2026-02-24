const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'admin@gmail.com';
        const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });

        if (user) {
            console.log(`User ${user.name} (${user.email}) promoted to Admin successfully!`);
        } else {
            console.log(`User with email ${email} not found.`);
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

promoteUser();
