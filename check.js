import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: profiles } = await supabase.from('profile').select('*');
  const { data: txs } = await supabase.from('transactions').select('*');
  const { data: savings } = await supabase.from('savings').select('*');
  console.log('Profiles:', profiles);
  console.log('Transactions:', txs);
  console.log('Savings:', savings);
}
check();
