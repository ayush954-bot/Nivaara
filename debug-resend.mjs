import { Resend } from 'resend';

console.log('=== Resend API Debug ===\n');

// Check API key
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('❌ RESEND_API_KEY not found!');
  process.exit(1);
}

console.log('✓ API Key found:', apiKey.substring(0, 10) + '...');
console.log('✓ API Key length:', apiKey.length);
console.log('✓ Starts with "re_":', apiKey.startsWith('re_'));
console.log('');

const resend = new Resend(apiKey);

console.log('Attempting to send test email...\n');

try {
  const result = await resend.emails.send({
    from: 'Nivaara Test <onboarding@resend.dev>',
    to: 'info@nivaararealty.com',
    subject: 'Final Debug Test - ' + new Date().toISOString(),
    html: '<h2>Debug Test Email</h2><p>If you see this, emails are working!</p>',
  });
  
  console.log('✅ EMAIL SENT SUCCESSFULLY!');
  console.log('\nFull Response:');
  console.log(JSON.stringify(result, null, 2));
  console.log('\nEmail ID:', result.data?.id || 'No ID returned');
  console.log('\nNow check:');
  console.log('1. Resend dashboard: https://resend.com/emails');
  console.log('2. info@nivaararealty.com inbox');
  
} catch (error) {
  console.error('❌ EMAIL SEND FAILED!');
  console.error('\nError Details:');
  console.error('- Name:', error.name);
  console.error('- Message:', error.message);
  console.error('- Status Code:', error.statusCode || 'N/A');
  
  if (error.statusCode === 401) {
    console.error('\n⚠️  AUTHENTICATION ERROR - API key is invalid!');
    console.error('   Go to https://resend.com/api-keys and create a new API key');
  } else if (error.statusCode === 403) {
    console.error('\n⚠️  FORBIDDEN - API key lacks permissions');
  } else if (error.statusCode === 422) {
    console.error('\n⚠️  VALIDATION ERROR - Check email format');
  }
  
  console.error('\nFull Error Object:');
  console.error(error);
}
