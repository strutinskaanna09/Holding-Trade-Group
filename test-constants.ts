
import { CATEGORY_GROUPS } from './apps/web/lib/constants';

const slug = 'flour-groats';
let found = null;

for (const [group, items] of Object.entries(CATEGORY_GROUPS)) {
    if (items.includes(slug)) found = group;
}

console.log(`Slug '${slug}' belongs to group:`, found);
