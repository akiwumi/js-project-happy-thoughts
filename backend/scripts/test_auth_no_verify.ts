import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modals/User.js';

dotenv.config();

const API_URL = 'http://localhost:8080/auth';
const TEST_USER = {
    name: 'Test NoVerify User',
    email: 'testnoverify@example.com',
    password: 'password123'
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        // Cleanup
        await User.deleteOne({ email: TEST_USER.email });
        console.log('Cleaned up previous test user');

        // 1. Register
        console.log('1. Registering user...');
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });
        const regData = await regRes.json();
        console.log('Registration response:', regData);

        if (!regData.success) {
            throw new Error('Registration failed');
        }

        // 2. Login (Immediately without verification)
        console.log('2. Logging in immediately...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
        });
        const loginData = await loginRes.json();
        console.log('Login response:', loginData);

        if (!loginData.success || !loginData.token) {
            throw new Error('Login failed');
        }

        console.log('SUCCESS: Auth flow verified (No Email Verification)!');
    } catch (error) {
        console.error('FAILED:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
};

run();
