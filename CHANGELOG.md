# Change Log

## [2.2.1](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v2.2.1)

#### Dependencies:

[Security] Bump socket.io-parser from 4.2.1 to 4.2.3 (#535)
Bump cross-fetch from 3.1.5 to 3.1.6 (#523)
[Security] Bump engine.io and socket.io (#515)
Bump js-cookie from 3.0.1 to 3.0.5 (#509)
[Security] Bump ua-parser-js from 0.7.31 to 0.7.33 (#457)
[Security] Bump json5 from 2.2.0 to 2.2.3 (#450)
[Security] Bump qs and body-parser (#437)
[Security] Bump engine.io and socket.io (#426)
[Security] Bump socket.io-parser from 4.0.4 to 4.0.5 (#418)
Bump jssha from 2.3.1 to 3.3.0 (#307, #416, #458, #529, #544, #406)
[Security] Bump async from 2.6.3 to 2.6.4 (#303)
[Security] Bump minimist from 1.2.5 to 1.2.6 (#291)
Bump fp-ts from 2.11.8 to 2.15.0 (#286, #298, #309, #317, #367, #382, #410, #506, #527)

## [2.2.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v2.2.0)

#### New features:

- Configurable `clabId` query parameter name ([#283](https://github.com/contactlab/contacthub-sdk-browser/issues/283))

#### Dependencies:

- [Security] Bump follow-redirects from 1.14.7 to 1.14.8 ([#260](https://github.com/contactlab/contacthub-sdk-browser/pull/260))

## [2.1.1](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v2.1.1)

#### Dependencies:

- [Security] fix vulnerabilities
- Bump cross-fetch from 3.1.4 to 3.1.5 ([#231](https://github.com/contactlab/contacthub-sdk-browser/pull/231))
- Bump fp-ts from 2.11.5 to 2.11.8 ([#215](https://github.com/contactlab/contacthub-sdk-browser/pull/215), [#223](https://github.com/contactlab/contacthub-sdk-browser/pull/223), [#232](https://github.com/contactlab/contacthub-sdk-browser/pull/232))

## [2.1.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v2.1.0)

#### New features:

- Handle aggregate nodes ([#80](https://github.com/contactlab/contacthub-sdk-browser/issues/80))

#### Dependencies:

- Bump js-cookie from 2.2.1 to 3.0.1 ([#89](https://github.com/contactlab/contacthub-sdk-browser/pull/89))
- Bump tslib from 2.3.0 to 2.3.1 ([#103](https://github.com/contactlab/contacthub-sdk-browser/pull/103))
- [Security] Bump ansi-regex from 5.0.0 to 5.0.1 ([#142](https://github.com/contactlab/contacthub-sdk-browser/pull/142))
- [Security] Bump tmpl from 1.0.4 to 1.0.5 ([#131](https://github.com/contactlab/contacthub-sdk-browser/pull/131))
- [Security] Bump path-parse from 1.0.6 to 1.0.7 ([#100](https://github.com/contactlab/contacthub-sdk-browser/pull/100))
- Bump fp-ts from 2.10.5 to 2.11.4 ([#88](https://github.com/contactlab/contacthub-sdk-browser/pull/88), [#146](https://github.com/contactlab/contacthub-sdk-browser/pull/146))

## [2.0.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v2.0.0)

#### New features:

- Third party CDN instead of assets.contactlab.it ([#66](https://github.com/contactlab/contacthub-sdk-browser/issues/66))

#### Documentation:

- API documentation ([#67](https://github.com/contactlab/contacthub-sdk-browser/issues/67))

#### Internal:

- Move to Typescript ([#64](https://github.com/contactlab/contacthub-sdk-browser/issues/64))
- Unit tests ([#65](https://github.com/contactlab/contacthub-sdk-browser/issues/65))

## [1.4.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v1.4.0)

This version adds a `debug` flag in configuration object which if it is set to `true` will lead the SDK to log errors to the browser's console.

#### Bug fixes:

- Calls to Hub api via xr do not catch promises rejections ([#44](https://github.com/contactlab/contacthub-sdk-browser/issues/44))

## [1.3.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v1.3.0)

#### New features:

- Reset cookie if token changes ([#40](https://github.com/contactlab/contacthub-sdk-browser/issues/40))
- Expire utm information after 30 minutes ([#39](https://github.com/contactlab/contacthub-sdk-browser/issues/39))

## [1.2.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v1.2.0)

#### New features:

- Support new "consents" object for Customers ([#36](https://github.com/contactlab/contacthub-sdk-browser/issues/36))

## [1.1.1](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v1.1.1)

#### Bug fixes:

- window.Promise should not be modified ([#34](https://github.com/contactlab/contacthub-sdk-browser/issues/34))

## [1.1.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v1.1.0)

#### Bug fixes:

- contextInfo cannot be set ([#32](https://github.com/contactlab/contacthub-sdk-browser/issues/32))

#### New features:

- Allow using an existing customerId ([#30](https://github.com/contactlab/contacthub-sdk-browser/issues/30))

## [1.0.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v1.0.0)

#### New features:

- Automatic Google Analytics properties for Events ([#28](https://github.com/contactlab/contacthub-sdk-browser/issues/28))
- run build on Travis ([#24](https://github.com/contactlab/contacthub-sdk-browser/issues/24))

## [0.4.1](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v0.4.1)

#### Bug fixes:

- Update to work with new API version (without hyperlinks) ([#22](https://github.com/contactlab/contacthub-sdk-browser/issues/22))

## [0.4.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v0.4.0)

#### Bug fixes:

- externalId is not part of the cookie hash ([#20](https://github.com/contactlab/contacthub-sdk-browser/issues/20))
- bringBackProperties behaviour ([#16](https://github.com/contactlab/contacthub-sdk-browser/issues/16))
- remove findByExternalId call ([#14](https://github.com/contactlab/contacthub-sdk-browser/issues/14))

#### New features:

- add resetSessionId method to use when a user logs out ([#18](https://github.com/contactlab/contacthub-sdk-browser/issues/18))

## [0.3.0](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v0.3.0)

#### New features:

- Handle 409 API errors on create ([#12](https://github.com/contactlab/contacthub-sdk-browser/issues/12))
- Use "referer" instead of "referrer"

## [0.2.2](https://github.com/contactlab/contacthub-sdk-browser/releases/tag/v0.2.2)

#### New features:

- Only infer props if event type is "viewedPage" ([#10](https://github.com/contactlab/contacthub-sdk-browser/pull/10))
