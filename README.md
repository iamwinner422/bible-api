# Bible Verses API

This API allows you to get Bible verses, chapters, or entire passages in different versions and languages using [YouVersion](https://bible.com) .
It is ideal for applications, websites, or bots that want to integrate Bible texts quickly and easily.

## Features

- Search for verses, chapters, or passages by book name, chapter, verse, version, and language.
- Multilingual support (English and French).
- Multiple Bible versions available for each language.
- Structured, easy-to-use responses.

## API Parameters

| Parameter | Type   | Required | Description | Default Value |
|-----------|--------|--------|---------------|-------------------|
| book      | string | Yes    | Book livre (ex: `John`, `Jean`) | - |
| chapter   | string | Yes    | Chapter number | - |
| verses    | string | Yes    | Verse number (ou `-1` pour tout le chapitre) | - |
| version   | string | No     | Version de la Bible (voir tableau ci-dessous) | `KJV` (en), `LSG` (fr) |
| language  | string | No     | Language (`en` or`fr`) | `en` |

## Using

```json
GET /verse?book=John&chapter=3&verses=16
```

Réponse (exemple) :
```json
{
  "citation": "John 3:16 (LSG)",
  "passage": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
}
```

## Available Bible versions

| Langue   | Versions disponibles |
|----------|----------------------|
| **en**   | KJV, ASV, AMP, AMPC, CPDV, ICL00D, NIV, NLT, NR06, VULG, B21, BKR, SNC, CSP, bibel.heute, Hfa, DELUT, LUTheute, SLB, NPK, SEB, SEBDT, SSV, MB20 |
| **fr**   | LSG, BCC1923, PDV2017, BDS, BFC, S21, NFC |

You can still a new version according to available versions on [YouVersion](https://bible.com) Bible.

## Default Values

- **Language** : English (`en`)
- **Version** : KJV (English), LSG (French)

## Credits

This project is fully inspired by [Glowstudent777's](https://github.com/Glowstudent777) [YouVersion-Core](https://github.com/Glowstudent777/YouVersion-Core) and [YouVersion-API](https://github.com/Glowstudent777/YouVersion-API).
