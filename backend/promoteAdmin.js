const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'admin@expense.com'; // Previously used during verification
        const user = await User.findOneAndUpdate({ email }, { isAdmin: true }, { new: true });

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
