import * as nostrTools from './nostr-tools.js';

// Use nostrTools as needed
const { finalizeEvent, verifyEvent, nip04, nip44, nip19 } = nostrTools

let pubkey = null;
let seckey = null;

async function signEvent(event) {

  try {
	if (!event) throw new Error('Event object is undefined');
	let { type, data } = nip19.decode(seckey.toString());
	// Ensure required fields are present
    event.kind = event.kind || 1;
    event.created_at = event.created_at || Math.floor(Date.now() / 1000);
    event.tags = event.tags || [];
    event.content = event.content || '';
    event.pubkey = pubkey;
    // Use finalizeEvent from nostr-tools/pure
    const finalizedEvent = finalizeEvent(event, data);
    return finalizedEvent;
  } catch (error) {
    throw error;
  }
}

async function encryptMessageNip04(recipientPubkey, message) {
  try {
    const encryptedMessage = await nip04.encrypt(seckey, recipientPubkey, message);
    return encryptedMessage;
  } catch (error) {
    throw error;
  }
}

async function decryptMessageNip04(senderPubkey, encryptedMessage) {
  try {
    const decryptedMessage = await nip04.decrypt(seckey, senderPubkey, encryptedMessage);
    return decryptedMessage;
  } catch (error) {
    throw error;
  }
}

async function encryptMessageNip44(recipientPubkey, message) {
  try {
    const encryptedMessage = await nip44.encrypt(seckey, recipientPubkey, message);
    return encryptedMessage;
  } catch (error) {
    throw error;
  }
}

async function decryptMessageNip44(senderPubkey, encryptedMessage) {
  try {
    const decryptedMessage = await nip44.decrypt(seckey, senderPubkey, encryptedMessage);
    return decryptedMessage;
  } catch (error) {
    throw error;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === 'updateKeys') {
    pubkey = message.keys.pubkey;
    seckey = message.keys.seckey;
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'getPublicKey') {
    sendResponse(pubkey);
    return true;
  } else if (message.type === 'signEvent') {
    signEvent(message.event).then(signedEvent => {
      sendResponse(signedEvent);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.type === 'encryptMessageNip04') {
    encryptMessageNip04(message.recipientPubkey, message.content).then(encryptedMessage => {
      sendResponse(encryptedMessage);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.type === 'decryptMessageNip04') {
    decryptMessageNip04(message.senderPubkey, message.encryptedContent).then(decryptedMessage => {
      sendResponse(decryptedMessage);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.type === 'encryptMessageNip44') {
    encryptMessageNip44(message.recipientPubkey, message.content).then(encryptedMessage => {
      sendResponse(encryptedMessage);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  } else if (message.type === 'decryptMessageNip44') {
    decryptMessageNip44(message.senderPubkey, message.encryptedContent).then(decryptedMessage => {
      sendResponse(decryptedMessage);
    }).catch(error => {
      sendResponse({ error: error.message });
    });
    return true;
  }
});