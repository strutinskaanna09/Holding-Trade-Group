
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const categories = await prisma.category.findMany();
        console.log('--- Categories ---');
        const slugCounts = {};

        categories.forEach(c => {
            console.log(`[${c.id}] ${c.slug} (${c.name_en}/${c.name_uk}) - Parent: ${c.parentId}`);
            slugCounts[c.slug] = (slugCounts[c.slug] || 0) + 1;
        });

        console.log('\n--- Duplicates ---');
        Object.entries(slugCounts).forEach(([slug, count]) => {
            if (count > 1) console.log(`Slug '${slug}' appears ${count} times`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
