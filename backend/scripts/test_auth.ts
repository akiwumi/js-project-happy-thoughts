import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modals/User.js';

dotenv.config();

const API_URL = 'http://localhost:8080/auth';
const TEST_USER = {
    name: 'Test Verify User',
    email: 'testverify@example.com',
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

        if (!regData.success && !regData.message.includes('successful')) {
            throw new Error('Registration failed');
        }

        // 2. Get Token from DB
        console.log('2. Retrieving verification token from DB...');
        const user = await User.findOne({ email: TEST_USER.email });
        if (!user || !user.verificationToken) {
            throw new Error('User not found or no verification token');
        }
        const token = user.verificationToken;
        console.log('Verification Token:', token);

        // 3. Verify Email
        console.log('3. Verifying email...');
        const verifyRes = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const verifyData = await verifyRes.json();
        console.log('Verification response:', verifyData);

        if (!verifyData.success) {
            throw new Error('Verification failed');
        }

        // 4. Login
        console.log('4. Logging in...');
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

        console.log('SUCCESS: Full auth flow verified!');
    } catch (error) {
        console.error('FAILED:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
};

run();
