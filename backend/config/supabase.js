import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
      const { data, error } = await this.supabase
        .from('petitioners')  // Changed from 'users' to 'petitioners'
        .select('*')
        .limit(1);

      if (error) throw error;

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
}

export const db = new Database();
export const supabase = db.supabase;