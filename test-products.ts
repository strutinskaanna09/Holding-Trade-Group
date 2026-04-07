
async function testProducts() {
    console.log('Fetching products...');
    try {
        const res = await fetch('http://localhost:3000/products');
        console.log('Status:', res.status, res.statusText);
        if (!res.ok) {
            console.log('Response text:', await res.text());
        } else {
            const data = await res.json();
            console.log('Products found:', data.data?.length);
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}
testProducts();
