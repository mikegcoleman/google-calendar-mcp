#!/usr/bin/env node

/**
 * Debug script to test time range logic and see what's actually being sent to the API
 */

// Simulate the handlerFunction logic from registry.ts
function simulateListEventsHandler(args) {
  console.log('=== INPUT ARGS ===');
  console.log(JSON.stringify(args, null, 2));
  
  // Provide default calendarId if not specified
  let processedCalendarId = args.calendarId || "primary";
  
  // For ADK: Provide intelligent default date ranges ONLY when user provides no time boundaries
  // Respect any user-specified time ranges exactly as provided
  let timeMin = args.timeMin;
  let timeMax = args.timeMax;
  
  // Only apply defaults when BOTH timeMin AND timeMax are missing
  // If user specifies either one, they have a specific intent and we should not override
  if (!timeMin && !timeMax) {
    const now = new Date();
    
    // Default to showing events for "today and the next few days" - a 7-day window
    // This provides context when user makes general requests like "show my events"
    const rangeStart = new Date(now);
    rangeStart.setHours(0, 0, 0, 0); // Start of today
    
    const rangeEnd = new Date(now);
    rangeEnd.setDate(rangeEnd.getDate() + 7); // Next 7 days
    rangeEnd.setHours(23, 59, 59, 999);
    
    timeMin = rangeStart.toISOString().slice(0, 19); // Remove Z for calendar timezone
    timeMax = rangeEnd.toISOString().slice(0, 19); // Remove Z for calendar timezone
    
    console.log(`[ListEvents] Using default 7-day range: ${timeMin} to ${timeMax}`);
  } else if (timeMin || timeMax) {
    console.log(`[ListEvents] Using user-specified time range: ${timeMin || 'no start'} to ${timeMax || 'no end'}`);
  }
  
  const result = { calendarId: processedCalendarId, timeMin, timeMax, timeZone: args.timeZone };
  
  console.log('=== PROCESSED RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

// Test different scenarios
console.log('🔍 DEBUGGING TIME RANGE LOGIC\n');

console.log('1. No time parameters (should get 7-day default):');
simulateListEventsHandler({});
console.log('\n' + '='.repeat(60) + '\n');

console.log('2. User asks for "yesterday" (model should provide specific range):');
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStart = new Date(yesterday);
yesterdayStart.setHours(0, 0, 0, 0);
const yesterdayEnd = new Date(yesterday);
yesterdayEnd.setHours(23, 59, 59, 999);

simulateListEventsHandler({
  timeMin: yesterdayStart.toISOString().slice(0, 19),
  timeMax: yesterdayEnd.toISOString().slice(0, 19)
});
console.log('\n' + '='.repeat(60) + '\n');

console.log('3. User asks for "tomorrow" (model should provide specific range):');
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStart = new Date(tomorrow);
tomorrowStart.setHours(0, 0, 0, 0);
const tomorrowEnd = new Date(tomorrow);
tomorrowEnd.setHours(23, 59, 59, 999);

simulateListEventsHandler({
  timeMin: tomorrowStart.toISOString().slice(0, 19),
  timeMax: tomorrowEnd.toISOString().slice(0, 19)
});
console.log('\n' + '='.repeat(60) + '\n');

console.log('4. User provides only timeMin (should respect it):');
simulateListEventsHandler({
  timeMin: '2025-07-15T00:00:00'
});
console.log('\n' + '='.repeat(60) + '\n');

console.log('5. User provides only timeMax (should respect it):');
simulateListEventsHandler({
  timeMax: '2025-07-15T23:59:59'
});
console.log('\n' + '='.repeat(60) + '\n');

// Show what dates we're working with
const now = new Date();
console.log('📅 CURRENT DATE CONTEXT:');
console.log(`Today: ${now.toISOString().slice(0, 10)} (${now.toLocaleDateString()})`);
console.log(`Yesterday: ${new Date(now.getTime() - 24*60*60*1000).toISOString().slice(0, 10)}`);
console.log(`Tomorrow: ${new Date(now.getTime() + 24*60*60*1000).toISOString().slice(0, 10)}`);
console.log(`Current timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
