import browser from 'webextension-polyfill'

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const {id, method, data} = JSON.parse(request)

  switch (method) {
    case 'getPublicKey': sendResponse({pubkey: 'my pubkey'})
  }
})
