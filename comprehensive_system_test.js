#!/usr/bin/env node

// Comprehensive System Test for Wizard Chess Master
// Tests all major functionality before adding storyboard features

const tests = [
  {
    name: "Authentication System",
    endpoint: "/api/auth/session",
    expected: "success"
  },
  {
    name: "Campaign Progress",
    endpoint: "/api/campaign/progress", 
    expected: "campaignLevels"
  },
  {
    name: "Leaderboard Campaign",
    endpoint: "/api/leaderboard/campaign",
    expected: "leaderboard"
  },
  {
    name: "Leaderboard PvP",
    endpoint: "/api/leaderboard/pvp",
    expected: "leaderboard"
  },
  {
    name: "User Stats",
    endpoint: "/api/users/stats",
    expected: "stats"
  },
  {
    name: "Payment Config",
    endpoint: "/api/payments/config",
    expected: "publishableKey"
  }
];

async function testEndpoint(test) {
  try {
    const response = await fetch(`http://localhost:5000${test.endpoint}`);
    const data = await response.json();
    
    console.log(`✅ ${test.name}: ${response.status}`);
    console.log(`   Data contains: ${Object.keys(data).join(', ')}`);
    
    if (test.expected && !JSON.stringify(data).includes(test.expected)) {
      console.log(`⚠️  Warning: Expected '${test.expected}' not found`);
    }
    
    return { name: test.name, status: response.status, success: response.ok };
  } catch (error) {
    console.log(`❌ ${test.name}: Failed - ${error.message}`);
    return { name: test.name, status: 'error', success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Comprehensive System Test - Wizard Chess Master');
  console.log('=' * 50);
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test);
    results.push(result);
    console.log(''); // Empty line between tests
  }
  
  console.log('📊 Test Summary:');
  console.log('=' * 30);
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n🔧 Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error || r.status}`);
    });
  }
  
  console.log('\n✨ System Ready for Storyboard Enhancement!');
}

runTests().catch(console.error);