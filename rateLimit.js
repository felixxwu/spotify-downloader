import fs from 'fs';

/**
 *
 * @param {string} name
 * @param {number} maxDownloads
 * @param {'h' | 'm'} timePeriod
 */
export async function triggerRateLimiter(name, maxDownloads, timePeriod) {
  let timestamps = getTimestamps(name);

  const timePeriodMS = timePeriod === 'h' ? 1000 * 60 * 60 : 1000 * 60;
  timestamps.push(Date.now());
  timestamps = timestamps.filter(t => t > Date.now() - timePeriodMS);
  fs.writeFileSync(`${name}.timestamps`, JSON.stringify(timestamps), 'utf8');

  process.stdout.write(`${timestamps.length}/${timePeriod} ... `);

  if (timestamps.length >= maxDownloads) {
    const oldestTimestamp = Math.min(...timestamps);
    const oldestPlusTimePeriod = oldestTimestamp + timePeriodMS;
    const waitTime = oldestPlusTimePeriod - Date.now();
    const waitTimeMinutes = waitTime / 1000 / 60;
    process.stdout.write(`Sleeping (${Math.floor(waitTimeMinutes)}m ${Math.round((waitTimeMinutes % 1) * 60)}s) ... `);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

/**
 * @param {srting} name
 * @returns {number[]}
 */
function getTimestamps(name) {
  try {
    return JSON.parse(fs.readFileSync(`${name}.timestamps`, 'utf8'));
  } catch (e) {
    return [];
  }
}
