
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

function log(msg: string) {
    fs.appendFileSync('migration.log', msg + '\n')
    console.log(msg)
}

async function runMigration() {
    log('Starting migration...')

    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        log('Error: DATABASE_URL is not set in .env.local')
        process.exit(1)
    }

    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260209000000_fix_quests_schema.sql')
    if (!fs.existsSync(migrationPath)) {
        log('Error: Migration file not found: ' + migrationPath)
        process.exit(1)
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8')
    log(`Loaded migration file: ${migrationPath}`)

    // Handle connection string properly (remove quotes if present)
    const cleanDbUrl = dbUrl.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')

    const client = new Client({
        connectionString: cleanDbUrl,
        ssl: { rejectUnauthorized: false }
    })

    try {
        log('Connecting to database...')
        await client.connect()
        log('Connected.')

        log('Executing SQL...')
        await client.query(sql)
        log('Migration completed successfully!')

    } catch (err: any) {
        log('Migration failed: ' + err.message)
    } finally {
        await client.end()
    }
}

// Clear log file first
fs.writeFileSync('migration.log', '')
runMigration()
