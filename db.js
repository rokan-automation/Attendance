const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://cwxhvuusxugrgdzlepza.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_9ici-cxL6WCB7Pu0hi4ugg_0O59hhb8';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;