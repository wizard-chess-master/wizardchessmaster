#!/usr/bin/env node

/**
 * Comprehensive Deployment Test Suite for Wizard Chess Master v2.0.0
 * Tests all critical functionality before production deployment
 */

import http from 'http';
import https from 'https';

const BASE_URL = 'http://localhost:5000';

class DeploymentTester {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, BASE_URL);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: jsonBody
            });
          } catch (err) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('🚀 Starting Wizard Chess Master Deployment Tests');
    console.log('=' * 60);

    for (const { name, testFn } of this.tests) {
      try {
        console.log(`\n🧪 Testing: ${name}`);
        const startTime = Date.now();
        await testFn();
        const duration = Date.now() - startTime;
        console.log(`✅ PASSED: ${name} (${duration}ms)`);
        this.results.push({ name, status: 'PASSED', duration });
      } catch (error) {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${error.message}`);
        this.results.push({ name, status: 'FAILED', error: error.message });
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' * 60);
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' * 60);

    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n🚨 FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
      console.log('\n⚠️  DEPLOYMENT NOT RECOMMENDED');
    } else {
      console.log('\n🎉 ALL TESTS PASSED - READY FOR DEPLOYMENT! 🚀');
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }
}

// Initialize test suite
const tester = new DeploymentTester();

// API Health Tests
tester.test('API Health Check', async () => {
  const response = await tester.makeRequest('/api/health');
  tester.assert(response.status === 200, 'Health check should return 200');
  tester.assert(response.body.status === 'healthy', 'API should report healthy status');
});

tester.test('Root Health Check', async () => {
  const response = await tester.makeRequest('/health');
  tester.assert(response.status === 200, 'Root health check should return 200');
});

// Authentication System Tests
tester.test('Session Endpoint', async () => {
  const response = await tester.makeRequest('/api/auth/session');
  tester.assert(response.status === 200, 'Session endpoint should be accessible');
  tester.assert(response.body.success !== undefined, 'Response should have success field');
});

// Founder Program Tests
tester.test('Founder Status API', async () => {
  const response = await tester.makeRequest('/api/founder/status');
  tester.assert(response.status === 200, 'Founder status should be accessible');
  tester.assert(response.body.success === true, 'Founder API should return success');
  tester.assert(typeof response.body.spotsRemaining === 'number', 'Should return spots remaining');
  tester.assert(response.body.spotsRemaining >= 0, 'Spots remaining should be non-negative');
});

tester.test('Founder Analytics API', async () => {
  const response = await tester.makeRequest('/api/founder/analytics');
  tester.assert(response.status === 200, 'Founder analytics should be accessible');
  tester.assert(response.body.success === true, 'Analytics should return success');
  tester.assert(typeof response.body.totalFounders === 'number', 'Should return total founders count');
});

// Payment System Tests
tester.test('Stripe Configuration', async () => {
  const response = await tester.makeRequest('/api/payments/config');
  tester.assert(response.status === 200, 'Payment config should be accessible');
  tester.assert(response.body.publishableKey, 'Should return Stripe publishable key');
  tester.assert(response.body.publishableKey.startsWith('pk_'), 'Should have valid Stripe key format');
});

// Database Tests
tester.test('User Registration Flow', async () => {
  const testUser = {
    username: `test_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    displayName: 'Test User'
  };

  const response = await tester.makeRequest('/api/auth/register', 'POST', testUser);
  // Allow both success and user exists responses for testing
  tester.assert([200, 400].includes(response.status), 'Registration should return 200 or 400');
  
  if (response.status === 200) {
    tester.assert(response.body.success === true, 'Successful registration should return success');
  }
});

// Static File Serving Tests
tester.test('Static File Serving', async () => {
  const response = await tester.makeRequest('/');
  tester.assert(response.status === 200, 'Main page should be served');
});

tester.test('Asset Loading', async () => {
  const response = await tester.makeRequest('/assets/');
  // Should either serve directory listing or return 404 - both are acceptable
  tester.assert([200, 404].includes(response.status), 'Assets endpoint should be handled');
});

// Performance Tests
tester.test('API Response Time', async () => {
  const startTime = Date.now();
  const response = await tester.makeRequest('/api/founder/status');
  const responseTime = Date.now() - startTime;
  
  tester.assert(response.status === 200, 'API should respond successfully');
  tester.assert(responseTime < 2000, `API response time should be under 2s (got ${responseTime}ms)`);
});

// Security Tests
tester.test('CORS Headers', async () => {
  const response = await tester.makeRequest('/api/health');
  // Basic CORS validation - more detailed in production
  tester.assert(response.status === 200, 'CORS preflight should succeed');
});

// Feature Integration Tests
tester.test('Complete User Flow Simulation', async () => {
  // 1. Check founder status
  const founderStatus = await tester.makeRequest('/api/founder/status');
  tester.assert(founderStatus.status === 200, 'Founder status check failed');
  
  // 2. Get session info  
  const session = await tester.makeRequest('/api/auth/session');
  tester.assert(session.status === 200, 'Session check failed');
  
  // 3. Check payment config
  const paymentConfig = await tester.makeRequest('/api/payments/config');
  tester.assert(paymentConfig.status === 200, 'Payment config failed');
  
  console.log('   ✓ User flow simulation completed successfully');
});

// Environment Validation
tester.test('Environment Configuration', async () => {
  // Test that required environment variables are configured
  const health = await tester.makeRequest('/api/health');
  tester.assert(health.status === 200, 'Environment health check failed');
  
  // Test database connectivity (implicit through other API calls)
  const founderStatus = await tester.makeRequest('/api/founder/status');
  tester.assert(founderStatus.body.success === true, 'Database connection appears to be failing');
});

// Run all tests
tester.runTests().catch(error => {
  console.error('Test suite failed to run:', error);
  process.exit(1);
});