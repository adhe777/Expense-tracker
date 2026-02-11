# Expense Tracker

A full-stack expense tracking application built with React, Node.js, and MongoDB.

## Getting Started on a New PC

Follow these steps to set up and run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/adhe777/Expense-tracker.git
cd Expense-tracker
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder (you can use `.env.example` as a template):
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your **MongoDB connection string** and other configurations.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### 4. Running the Application

#### Start the Backend
In the `backend` folder:
```bash
npm run dev
```
*Note: Make sure your backend port matches what the frontend expects (currently hardcoded to `8081` in `AuthContext.jsx`).*

#### Start the Frontend
In the `frontend` folder:
```bash
npm run dev
```

## Contributing
Feel free to open issues or pull requests.
