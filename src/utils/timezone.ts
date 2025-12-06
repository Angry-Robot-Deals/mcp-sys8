/**
 * Timezone conversion utilities
 */

export interface ConvertTimezoneArgs {
  datetime: string;
  from_timezone?: string;
  to_timezone: string;
  format?: string;
}

export interface ConvertTimezoneResult {
  input_datetime: string;
  from_timezone: string;
  to_timezone: string;
  converted_datetime: string;
  iso_string: string;
  unix_timestamp: number;
  formatted: string;
}

/**
 * Convert datetime between timezones
 */
export function convertTimezone(args: ConvertTimezoneArgs): ConvertTimezoneResult {
  const {
    datetime,
    from_timezone = 'UTC',
    to_timezone,
    format,
  } = args;

  if (typeof datetime !== 'string' || datetime.trim().length === 0) {
    throw new Error('Datetime must be a non-empty string');
  }

  if (typeof to_timezone !== 'string' || to_timezone.trim().length === 0) {
    throw new Error('Target timezone must be a non-empty string');
  }

  try {
    // Parse input datetime
    let inputDate: Date;

    // Try to parse as ISO string first
    if (datetime.includes('T') || datetime.includes('Z') || datetime.includes('+')) {
      inputDate = new Date(datetime);
    } else {
      // Try common formats
      inputDate = new Date(datetime);
    }

    if (isNaN(inputDate.getTime())) {
      throw new Error(`Invalid datetime format: ${datetime}`);
    }

    // Get datetime string in source timezone
    const sourceDateString = inputDate.toLocaleString('en-US', {
      timeZone: from_timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Convert to target timezone
    const targetDateString = inputDate.toLocaleString('en-US', {
      timeZone: to_timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Create a new date object representing the time in target timezone
    // We need to construct a date string that represents the same moment in target timezone
    const targetDate = new Date(inputDate.toLocaleString('en-US', { timeZone: to_timezone }));

    // Get ISO string
    const isoString = targetDate.toISOString();

    // Get Unix timestamp (always UTC)
    const unixTimestamp = Math.floor(inputDate.getTime() / 1000);

    // Format according to requested format or default
    let formatted: string;
    if (format) {
      // Custom format using Intl.DateTimeFormat
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: to_timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      formatted = formatter.format(inputDate);
    } else {
      formatted = targetDateString;
    }

    return {
      input_datetime: datetime,
      from_timezone: from_timezone || 'UTC',
      to_timezone,
      converted_datetime: targetDateString,
      iso_string: isoString,
      unix_timestamp: unixTimestamp,
      formatted,
    };
  } catch (error) {
    throw new Error(`Timezone conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
