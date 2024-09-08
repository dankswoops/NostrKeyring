import { generateSecretKey as generateSecretKeyNostr, getPublicKey } from 'nostr-tools';
import { nip19 } from 'nostr-tools';

export const generateSecretKey = (): string => {
  const secretKey = generateSecretKeyNostr();
  return nip19.nsecEncode(secretKey);
};

export const isValidSecretKey = (key: string): boolean => {
  try {
    const { type, data } = nip19.decode(key);
    return type === 'nsec' && data.length === 32;
  } catch {
    return false;
  }
};

export const getPublicKeyHex = (secretKey: string): string => {
  const { type, data } = nip19.decode(secretKey);
  if (type !== 'nsec') {
    throw new Error('Invalid secret key format');
  }
  return getPublicKey(data);
};

export const encodePublicKey = (pubkey: string): string => {
  return nip19.npubEncode(pubkey);
};

export { nip19 };