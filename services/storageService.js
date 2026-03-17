const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET || 'devdoc-documents';

class StorageService {
    /**
     * Upload a file to Supabase Storage
     * @param {Buffer} buffer - The file buffer
     * @param {string} userId - The user ID (for path organization)
     * @param {string} projectId - The project ID (for path organization)
     * @param {string} originalName - The original file name
     * @param {string} mimeType - The file MIME type
     * @returns {Object} { url, storagePath }
     */
    static async uploadFile(buffer, userId, projectId, originalName, mimeType) {
        // Create a unique path: userId/projectId/timestamp-filename
        const timestamp = Date.now();
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${userId}/${projectId}/${timestamp}-${safeName}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, buffer, {
                contentType: mimeType,
                upsert: false
            });

        if (error) {
            throw new Error(`Failed to upload file to storage: ${error.message}`);
        }

        // Get the public URL
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

        return {
            url: data.publicUrl,
            storagePath
        };
    }

    /**
     * Delete a file from Supabase Storage
     * @param {string} storagePath - The path within the bucket
     * @returns {boolean}
     */
    static async deleteFile(storagePath) {
        if (!storagePath) return false;

        const { error } = await supabase.storage
            .from(BUCKET)
            .remove([storagePath]);

        if (error) {
            console.error(`[StorageService] Failed to delete file: ${error.message}`);
            return false;
        }

        return true;
    }
}

module.exports = StorageService;
