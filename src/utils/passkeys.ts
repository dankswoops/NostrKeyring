export const updateBackgroundKeys = async (keys: { pubkey: string | null, seckey: string | null }) => {
  console.log('Sending updateKeys message to background script');
  return new Promise<void>((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'updateKeys', keys }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error updating background keys:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('Background keys updated successfully');
        resolve();
      }
    });
  });
};

export const getPublicKeyFromBackground = async (): Promise<string | null> => {
  console.log('Requesting public key from background script');
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'getPublicKey' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting public key from background:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('Received public key from background:', response.pubkey);
        resolve(response.pubkey);
      }
    });
  });
};