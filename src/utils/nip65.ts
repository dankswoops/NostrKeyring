import { SimplePool, Filter } from 'nostr-tools';

const RELAY_URLS = ['wss://purplepag.es', 'wss://relay.damus.io', 'wss://relay.primal.net'];

interface UserMetadata {
  picture?: string;
  name?: string;
  lud16?: string;
}

export const fetchUserDataAndRelays = async (pubkeyHex: string): Promise<{ metadata: UserMetadata; relays: string[] }> => {
  const pool = new SimplePool();

  try {
    let metadata: UserMetadata = {};
    let relays: string[] = [];

    for (const relayUrl of RELAY_URLS) {
      try {
        // Fetch NIP-65 relays
        const relayFilter: Filter = {
          kinds: [10002],
          authors: [pubkeyHex],
          limit: 1,
        };
        const relayEvent = await pool.get([relayUrl], relayFilter);

        if (relayEvent) {
          relays = relayEvent.tags
            .filter((tag: string[]) => tag[0] === 'r')
            .map((tag: string[]) => tag[1]);
        }

        // Fetch user metadata
        const metadataFilter: Filter = {
          kinds: [0],
          authors: [pubkeyHex],
          limit: 1,
        };
        const allRelays = [relayUrl, ...relays];

        const metadataEvent = await pool.get(allRelays, metadataFilter);

        if (metadataEvent) {
          const content = JSON.parse(metadataEvent.content);
          metadata = {
            picture: content.picture,
            name: content.name,
            lud16: content.lud16
          };
          return { metadata, relays }; // Successfully fetched data, return immediately
        }
      } catch (err) {
        console.error(`Failed to fetch data from ${relayUrl}:`, err);
        // Continue to the next relay
      }
    }

    // If we've reached this point, we couldn't fetch the metadata
    return { metadata, relays };
  } finally {
    pool.close(RELAY_URLS);
  }
};