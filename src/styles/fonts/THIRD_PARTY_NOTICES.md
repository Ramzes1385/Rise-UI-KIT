# Сторонние материалы: шрифты

Шрифты Rise UI Kit — файлы `dist/fonts/**` пакета (исходники — `src/styles/fonts/**` в репозитории кита) — свободные шрифты по лицензии **SIL Open Font License 1.1** (OFL, текст ниже), а не по MIT, как остальной кит. По OFL их можно использовать, встраивать в сайты и приложения и распространять вместе с любым ПО; продавать сами шрифты отдельно нельзя, а изменённые версии остаются под OFL.

Все файлы — подмножества или преобразованные копии оригиналов из репозитория [google/fonts](https://github.com/google/fonts) (каталог `ofl/`); собирает их `build/fonts/build_fonts.py` в репозитории кита (исходники сверяются по SHA-256).

## Rise Grotesk — `--rise-font-sans`

| Файл | Шрифт | Авторские права | Изменения |
|---|---|---|---|
| `rise-grotesk.woff2` | Space Grotesk 2.000 (`ofl/spacegrotesk`) | Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk) | переведён в WOFF2 |
| `rise-grotesk-cyrillic.woff2` | Onest 2.001 (`ofl/onest`) | Copyright 2021 The Onest Project Authors (https://github.com/googlefonts/onest) | подмножество: кириллица, № ₸, стрелки; WOFF2 |

## Rise Mono — `--rise-font-mono`

| Файл | Шрифт | Авторские права | Изменения |
|---|---|---|---|
| `rise-mono-400.woff2`, `rise-mono-700.woff2` | Space Mono 1.003, Regular и Bold (`ofl/spacemono`) | Copyright 2016 The Space Mono Project Authors (https://github.com/googlefonts/spacemono) | переведены в WOFF2 |
| `rise-mono-cyrillic-400.woff2`, `rise-mono-cyrillic-500.woff2` | IBM Plex Mono 2.3, Regular и Medium (`ofl/ibmplexmono`) | Copyright © 2017 IBM Corp. with Reserved Font Name "Plex" | подмножество: кириллица, ₽ № ₸ ʻ ʼ, стрелки; внутреннее имя — «Rise Mono Cyrillic» (имя «Plex» зарезервировано, OFL, п. 3); WOFF2 |

## Знаки интерфейса — в обоих семействах

| Файл | Шрифт | Авторские права | Изменения |
|---|---|---|---|
| `rise-symbols.woff2` | Noto Sans Symbols 2 2.008 (`ofl/notosanssymbols2`), Noto Sans Math 3.000 (`ofl/notosansmath`), Noto Sans Symbols 2.003 (`ofl/notosanssymbols`) | Copyright 2022 The Noto Project Authors (https://github.com/notofonts/symbols, https://github.com/notofonts/math) | 22 знака (клавиши ⌘ ⌥ ⌃ ⇧ ⇪ ⌫ ⌦ ↵ ⏎ ⎋ ⇥ ⇤, ⋮ ⋯, ∈ ∉ ∋ ∌ ∧ ∨, ✓ ✕) из трёх шрифтов в одном файле, начертание 400, без хинтинга; внутреннее имя — «Rise Symbols»; WOFF2 |

## SIL Open Font License 1.1

Текст лицензии один для всех шрифтов выше; уведомление об авторских правах каждого шрифта — в его строке таблицы и в таблице `name` самого файла.

```text
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```
