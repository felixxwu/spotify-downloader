export async function retry(maxRetries, retryDelay, fn, depth = 1) {
  if (depth > maxRetries) return;

  try {
    return await fn();
  } catch (e) {
    process.stdout.write(`Failed, trying again in ${retryDelay}s (${depth}/${maxRetries}) ... `);
    console.log('');
    console.log(e);
    console.log('');
    await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
    return await retry(maxRetries, retryDelay * 2, fn, depth + 1);
  }
}
