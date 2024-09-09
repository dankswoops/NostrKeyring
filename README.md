<!----------------------------------------------------------------------------->
<!----------------- https://github.com/dankswoops/NostrKeyring ---------------->
<!----------------------------------------------------------------------------->
<!---------------------- WHAT'S UP SEXY, YOU LIKE MY CODE? -------------------->
<!------------------------------- NOSTR KEYRING ------------------------------->
<!------------------------------------- BY ------------------------------------>
<!------┌───────────────────────────────────────────────────────────────┐------>
<!------│·▄▄▄▄   ▄▄▄·  ▐ ▄ ▄ •▄    .▄▄ · ▄▄▌ ▐ ▄▌             ▄▄▄·.▄▄ · │------>
<!------│██▪ ██ ▐█ ▀█ •█▌▐██▌▄▌▪   ▐█ ▀. ██· █▌▐█ ▄█▀▄  ▄█▀▄ ▐█ ▄█▐█ ▀. │------>
<!------│▐█· ▐█▌▄█▀▀█ ▐█▐▐▌▐▀▀▄·   ▄▀▀▀█▄██▪▐█▐▐▌▐█▌.▐▌▐█▌.▐▌ ██▀·▄▀▀▀█▄│------>
<!------│██. ██ ▐█ ▪▐▌██▐█▌▐█.█▌   ▐█▄▪▐█▐█▌██▐█▌▐█▌.▐▌▐█▌.▐▌▐█▪·•▐█▄▪▐█│------>
<!------│▀▀▀▀▀•  ▀  ▀ ▀▀ █▪·▀  ▀    ▀▀▀▀  ▀▀▀▀ ▀▪ ▀█▄▀▪ ▀█▄▀▪.▀    ▀▀▀▀ │------>
<!------└───────────────────────────────────────────────────────────────┘------>
<!------ npub1yrkexvt88h6cgd32gdcfm55auuz6rw6c70xj478gcz6lstz5czvs9s77xh ------>
<!----------------------------------------------------------------------------->
<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Watchers][watchers-shield]][watchers-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
[![Pull Requests][pr-shield]][pr-url]
<br />
<!----------------------------------------------------------------------------->
<div align="center">
  <a href="#">
    <img src="https://github.com/dankswoops/NostrKeyring/blob/main/public/nostrkeyring.svg" alt="Logo" width="80" height="80">
  </a>
  <h3 align="center">Nostr Keyring</h3>
  <p align="center">
    <i>"Because Nsec signers should have never required an email address..."</i>
  </p>
  <p align="center">
    <a href="https://primal.net/p/npub1yrkexvt88h6cgd32gdcfm55auuz6rw6c70xj478gcz6lstz5czvs9s77xh">Contact Founder</a>
    ·
    <a href="https://github.com/dankswoops/NostrKeyring/issues">Report Bug</a>
    ·
    <a href="https://github.com/dankswoops/NostrKeyring/issues">Request Feature</a>
  </p>
  <p align="center">
    NostrKeyChain.com -> NostrKeyRing.com
  </p>
</div>
<br />
<!----------------------------------------------------------------------------->

## About The Project
Nostr Keyring was made to be the simplest secure Nsec manager across all browsers.      
<br />

### Built With 
<div align="center">
  <a href="#"><img src="https://github.com/dankswoops/NostrKeyring/blob/main/icons/typescript.svg" width="60" height="60" alt="TypeScript"></a>
  <a href="#"><img src="https://github.com/dankswoops/NostrKeyring/blob/main/icons/react.svg" width="60" height="60" alt="React"></a>
  <a href="#"><img src="https://github.com/dankswoops/NostrKeyring/blob/main/icons/tailwindcss.svg" width="60" height="60" alt="TailwindCSS"></a>
  <a href="#"><img src="https://github.com/dankswoops/NostrKeyring/blob/main/icons/vite.svg" width="60" height="60" alt="Vite"></a>
  <a href="#"><img src="https://github.com/dankswoops/NostrKeyring/blob/main/icons/html.svg" width="60" height="60" alt="HTML5"></a>
  <a href="#"><img src="https://github.com/dankswoops/NostrKeyring/blob/main/icons/json.svg" width="60" height="60" alt="JSON"></a>
  <a href="#"><img src="https://github.com/dankswoops/NostrKeyring/blob/main/icons/nostr.svg" width="60" height="60" alt="Nostr"></a>
</div>
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!----------------------------------------------------------------------------->

## How The App Works
There's only 4 pages to this app.   
1. Login
- How to get here: This the apps main page unless you're logged in, the it's the User's Profile
- What does it do: Create UserProfiles, Access UserProfiles

2. Create
- How to get here: Create Profile button
- What does it do: 
- 1. Create or Input Nsec, has to be verifed to move foward
- 2. Nip-65 validates the "picture", "name", "lud16"
- 3. User select if they want to use encryption, passwords must match
- 4. Show password is optional
- 5. Create Profile button uses Storage API in production or Local Storage in development, it store this information: 
- 5. 1. id = time of creation shown in order of creation
- 5. 2. pubkey = npub Hex
- 5. 3. name = if found in Nip-65 search
- 5. 4. picture = if found in Nip-65 search
- 5. 5. lud16 = if found in Nip-65 search
- 5. 6. salt = created randomly for each user
- 5. 7. nsec or encrypted nsec

3. UserProfile
- How to get here: Clicking a User Profile
- What does it do: If encrypted, we have to login we can access this user
- - Nip-65 runs again and updates "picture", "name", "lud16"
- - Once logged in, full access to Nip-07
- - If encrypted, option to change password/re-encrypt nsec 
- - Option to show plain text nsec
- - Option to clipboard copy nsec (NOT SECURE, DONT)
- - Option to delete User Profile, must enter name to confirm

4. About
- How to get here: Clicking the Header take you to this page   
- What does it do: Select language, Find this Repo, Copy my Npub for zaps 🤫🧏🏻‍♂️     
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!----------------------------------------------------------------------------->

## How The Encyption Works
The user enters their own password    
On profile creation each user is assigned a 16-byte random salt   
Password and salt are appended then ran through a Key Derivation Function (KDF) using Argon2id   
Now we take the KDF and AES symmetrically encrypt the Nsec   
When it's time to un-encrypt the Nsec, if the result doesn't start with "nsec1" returned invalid   
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!----------------------------------------------------------------------------->

## How To Compile, Test, & Push
To Dev:   
1. Open in your editor, VSCodium is legit
2. You'll need NodeJS `https://nodejs.org`
3. On root in IDE > Open Intergated Terminal > `npm i` then `npm start`

To Build:   
1. On root in IDE > Open Intergated Terminal > `npm i` then `npm run build`
2. Open folder `Root`>`src`>`compiled`>`manifest.json`
3. Go into browser URL:
3. - firefox: `about:debugging#/runtime/this-firefox`
3. - chrome: ``
3. - safari: ``
4. Load Temporary Add-on...
5. Add `manifest.json` and check your extension to open

To Push:   
1. git add .
2. git commit -m ""
3. git push origin main
4. username
5. password token
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!----------------------------------------------------------------------------->

## Rules For Contributing
If you make a PR, just don't write shitty code, keep it clean   

If you want to make a suggestion, I'm chill, make it logical and submit   

For bug submissions TRY to include a few parts:
1. What is the issue
2. How to reproduce it
3. What is the desired outcome
4. What is the proposed fix
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!----------------------------------------------------------------------------->

## Open Source License (GPLv3)
This project is licensed under the GNU General Public License v3.0 (GPLv3). This means you are free to use, modify, and distribute this software, provided that all derivative works are also licensed under the GPLv3. This license ensures that the software remains open source and that all modifications are shared with the community. It prohibits the incorporation of this code into proprietary software. For more details, see the [LICENSE](LICENSE) file in this repository or visit [https://www.gnu.org/licenses/gpl-3.0.en.html](https://www.gnu.org/licenses/gpl-3.0.en.html).
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!----------------------------------------------------------------------------->

## Acknowledgments
Please note that this software is provided "as is," and we assume no liability for any issues that may arise from its use. There is no magic bullet for cyber security. Encrypting your nsec and storing it in the Storage API is superior to almost all forms of nsec management but advanced targeted attacks could still aquire your keys. If you use sim cards, post on centeralized social media, and use apple/windows products, worrying about state level actors zero-daying your keys should be the least of your concerns...   
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!----------------------------------------------------------------------------->

## Versions, Fixes, & Bugs
1.0.0: Offical Release 🎉🥳🎊   
- It's stable, no clue what's broken or buggy yet 🤪   
- Code Auditors! please examine `nip65.ts` and `manifest.json`'s connect-src 'self' wss://* and make sure it's secure.
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!----------------------------------------------------------------------------->

## Roadmap Before Full Release
1. implement nip-07 (for the love of god 😭)
1. add approve once, approve all button and request number
1. update permission list (site,revoke button)


1. Create keys, sign into client, change profile pic, test nip65 update


1. Add each language and all text remapping to i18 
1. have users confirm all localizations


1. compile to firefox, upload to mozilla dev account
1. compile to chrome, upload to chrome dev account
1. compile to safari, upload to safari dev account


1. optmize/organize code, comment it like a real keyboard gangster


1. add compile option to remove comment, check all compile options
<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<!----------------------------------------------------------------------------->

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/dankswoops/NostrKeyring.svg?style=for-the-badge
[contributors-url]: https://github.com/dankswoops/NostrKeyring/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/dankswoops/NostrKeyring.svg?style=for-the-badge
[forks-url]: https://github.com/dankswoops/NostrKeyring/network/members
[stars-shield]: https://img.shields.io/github/stars/dankswoops/NostrKeyring.svg?style=for-the-badge
[stars-url]: https://github.com/dankswoops/NostrKeyring/stargazers
[watchers-shield]: https://img.shields.io/github/watchers/dankswoops/NostrKeyring.svg?style=for-the-badge
[watchers-url]: https://github.com/dankswoops/NostrKeyring/watchers
[issues-shield]: https://img.shields.io/github/issues/dankswoops/NostrKeyring.svg?style=for-the-badge
[issues-url]: https://github.com/dankswoops/NostrKeyring/issues
[pr-shield]: https://img.shields.io/github/issues-pr/dankswoops/NostrKeyring.svg?style=for-the-badge
[pr-url]: https://github.com/dankswoops/NostrKeyring/pulls
<!----------------------------------------------------------------------------->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿  BYE BYE  ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⡽⣿⣿⣿⣿⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢷⣤⣙⣿⣿⣿⣹⣿⣿⣿⣿⢿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠛⠋⣢⡤⣽⣿⣿⠯⠛⠟⠛⠏⠛⠣⡿⣿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡩⠽⣻⢿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠉⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠂⢕⣂⣤⢤⣄⠀⠈⣟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡙⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠟⠉⠁⠈⠛⢧⡠⢜⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢡⣀⡀⠀⠀⠀⠀⢀⠀⢀⣴⣿⠟⣁⠄⠂⣁⣄⠀⠀⢣⢈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠉⠛⠻⠿⣶⣄⡀⠉⢰⠞⢁⣨⠖⢿⠿⠉⠉⠁⠀⠀⢇⠘⣿⠝⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀⣀⣤⣴⣴⣢⢼⠀⠀⠓⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡏⢆⠃⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠐⢏⠨⠋⠁⠀⡞⡆⠀⠱⡈⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⢾⡇⠤⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⢰⡇⠀⠀⠱⣀⠀⠀⠀⠀⠀⠀⠀⢀⡆⠀⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⢠⠀⠀⠀⠀⠀⢳⠀⠀⠀⠀⠀⢠⡟⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠰⣳⣴⠖⢉⠭⠊⠀⠀⠀⠀⠀⠈⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠄⠀⠀⠀⠀⢠⢻⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⡢⡀⠀⢤⡐⢉⡉⠭⠤⠘⠁⡀⠀⠀⠀⢀⡞⠀⣷⡘⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢯⠉⠁⠀⠀⠀⣀⠄⠄⠀⠀⠀⢀⡞⠀⠀⢸⣹⡘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡗⠒⠒⠚⠉⠁⠀⠀⠀⠀⢠⠞⠀⠀⠀⠀⡏⡇⢩⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡵⢁⢾⣄⠀⠀⠀⠀⠀⠀⠀⣰⠏⠀⠀⠀⠀⠀⠃⢠⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
<!--⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⠟⡌⠘⢅⣾⢻⠢⢄⣀⣀⣀⡤⠞⠁⠀⠀⠀⠀⠀⠀⡄⠘⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿-->
