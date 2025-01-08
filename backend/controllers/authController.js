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

    const { data: newUser, error: insertError } = await supabase
      .from('petitioners')
      .insert([
        {
          email,
          full_name: fullName,
          date_of_birth: dateOfBirth,
          password_hash: hashedPassword,
          bio_id: bioId,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return res.status(400).json({ error: 'Error creating user' });
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

    const { data: user, error: userError } = await supabase
      .from('petitioners')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        bioId: user.bio_id,
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