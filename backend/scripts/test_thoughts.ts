import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Thought from '../modals/Thought.js';

dotenv.config();

const API_URL = 'http://localhost:8080/thoughts';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        // Cleanup
        await Thought.deleteMany({});
        console.log('Cleaned up thoughts collection');

        // 1. POST Thought
        console.log('1. Creating a thought...');
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello from verification script!' })
        });
        const createdThought = await createRes.json();
        console.log('Created Thought:', createdThought);

        if (!createdThought._id || createdThought.message !== 'Hello from verification script!') {
            throw new Error('Failed to create thought');
        }

        // 2. GET Thoughts
        console.log('2. Fetching thoughts...');
        const getRes = await fetch(API_URL);
        const thoughts = await getRes.json();
        console.log('Fetched Thoughts Count:', thoughts.length);

        if (thoughts.length !== 1) {
            throw new Error('Failed to fetch thoughts');
        }

        // 3. LIKE Thought
        console.log('3. Liking thought...');
        const likeRes = await fetch(`${API_URL}/${createdThought._id}/like`, {
            method: 'POST'
        });
        const likedThought = await likeRes.json();
        console.log('Liked Thought Hearts:', likedThought.hearts);

        if (likedThought.hearts !== 1) {
            throw new Error('Failed to like thought');
        }

        console.log('SUCCESS: Thoughts API verified!');
    } catch (error) {
        console.error('FAILED:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
};

run();
