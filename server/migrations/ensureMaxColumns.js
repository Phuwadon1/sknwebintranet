/**
 * Migration: Ensures all image/file columns are NVARCHAR(MAX)
 * Drops any dependent indexes first to allow the ALTER.
 */
const { poolPromise } = require('../db');

// Map of table -> column to upgrade to NVARCHAR(MAX)
const columnsToExpand = [
    { table: 'ActivityPhotos', column: 'image_path' },
    { table: 'BannerLinks', column: 'ImageUrl' },
    { table: 'Schedules', column: 'FilePath' },
    { table: 'RelatedLinks', column: 'Url' },
    { table: 'ChiefProfile', column: 'image_path' },
    { table: 'ExecutiveBoard', column: 'image_path' },
    { table: 'Departments', column: 'image_path' },
    { table: 'NursingPRNews', column: 'Url' },
    // Previously missing routes
    { table: 'News', column: 'FilePath' },
    { table: 'NewsAttachments', column: 'FilePath' },
    { table: 'Posters', column: 'image_path' },
    { table: 'Posters', column: 'link_url' },
    { table: 'OrgChart', column: 'Photo' },
    { table: 'HealthKnowledge', column: 'image_path' },
    { table: 'HealthKnowledge', column: 'file_path' },
];

async function ensureMaxColumns() {
    try {
        const pool = await poolPromise;

        for (const { table, column } of columnsToExpand) {
            try {
                // Check if column is already NVARCHAR(MAX) (-1 means MAX)
                const checkResult = await pool.request().query(`
                    SELECT CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = '${table}' AND COLUMN_NAME = '${column}'
                `);

                if (checkResult.recordset.length === 0) continue; // column doesn't exist
                if (checkResult.recordset[0].CHARACTER_MAXIMUM_LENGTH === -1) continue; // already MAX

                // Drop all indexes that reference this column
                const idxResult = await pool.request().query(`
                    SELECT i.name AS obj_name, 'INDEX' AS obj_type
                    FROM sys.indexes i
                    JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                    JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
                    WHERE OBJECT_NAME(i.object_id) = '${table}'
                      AND c.name = '${column}'
                      AND i.is_primary_key = 0
                    UNION ALL
                    -- Default constraints
                    SELECT dc.name, 'DEFAULT'
                    FROM sys.default_constraints dc
                    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
                    WHERE OBJECT_NAME(dc.parent_object_id) = '${table}'
                      AND c.name = '${column}'
                    UNION ALL
                    -- Check constraints
                    SELECT cc.name, 'CHECK'
                    FROM sys.check_constraints cc
                    JOIN sys.columns c ON cc.parent_object_id = c.object_id
                    WHERE OBJECT_NAME(cc.parent_object_id) = '${table}'
                      AND cc.definition LIKE '%${column}%'
                `);

                for (const obj of idxResult.recordset) {
                    if (obj.obj_type === 'INDEX') {
                        await pool.request().query(`DROP INDEX [${obj.obj_name}] ON [${table}]`);
                    } else {
                        await pool.request().query(`ALTER TABLE [${table}] DROP CONSTRAINT [${obj.obj_name}]`);
                    }
                    console.log(`[Migration] Dropped ${obj.obj_type} ${obj.obj_name} on ${table}.${column}`);
                }

                // Now ALTER the column
                await pool.request().query(`ALTER TABLE [${table}] ALTER COLUMN [${column}] NVARCHAR(MAX)`);
                console.log(`[Migration] Expanded ${table}.${column} to NVARCHAR(MAX)`);

            } catch (err) {
                console.error(`[Migration] Could not expand ${table}.${column}:`, err.message);
            }
        }

        // Ensure Files table has file_data column
        const filesCheck = await pool.request().query(`
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME='Files' AND COLUMN_NAME='file_data'
        `);
        if (filesCheck.recordset.length === 0) {
            await pool.request().query(`ALTER TABLE Files ADD file_data NVARCHAR(MAX) NULL`);
            console.log('[Migration] Added Files.file_data column');
        }

        // Ensure Files.file_path is NVARCHAR(MAX)
        const fpCheck = await pool.request().query(`
            SELECT CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME='Files' AND COLUMN_NAME='file_path'
        `);
        if (fpCheck.recordset.length > 0 && fpCheck.recordset[0].CHARACTER_MAXIMUM_LENGTH !== -1) {
            await pool.request().query(`ALTER TABLE Files ALTER COLUMN file_path NVARCHAR(MAX)`);
            console.log('[Migration] Expanded Files.file_path to NVARCHAR(MAX)');
        }

        console.log('[Migration] Column size check complete.');
    } catch (err) {
        console.error('[Migration] ensureMaxColumns error:', err.message);
    }
}

module.exports = { ensureMaxColumns };
