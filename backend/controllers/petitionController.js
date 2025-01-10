import { supabase } from '../config/supabase.js';

export const getAllPetitions = async (req, res) => {
  try {
    let query = supabase
      .from('petition_stats')
      .select('*')
      .order('created_at', { ascending: false });

    // Add status filter if provided
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format for REST API if format=api is specified
    if (req.query.format === 'api') {
      return res.json({
        petitions: data.map(petition => ({
          petition_id: petition.id,
          status: petition.status,
          petition_title: petition.title,
          petition_text: petition.content,
          petitioner: petition.petitioner_email,
          signatures: petition.signature_count.toString(),
          response: petition.response || ""
        }))
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching petitions:', error);
    res.status(500).json({ error: 'Failed to fetch petitions' });
  }
};

export const getPetitionStats = async (req, res) => {
  try {
    const { data: petitions, error: petitionsError } = await supabase
      .from('petition_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (petitionsError) throw petitionsError;

    const stats = {
      totalPetitions: petitions.length,
      openPetitions: petitions.filter(p => p.status === 'open').length,
      closedPetitions: petitions.filter(p => p.status === 'closed').length,
      totalSignatures: petitions.reduce((sum, p) => sum + p.signature_count, 0),
      petitions
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching petition stats:', error);
    res.status(500).json({ error: 'Failed to fetch petition statistics' });
  }
};

export const getPetition = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('petition_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching petition:', error);
    res.status(500).json({ error: 'Failed to fetch petition' });
  }
};

// New method to get all petitions with signed status
export const getPetitionsWithSignedStatus = async (req, res) => {
  try {
    // Get all petitions first
    const { data: petitions, error: petitionsError } = await supabase
      .from('petition_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (petitionsError) throw petitionsError;

    // Get all signatures for current user
    const { data: userSignatures, error: signaturesError } = await supabase
      .from('signatures')
      .select('petition_id')
      .eq('petitioner_id', req.user.id);

    if (signaturesError) throw signaturesError;

    // Create a Set of signed petition IDs for efficient lookup
    const signedPetitionIds = new Set(userSignatures?.map(sig => sig.petition_id) || []);

    // Add signed status to each petition
    const petitionsWithStatus = petitions.map(petition => ({
      ...petition,
      signed: signedPetitionIds.has(petition.id)
    }));

    res.json(petitionsWithStatus);
  } catch (error) {
    console.error('Error fetching petitions with signed status:', error);
    res.status(500).json({ error: 'Failed to fetch petitions' });
  }
};

export const createPetition = async (req, res) => {
  try {
    const { title, content } = req.body;
    const petitioner_id = req.user.id;

    // Get current threshold
    const { data: settings, error: settingsError } = await supabase
      .from('petitions')
      .select('signature_threshold')
      .limit(1)
      .single();

    const threshold = settings?.signature_threshold || 100; // Default threshold

    const { data, error } = await supabase
      .from('petitions')
      .insert([
        { 
          title, 
          content, 
          petitioner_id,
          signature_threshold: threshold
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating petition:', error);
    res.status(500).json({ error: 'Failed to create petition' });
  }
};

export const signPetition = async (req, res) => {
  try {
    const { id: petition_id } = req.params;
    const petitioner_id = req.user.id;

    // Check if petition exists and is open
    const { data: petition, error: petitionError } = await supabase
      .from('petitions')
      .select('status')
      .eq('id', petition_id)
      .single();

    if (petitionError || !petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    if (petition.status !== 'open') {
      return res.status(400).json({ error: 'Petition is closed' });
    }

    // Check if already signed
    const { data: existingSignature, error: signatureError } = await supabase
      .from('signatures')
      .select('*')
      .eq('petition_id', petition_id)
      .eq('petitioner_id', petitioner_id)
      .single();

    if (existingSignature) {
      return res.status(400).json({ error: 'Already signed this petition' });
    }

    // Add signature
    const { data, error } = await supabase
      .from('signatures')
      .insert([
        { petition_id, petitioner_id }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error signing petition:', error);
    res.status(500).json({ error: 'Failed to sign petition' });
  }
};

export const hasSignedPetition = async (req, res) => {
  try {
    const { id: petition_id } = req.params;
    const petitioner_id = req.user.id;

    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .eq('petition_id', petition_id)
      .eq('petitioner_id', petitioner_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ signed: !!data });
  } catch (error) {
    console.error('Error checking signature:', error);
    res.status(500).json({ error: 'Failed to check signature status' });
  }
};

export const updateThreshold = async (req, res) => {
  try {
    const { threshold } = req.body;

    if (typeof threshold !== 'number' || threshold < 0) {
      return res.status(400).json({ error: 'Invalid threshold value' });
    }

    const { data, error } = await supabase
      .from('petitions')
      .update({ signature_threshold: threshold })
      .eq('status', 'open')
      .select();

    if (error) throw error;

    res.json({ message: 'Threshold updated successfully', data });
  } catch (error) {
    console.error('Error updating threshold:', error);
    res.status(500).json({ error: 'Failed to update threshold' });
  }
};

export const respondToPetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response is required' });
    }

    // Verify petition exists and has met threshold
    const { data: petition, error: petitionError } = await supabase
      .from('petition_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (petitionError || !petition) {
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
    console.error('Error responding to petition:', error);
    res.status(500).json({ error: 'Failed to respond to petition' });
  }
};