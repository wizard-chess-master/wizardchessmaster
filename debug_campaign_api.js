#!/usr/bin/env node

// Debug Campaign API endpoints specifically

async function testCampaignAPI() {
  console.log('🧪 Testing Campaign API Endpoints');
  console.log('='.repeat(40));
  
  const endpoints = [
    '/api/campaign/progress',
    '/api/campaign/levels',
    '/api/campaign/start',
    '/api/leaderboard/campaign',
    '/api/leaderboard/pvp',
    '/api/users/stats'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🎯 Testing: ${endpoint}`);
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers.get('content-type');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`   Response Keys: ${Object.keys(data).join(', ')}`);
        if (data.error) {
          console.log(`   ⚠️ API Error: ${data.error}`);
        }
      } else {
        const text = await response.text();
        if (text.includes('<!DOCTYPE')) {
          console.log(`   ❌ Returning HTML instead of JSON`);
        } else {
          console.log(`   📝 Response: ${text.substring(0, 100)}...`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Request Failed: ${error.message}`);
    }
  }
}

testCampaignAPI().catch(console.error);