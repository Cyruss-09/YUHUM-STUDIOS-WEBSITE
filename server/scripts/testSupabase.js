const { supabase } = require('../config/supabase');

async function testConnection() {
    console.log('Testing Supabase connection...');

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            process.exit(1);
        }

        console.log('✅ Supabase connected successfully!');
        console.log('Query result:', data);
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        process.exit(1);
    }
}

testConnection();