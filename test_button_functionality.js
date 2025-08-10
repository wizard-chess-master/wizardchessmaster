// Test Button Functionality
const puppeteer = require('puppeteer');

async function testButtonFunctionality() {
  console.log('🔍 Testing Button Functionality...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log(`Browser Console: ${msg.text()}`);
    });
    
    // Navigate to the app
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    
    console.log('✅ Page loaded');
    
    // Wait for React to load
    await page.waitForSelector('#root', { timeout: 10000 });
    console.log('✅ React app loaded');
    
    // Test 1: Check if navigation buttons exist
    const navButtons = await page.$$eval('button', buttons => 
      buttons.map(btn => ({ 
        text: btn.textContent.trim(), 
        disabled: btn.disabled,
        onClick: !!btn.onclick || btn.hasAttribute('onclick')
      })).filter(btn => btn.text.length > 0)
    );
    
    console.log('📋 Found buttons:', navButtons.slice(0, 5));
    
    // Test 2: Try clicking navigation buttons
    const navigationButtons = ['Strategy', 'AI Training', 'Tournaments', 'Blog'];
    
    for (const buttonText of navigationButtons) {
      try {
        const button = await page.$(`button:contains("${buttonText}")`);
        if (button) {
          console.log(`🖱️ Attempting to click: ${buttonText}`);
          await button.click();
          await page.waitForTimeout(1000); // Wait for navigation
          console.log(`✅ Successfully clicked: ${buttonText}`);
        } else {
          console.log(`⚠️ Button not found: ${buttonText}`);
        }
      } catch (error) {
        console.log(`❌ Failed to click ${buttonText}:`, error.message);
      }
    }
    
    // Test 3: Check current URL after clicks
    const currentUrl = await page.url();
    console.log('🌐 Current URL:', currentUrl);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Simple fallback test without puppeteer
async function testButtonsSimple() {
  console.log('🔧 Running simple button test...');
  
  try {
    const response = await fetch('http://localhost:5000/');
    const html = await response.text();
    
    const buttonCount = (html.match(/button/gi) || []).length;
    const onClickCount = (html.match(/onclick/gi) || []).length;
    const hasReactRouter = html.includes('react-router') || html.includes('router');
    
    console.log(`📊 Button elements found: ${buttonCount}`);
    console.log(`📊 onClick handlers found: ${onClickCount}`);
    console.log(`📊 React Router detected: ${hasReactRouter}`);
    
    if (buttonCount > 0) {
      console.log('✅ Buttons are present in the HTML');
    } else {
      console.log('❌ No buttons found in HTML');
    }
    
  } catch (error) {
    console.error('❌ Simple test failed:', error.message);
  }
}

// Run the appropriate test
if (process.argv.includes('--simple')) {
  testButtonsSimple();
} else {
  testButtonFunctionality().catch(() => {
    console.log('🔄 Puppeteer failed, running simple test...');
    testButtonsSimple();
  });
}