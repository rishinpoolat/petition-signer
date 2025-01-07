import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

// Utility function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Valid BioIDs array from the requirements
const validBioIds = [
  'K1YL8VA2HG', '7DMPYAZAP2', 'D05HPPQNJ4', '2WYIM3QCK9', 'DHKFIYHMAZ',
  'LZK7P0X0LQ', 'H5C98XCENC', '6X6I6TSUFG', 'QTLCWUS8NB', 'Y4FC3F9ZGS'
];

export const signup = async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { email, fullName, dateOfBirth, password, bioId } = req.body;

    // Validate required fields
    if (!email || !fullName || !dateOfBirth || !password || !bioId) {
      console.log('Missing required fields:', { 
        hasEmail: !!email, 
        hasFullName: !!fullName, 
        hasDateOfBirth: !!dateOfBirth, 
        hasPassword: !!password, 
        hasBioId: !!bioId 
      });
      return res.status(400).json({ 
        error: 'All fields are required',
        details: 'Email, full name, date of birth, password, and BioID are required fields'
      });
    }

    // Validate BioID
    if (!validBioIds.includes(bioId)) {
      console.log('Invalid BioID provided:', bioId);
      return res.status(400).json({ error: 'Invalid BioID' });
    }

    // Check if BioID is already used
    const { data: existingBioId, error: bioIdError } = await supabase
      .from('petitioners')
      .select('bio_id')
      .eq('bio_id', bioId)
      .single();

    if (bioIdError && bioIdError.code !== 'PGRST116') {
      console.error('BioID check error:', bioIdError);
      return res.status(500).json({ 
        error: 'Error checking BioID',
        details: bioIdError
      });
    }

    if (existingBioId) {
      return res.status(400).json({ error: 'BioID already registered' });
    }

    // Check if email already exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('petitioners')
      .select('email')
      .eq('email', email)
      .single();

    if (emailError && emailError.code !== 'PGRST116') {
      console.error('Email check error:', emailError);
      return res.status(500).json({ 
        error: 'Error checking email',
        details: emailError
      });
    }

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in Supabase
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
      console.error('Signup insert error:', insertError);
      return res.status(400).json({ 
        error: 'Error creating user',
        details: insertError.message,
        code: insertError.code
      });
    }

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Set JWT as HTTP-Only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return success response
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
    console.error('Unexpected signup error:', error);
    res.status(500).json({ 
      error: 'Server error during signup',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if it's admin login
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

    // Regular petitioner login
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
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};