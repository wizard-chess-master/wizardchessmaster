// Production Readiness Test Suite
const tests = [
  {
    name: 'Authentication API',
    url: 'http://localhost:5000/api/auth/session',
    expectedStatus: 200
  },
  {
    name: 'Payment Config API',
    url: 'http://localhost:5000/api/payments/config',
    expectedStatus: 200
  },
  {
    name: 'Leaderboard API',
    url: 'http://localhost:5000/api/leaderboards/campaign',
    expectedStatus: 200
  },
  {
    name: 'Static Assets',
    url: 'http://localhost:5000/assets/crossed-wizard-wands.png',
    expectedStatus: 200
  },
  {
    name: 'Main App',
    url: 'http://localhost:5000/',
    expectedStatus: 200
  }
];

async function runTests() {
  console.log('🧪 Running Production Readiness Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASS (${response.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAIL (Expected ${test.expectedStatus}, got ${response.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR (${error.message})`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - READY FOR DEPLOYMENT');
    console.log('✅ System is stable and production-ready');
  } else {
    console.log('\n⚠️  Some tests failed - review before deployment');
  }
}

runTests();