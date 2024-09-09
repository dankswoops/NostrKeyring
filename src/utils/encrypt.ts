import { argon2id } from 'hash-wasm';
import CryptoJS from 'crypto-js';

export const encryptSecretKey = async (nsec: string, password: string, pubkey: string): Promise<string> => {
  const hash = await argon2id({
    password,
    salt: pubkey,
    parallelism: 1,
    memorySize: 65536,
    iterations: 3,
    hashLength: 32,
    outputType: 'hex',
  });

  const encrypted = CryptoJS.AES.encrypt(nsec, hash).toString();
  return encrypted;
};

export const decryptSecretKey = async (encryptedKey: string, password: string, pubkey: string): Promise<string> => {
  const hash = await argon2id({
    password,
    salt: pubkey,
    parallelism: 1,
    memorySize: 65536,
    iterations: 3,
    hashLength: 32,
    outputType: 'hex',
  });

  const decrypted = CryptoJS.AES.decrypt(encryptedKey, hash).toString(CryptoJS.enc.Utf8);
  if (!decrypted.startsWith('nsec1')) {
    throw new Error('Invalid password');
  }
  return decrypted;
};