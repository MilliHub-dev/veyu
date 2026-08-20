/**
 * VIN decoding backed by the public NHTSA vPIC and Recalls APIs.
 * Both endpoints are open (no key) and rate-limit generously.
 */

const VPIC_DECODE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended';
const RECALLS_URL = 'https://api.nhtsa.gov/recalls/recallsByVehicle';
const REQUEST_TIMEOUT = 15000;
const HISTORY_KEY = 'veyu_recent_vins';
const HISTORY_LIMIT = 5;

/** Errors we're happy to show the user verbatim. */
export class VinError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VinError';
  }
}

// I, O and Q are excluded from the VIN alphabet so they can't be confused with 1 and 0.
const NON_VIN_CHARS = /[^A-HJ-NPR-Z0-9]/g;

export function normalizeVin(raw) {
  return String(raw || '').toUpperCase().replace(NON_VIN_CHARS, '').slice(0, 17);
}

/* ── ISO 3779 check digit ──────────────────────────────────────────────────
   Position 9 of a 17-character VIN is a checksum over the other 16. It catches
   most single-character typos before we spend a network round trip on them. */
const TRANSLITERATION = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
};
const POSITION_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/** @returns {boolean|null} null when the VIN isn't 17 chars, so no checksum is defined. */
export function hasValidCheckDigit(vin) {
  if (!vin || vin.length !== 17) return null;

  let sum = 0;
  for (let i = 0; i < 17; i += 1) {
    const char = vin[i];
    const value = TRANSLITERATION[char] ?? Number(char);
    if (!Number.isFinite(value)) return false;
    sum += value * POSITION_WEIGHTS[i];
  }

  const remainder = sum % 11;
  return vin[8] === (remainder === 10 ? 'X' : String(remainder));
}

/**
 * @returns {{valid: boolean, message?: string, warning?: string}}
 * A failed check digit is a warning, not a hard stop — VINs from outside North
 * America aren't required to carry a valid one.
 */
export function validateVin(vin) {
  if (!vin) return { valid: false, message: 'Enter a VIN to decode.' };

  if (vin.length < 11) {
    return {
      valid: false,
      message: `A VIN is 11–17 characters — you've entered ${vin.length}.`
    };
  }

  if (hasValidCheckDigit(vin) === false) {
    return {
      valid: true,
      warning: "The check digit doesn't match, so this VIN may contain a typo. Decoding anyway."
    };
  }

  return { valid: true };
}

/* ── Requests ─────────────────────────────────────────────────────────────── */

async function fetchJson(url, externalSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  const relayAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', relayAbort);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new VinError(`The NHTSA service returned ${response.status}. Please try again shortly.`);
    }
    return await response.json();
  } catch (error) {
    // A caller-initiated abort means a newer lookup superseded this one; let it bubble.
    if (error?.name === 'AbortError') {
      if (externalSignal?.aborted) throw error;
      throw new VinError('The lookup timed out. Please try again.');
    }
    if (error instanceof VinError) throw error;
    throw new VinError('Could not reach the NHTSA service. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', relayAbort);
  }
}

/** NHTSA packs its diagnostics into "1 - reason; 7 - reason" strings. */
function parseNotes(record) {
  return [record.ErrorText, record.AdditionalErrorText]
    .filter(Boolean)
    .join('; ')
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part && !/^0\s*-\s*VIN decoded clean/i.test(part))
    .map((part) => part.replace(/^\d+\s*-\s*/, ''))
    .filter(Boolean);
}

/**
 * @returns {{record: object, notes: string[], partial: boolean}}
 * @throws {VinError} when NHTSA can't identify the vehicle at all.
 */
export async function decodeVin(vin, { signal } = {}) {
  const payload = await fetchJson(`${VPIC_DECODE_URL}/${encodeURIComponent(vin)}?format=json`, signal);
  const record = Array.isArray(payload?.Results) ? payload.Results[0] : null;

  if (!record) throw new VinError('NHTSA returned no data for this VIN.');

  const notes = parseNotes(record);

  // A syntactically valid VIN can still decode to nothing — the old code treated
  // that as success and rendered a table of dashes.
  const identified = Boolean(record.Make || record.ModelYear || record.VehicleType);
  if (!identified) {
    throw new VinError(notes[0] || 'This VIN could not be decoded. Double-check the characters and try again.');
  }

  const codes = String(record.ErrorCode || '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);

  return { record, notes, partial: codes.some((code) => code !== '0') };
}

/** @returns {{count: number, recalls: object[]}|null} null when we lack make/model/year. */
export async function fetchRecalls({ make, model, modelYear }, { signal } = {}) {
  if (!make || !model || !modelYear) return null;

  const query = new URLSearchParams({ make, model, modelYear });
  const payload = await fetchJson(`${RECALLS_URL}?${query.toString()}`, signal);
  const recalls = Array.isArray(payload?.results) ? payload.results : [];

  return { count: recalls.length, recalls };
}

/* ── Presentation helpers ─────────────────────────────────────────────────── */

export const VIN_FIELD_GROUPS = [
  {
    title: 'Vehicle',
    fields: [
      ['Make', 'Make'], ['Model', 'Model'], ['ModelYear', 'Year'],
      ['Trim', 'Trim'], ['Series', 'Series'], ['BodyClass', 'Body class'],
      ['VehicleType', 'Vehicle type'], ['Doors', 'Doors']
    ]
  },
  {
    title: 'Engine & drivetrain',
    fields: [
      ['EngineModel', 'Engine model'], ['EngineCylinders', 'Cylinders'],
      ['DisplacementL', 'Displacement'], ['EngineHP', 'Horsepower'],
      ['FuelTypePrimary', 'Fuel type'], ['TransmissionStyle', 'Transmission'],
      ['TransmissionSpeeds', 'Gears'], ['DriveType', 'Drive type'],
      ['ElectrificationLevel', 'Electrification']
    ]
  },
  {
    title: 'Manufacturing',
    fields: [
      ['Manufacturer', 'Manufacturer'], ['PlantCompanyName', 'Plant'],
      ['PlantCity', 'Plant city'], ['PlantCountry', 'Plant country'],
      ['VehicleDescriptor', 'Descriptor']
    ]
  },
  {
    title: 'Safety',
    fields: [
      ['AirBagLocFront', 'Front airbags'], ['AirBagLocSide', 'Side airbags'],
      ['AirBagLocCurtain', 'Curtain airbags'], ['ABS', 'ABS'],
      ['ESC', 'Stability control'], ['TPMS', 'Tyre pressure monitoring'],
      ['SeatBeltsAll', 'Seat belts'], ['GVWR', 'Gross weight rating']
    ]
  }
];

const GROUPED_KEYS = new Set(VIN_FIELD_GROUPS.flatMap((g) => g.fields.map(([key]) => key)));

// vPIC returns placeholders as well as blanks for fields it has nothing for.
const EMPTY_VALUES = new Set(['', 'not applicable', 'no data', 'unknown', 'null', '0']);

// vPIC shouts most of its values ("HONDA", "PASSENGER CAR"); these read better cased.
const SHOUTED_KEYS = new Set([
  'Make', 'VehicleType', 'Manufacturer', 'PlantCompanyName', 'PlantCity', 'PlantCountry'
]);

export function formatVinValue(key, rawValue) {
  if (rawValue === null || rawValue === undefined) return null;

  const value = String(rawValue).trim();
  if (EMPTY_VALUES.has(value.toLowerCase())) return null;

  if (key === 'DisplacementL') {
    const litres = Number(value);
    return Number.isFinite(litres) ? `${litres.toFixed(1)} L` : value;
  }
  if (key === 'EngineHP') return `${value} hp`;
  if (key === 'TransmissionSpeeds') return `${value}-speed`;
  if (SHOUTED_KEYS.has(key)) return titleCase(value);

  return value;
}

// Acronyms and marques that must not be title-cased. A blanket "leave short
// words alone" rule mangles "PASSENGER CAR" and "MOTOR CO., INC." instead.
const KEEP_UPPERCASE = new Set([
  'USA', 'US', 'UK', 'UAE', 'EU', 'LLC', 'LLP', 'NHTSA', 'GVWR', 'ABS', 'ESC',
  'TPMS', 'AWD', 'FWD', 'RWD', 'BEV', 'PHEV', 'HEV', 'SUV', 'MPV', 'GVW',
  'BMW', 'GMC', 'KTM', 'MG', 'VW', 'AMG', 'SRT', 'FCA', 'BYD', 'RAM'
]);

/** Title-cases words but preserves known acronyms, so "UNITED STATES (USA)"
 *  becomes "United States (USA)" rather than "United States (Usa)". */
export function titleCase(value) {
  if (!value) return '';
  return String(value).replace(/[A-Za-z]+/g, (word) =>
    KEEP_UPPERCASE.has(word.toUpperCase())
      ? word.toUpperCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

/** Group definitions, with empty fields and empty groups dropped. */
export function groupDecodedFields(record) {
  if (!record) return [];

  return VIN_FIELD_GROUPS.map((group) => ({
    title: group.title,
    rows: group.fields
      .map(([key, label]) => ({ key, label, value: formatVinValue(key, record[key]) }))
      .filter((row) => row.value)
  })).filter((group) => group.rows.length > 0);
}

/** Everything vPIC decoded that isn't already surfaced in a group. */
export function extraDecodedFields(record) {
  if (!record) return [];

  return Object.entries(record)
    .filter(([key]) => !GROUPED_KEYS.has(key) && !/^(ErrorCode|ErrorText|AdditionalErrorText|VIN|SuggestedVIN)$/.test(key))
    .map(([key, rawValue]) => ({
      key,
      label: key.replace(/([a-z0-9])([A-Z])/g, '$1 $2'),
      value: formatVinValue(key, rawValue)
    }))
    .filter((row) => row.value)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function buildVehicleTitle(record) {
  if (!record) return '';
  return [record.ModelYear, titleCase(record.Make), titleCase(record.Model), record.Trim]
    .filter(Boolean)
    .join(' ');
}

/** Plain-text summary for the clipboard. */
export function buildVinSummary(vin, record) {
  const lines = [`VIN ${vin}`, buildVehicleTitle(record), ''];
  groupDecodedFields(record).forEach((group) => {
    lines.push(group.title.toUpperCase());
    group.rows.forEach((row) => lines.push(`  ${row.label}: ${row.value}`));
    lines.push('');
  });
  lines.push('Source: NHTSA vPIC');
  return lines.join('\n');
}

/* ── Recent lookups ───────────────────────────────────────────────────────── */

export function getRecentVins() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter((entry) => typeof entry === 'string').slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function rememberVin(vin) {
  try {
    const next = [vin, ...getRecentVins().filter((entry) => entry !== vin)].slice(0, HISTORY_LIMIT);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecentVins();
  }
}

export function clearRecentVins() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
  return [];
}

export default {
  normalizeVin,
  validateVin,
  hasValidCheckDigit,
  decodeVin,
  fetchRecalls,
  groupDecodedFields,
  extraDecodedFields,
  buildVehicleTitle,
  buildVinSummary,
  formatVinValue,
  titleCase,
  getRecentVins,
  rememberVin,
  clearRecentVins,
  VinError
};
