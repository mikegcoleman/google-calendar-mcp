/**
 * Datetime utilities for Google Calendar MCP Server
 * Provides timezone handling and datetime conversion utilities
 */

/**
 * Checks if a datetime string includes timezone information
 * @param datetime ISO 8601 datetime string
 * @returns True if timezone is included, false if timezone-naive
 */
export function hasTimezoneInDatetime(datetime: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(datetime);
}

/**
 * Converts a flexible datetime string to RFC3339 format required by Google Calendar API
 * 
 * Precedence rules:
 * 1. If datetime already has timezone info (Z or ±HH:MM), use as-is
 * 2. If datetime is timezone-naive, convert using fallbackTimezone
 * 
 * @param datetime ISO 8601 datetime string (with or without timezone)
 * @param fallbackTimezone Timezone to use if datetime is timezone-naive (IANA format)
 * @returns RFC3339 formatted datetime string
 */
export function convertToRFC3339(datetime: string, fallbackTimezone: string): string {
    if (hasTimezoneInDatetime(datetime)) {
        // Already has timezone, use as-is
        return datetime;
    } else {
        // Timezone-naive, need to interpret the datetime as being in the target timezone
        try {
            // Parse the datetime components
            const match = datetime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
            if (!match) {
                throw new Error(`Invalid datetime format: ${datetime}`);
            }
            
            const [, year, month, day, hour, minute, second] = match;
            
            // Create a date object representing this local time in the target timezone
            // We use the Intl API to get the UTC offset for this timezone at this date/time
            const testDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
            const offsetFormatter = new Intl.DateTimeFormat('en', {
                timeZone: fallbackTimezone,
                timeZoneName: 'longOffset'
            });
            
            const offsetParts = offsetFormatter.formatToParts(testDate);
            const timeZoneName = offsetParts.find(p => p.type === 'timeZoneName')?.value;
            
            if (timeZoneName) {
                // Handle both ASCII minus (-) and Unicode minus (−)
                const offsetMatch = timeZoneName.match(/GMT([+\-−]\d{2}:\d{2})/);
                if (offsetMatch) {
                    const offset = offsetMatch[1].replace('−', '-');
                    return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
                }
            }
            
            // Fallback: append Z for UTC
            return datetime + 'Z';
        } catch (error) {
            // Fallback: if timezone conversion fails, append Z for UTC
            return datetime + 'Z';
        }
    }
}

/**
 * Creates a time object for Google Calendar API, handling both timezone-aware and timezone-naive datetime strings
 * @param datetime ISO 8601 datetime string (with or without timezone)
 * @param fallbackTimezone Timezone to use if datetime is timezone-naive (IANA format)
 * @returns Google Calendar API time object
 */
export function createTimeObject(datetime: string, fallbackTimezone: string): { dateTime: string; timeZone?: string } {
    if (hasTimezoneInDatetime(datetime)) {
        // Timezone included in datetime - use as-is, no separate timeZone property needed
        return { dateTime: datetime };
    } else {
        // Timezone-naive datetime - use fallback timezone
        return { dateTime: datetime, timeZone: fallbackTimezone };
    }
}