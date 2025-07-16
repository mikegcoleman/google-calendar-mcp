// Test fixSchemaTypes method directly
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

// Simulate the fixSchemaTypes method
function fixSchemaTypes(schema) {
  console.log('Fixing schema:', JSON.stringify(schema, null, 2));
  
  // Fix type capitalization and array types
  if (Array.isArray(schema.type)) {
    schema.type = schema.type.find((t) => t !== 'null') || schema.type[0];
  }
  if (typeof schema.type === 'string') {
    schema.type = schema.type.toLowerCase();
  }

  // Remove unsupported keys that ADK doesn't understand
  const unsupportedKeys = [
    'examples', 
    'nullable', 
    'default', 
    'format',
    '$schema',
    'definitions',
    'additionalProperties',
    'anyOf',
    'oneOf',
    'allOf',
    'not',
    'if',
    'then',
    'else'
  ];
  
  for (const key of unsupportedKeys) {
    if (schema.hasOwnProperty(key)) {
      console.log(`Removing key: ${key}`);
      delete schema[key];
    }
  }

  // Recursively fix nested schemas
  if (schema.properties) {
    for (const key in schema.properties) {
      fixSchemaTypes(schema.properties[key]);
    }
  }
  if (schema.items) {
    fixSchemaTypes(schema.items);
  }

  // Handle patternProperties (convert to properties if possible)
  if (schema.patternProperties) {
    delete schema.patternProperties;
  }

  // Ensure required is a simple array of strings
  if (schema.required && Array.isArray(schema.required)) {
    schema.required = schema.required.filter((val) => typeof val === 'string');
    if (schema.required.length === 0) {
      delete schema.required;
    }
  }
  
  console.log('Fixed schema:', JSON.stringify(schema, null, 2));
}

// Test with a simple schema
const testSchema = z.object({});

const jsonSchema = zodToJsonSchema(testSchema, {
  target: "jsonSchema7",
  strictUnions: false,
  definitions: {}
});

console.log('=== Before fix ===');
console.log(JSON.stringify(jsonSchema, null, 2));

console.log('\n=== Applying fix ===');
fixSchemaTypes(jsonSchema);

console.log('\n=== After fix ===');
console.log(JSON.stringify(jsonSchema, null, 2));
