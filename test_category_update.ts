
// import fetch from 'node-fetch'; // fetch is global

const API_URL = 'http://localhost:3000';

async function main() {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@holding.com', password: 'admin123' })
    });

    if (!loginRes.ok) {
        throw new Error(`Login failed: ${await loginRes.text()}`);
    }

    const { access_token } = await loginRes.json();
    console.log('Got token:', access_token.substring(0, 20) + '...');

    // 2. Fetch Categories
    const catsRes = await fetch(`${API_URL}/categories`);
    const categories = await catsRes.json();
    const barley = categories.find((c: any) => c.slug === 'barley');

    if (!barley) {
        throw new Error('Barley category not found');
    }

    console.log('Found category:', barley.id, barley.name_en);

    // 3. Update Category
    const payload = {
        slug: barley.slug,
        name_en: barley.name_en,
        name_uk: barley.name_uk,
        name_ru: barley.name_ru,
        name_ar: barley.name_ar,
        image: 'http://localhost:3000/uploads/test.jpg', // Dummy image
        // Optional fields
        parentId: barley.parentId // Should be null or undefined
    };

    console.log('Sending payload:', payload);

    const updateRes = await fetch(`${API_URL}/categories/${barley.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify(payload)
    });

    if (!updateRes.ok) {
        console.error('Update FAILED:', updateRes.status);
        const errorText = await updateRes.text();
        console.log('Error Body:', errorText);
    } else {
        console.log('Update SUCCESS:', await updateRes.json());
    }
}

main().catch(console.error);
