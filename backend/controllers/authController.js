import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { validBioIds } from '../config/bioIds.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const signup = async (req, res) => {
  try {
    const { email, fullName, dateOfBirth, password, bioId } = req.body;

    if (!email || !fullName || !dateOfBirth || !password || !bioId) {
      return res.status(400).json({ 
        error: 'All fields are required'
      });
    }

    if (!validBioIds.includes(bioId)) {
      return res.status(400).json({ error: 'Invalid BioID' });
    }

    const { data: existingBioId, error: bioIdError } = await supabase
      .from('petitioners')
      .select('bio_id')
      .eq('bio_id', bioId)
      .single();

    if (bioIdError && bioIdError.code !== 'PGRST116') {
      console.error('Database error:', bioIdError);
      return res.status(500).json({ error: 'Error checking BioID' });
    }

    if (existingBioId) {
      return res.status(400).json({ error: 'BioID already registered' });
    }

    const { data: existingEmail, error: emailError } = await supabase
      .from('petitioners')
      .select('email')
      .eq('email', email)
      .single();

    if (emailError && emailError.code !== 'PGRST116') {
      console.error('Database error:', emailError);
      return res.status(500).json({ error: 'Error checking email' });
    }

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create auth user first
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(400).json({ error: 'Error creating user' });
    }

    // Then create petitioner profile
    const { data: newUser, error: insertError } = await supabase
      .from('petitioners')
      .insert([{
        id: authUser.user.id,
        email,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        password_hash: hashedPassword,
        bio_id: bioId,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ error: 'Error creating user profile' });
    }

    const token = generateToken(newUser.id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        bioId: newUser.bio_id,
        role: 'petitioner'
      },
      token
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (email === 'admin@petition.parliament.sr') {
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(admin.id);
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        data: {
          id: admin.id,
          email: admin.email,
          role: 'admin'
        },
        token
      });
    }

    const { data: petitioner, error: userError } = await supabase
      .from('petitioners')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !petitioner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, petitioner.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(petitioner.id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        id: petitioner.id,
        email: petitioner.email,
        fullName: petitioner.full_name,
        bioId: petitioner.bio_id,
        role: 'petitioner'
      },
      token
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check petitioners table first
    const { data: petitioner, error: petitionerError } = await supabase
      .from('petitioners')
      .select('*')
      .eq('id', userId)
      .single();

    if (petitioner) {
      return res.json({
        user: {
          id: petitioner.id,
          email: petitioner.email,
          fullName: petitioner.full_name,
          bioId: petitioner.bio_id,
          role: 'petitioner'
        }
      });
    }

    // If not found in petitioners, check admins
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single();

    if (admin) {
      return res.json({
        user: {
          id: admin.id,
          email: admin.email,
          role: 'admin'
        }
      });
    }

    res.status(404).json({ error: 'User not found' });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};