# Typography and font licensing

## Active website typefaces

Yemen Study uses **IBM Plex Sans Arabic** for Arabic UI text and **IBM Plex Sans** for English text, numbers, and Latin-script labels. The matching families provide a consistent bilingual reading experience.

IBM identifies Plex as its corporate type family, documents Arabic language support, and publishes the family under the SIL Open Font License 1.1 (OFL). The website loads the selected webfont weights through Google Fonts with `font-display: swap` behaviour supplied by the Google Fonts stylesheet, and retains system font fallbacks.

Official references:
- IBM typeface overview: https://www.ibm.com/design/language/typography/typeface/
- IBM Plex project and licence: https://github.com/IBM/plex
- IBM Plex Sans Arabic package: https://github.com/IBM/plex/tree/master/packages/plex-sans-arabic

## Previously supplied trial fonts

The previous Dialogue ME / RTL-Bushra / EidFontByRola files are no longer used by the website and are not generated into the public build. The preparation script removes any stale generated files under `public/fonts`. Personal-use trial font binaries are not distributed as website assets.

## Fallback behaviour

When the Google Fonts stylesheet is unavailable, the site falls back to locally available system fonts: Segoe UI, Tahoma, and Arial. The site remains readable without loading external font resources.
