// Debug script to see what schemas ADK actually receives
import { ToolRegistry } from './build/tools/registry.js';

console.log('=== ADK Schema Debug ===\n');

const tools = ToolRegistry.getToolsWithSchemas();

for (const tool of tools) {
  console.log(`Tool: ${tool.name}`);
  console.log('Schema:', JSON.stringify(tool.inputSchema, null, 2));
  console.log('---\n');
}

console.log('\n=== Schema Summary ===');
console.log(`Total tools: ${tools.length}`);

// Check for any remaining problematic patterns
for (const tool of tools) {
  const schema = tool.inputSchema;
  const issues = [];
  
  function checkSchema(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) return;
    
    // Check for array types
    if (Array.isArray(obj.type)) {
      issues.push(`${path}: type is array [${obj.type.join(', ')}]`);
    }
    
    // Check for uppercase types
    if (typeof obj.type === 'string' && obj.type !== obj.type.toLowerCase()) {
      issues.push(`${path}: uppercase type "${obj.type}"`);
    }
    
    // Check for problematic properties
    const problematicProps = ['examples', 'nullable', 'format', '$schema', 'definitions', 'additionalProperties', 'anyOf', 'oneOf', 'allOf'];
    for (const prop of problematicProps) {
      if (obj.hasOwnProperty(prop)) {
        issues.push(`${path}: has "${prop}" property`);
      }
    }
    
    // Recurse into nested objects
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        checkSchema(value, path ? `${path}.${key}` : key);
      }
    }
  }
  
  checkSchema(schema);
  
  if (issues.length > 0) {
    console.log(`\n${tool.name} issues:`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
}
