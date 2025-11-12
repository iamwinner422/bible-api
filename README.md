
# Bible Verses API

This API allows you to get Bible verses, chapters, or entire passages in different versions and languages using [YouVersion](https://bible.com).
It is ideal for applications, websites, or bots that want to integrate Bible texts quickly and easily.

## Features

- Search for verses, chapters, or passages by book name, chapter, verse, version, and language.
- Get a random Bible verse in any supported language and version.
- Multilingual support (English and French).
- Multiple Bible versions available for each language.
- Structured, easy-to-use responses.

## Get a Random Bible Verse

You can retrieve a random verse from the Bible using the following endpoint:

```
GET /verse/random
```

### Query Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| version   | string | No       | Bible version (e.g. `KJV`, `LSG`, etc.) |
| language  | string | No       | Language code (`en` or `fr`) |

- If only the version is provided, the API will find the corresponding language and return a random verse from that language and version.
- If only the language is provided, the API will use the default version for that language.
- If both are provided, the API will use the specified language and version.
- If neither is provided, the API will use English (`en`) and the default version (`KJV`).

### Example Request

```
GET /verse/random?version=LSG&language=fr
```

### Example Response

```json
{
  "citation": "Psaumes 23:1 (LSG)",
  "passage": "L’Éternel est mon berger: je ne manquerai de rien."
}
```

## Get Today's Verse (Verse of the Day)

You can retrieve Youversion daily verse for a specific language using the following endpoint:

```
GET /verse/today
```

### Query Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| language  | string | No       | Language code (any language supported by Youversion Bible). |

- The API returns the verse selected for the current day by YouVersion for the given language.
- Responses for the same language are cached in-memory and will expire automatically at local midnight. This means repeated calls on the same day will return the cached result; a fresh fetch is performed after midnight.

### Example Request

```
GET /verse/today?language=en
```

### Example Response

```json
{
  "citation": "Psalms 23:1 (KJV)",
  "passage": "The Lord is my shepherd; I shall not want."
}
```

## Get a specified Bible Verse or Chapter

You can also get a verse or entire chapter using the following endpoint:

```
GET /verse?book=John&chapter=3&verses=16
```
### Query Parameters

| Parameter | Type   | Required | Description | Default Value |
|-----------|--------|----------|-------------|---------------|
| book      | string | Yes      | Book name (e.g. `John`, `Jean`) | - |
| chapter   | string | Yes      | Chapter number | - |
| verses    | string | Yes      | Verse number (or `-1` for the whole chapter) | - |
| version   | string | No       | Bible version (see table below) | `KJV` (en), `LSG` (fr) |
| language  | string | No       | Language (`en` or `fr`) | `en` |


### Example response:

```json
{
  "citation": "John 3:16 (KJV)",
  "passage": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
}
```

## Available Bible Versions

| Language | Available Versions |
|----------|-------------------|
| **en**   | KJV, ASV, AMP, AMPC, CPDV, ICL00D, NIV, NLT, NR06, VULG, B21, BKR, SNC, CSP, bibel.heute, Hfa, DELUT, LUTheute, SLB, NPK, SEB, SEBDT, SSV, MB20 |
| **fr**   | LSG, BCC1923, PDV2017, BDS, BFC, S21, NFC |

You can use any available version from [YouVersion](https://bible.com).

## Default Values

- **Language**: English (`en`)
- **Version**: KJV (English), LSG (French)

## Credits

This project is fully inspired by [Glowstudent777's](https://github.com/Glowstudent777) [YouVersion-Core](https://github.com/Glowstudent777/YouVersion-Core) and [YouVersion-API](https://github.com/Glowstudent777/YouVersion-API).
