import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { BaseToolHandler } from "../handlers/core/BaseToolHandler.js";

// Import all handlers
import { ListCalendarsHandler } from "../handlers/core/ListCalendarsHandler.js";
import { ListEventsHandler } from "../handlers/core/ListEventsHandler.js";
import { SearchEventsHandler } from "../handlers/core/SearchEventsHandler.js";
import { ListColorsHandler } from "../handlers/core/ListColorsHandler.js";
import { CreateEventHandler } from "../handlers/core/CreateEventHandler.js";
import { UpdateEventHandler } from "../handlers/core/UpdateEventHandler.js";
import { DeleteEventHandler } from "../handlers/core/DeleteEventHandler.js";
import { FreeBusyEventHandler } from "../handlers/core/FreeBusyEventHandler.js";
import { GetCurrentTimeHandler } from "../handlers/core/GetCurrentTimeHandler.js";

// Define all tool schemas with TypeScript inference
export const ToolSchemas = {
  'list-calendars': z.object({}),
  
  'list-events': z.object({
    calendarId: z.string().optional().describe(
      "ID of the calendar(s) to list events from. Accepts either a single calendar ID string or an array of calendar IDs (passed as JSON string like '[\"cal1\", \"cal2\"]'). Defaults to 'primary' if not provided."
    ),
    timeMin: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Start time boundary. Preferred: '2024-01-01T00:00:00' (uses timeZone parameter or calendar timezone). Also accepts: '2024-01-01T00:00:00Z' or '2024-01-01T00:00:00-08:00'.")
      .optional(),
    timeMax: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("End time boundary. Preferred: '2024-01-01T23:59:59' (uses timeZone parameter or calendar timezone). Also accepts: '2024-01-01T23:59:59Z' or '2024-01-01T23:59:59-08:00'.")
      .optional(),
    timeZone: z.string().optional().describe(
      "Timezone as IANA Time Zone Database name (e.g., America/Los_Angeles). Takes priority over calendar's default timezone. Only used for timezone-naive datetime strings."
    )
  }),
  
  'search-events': z.object({
    calendarId: z.string().describe("ID of the calendar (use 'primary' for the main calendar)"),
    query: z.string().describe(
      "Free text search query (searches summary, description, location, attendees, etc.)"
    ),
    timeMin: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Start time boundary. Preferred: '2024-01-01T00:00:00' (uses timeZone parameter or calendar timezone). Also accepts: '2024-01-01T00:00:00Z' or '2024-01-01T00:00:00-08:00'."),
    timeMax: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("End time boundary. Preferred: '2024-01-01T23:59:59' (uses timeZone parameter or calendar timezone). Also accepts: '2024-01-01T23:59:59Z' or '2024-01-01T23:59:59-08:00'."),
    timeZone: z.string().optional().describe(
      "Timezone as IANA Time Zone Database name (e.g., America/Los_Angeles). Takes priority over calendar's default timezone. Only used for timezone-naive datetime strings."
    )
  }),
  
  'list-colors': z.object({}),
  
  'create-event': z.object({
    calendarId: z.string().describe("ID of the calendar (use 'primary' for the main calendar)"),
    summary: z.string().describe("Title of the event"),
    description: z.string().optional().describe("Description/notes for the event"),
    start: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Event start time: '2024-01-01T10:00:00'"),
    end: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Event end time: '2024-01-01T11:00:00'"),
    timeZone: z.string().optional().describe(
      "Timezone as IANA Time Zone Database name (e.g., America/Los_Angeles). Takes priority over calendar's default timezone. Only used for timezone-naive datetime strings."
    ),
    location: z.string().optional().describe("Location of the event"),
    attendees: z.array(z.object({
      email: z.string().email().describe("Email address of the attendee")
    })).optional().describe("List of attendee email addresses"),
    colorId: z.string().optional().describe(
      "Color ID for the event (use list-colors to see available IDs)"
    ),
    reminders: z.object({
      useDefault: z.boolean().describe("Whether to use the default reminders"),
      overrides: z.array(z.object({
        method: z.enum(["email", "popup"]).default("popup").describe("Reminder method"),
        minutes: z.number().describe("Minutes before the event to trigger the reminder")
      }).partial({ method: true })).optional().describe("Custom reminders")
    }).describe("Reminder settings for the event").optional(),
    recurrence: z.array(z.string()).optional().describe(
      "Recurrence rules in RFC5545 format (e.g., [\"RRULE:FREQ=WEEKLY;COUNT=5\"])"
    )
  }),
  
  'update-event': z.object({
    calendarId: z.string().describe("ID of the calendar (use 'primary' for the main calendar)"),
    eventId: z.string().describe("ID of the event to update"),
    summary: z.string().optional().describe("Updated title of the event"),
    description: z.string().optional().describe("Updated description/notes"),
    start: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Updated start time: '2024-01-01T10:00:00'")
      .optional(),
    end: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Updated end time: '2024-01-01T11:00:00'")
      .optional(),
    timeZone: z.string().optional().describe("Updated timezone as IANA Time Zone Database name. If not provided, uses the calendar's default timezone."),
    location: z.string().optional().describe("Updated location"),
    attendees: z.array(z.object({
      email: z.string().email().describe("Email address of the attendee")
    })).optional().describe("Updated attendee list"),
    colorId: z.string().optional().describe("Updated color ID"),
    reminders: z.object({
      useDefault: z.boolean().describe("Whether to use the default reminders"),
      overrides: z.array(z.object({
        method: z.enum(["email", "popup"]).default("popup").describe("Reminder method"),
        minutes: z.number().describe("Minutes before the event to trigger the reminder")
      }).partial({ method: true })).optional().describe("Custom reminders")
    }).describe("Reminder settings for the event").optional(),
    recurrence: z.array(z.string()).optional().describe("Updated recurrence rules"),
    sendUpdates: z.enum(["all", "externalOnly", "none"]).default("all").describe(
      "Whether to send update notifications"
    ),
    modificationScope: z.enum(["thisAndFollowing", "all", "thisEventOnly"]).optional().describe(
      "Scope for recurring event modifications"
    ),
    originalStartTime: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Original start time in the ISO 8601 format '2024-01-01T10:00:00'")
      .optional(),
    futureStartDate: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Start date for future instances in the ISO 8601 format '2024-01-01T10:00:00'")
      .optional()
  }).refine(
    (data) => {
      // Require originalStartTime when modificationScope is 'thisEventOnly'
      if (data.modificationScope === 'thisEventOnly' && !data.originalStartTime) {
        return false;
      }
      return true;
    },
    {
      message: "originalStartTime is required when modificationScope is 'thisEventOnly'",
      path: ["originalStartTime"]
    }
  ).refine(
    (data) => {
      // Require futureStartDate when modificationScope is 'thisAndFollowing'
      if (data.modificationScope === 'thisAndFollowing' && !data.futureStartDate) {
        return false;
      }
      return true;
    },
    {
      message: "futureStartDate is required when modificationScope is 'thisAndFollowing'",
      path: ["futureStartDate"]
    }
  ).refine(
    (data) => {
      // Ensure futureStartDate is in the future when provided
      if (data.futureStartDate) {
        const futureDate = new Date(data.futureStartDate);
        const now = new Date();
        return futureDate > now;
      }
      return true;
    },
    {
      message: "futureStartDate must be in the future",
      path: ["futureStartDate"]
    }
  ),
  
  'delete-event': z.object({
    calendarId: z.string().describe("ID of the calendar (use 'primary' for the main calendar)"),
    eventId: z.string().describe("ID of the event to delete"),
    sendUpdates: z.enum(["all", "externalOnly", "none"]).default("all").describe(
      "Whether to send cancellation notifications"
    )
  }),
  
  'get-freebusy': z.object({
    calendars: z.array(z.object({
      id: z.string().describe("ID of the calendar (use 'primary' for the main calendar)")
    })).describe(
      "List of calendars and/or groups to query for free/busy information"
    ),
    timeMin: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("Start time boundary. Preferred: '2024-01-01T00:00:00' (uses timeZone parameter or calendar timezone). Also accepts: '2024-01-01T00:00:00Z' or '2024-01-01T00:00:00-08:00'."),
    timeMax: z.string()
      .refine((val) => {
        const withTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(val);
        const withoutTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(val);
        return withTimezone || withoutTimezone;
      }, "Must be ISO 8601 format: '2026-01-01T00:00:00'")
      .describe("End time boundary. Preferred: '2024-01-01T23:59:59' (uses timeZone parameter or calendar timezone). Also accepts: '2024-01-01T23:59:59Z' or '2024-01-01T23:59:59-08:00'."),
    timeZone: z.string().optional().describe("Timezone for the query"),
    groupExpansionMax: z.number().int().max(100).optional().describe(
      "Maximum number of calendars to expand per group (max 100)"
    ),
    calendarExpansionMax: z.number().int().max(50).optional().describe(
      "Maximum number of calendars to expand (max 50)"
    )
  }),
  
  'get-current-time': z.object({
    timeZone: z.string().optional().describe(
      "Optional IANA timezone (e.g., 'America/Los_Angeles', 'Europe/London', 'UTC'). If not provided, returns UTC time and system timezone for reference."
    )
  })
} as const;

// Generate TypeScript types from schemas
export type ToolInputs = {
  [K in keyof typeof ToolSchemas]: z.infer<typeof ToolSchemas[K]>
};

// Export individual types for convenience
export type ListCalendarsInput = ToolInputs['list-calendars'];
export type ListEventsInput = ToolInputs['list-events'];
export type SearchEventsInput = ToolInputs['search-events'];
export type ListColorsInput = ToolInputs['list-colors'];
export type CreateEventInput = ToolInputs['create-event'];
export type UpdateEventInput = ToolInputs['update-event'];
export type DeleteEventInput = ToolInputs['delete-event'];
export type GetFreeBusyInput = ToolInputs['get-freebusy'];
export type GetCurrentTimeInput = ToolInputs['get-current-time'];

interface ToolDefinition {
  name: keyof typeof ToolSchemas;
  description: string;
  schema: z.ZodType<any>;
  handler: new () => BaseToolHandler;
  handlerFunction?: (args: any) => Promise<any>;
}


export class ToolRegistry {

  /**
   * Fix schema type capitalization and other issues for ADK compatibility
   * ADK expects JSON schema with proper types and clean structure.
   * Also removes unsupported schema properties that ADK doesn't understand.
   */
  private static fixSchemaTypes(schema: any): void {
    // Fix type capitalization and array types
    if (Array.isArray(schema.type)) {
      // Take the first type (e.g., "object", ignore null)
      schema.type = schema.type.find((t: string) => t !== 'null') || schema.type[0];
    }
    // Keep types as they are - don't force lowercase as ADK might expect proper casing
    if (typeof schema.type === 'string') {
      // Ensure proper type names
      const typeMap: { [key: string]: string } = {
        'STRING': 'string',
        'OBJECT': 'object', 
        'ARRAY': 'array',
        'NUMBER': 'number',
        'INTEGER': 'integer',
        'BOOLEAN': 'boolean'
      };
      schema.type = typeMap[schema.type] || schema.type;
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
      'not',
      'if',
      'then',
      'else'
    ];
    for (const key of unsupportedKeys) {
      delete schema[key];
    }

    // Handle enum values - ensure they're simple arrays
    if (schema.enum && Array.isArray(schema.enum)) {
      schema.enum = schema.enum.filter((val: any) => typeof val === 'string' || typeof val === 'number');
    }

    // Recursively fix nested schemas
    if (schema.properties) {
      for (const key in schema.properties) {
        this.fixSchemaTypes(schema.properties[key]);
      }
    }
    if (schema.items) {
      this.fixSchemaTypes(schema.items);
    }

    // Recursively fix anyOf, oneOf, allOf
    if (Array.isArray(schema.anyOf)) {
      for (const sub of schema.anyOf) {
        this.fixSchemaTypes(sub);
      }
    }
    if (Array.isArray(schema.oneOf)) {
      for (const sub of schema.oneOf) {
        this.fixSchemaTypes(sub);
      }
    }
    if (Array.isArray(schema.allOf)) {
      for (const sub of schema.allOf) {
        this.fixSchemaTypes(sub);
      }
    }

    // Handle patternProperties (convert to properties if possible)
    if (schema.patternProperties) {
      delete schema.patternProperties;
    }

    // Ensure required is a simple array of strings and handle calendarId for list-events
    if (schema.required && Array.isArray(schema.required)) {
      schema.required = schema.required.filter((val: any) => typeof val === 'string');
      
      // For ADK: calendarId should never be required for list-events since we provide defaults
      if (schema.required.includes('calendarId')) {
        // Check if this is likely the list-events schema by looking for timeMin/timeMax that are optional
        const hasOptionalTimeFields = schema.properties && 
          schema.properties.timeMin && 
          schema.properties.timeMax &&
          !schema.required.includes('timeMin') &&
          !schema.required.includes('timeMax');
        
        if (hasOptionalTimeFields) {
          // This is list-events schema, remove calendarId from required for ADK
          schema.required = schema.required.filter((field: string) => field !== 'calendarId');
          console.log(`[ToolRegistry] Removed calendarId from required for ADK`);
        }
      }
      
      if (schema.required.length === 0) {
        delete schema.required;
      }
    }
  }

  private static extractSchemaShape(schema: z.ZodType<any>): any {
    const schemaAny = schema as any;
    
    // Handle ZodEffects (schemas with .refine())
    if (schemaAny._def && schemaAny._def.typeName === 'ZodEffects') {
      return this.extractSchemaShape(schemaAny._def.schema);
    }
    
    // Handle regular ZodObject - return raw shape for MCP SDK compatibility
    if ('shape' in schemaAny) {
      return schemaAny.shape;
    }
    
    // Handle other nested structures
    if (schemaAny._def && schemaAny._def.schema) {
      return this.extractSchemaShape(schemaAny._def.schema);
    }
    
    // Fallback to the original approach - return raw shape for VS Code/Claude Desktop
    const shape = schemaAny._def?.schema?.shape || schemaAny.shape;
    return shape;
  }

  private static tools: ToolDefinition[] = [
    {
      name: "list-calendars",
      description: "List all available calendars",
      schema: ToolSchemas['list-calendars'],
      handler: ListCalendarsHandler
    },
    {
      name: "list-events",
      description: "List events from one or more calendars.",
      schema: ToolSchemas['list-events'],
      handler: ListEventsHandler,
      handlerFunction: async (args: ListEventsInput) => {
        // Provide default calendarId if not specified
        let processedCalendarId: string | string[] = args.calendarId || "primary";
        
        // Provide default date filtering for today if no time boundaries specified
        let timeMin = args.timeMin;
        let timeMax = args.timeMax;
        
        if (!timeMin || !timeMax) {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);
          todayEnd.setMilliseconds(todayEnd.getMilliseconds() - 1);
          
          if (!timeMin) {
            timeMin = todayStart.toISOString().slice(0, 19); // Remove Z for calendar timezone
          }
          if (!timeMax) {
            timeMax = todayEnd.toISOString().slice(0, 19); // Remove Z for calendar timezone
          }
        }
        
        // Handle case where calendarId is passed as a JSON string
        if (typeof processedCalendarId === 'string' && processedCalendarId.trim().startsWith('[') && processedCalendarId.trim().endsWith(']')) {
          try {
            const parsed = JSON.parse(processedCalendarId);
            if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string' && id.length > 0)) {
              if (parsed.length === 0) {
                throw new Error("At least one calendar ID is required");
              }
              if (parsed.length > 50) {
                throw new Error("Maximum 50 calendars allowed per request");
              }
              if (new Set(parsed).size !== parsed.length) {
                throw new Error("Duplicate calendar IDs are not allowed");
              }
              processedCalendarId = parsed;
            } else {
              throw new Error('JSON string must contain an array of non-empty strings');
            }
          } catch (error) {
            throw new Error(
              `Invalid JSON format for calendarId: ${error instanceof Error ? error.message : 'Unknown parsing error'}`
            );
          }
        }
        
        // Additional validation for arrays
        if (Array.isArray(processedCalendarId)) {
          if (processedCalendarId.length === 0) {
            throw new Error("At least one calendar ID is required");
          }
          if (processedCalendarId.length > 50) {
            throw new Error("Maximum 50 calendars allowed per request");
          }
          if (!processedCalendarId.every(id => typeof id === 'string' && id.length > 0)) {
            throw new Error("All calendar IDs must be non-empty strings");
          }
          if (new Set(processedCalendarId).size !== processedCalendarId.length) {
            throw new Error("Duplicate calendar IDs are not allowed");
          }
        }
        
        return { calendarId: processedCalendarId, timeMin, timeMax, timeZone: args.timeZone };
      }
    },
    {
      name: "search-events",
      description: "Search for events in a calendar by text query.",
      schema: ToolSchemas['search-events'],
      handler: SearchEventsHandler
    },
    {
      name: "list-colors",
      description: "List available color IDs and their meanings for calendar events",
      schema: ToolSchemas['list-colors'],
      handler: ListColorsHandler
    },
    {
      name: "create-event",
      description: "Create a new calendar event.",
      schema: ToolSchemas['create-event'],
      handler: CreateEventHandler
    },
    {
      name: "update-event",
      description: "Update an existing calendar event with recurring event modification scope support.",
      schema: ToolSchemas['update-event'],
      handler: UpdateEventHandler
    },
    {
      name: "delete-event",
      description: "Delete a calendar event.",
      schema: ToolSchemas['delete-event'],
      handler: DeleteEventHandler
    },
    {
      name: "get-freebusy",
      description: "Query free/busy information for calendars. Note: Time range is limited to a maximum of 3 months between timeMin and timeMax.",
      schema: ToolSchemas['get-freebusy'],
      handler: FreeBusyEventHandler
    },
    {
      name: "get-current-time",
      description: "Get current system time and timezone information.",
      schema: ToolSchemas['get-current-time'],
      handler: GetCurrentTimeHandler
    }
  ];

  static getToolsWithSchemas() {
    console.log(`[ToolRegistry] Configuring for ADK environment`);
    
    return this.tools.map(tool => {
      let jsonSchema;
      
      // For create-event, use a much simpler approach to avoid ADK schema issues
      if (tool.name === 'create-event') {
        jsonSchema = {
          type: "object",
          required: ["calendarId", "summary", "start", "end"],
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar (use 'primary' for the main calendar)"
            },
            summary: {
              type: "string", 
              description: "Title of the event"
            },
            start: {
              type: "string",
              description: "Event start time: '2024-01-01T10:00:00'"
            },
            end: {
              type: "string", 
              description: "Event end time: '2024-01-01T11:00:00'"
            },
            description: {
              type: "string",
              description: "Description/notes for the event"
            },
            location: {
              type: "string",
              description: "Location of the event"
            }
          }
        };
        console.log(`[ToolRegistry] Using ultra-simplified schema for create-event to avoid ADK issues`);
      } else if (tool.name === 'list-events') {
        // For list-events, also use a simplified approach to avoid all schema validation issues
        jsonSchema = {
          type: "object",
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar (use 'primary' for the main calendar). Defaults to 'primary' if not provided."
            },
            timeMin: {
              type: "string",
              description: "Start time boundary in ISO 8601 format: '2024-01-01T10:00:00'"
            },
            timeMax: {
              type: "string", 
              description: "End time boundary in ISO 8601 format: '2024-01-01T23:59:59'"
            },
            timeZone: {
              type: "string",
              description: "Timezone as IANA Time Zone Database name (e.g., America/Los_Angeles)"
            }
          }
        };
        console.log(`[ToolRegistry] Using ultra-simplified schema for list-events to avoid ADK issues`);
      } else {
        jsonSchema = zodToJsonSchema(tool.schema, {
          target: "jsonSchema7",
          strictUnions: false,
          definitions: {}
        });
        
        // Apply ADK compatibility fix for schema types
        this.fixSchemaTypes(jsonSchema);
      }
      
      // Log schema details for debugging problematic tools
      if (tool.name === 'list-events' || tool.name === 'create-event') {
        const schemaAny = jsonSchema as any;
        console.log(`[ToolRegistry] ${tool.name} schema for ADK:`, 
          JSON.stringify({ 
            type: schemaAny.type,
            required: schemaAny.required, 
            properties: Object.keys(schemaAny.properties || {}),
            firstProperty: schemaAny.properties ? Object.values(schemaAny.properties)[0] : null
          }, null, 2));
      }
      
      return {
        name: tool.name,
        description: tool.description,
        inputSchema: jsonSchema
      };
    });
  }

  static async registerAll(
    server: McpServer, 
    executeWithHandler: (
      handler: any, 
      args: any
    ) => Promise<{ content: Array<{ type: "text"; text: string }> }>
  ) {
    console.log(`[ToolRegistry] RegisterAll for ADK environment with ultra-simplified schemas for ALL tools`);
    
    for (const tool of this.tools) {
      let schemaToUse;
      
      // Use ultra-simplified schemas for ALL tools to avoid ANY ADK schema validation issues
      if (tool.name === 'list-calendars') {
        schemaToUse = {
          type: "object",
          properties: {}
        };
      } else if (tool.name === 'list-events') {
        schemaToUse = {
          type: "object",
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar (use 'primary' for the main calendar). Defaults to 'primary' if not provided."
            },
            timeMin: {
              type: "string",
              description: "Start time boundary in ISO 8601 format: '2024-01-01T10:00:00'"
            },
            timeMax: {
              type: "string", 
              description: "End time boundary in ISO 8601 format: '2024-01-01T23:59:59'"
            },
            timeZone: {
              type: "string",
              description: "Timezone as IANA Time Zone Database name (e.g., America/Los_Angeles)"
            }
          }
        };
      } else if (tool.name === 'search-events') {
        schemaToUse = {
          type: "object",
          required: ["calendarId", "query", "timeMin", "timeMax"],
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar (use 'primary' for the main calendar)"
            },
            query: {
              type: "string",
              description: "Free text search query"
            },
            timeMin: {
              type: "string",
              description: "Start time boundary in ISO 8601 format"
            },
            timeMax: {
              type: "string",
              description: "End time boundary in ISO 8601 format"
            },
            timeZone: {
              type: "string",
              description: "Timezone as IANA Time Zone Database name"
            }
          }
        };
      } else if (tool.name === 'list-colors') {
        schemaToUse = {
          type: "object",
          properties: {}
        };
      } else if (tool.name === 'create-event') {
        schemaToUse = {
          type: "object",
          required: ["calendarId", "summary", "start", "end"],
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar (use 'primary' for the main calendar)"
            },
            summary: {
              type: "string", 
              description: "Title of the event"
            },
            start: {
              type: "string",
              description: "Event start time: '2024-01-01T10:00:00'"
            },
            end: {
              type: "string", 
              description: "Event end time: '2024-01-01T11:00:00'"
            },
            description: {
              type: "string",
              description: "Description/notes for the event"
            },
            location: {
              type: "string",
              description: "Location of the event"
            }
          }
        };
      } else if (tool.name === 'update-event') {
        schemaToUse = {
          type: "object",
          required: ["calendarId", "eventId"],
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar (use 'primary' for the main calendar)"
            },
            eventId: {
              type: "string",
              description: "ID of the event to update"
            },
            summary: {
              type: "string",
              description: "Updated title of the event"
            },
            description: {
              type: "string",
              description: "Updated description/notes"
            },
            start: {
              type: "string",
              description: "Updated start time: '2024-01-01T10:00:00'"
            },
            end: {
              type: "string",
              description: "Updated end time: '2024-01-01T11:00:00'"
            },
            location: {
              type: "string",
              description: "Updated location"
            }
          }
        };
      } else if (tool.name === 'delete-event') {
        schemaToUse = {
          type: "object",
          required: ["calendarId", "eventId"],
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar (use 'primary' for the main calendar)"
            },
            eventId: {
              type: "string",
              description: "ID of the event to delete"
            }
          }
        };
      } else if (tool.name === 'get-freebusy') {
        schemaToUse = {
          type: "object",
          required: ["timeMin", "timeMax"],
          properties: {
            timeMin: {
              type: "string",
              description: "Start time boundary in ISO 8601 format"
            },
            timeMax: {
              type: "string",
              description: "End time boundary in ISO 8601 format"
            },
            timeZone: {
              type: "string",
              description: "Timezone for the query"
            }
          }
        };
      } else if (tool.name === 'get-current-time') {
        schemaToUse = {
          type: "object",
          properties: {
            timeZone: {
              type: "string",
              description: "Optional IANA timezone (e.g., 'America/Los_Angeles', 'Europe/London', 'UTC')"
            }
          }
        };
      } else {
        // Fallback to extracting Zod shape for any new tools
        schemaToUse = this.extractSchemaShape(tool.schema);
      }
      
      // Log registration details for debugging
      console.log(`[ToolRegistry] Registering ${tool.name} for ADK with NO inputSchema to bypass MCP SDK keyValidator bug`);
      
      server.registerTool(
        tool.name,
        {
          description: tool.description
          // COMPLETELY REMOVE inputSchema to bypass "keyValidator._parse is not a function" MCP SDK bug
        },
        async (args: any) => {
          // Skip Zod validation entirely for ALL tools to avoid ANY ADK schema issues
          // Let the handlerFunction provide defaults and the handlers do their own validation
          let validatedArgs = args || {};
          
          // Apply any custom handler function preprocessing
          const processedArgs = tool.handlerFunction ? await tool.handlerFunction(validatedArgs) : validatedArgs;
          
          // Create handler instance and execute
          const handler = new tool.handler();
          return executeWithHandler(handler, processedArgs);
        }
      );
    }
  }
}