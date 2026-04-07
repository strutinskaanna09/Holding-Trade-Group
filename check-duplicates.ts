
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({
        select: { id: true, slug: true, name_en: true, parentId: true }
    });

    console.log('--- All Categories ---');
    categories.forEach(c => {
        console.log(`[${c.id}] ${c.slug} (Parent: ${c.parentId}) - ${c.name_en}`);
    });

    console.log('\n--- Checking for Duplicates by Slug ---');
    const slugCounts = {};
    categories.forEach(c => {
        slugCounts[c.slug] = (slugCounts[c.slug] || 0) + 1;
    });

    Object.entries(slugCounts).forEach(([slug, count]) => {
        if ((count as number) > 1) {
            console.log(`Duplicate Slug: ${slug} (${count} times)`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
