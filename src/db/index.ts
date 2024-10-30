import { Database } from "bun:sqlite";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";

import type * as schema from "./schema";

const sqlite = new Database(process.env.DB_FILE_NAME!);
const db: BunSQLiteDatabase<typeof schema> = drizzle({ client: sqlite });

export default db;
