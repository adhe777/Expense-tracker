const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Expense Tracker API is running...');
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
