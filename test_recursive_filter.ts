
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
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
    };

    console.log('Creating test data...');

    // 2. Create Parent Category
    const parentSlug = `parent-${Date.now()}`;
    const parentRes = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            slug: parentSlug,
            name_en: 'Parent Cat',
            name_uk: 'Батько',
            name_ru: 'Отец',
            name_ar: 'الوالد'
        })
    });
    const parent = await parentRes.json();
    console.log('Parent Created:', parent.id);

    // 3. Create Child Category
    const childSlug = `child-${Date.now()}`;
    const childRes = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            slug: childSlug,
            name_en: 'Child Cat',
            name_uk: 'Дитина',
            name_ru: 'Ребенок',
            name_ar: 'الطفل',
            parentId: parent.id
        })
    });
    const child = await childRes.json();
    console.log('Child Created:', child.id);

    // 4. Create Product in Child
    const productSlug = `prod-${Date.now()}`;
    await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            slug: productSlug,
            name_en: 'Child Product',
            name_uk: 'Продукт',
            name_ru: 'Продукт',
            name_ar: 'منتج',
            categoryId: child.id,
            images: []
        })
    });
    console.log('Product Created in Child Category');

    // 5. Test Filtering by Parent Slug
    console.log(`Fetching products for parent category: ${parentSlug}...`);
    const searchRes = await fetch(`${API_URL}/products?category=${parentSlug}`);
    const searchData = await searchRes.json();

    // Normalize data (check if array or object)
    const products = Array.isArray(searchData) ? searchData : (searchData.data || []);

    console.log('Products Found:', products.length);
    const found = products.find((p: any) => p.slug === productSlug);

    if (found) {
        console.log('SUCCESS: Product found in parent category search!');
    } else {
        console.error('FAILURE: Product NOT found in parent category search.');
        console.log('Found:', products.map((p: any) => p.slug));
    }

    // Cleanup (optional, keeping for inspection)
}

main().catch(console.error);
