/**
 * Migration: Reads existing `/uploads/...` paths from all DB tables
 * and converts the actual files on disk to Base64 data-URLs stored in DB.
 * 
 * Runs once on server startup. Safe to re-run — skips records already
 * migrated (those whose value already starts with 'data:').
 */
const fs = require('fs');
const path = require('path');
const { poolPromise, sql } = require('../db');

// Base directory of the server (where uploads/ lives)
const SERVER_DIR = path.join(__dirname, '..');

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB limit

function fileToBase64DataUrl(filePath) {
    try {
        const absolutePath = path.join(SERVER_DIR, filePath);
        if (!fs.existsSync(absolutePath)) return null;

        const stat = fs.statSync(absolutePath);
        if (stat.size > MAX_FILE_SIZE_BYTES) {
            console.warn(`[Migration] Skipping large file (${(stat.size / 1024 / 1024).toFixed(1)} MB): ${filePath}`);
            return null;
        }

        const buffer = fs.readFileSync(absolutePath);
        const ext = path.extname(filePath).toLowerCase();
        const mimeMap = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.png': 'image/png', '.gif': 'image/gif',
            '.webp': 'image/webp', '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
        const mime = mimeMap[ext] || 'application/octet-stream';
        return `data:${mime};base64,${buffer.toString('base64')}`;
    } catch (e) {
        console.warn(`[Migration] Could not read file: ${filePath}`, e.message);
        return null;
    }
}

async function migrateTable(pool, tableName, idColumn, pathColumn) {
    try {
        const result = await pool.request().query(
            `SELECT ${idColumn}, ${pathColumn} FROM ${tableName} WHERE ${pathColumn} IS NOT NULL AND ${pathColumn} NOT LIKE 'data:%' AND ${pathColumn} LIKE '/uploads/%'`
        );
        let count = 0;
        for (const row of result.recordset) {
            const dataUrl = fileToBase64DataUrl(row[pathColumn]);
            if (dataUrl) {
                try {
                    // Use a long timeout (5 minutes) for large files like PDFs
                    const req = pool.request();
                    req.timeout = 300000;
                    req.input('id', row[idColumn]);
                    req.input('data', sql.NVarChar(sql.MAX), dataUrl);
                    await req.query(`UPDATE ${tableName} SET ${pathColumn} = @data WHERE ${idColumn} = @id`);
                    count++;
                } catch (rowErr) {
                    console.warn(`[Migration] Skipped row ${row[idColumn]} in ${tableName}:`, rowErr.message);
                }
            }
        }
        if (count > 0) console.log(`[Migration] ${tableName}: Migrated ${count} record(s).`);
    } catch (err) {
        console.error(`[Migration] Error migrating ${tableName}:`, err.message);
    }
}

async function migrateFilesToDb() {
    try {
        const pool = await poolPromise;

        await migrateTable(pool, 'ActivityPhotos', 'id', 'image_path');
        await migrateTable(pool, 'BannerLinks', 'ID', 'ImageUrl');
        // await migrateTable(pool, 'Schedules', 'ID', 'FilePath');
        // await migrateTable(pool, 'RelatedLinks', 'ID', 'Url');
        await migrateTable(pool, 'ChiefProfile', 'id', 'image_path');
        await migrateTable(pool, 'ExecutiveBoard', 'id', 'image_path');
        await migrateTable(pool, 'Departments', 'id', 'image_path');
        await migrateTable(pool, 'NursingPRNews', 'ID', 'Url');
        // Previously missing routes
        // await migrateTable(pool, 'News', 'ID', 'FilePath');
        // await migrateTable(pool, 'NewsAttachments', 'ID', 'FilePath');
        await migrateTable(pool, 'Posters', 'id', 'image_path');
        await migrateTable(pool, 'Posters', 'id', 'link_url');
        await migrateTable(pool, 'OrgChart', 'Id', 'Photo');
        await migrateTable(pool, 'HealthKnowledge', 'id', 'image_path');
        await migrateTable(pool, 'HealthKnowledge', 'id', 'file_path');


        // Files table: migrate both file_path and file_data
        try {
            const filesResult = await pool.request().query(
                `SELECT id, file_path FROM Files WHERE file_data IS NULL AND file_path IS NOT NULL AND file_path NOT LIKE 'data:%'`
            );
            let fileCount = 0;
            for (const row of filesResult.recordset) {
                const dataUrl = fileToBase64DataUrl(row.file_path);
                if (dataUrl) {
                    await pool.request()
                        .input('id', row.id)
                        .input('data', sql.NVarChar(sql.MAX), dataUrl)
                        .query(`UPDATE Files SET file_data = @data, file_path = @data WHERE id = @id`);
                    fileCount++;
                }
            }
            if (fileCount > 0) console.log(`[Migration] Files: Migrated ${fileCount} record(s).`);
        } catch (err) {
            console.error('[Migration] Error migrating Files table:', err.message);
        }

        console.log('[Migration] Existing files migration complete.');
    } catch (err) {
        console.error('[Migration] migrateFilesToDb error:', err.message);
    }
}

module.exports = { migrateFilesToDb };
