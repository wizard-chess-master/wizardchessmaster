// Simple debug script to test premium status
console.log('🔍 Testing Premium Status for Tokingteepee');

// Test login and premium detection
async function testPremiumStatus() {
  try {
    console.log('📤 Sending login request...');
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'Tokingteepee',
        password: 'WizardChess123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📥 Login Response:', JSON.stringify(loginData, null, 2));
    
    if (loginData.success && loginData.user) {
      console.log('✅ Login successful!');
      console.log('👤 Username:', loginData.user.username);
      console.log('💎 Is Premium:', loginData.user.isPremium);
      console.log('🏷️ Subscription Status:', loginData.user.subscriptionStatus);
      console.log('🆔 Subscription ID:', loginData.user.subscriptionId);
      
      if (loginData.user.isPremium) {
        console.log('🎉 USER HAS PREMIUM ACCESS!');
      } else {
        console.log('❌ User does not have premium access');
      }
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('💥 Error during test:', error.message);
  }
}

testPremiumStatus();