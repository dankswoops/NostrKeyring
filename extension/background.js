import * as nostrTools from './nostr-tools.js';

// Use nostrTools as needed
const { finalizeEvent, verifyEvent, nip04, nip44 } = nostrTools

console.log('Nostr Key Signer: Background script starting');

const PUBKEY = '7e7e9c42a91bfef19fa929e5fda1b72e0ebc1a4c1141673e2794234d86addf4e';
const SECKEY = '67dea2ed018072d675f5415ecfaed7d2597555e202d85b3d65ea4e58d2d92ffa';

async function signEvent(event) {
  console.log('Nostr Key Signer: signEvent called with', event);
  
  try {
    if (!event) throw new Error('Event object is undefined');

    // Ensure created_at is set if not provided
    if (!event.created_at) {
      event.created_at = Math.floor(Date.now() / 1000);
    }

    // Finalize the event
    const finalizedEvent = finalizeEvent(event, SECKEY);

    // Verify the event
    const isGood = verifyEvent(finalizedEvent);

    if (isGood) {
      console.log('Nostr Key Signer: Event verified successfully');
      return finalizedEvent;
    } else {
      console.error('Nostr Key Signer: Event verification failed');
      return { error: { message: 'Event verification failed' } };
    }
  } catch (error) {
    console.error('Nostr Key Signer: Error in signEvent function', error);
    return { error: error.message };
  }
}

async function encryptMessageNip04(recipientPubkey, message) {
  console.log('Nostr Key Signer: encryptMessageNip04 called');
  try {
    const encryptedMessage = await nip04.encrypt(SECKEY, recipientPubkey, message);
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
    const decryptedMessage = await nip04.decrypt(SECKEY, senderPubkey, encryptedMessage);
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
    const encryptedMessage = await nip44.encrypt(SECKEY, recipientPubkey, message);
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
    const decryptedMessage = await nip44.decrypt(SECKEY, senderPubkey, encryptedMessage);
    console.log('Nostr Key Signer: Message decrypted (NIP-44)');
    return decryptedMessage;
  } catch (error) {
    console.error('Nostr Key Signer: Error in decryptMessageNip44 function', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Nostr Key Signer: Received message', message);

  if (message.type === 'getPublicKey') {
    console.log('Nostr Key Signer: Returning public key', PUBKEY);
    sendResponse(PUBKEY);
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