import { ToolRegistry } from './build/tools/registry.js';

console.log('Testing All Schema Types for ADK Compatibility\n');

const tools = ToolRegistry.getToolsWithSchemas();

function collectAllTypes(schema, path = '') {
  const types = [];
  
  if (schema.type) {
    types.push({ path: path || 'root', type: schema.type });
  }
  
  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      types.push(...collectAllTypes(prop, path ? `${path}.${key}` : key));
    }
  }
  
  if (schema.items) {
    types.push(...collectAllTypes(schema.items, `${path}[]`));
  }
  
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    types.push(...collectAllTypes(schema.additionalProperties, `${path}.*`));
  }
  
  return types;
}

const allTypes = new Set();
const typesByTool = {};

tools.forEach(tool => {
  const types = collectAllTypes(tool.inputSchema);
  typesByTool[tool.name] = types;
  types.forEach(t => allTypes.add(t.type));
});

console.log('=== ALL TYPES FOUND ===');
console.log('Unique types:', Array.from(allTypes).sort());
console.log();

console.log('=== TYPE ISSUES ===');
let hasIssues = false;
Array.from(allTypes).forEach(type => {
  if (typeof type === 'string') {
    if (type !== type.toLowerCase()) {
      console.log(`❌ UPPERCASE TYPE FOUND: "${type}"`);
      hasIssues = true;
    } else if (type.match(/^[A-Z]/)) {
      console.log(`❌ CAPITALIZED TYPE FOUND: "${type}"`);
      hasIssues = true;
    }
  } else if (Array.isArray(type)) {
    console.log(`❌ ARRAY TYPE FOUND: ${JSON.stringify(type)}`);
    hasIssues = true;
  } else {
    console.log(`❌ NON-STRING TYPE FOUND: ${JSON.stringify(type)}`);
    hasIssues = true;
  }
});

if (!hasIssues) {
  console.log('✅ All types are properly formatted (lowercase strings)');
}

console.log('\n=== DETAILED BREAKDOWN BY TOOL ===');
tools.forEach(tool => {
  console.log(`\n--- ${tool.name} ---`);
  const types = typesByTool[tool.name];
  if (types.length === 0) {
    console.log('  No types found');
  } else {
    types.forEach(t => {
      const status = (typeof t.type === 'string' && t.type === t.type.toLowerCase()) ? '✅' : '❌';
      console.log(`  ${status} ${t.path}: ${JSON.stringify(t.type)}`);
    });
  }
});
