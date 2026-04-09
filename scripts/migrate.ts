import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'sales_advisor.db');
const dataDir = join(process.cwd(), 'data');

if (!existsSync(dataDir)) {
	mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);

console.log('Running migrations...');
migrate(db, { migrationsFolder: './drizzle/migrations' });
console.log('Migrations complete ✓');

sqlite.close();
