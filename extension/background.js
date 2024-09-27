import * as nostrTools from './nostr-tools.js';

// Use nostrTools as needed
const { finalizeEvent, verifyEvent, nip04, nip44 } = nostrTools

console.log('Nostr Key Signer: Background script starting');

let pubkey = null;
let seckey = null;

async function signEvent(event) {
  console.log('Nostr Key Signer: signEvent called with', event);
  
  try {
    if (!event) throw new Error('Event object is undefined');

    // Ensure required fields are present
    event.kind = event.kind || 1;
    event.created_at = event.created_at || Math.floor(Date.now() / 1000);
    event.tags = event.tags || [];
    event.content = event.content || '';
    event.pubkey = pubkey;

    // Use finalizeEvent from nostr-tools/pure
    const finalizedEvent = finalizeEvent(event, seckey);

    console.log('Nostr Key Signer: Event signed', finalizedEvent);
    return finalizedEvent;
  } catch (error) {
    console.error('Nostr Key Signer: Error in signEvent function', error);
    throw error;
  }
}

async function encryptMessageNip04(recipientPubkey, message) {
  console.log('Nostr Key Signer: encryptMessageNip04 called');
  try {
    const encryptedMessage = await nip04.encrypt(seckey, recipientPubkey, message);
    console.log('Nostr Key Signer: Message encrypted (NIP-04)');
    return encryptedMessage;
  } catch (error) {
    console.error('Nostr Key Signer: Error in encryptMessageNip04 function', error);
    throw error;
  }
}

async function decryptMessageNip04(senderPubkey, encryptedMessage) {
  console.log('Nostr Key Signer: decryptMessageNip04 called');
  try {
    const decryptedMessage = await nip04.decrypt(seckey, senderPubkey, encryptedMessage);
    console.log('Nostr Key Signer: Message decrypted (NIP-04)');
    return decryptedMessage;
  } catch (error) {
    console.error('Nostr Key Signer: Error in decryptMessageNip04 function', error);
    throw error;
  }
}

async function encryptMessageNip44(recipientPubkey, message) {
  console.log('Nostr Key Signer: encryptMessageNip44 called');
  try {
    const encryptedMessage = await nip44.encrypt(seckey, recipientPubkey, message);
    console.log('Nostr Key Signer: Message encrypted (NIP-44)');
    return encryptedMessage;
  } catch (error) {
    console.error('Nostr Key Signer: Error in encryptMessageNip44 function', error);
    throw error;
  }
}

async function decryptMessageNip44(senderPubkey, encryptedMessage) {
  console.log('Nostr Key Signer: decryptMessageNip44 called');
  try {
    const decryptedMessage = await nip44.decrypt(seckey, senderPubkey, encryptedMessage);
    console.log('Nostr Key Signer: Message decrypted (NIP-44)');
    return decryptedMessage;
  } catch (error) {
    console.error('Nostr Key Signer: Error in decryptMessageNip44 function', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Nostr Key Signer: Received message', message);

  if (message.type === 'updateKeys') {
    console.log('Nostr Key Signer: Updating keys', message.keys);
    pubkey = message.keys.pubkey;
    seckey = message.keys.seckey;
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'getPublicKey') {
    console.log('Nostr Key Signer: Returning public key', pubkey);
    sendResponse(pubkey);
    return true;
  } else if (message.type === 'signEvent') {
    console.log('Nostr Key Signer: Signing event', message.event);
    signEvent(message.event).then(signedEvent => {
      console.log('Nostr Key Signer: Event signed successfully', signedEvent);
      sendResponse(signedEvent);
    }).catch(error => {
      console.error('Nostr Key Signer: Error signing event', error);
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.type === 'encryptMessageNip04') {
    console.log('Nostr Key Signer: Encrypting message (NIP-04)');
    encryptMessageNip04(message.recipientPubkey, message.content).then(encryptedMessage => {
      console.log('Nostr Key Signer: Message encrypted successfully (NIP-04)');
      sendResponse(encryptedMessage);
    }).catch(error => {
      console.error('Nostr Key Signer: Error encrypting message (NIP-04)', error);
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.type === 'decryptMessageNip04') {
    console.log('Nostr Key Signer: Decrypting message (NIP-04)');
    decryptMessageNip04(message.senderPubkey, message.encryptedContent).then(decryptedMessage => {
      console.log('Nostr Key Signer: Message decrypted successfully (NIP-04)');
      sendResponse(decryptedMessage);
    }).catch(error => {
      console.error('Nostr Key Signer: Error decrypting message (NIP-04)', error);
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.type === 'encryptMessageNip44') {
    console.log('Nostr Key Signer: Encrypting message (NIP-44)');
    encryptMessageNip44(message.recipientPubkey, message.content).then(encryptedMessage => {
      console.log('Nostr Key Signer: Message encrypted successfully (NIP-44)');
      sendResponse(encryptedMessage);
    }).catch(error => {
      console.error('Nostr Key Signer: Error encrypting message (NIP-44)', error);
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.type === 'decryptMessageNip44') {
    console.log('Nostr Key Signer: Decrypting message (NIP-44)');
    decryptMessageNip44(message.senderPubkey, message.encryptedContent).then(decryptedMessage => {
      console.log('Nostr Key Signer: Message decrypted successfully (NIP-44)');
      sendResponse(decryptedMessage);
    }).catch(error => {
      console.error('Nostr Key Signer: Error decrypting message (NIP-44)', error);
      sendResponse({ error: error.message });
    });
    return true;
  }
});

console.log('Nostr Key Signer: Background script loaded');