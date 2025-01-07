import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment variables');
}

class Database {
    constructor() {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async testConnection() {
        try {
            // Simple test query to verify connection
            const { data, error } = await this.supabase
                .from('petitioners')
                .select('*')
                .limit(1);

            if (error) throw error;

            console.log('Supabase connection test successful');
            return { 
                success: true, 
                result: { message: 'Connected successfully' }
            };
        } catch (error) {
            console.error('Connection test failed:', error);
            return { 
                success: false, 
                error: error.message,
                details: error
            };
        }
    }

    // Generic query method
    async query(table, query) {
        try {
            const { data, error } = await this.supabase
                .from(table)
                .select(query);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    }

    // Insert method
    async insert(table, data) {
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .insert(data)
                .select();

            if (error) throw error;
            return result;
        } catch (error) {
            console.error('Insert error:', error);
            throw error;
        }
    }

    // Update method
    async update(table, data, conditions) {
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .update(data)
                .match(conditions)
                .select();

            if (error) throw error;
            return result;
        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }

    // Delete method
    async delete(table, conditions) {
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .delete()
                .match(conditions)
                .select();

            if (error) throw error;
            return result;
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }
}

const db = new Database();
export default db;