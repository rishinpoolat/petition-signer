import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if it's the admin email
    if (email !== 'admin@petition.parliament.sr') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get admin from database
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      data: {
        id: admin.id,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSignatureThreshold = async (req, res) => {
  const { threshold } = req.body;

  try {
    if (typeof threshold !== 'number' || threshold < 0) {
      return res.status(400).json({ error: 'Invalid threshold value' });
    }

    // Update all open petitions with new threshold
    const { data, error } = await supabase
      .from('petitions')
      .update({ signature_threshold: threshold })
      .eq('status', 'open')
      .select();

    if (error) throw error;

    res.json({ message: 'Threshold updated successfully', data });
  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({ error: 'Failed to update threshold' });
  }
};

export const getPetitionStats = async (req, res) => {
  try {
    // Get all petitions with their signature counts
    const { data: petitions, error: petitionsError } = await supabase
      .from('petition_stats')
      .select('*');

    if (petitionsError) throw petitionsError;

    // Calculate additional statistics
    const stats = {
      petitions,
      totalPetitions: petitions.length,
      openPetitions: petitions.filter(p => p.status === 'open').length,
      closedPetitions: petitions.filter(p => p.status === 'closed').length,
      totalSignatures: petitions.reduce((sum, p) => sum + p.signature_count, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get petition statistics' });
  }
};

export const respondToPetition = async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  try {
    // First verify if petition exists and has met threshold
    const { data: petition, error: petitionError } = await supabase
      .from('petition_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (petitionError) throw petitionError;

    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    if (petition.signature_count < petition.signature_threshold) {
      return res.status(400).json({ 
        error: 'Petition has not met the required signature threshold' 
      });
    }

    // Update petition with response and close it
    const { data, error } = await supabase
      .from('petitions')
      .update({ 
        response,
        status: 'closed'
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ 
      message: 'Response added and petition closed successfully', 
      data 
    });
  } catch (error) {
    console.error('Respond to petition error:', error);
    res.status(500).json({ error: 'Failed to respond to petition' });
  }
};