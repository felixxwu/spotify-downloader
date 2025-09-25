import { client_id, client_secret } from './secrets.js';

/**
 *
 * @returns {Promise<string>}
 */
export async function getToken() {
  const response = await fetch(
    'https://accounts.spotify.com/api/token?grant_type=client_credentials',
    {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
    }
  );
  return (await response.json()).access_token;
}
