require('dotenv').config();
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('MONGO_URI value:', process.env.MONGO_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);
