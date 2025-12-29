import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailSending() {
  console.log('Testing email configuration...\n');
  
  // Test 1: Check API key
  console.log('1. Checking Resend API key...');
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    process.exit(1);
  }
  console.log('✓ API key is configured\n');
  
  // Test 2: List domains
  console.log('2. Checking verified domains in Resend...');
  try {
    const domains = await resend.domains.list();
    console.log(`✓ Found ${domains.data?.data?.length || 0} domain(s):`);
    
    if (domains.data?.data && domains.data.data.length > 0) {
      domains.data.data.forEach(domain => {
        console.log(`  - ${domain.name}: ${domain.status} (Region: ${domain.region})`);
        if (domain.status !== 'verified') {
          console.log(`    ⚠️  Domain not verified yet!`);
        }
      });
    } else {
      console.log('  ⚠️  No domains configured in Resend');
      console.log('  → You need to add nivaararealty.com in Resend dashboard');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Failed to list domains:', error.message);
    console.log('');
  }
  
  // Test 3: Try sending a test email
  console.log('3. Attempting to send test email...');
  try {
    const result = await resend.emails.send({
      from: 'Nivaara Test <inquiries@updates.nivaararealty.com>',
      to: 'info@nivaararealty.com',
      subject: 'Test Email from Nivaara Website',
      html: '<p>This is a test email to verify email configuration.</p><p>If you receive this, email notifications are working!</p>',
    });
    
    console.log('✓ Email sent successfully!');
    console.log(`  Email ID: ${result.data?.id}`);
    console.log(`  Check info@nivaararealty.com inbox`);
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(`  Error: ${error.message}`);
    
    if (error.message?.includes('domain') || error.message?.includes('verify')) {
      console.log('\n📝 Solution:');
      console.log('  Your domain needs to be verified in Resend.');
      console.log('  1. Go to https://resend.com/domains');
      console.log('  2. Check if nivaararealty.com shows as "verified"');
      console.log('  3. If not, check DNS records in GoDaddy match exactly');
      console.log('  4. DNS propagation can take 15-30 minutes');
    }
    
    if (error.statusCode) {
      console.log(`  Status Code: ${error.statusCode}`);
    }
  }
}

testEmailSending().catch(console.error);
