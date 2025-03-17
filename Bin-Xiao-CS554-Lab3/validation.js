// validation.js
import { GraphQLError } from 'graphql';

export function checkNonEmptyString(str, fieldName = 'input') {
  if (typeof str !== 'string') {
    throw new GraphQLError(`${fieldName} must be a string.`);
  }
  const trimmed = str.trim();
  if (!trimmed) {
    throw new GraphQLError(`${fieldName} cannot be empty or just whitespace.`);
  }
  return trimmed;
}

/**
 * Ensures the given string contains only letters (A-Z, a-z) and spaces.
 */
export function checkLettersOnly(str, fieldName = 'input') {
  if (!/^[A-Za-z ]+$/.test(str)) {
    throw new GraphQLError(
      `${fieldName} must contain only letters and spaces, no digits or special chars.`
    );
  }
  return str;
}

/**
 * Validates a date in formats like M/D/YYYY or MM/DD/YYYY.
 */
export function checkValidDate(dateStr, fieldName = 'date') {
  const trimmed = checkNonEmptyString(dateStr, fieldName); 
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = trimmed.match(dateRegex);
  if (!match) {
    throw new GraphQLError(
      `${fieldName} must be in M/D/YYYY (or similar) format, e.g. "9/21/2023".`
    );
  }
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (year < 1 || year > 9999)
    throw new GraphQLError(`${fieldName} year must be between 0001 and 9999.`);
  if (month < 1 || month > 12)
    throw new GraphQLError(`${fieldName} month must be between 1 and 12.`);
  if (day < 1 || day > 31)
    throw new GraphQLError(`${fieldName} day must be between 1 and 31.`);

  const testDate = new Date(`${year}-${month}-${day}`);
  if (
    testDate.getFullYear() !== year ||
    testDate.getMonth() + 1 !== month ||
    testDate.getDate() !== day
  ) {
    throw new GraphQLError(`${fieldName} is invalid; date doesn't exist.`);
  }
  return trimmed;
}

/**
 * Validates that year is [1900..2024].
 */
export function checkValidYear(year, fieldName = 'founded_year') {
  if (typeof year !== 'number' || isNaN(year)) {
    throw new GraphQLError(`${fieldName} must be a valid integer.`);
  }
  if (year < 1900 || year >= 2025) {
    throw new GraphQLError(`${fieldName} must be in the range [1900..2024].`);
  }
  return year;
}

/**
 * Validates that arr is a non-empty array of letter-only strings.
 */
export function checkArrayOfLetters(arr, fieldName = 'array') {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new GraphQLError(`${fieldName} must be a non-empty array.`);
  }
  arr.forEach((item, i) => {
    const trimmed = checkNonEmptyString(item, `${fieldName}[${i}]`);
    checkLettersOnly(trimmed, `${fieldName}[${i}]`);
  });
  return arr;
}

/**
 * Ensures the genre is one of the allowed MusicGenre enums
 * and returns it in uppercase form.
 */
export function checkMusicGenre(genre) {
  const trimmed = checkNonEmptyString(genre, 'genre');
  const upper = trimmed.toUpperCase();
  const allowed = [
    'POP',
    'ROCK',
    'HIP_HOP',
    'COUNTRY',
    'JAZZ',
    'CLASSICAL',
    'ELECTRONIC',
    'R_AND_B',
    'INDIE',
    'ALTERNATIVE'
  ];
  if (!allowed.includes(upper)) {
    throw new GraphQLError(
      `genre must be one of: ${allowed.join(', ')} (got "${genre}")`
    );
  }
  return upper;
}

/**
 * Validates that songs is a non-empty array of letter-only strings.
 */
export function checkSongsArray(songs, fieldName = 'songs') {
  if (!Array.isArray(songs) || songs.length === 0) {
    throw new GraphQLError(`${fieldName} must be a non-empty array.`);
  }
  songs.forEach((item, i) => {
    const trimmed = checkNonEmptyString(item, `${fieldName}[${i}]`);
    checkLettersOnly(trimmed, `${fieldName}[${i}]`);
  });
  return songs;
}

/**
 * New: Validates that the song duration is in "MM:SS" format.
 */
export function checkSongDuration(duration, fieldName = 'duration') {
  const trimmed = checkNonEmptyString(duration, fieldName);
  // Regex to match "MM:SS", where minutes can be one or two digits and seconds exactly two digits (00-59)
  const durationRegex = /^([0-5]?[0-9]):([0-5][0-9])$/;
  if (!durationRegex.test(trimmed)) {
    throw new GraphQLError(`${fieldName} must be in the format MM:SS, e.g. "03:45"`);
  }
  return trimmed;
}
