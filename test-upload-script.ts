
import { } from 'node:fs';
import { } from 'node:path';

// Polyfill FormData and fetch if needed (Node 18+ has them)
// We assume Node 18+

async function testUpload() {
    const API_URL = 'http://localhost:3000';

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@holding.com', password: 'admin123' })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const { access_token } = await loginRes.json() as any;
    console.log('Login successful. Token obtained.');

    // 2. Create a dummy file
    const fileContent = 'fake image content';
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'test-image.txt');

    // 3. Upload
    console.log('Uploading file...');
    const uploadRes = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_token}`
        },
        body: formData
    });

    if (!uploadRes.ok) {
        console.error('Upload failed:', uploadRes.status, uploadRes.statusText);
        console.error('Response:', await uploadRes.text());
        return;
    }

    const uploadData = await uploadRes.json();
    console.log('Upload successful:', uploadData);
}

testUpload().catch(console.error);
