import browser from 'webextension-polyfill'

window.nostr = {
  getPublicKey: async function() {
    return new Promise((resolve, reject) => {
      browser.runtime.sendMessage({method: 'getPublicKey'}, function(response) {
        resolve(response.pubkey);
      });
    });
  },
}
