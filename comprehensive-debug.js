#!/usr/bin/env node

/**
 * Comprehensive diagnostic script for Google Calendar MCP debugging
 */

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🔍 GOOGLE CALENDAR MCP DIAGNOSTIC REPORT\n');

// 1. Check current time and timezone handling
console.log('1. TIMEZONE & TIME ANALYSIS:');
const now = new Date();
console.log(`Current local time: ${now.toString()}`);
console.log(`Current UTC time: ${now.toUTCString()}`);
console.log(`Current ISO string: ${now.toISOString()}`);
console.log(`Detected timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
console.log(`UTC offset: ${now.getTimezoneOffset()} minutes`);

// 2. Test date boundaries for yesterday/today/tomorrow
console.log('\n2. DATE BOUNDARY TESTING:');
['yesterday', 'today', 'tomorrow'].forEach((day, index) => {
  const date = new Date();
  date.setDate(date.getDate() + (index - 1)); // yesterday = -1, today = 0, tomorrow = +1
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  console.log(`${day.toUpperCase()}:`);
  console.log(`  Start: ${startOfDay.toISOString()} (${startOfDay.toString()})`);
  console.log(`  End: ${endOfDay.toISOString()} (${endOfDay.toString()})`);
  console.log(`  Without Z: ${startOfDay.toISOString().slice(0, 19)} to ${endOfDay.toISOString().slice(0, 19)}`);
});

// 3. Check for potential rate limiting patterns
console.log('\n3. RATE LIMITING ANALYSIS:');
console.log('Common causes of rate limiting:');
console.log('- Too many API calls in short time period');
console.log('- Large time ranges causing multiple API calls');
console.log('- Multiple calendar requests without batching');
console.log('- Missing exponential backoff on failures');

// 4. Check build and configuration
console.log('\n4. CONFIGURATION CHECK:');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log(`Package version: ${packageJson.version}`);
  console.log(`Node version: ${process.version}`);
  
  // Check if auth file exists
  const authFileExists = fs.existsSync('./gcp-oauth.keys.json');
  console.log(`Auth file exists: ${authFileExists}`);
  
  // Check build directory
  const buildExists = fs.existsSync('./build');
  console.log(`Build directory exists: ${buildExists}`);
  
  if (buildExists) {
    const buildFiles = fs.readdirSync('./build');
    console.log(`Build files: ${buildFiles.filter(f => f.endsWith('.js')).join(', ')}`);
  }
} catch (error) {
  console.log(`Configuration check failed: ${error.message}`);
}

// 5. Simulate potential problematic scenarios
console.log('\n5. PROBLEMATIC SCENARIO SIMULATION:');

// Scenario A: Very broad date range (could cause too many results)
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
const oneMonthLater = new Date();
oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

console.log('SCENARIO A - Very broad range (potential for many events):');
console.log(`  From: ${oneMonthAgo.toISOString().slice(0, 19)}`);
console.log(`  To: ${oneMonthLater.toISOString().slice(0, 19)}`);
console.log(`  Duration: ${Math.round((oneMonthLater - oneMonthAgo) / (1000 * 60 * 60 * 24))} days`);

// Scenario B: Edge case timezones
console.log('\nSCENARIO B - Timezone edge cases:');
const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'UTC'];
timezones.forEach(tz => {
  try {
    const date = new Date();
    const localized = date.toLocaleString('en-US', { timeZone: tz });
    console.log(`  ${tz}: ${localized}`);
  } catch (error) {
    console.log(`  ${tz}: ERROR - ${error.message}`);
  }
});

// 6. Generate test commands
console.log('\n6. SUGGESTED DEBUG COMMANDS:');
console.log('Run these commands to test specific scenarios:');
console.log('');
console.log('# Test the MCP server directly:');
console.log('echo \'{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "list-events", "arguments": {}}}\' | npm run dev');
console.log('');
console.log('# Test with specific date range:');
console.log('echo \'{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "list-events", "arguments": {"timeMin": "2025-07-15T00:00:00", "timeMax": "2025-07-15T23:59:59"}}}\' | npm run dev');
console.log('');
console.log('# Check server logs:');
console.log('npm run dev 2>&1 | tee debug.log');

console.log('\n7. RECOMMENDATIONS:');
console.log('Based on your issues (rate limiting + missing meetings):');
console.log('');
console.log('A. RATE LIMITING FIXES:');
console.log('   - Add exponential backoff retry logic');
console.log('   - Implement request batching for multiple calendars');
console.log('   - Add caching for frequently requested ranges');
console.log('   - Limit concurrent API requests');
console.log('');
console.log('B. MISSING MEETINGS FIXES:');
console.log('   - Verify timezone handling in requests');
console.log('   - Check if all-day events are being included');
console.log('   - Ensure date ranges cover full days (00:00:00 to 23:59:59)');
console.log('   - Verify calendar permissions and access');
console.log('');
console.log('C. IMMEDIATE DEBUG STEPS:');
console.log('   1. Run: npm run dev and test with simple date ranges');
console.log('   2. Check server logs for API errors or timezone issues');
console.log('   3. Test with explicit timezone parameter');
console.log('   4. Verify OAuth permissions include calendar read access');
