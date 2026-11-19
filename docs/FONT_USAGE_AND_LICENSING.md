# Font usage and licensing

Yemen Study does not bundle the uploaded font binaries.

## Dialogue ME

The supplied file is a Trial / personal-use font. Its embedded EULA excludes website and software embedding and prohibits redistribution. Zetafonts provides a separate Web License for WOFF/WOFF2 embedding on one registered domain, with a pageview tier:
- https://www.zetafonts.com/licensing/web
- https://www.zetafonts.com/dialogue

## RTL-Bushra

The supplied free download is marked for personal use. RTLtype says a registered licence is required for lawful commercial use, and its font licence says web-font delivery and embedding must be agreed and protected against direct access and extraction:
- https://rtltype.com/fonts/bushra
- https://mail.rtltype.com/license

Ask RTLtype for written permission and an authorised webfont build before using it for all website visitors.

## EidFontByRola

The supplied file is a decorative numeral set (digits 0–9), not a general Arabic reading face. No usage licence was present in the file metadata, so the website does not load or distribute it.

## Current website behaviour

- CSS prefers the locally installed family names `Dialogue Variable Trial` and `RTL-Bushra`.
- If a visitor does not have either font installed locally, the site falls back to IBM Plex Sans Arabic, Tahoma, or Arial.
- The site does not use `@font-face`, request missing WOFF2 files, or expose the supplied font binaries.
- Do not add the binaries to this public repository or deploy them as webfonts until the relevant rightsholder has granted the required web licence and supplied authorised webfont files.
