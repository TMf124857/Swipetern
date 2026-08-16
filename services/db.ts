import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Opportunity {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  requirements: string;
  tags: string[];
  created_at: string;
}

export interface Interaction {
  id: string;
  sender_id: string;
  target_id: string;
  opportunity_id?: string;
  action: 'like' | 'pass';
  created_at: string;
}

export interface Match {
  id: string;
  student_id: string;
  opportunity_id: string;
  compliance_status: {
    university_approval: 'pending' | 'approved' | 'rejected';
    visa_status: 'pending' | 'approved' | 'rejected' | 'not_required';
    travel_docs: 'pending' | 'approved' | 'rejected';
  };
  progress_percentage: number;
  created_at: string;
}

/**
 * Fetch active opportunities that the current user has NOT interacted with yet.
 * Cross-references the `interactions` table for matching sender_id / opportunity_id.
 */
export async function fetchActiveOpportunities(userId: string): Promise<Opportunity[]> {
  try {
    // 1. Fetch all interaction opportunity IDs for this user
    const { data: swipedData, error: swipeError } = await supabase
      .from('interactions')
      .select('opportunity_id')
      .eq('sender_id', userId)
      .not('opportunity_id', 'is', null);

    if (swipeError) {
      console.error('Error fetching interactions:', swipeError);
      throw swipeError;
    }

    const swipedOppIds = (swipedData || [])
      .map((item) => item.opportunity_id)
      .filter((id): id is string => typeof id === 'string');

    // 2. Fetch opportunities excluding the swiped ones
    let query = supabase.from('opportunities').select('*');

    if (swipedOppIds.length > 0) {
      query = query.not('id', 'in', `(${swipedOppIds.join(',')})`);
    }

    const { data: opportunities, error: oppError } = await query;

    if (oppError) {
      console.error('Error fetching opportunities:', oppError);
      throw oppError;
    }

    return opportunities || [];
  } catch (error) {
    console.error('fetchActiveOpportunities failed:', error);
    return [];
  }
}

/**
 * Record a card swipe interaction ('like' or 'pass') for a given user.
 */
export async function recordInteraction(
  userId: string,
  targetId: string,
  oppId: string,
  action: 'like' | 'pass'
): Promise<{ success: boolean; is_match: boolean }> {
  try {
    // Record interaction in DB
    const { error } = await supabase
      .from('interactions')
      .insert({
        sender_id: userId,
        target_id: targetId,
        opportunity_id: oppId,
        action: action
      });

    if (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }

    // If swipe right (like), check if reciprocal match exists
    if (action === 'like') {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('student_id', userId)
        .eq('opportunity_id', oppId)
        .maybeSingle();

      if (matchError) {
        console.error('Error checking mutual match:', matchError);
      }

      return {
        success: true,
        is_match: !!matchData
      };
    }

    return { success: true, is_match: false };
  } catch (error) {
    console.error('recordInteraction failed:', error);
    return { success: false, is_match: false };
  }
}
