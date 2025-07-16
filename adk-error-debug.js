// Simple test to understand the ADK error
console.log('=== ADK Error Investigation ===');

// The error "keyValidator._parse is not a function" suggests that
// ADK is expecting a different validation function signature.
// This typically happens when:
// 1. The schema structure is not what ADK expects
// 2. The tool response format is incorrect
// 3. There's a version mismatch in validation libraries

// Let's examine our current time tool which is the simplest
import { ToolRegistry } from './build/tools/registry.js';

const tools = ToolRegistry.getToolsWithSchemas();
const currentTimeTool = tools.find(t => t.name === 'get-current-time');

console.log('Current Time Tool:');
console.log('Name:', currentTimeTool.name);
console.log('Description:', currentTimeTool.description);
console.log('Schema:', JSON.stringify(currentTimeTool.inputSchema, null, 2));

// Check for any properties that might be causing issues
function analyzeSchema(schema, path = '') {
  const issues = [];
  
  function traverse(obj, currentPath) {
    if (typeof obj !== 'object' || obj === null) return;
    
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;
      
      // Check for potentially problematic patterns
      if (key === 'type' && typeof value === 'string') {
        if (value !== value.toLowerCase()) {
          issues.push(`${fullPath}: uppercase type "${value}"`);
        }
      }
      
      if (Array.isArray(value)) {
        issues.push(`${fullPath}: array value [${value.length} items]`);
      }
      
      if (typeof value === 'object' && value !== null) {
        traverse(value, fullPath);
      }
    }
  }
  
  traverse(schema, path);
  return issues;
}

const issues = analyzeSchema(currentTimeTool.inputSchema);
console.log('\nPotential Issues:');
if (issues.length === 0) {
  console.log('✅ No obvious schema issues detected');
} else {
  issues.forEach(issue => console.log(`⚠️  ${issue}`));
}
