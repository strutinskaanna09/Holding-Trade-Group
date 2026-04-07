
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

    // 2. Fetch a Product (e.g. sunflower honey, or first available)
    const productsRes = await fetch(`${API_URL}/products?limit=1`);
    const productsData = await productsRes.json();
    // Handle paginated or array structure
    const products = Array.isArray(productsData) ? productsData : (productsData.data || productsData.items || []);

    if (products.length === 0) {
        console.log("No products to test update on.");
        return;
    }

    const startProduct = products[0];
    console.log(`Testing update on product: ${startProduct.slug} (${startProduct.id})`);

    // 3. Update Product
    // Simulate what the frontend sends
    const payload = {
        ...startProduct,
        name_en: startProduct.name_en + (startProduct.name_en.endsWith(' (Edited)') ? '' : ' (Edited)'), // Toggle edit
        categoryId: startProduct.category?.id || startProduct.categoryId,
    };

    // Clean up as frontend does
    delete payload.category;
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const updateRes = await fetch(`${API_URL}/products/${startProduct.id}`, {
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
