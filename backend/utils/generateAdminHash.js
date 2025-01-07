import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const ADMIN_EMAIL = 'admin@petition.parliament.sr';
const ADMIN_PASSWORD = '2025%shangrila';

const setupAdmin = async () => {
  try {
    // Generate hash for admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (existingAdmin) {
      // Update existing admin's password
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password_hash: hashedPassword })
        .eq('email', ADMIN_EMAIL);

      if (updateError) {
        console.error('Error updating admin:', updateError);
        return;
      }
      console.log('Admin password updated successfully');
    } else {
      // Create new admin account
      const { error: insertError } = await supabase
        .from('admins')
        .insert([
          {
            email: ADMIN_EMAIL,
            password_hash: hashedPassword
          }
        ]);

      if (insertError) {
        console.error('Error creating admin:', insertError);
        return;
      }
      console.log('Admin account created successfully');
    }

  } catch (error) {
    console.error('Setup admin error:', error);
  }
  process.exit(0);
};

// Run the setup
setupAdmin();