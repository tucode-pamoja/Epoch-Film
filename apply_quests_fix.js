
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Config
const LOG_FILE = 'migration.log';
const ENV_FILE = '.env.local';

// Setup Logging
function log(msg) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}`;
    console.log(logMsg);
    try {
        fs.appendFileSync(LOG_FILE, logMsg + '\n');
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

// Clear log
try {
    fs.writeFileSync(LOG_FILE, '');
} catch (e) { }

log('Script started.');

// Load Env
const envPath = path.resolve(process.cwd(), ENV_FILE);
if (fs.existsSync(envPath)) {
    dotenv.config({ path: ENV_FILE });
    log(`Loaded environment from ${ENV_FILE}`);
} else {
    log(`Warning: ${ENV_FILE} not found.`);
}

async function runMigration() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        log('Error: DATABASE_URL is missing in environment.');
        process.exit(1);
    }

    // Clean URL
    const cleanDbUrl = dbUrl.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    log(`Database URL found (masked): ${cleanDbUrl.replace(/:[^:]*@/, ':****@')}`);

    const migrationFileRel = 'supabase/migrations/20260209000000_fix_quests_schema.sql';
    const migrationPath = path.resolve(process.cwd(), migrationFileRel);

    if (!fs.existsSync(migrationPath)) {
        log(`Error: Migration file not found at ${migrationPath}`);
        process.exit(1);
    }

    let sql;
    try {
        sql = fs.readFileSync(migrationPath, 'utf-8');
        log(`Read SQL file (${sql.length} bytes).`);
    } catch (e) {
        log(`Error reading SQL file: ${e.message}`);
        process.exit(1);
    }

    const client = new Client({
        connectionString: cleanDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        log('Connecting to database...');
        await client.connect();
        log('Connected successfully.');

        log('Executing migration SQL...');
        await client.query(sql);
        log('Migration executed successfully!');

    } catch (err) {
        log(`Migration FAILED: ${err.message}`);
        if (err.stack) log(err.stack);
    } finally {
        await client.end();
        log('Database connection closed.');
    }
}

runMigration().catch(err => {
    log(`Unhandled error: ${err.message}`);
});
