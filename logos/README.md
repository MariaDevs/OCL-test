# Casino Logos

Drop your casino logo image files in this folder using these exact filenames.
They will appear automatically on every page (homepage, country pages, casino list, etc.).

## Wired files

The HTML references these exact filenames per casino:

| Filename | Casino | Status |
|---|---|---|
| `ultra-casino-logo.jpg` | Ultra Casino | ✅ present |
| `novajackpot-logo.jpg` | Nova Jackpot | ✅ present |
| `22-bet-casino-logo.jpg` | 22Bet Casino | ✅ present |
| `Stake.com-Casino-logo.jpg` | Stake Casino | ✅ present |
| `jackpoty-logo.jpg` | Jackpoty | ✅ present |
| `bitsler-casino-logo.jpeg` | Bitsler | ✅ present |
| `space-casino.png` | Space Casino | ⬜ missing → 🎰 fallback |
| `jackpotcity.png` | JackpotCity | ⬜ missing → 🎰 fallback |
| `leovegas-logo.jpg` | LeoVegas | ✅ present |
| `betsson-logo.png` | Betsson | ✅ present |
| `mr-bet-logo.png` | Mr Bet | ✅ present |
| `mystake-logo.png` | Mystake | ✅ present |
| `nomini-casino-logo.png` | Nomini | ✅ present |
| `Rivalo-Casino-logo.jpg` | Rivalo | ✅ present |
| `lvbet-logo.png` | LVBet | ✅ present |

To wire Space Casino / JackpotCity, drop a file with the exact name above,
or change the `<img src>` path in the HTML to your file.

### Unused logos in this folder

Present but not referenced by any brand on the site:
betobet, betway, talismania (not on the source site), and codere (casino is closed/cerrado).

## Image guidelines

- **Format:** PNG with transparent background (preferred), or JPG/SVG
- **Size:** ~200×200px is plenty — they display at 48–56px
- **Shape:** square or near-square works best inside the rounded logo box
- If you use SVG, change the file extension in the HTML accordingly (search for `/logos/ultra-casino-logo.jpg`)

## Fallback

If a logo file is missing, the card automatically falls back to a 🎰 emoji
so the layout never breaks. Once you add the file, the logo appears on the next deploy.
