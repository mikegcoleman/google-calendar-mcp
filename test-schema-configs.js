// Test different schema transformation approaches
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

// Minimal create-event schema for testing
const minimalSchema = z.object({
  calendarId: z.string().describe("Calendar ID"),
  summary: z.string().describe("Event title"),
  start: z.string().describe("Start time"),
  end: z.string().describe("End time")
});

console.log("=== Testing different zodToJsonSchema configurations ===\n");

// Test 1: Current configuration
console.log("1. Current configuration (jsonSchema7):");
const current = zodToJsonSchema(minimalSchema, {
  target: "jsonSchema7",
  strictUnions: false,
  definitions: {}
});
console.log(JSON.stringify(current, null, 2));
console.log();

// Test 2: OpenAPI 3.0 target
console.log("2. OpenAPI 3.0 target:");
const openapi = zodToJsonSchema(minimalSchema, {
  target: "openApi3",
  strictUnions: false,
  definitions: {}
});
console.log(JSON.stringify(openapi, null, 2));
console.log();

// Test 3: JSON Schema 2019-09
console.log("3. JSON Schema 2019-09:");
const schema2019 = zodToJsonSchema(minimalSchema, {
  target: "jsonSchema2019-09",
  strictUnions: false,
  definitions: {}
});
console.log(JSON.stringify(schema2019, null, 2));
console.log();

// Test 4: Minimal manual schema
console.log("4. Minimal manual schema:");
const manual = {
  type: "object",
  properties: {
    calendarId: { type: "string", description: "Calendar ID" },
    summary: { type: "string", description: "Event title" },
    start: { type: "string", description: "Start time" },
    end: { type: "string", description: "End time" }
  },
  required: ["calendarId", "summary", "start", "end"]
};
console.log(JSON.stringify(manual, null, 2));
