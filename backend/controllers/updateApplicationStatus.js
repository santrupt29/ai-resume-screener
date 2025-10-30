import { supabase } from '../config/supabase.js';

async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Missing applicationId or status' });
    }

    console.log(`[DEBUG] Updating application status for ${id} to ${status}`);

    const { data, error, count } = await supabase
      .from('candidate_submissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(`[DEBUG] Error updating application status for ${id}:`, error);
      return res.status(500).json({ error: 'Failed to update application status' });
    }

    if (count === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    return res.status(200).json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
export default updateApplicationStatus;