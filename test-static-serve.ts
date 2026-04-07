
// Basic check if we can fetch the uploaded file from the static endpoint
// Assuming one of the files from 'ls' output exists: 516da5b4c326c5fa7f0a9d10a80b562a4.jpg

async function testStaticServe() {
    const filename = '611ef1a0b51c6472a23a128c8fbe64c8.txt'; // from previous successful upload
    const url = `http://localhost:3000/uploads/${filename}`;

    console.log(`Checking ${url}...`);
    const res = await fetch(url);

    if (res.ok) {
        console.log('Success! Static file served.');
        const text = await res.text();
        console.log('Content:', text);
    } else {
        console.log('Failed:', res.status, res.statusText);
    }
}

testStaticServe().catch(console.error);
