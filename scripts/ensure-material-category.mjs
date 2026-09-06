// init.sql creates fresh schemas; existing databases need the additive migration once.
import { execFileSync } from 'node:child_process';
const mode = process.argv[2];
if (!['--local', '--remote'].includes(mode)) throw Error('Specify --local or --remote');
const base = ['d1', 'execute', 'jiancai-road', mode];
const result = JSON.parse(execFileSync('node_modules/.bin/wrangler', [...base, '--command=PRAGMA table_info(materials)', '--json'], {encoding:'utf8'}));
const columns = result.flatMap((entry) => entry.results ?? []);
if (!columns.length) throw Error('Initialize the database with drizzle/init.sql first');
if (!columns.some((column) => column.name === 'category')) {
  execFileSync('node_modules/.bin/wrangler', [...base, '--file=drizzle/0002_material_category.sql'], {stdio:'inherit'});
}
