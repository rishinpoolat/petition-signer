import { supabase } from '../config/supabase.js';

export const getAllPetitions = async (req, res) => {
  try {
    const { data: petitions, error } = await supabase
      .from('petitions')
      .select(`
        *,
        signatures (count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedPetitions = petitions.map(petition => ({
      ...petition,
      signature_count: petition.signatures?.[0]?.count || 0
    }));

    res.json(transformedPetitions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petitions' });
  }
};

export const createPetition = async (req, res) => {
  try {
    const { title, content } = req.body;
    const petitioner_id = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const { data: petition, error } = await supabase
      .from('petitions')
      .insert([{
        title,
        content,
        petitioner_id,
        status: 'open',
        signature_threshold: 1000
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(petition);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create petition' });
  }
};

export const signPetition = async (req, res) => {
  const { id: petition_id } = req.params;
  const petitioner_id = req.user.id;

  try {
    const { data: petition, error: petitionError } = await supabase
      .from('petitions')
      .select('status')
      .eq('id', petition_id)
      .single();

    if (petitionError || !petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    if (petition.status !== 'open') {
      return res.status(400).json({ error: 'This petition is closed' });
    }

    const { data: existingSignature, error: signatureError } = await supabase
      .from('signatures')
      .select('id')
      .eq('petition_id', petition_id)
      .eq('petitioner_id', petitioner_id)
      .single();

    if (existingSignature) {
      return res.status(400).json({ error: 'You have already signed this petition' });
    }

    const { error: insertError } = await supabase
      .from('signatures')
      .insert([{ petition_id, petitioner_id }]);

    if (insertError) throw insertError;

    res.json({ success: true, message: 'Petition signed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign petition' });
  }
};

export const getPetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: petition, error } = await supabase
      .from('petitions')
      .select(`
        *,
        signatures (count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!petition) {
      return res.status(404).json({ error: 'Petition not found' });
    }

    const transformedPetition = {
      ...petition,
      signature_count: petition.signatures?.[0]?.count || 0
    };

    res.json(transformedPetition);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petition' });
  }
};

export const hasSignedPetition = async (req, res) => {
  try {
    const { id: petition_id } = req.params;
    const petitioner_id = req.user.id;

    const { data: signature, error } = await supabase
      .from('signatures')
      .select('id')
      .eq('petition_id', petition_id)
      .eq('petitioner_id', petitioner_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ signed: !!signature });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check signature status' });
  }
};