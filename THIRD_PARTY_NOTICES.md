# Сторонние материалы

## Font Awesome Free

Значки медиаплеера (`src/components/BaseMediaPlayer/types/controls/MediaIcon.types.ts` и `MediaBrandIcon.types.ts`, в сборке — `dist/media.js`) — контуры из [Font Awesome Free](https://fontawesome.com) версии 7.3.1 (наборы Solid, Regular и Brands, пакеты `@fortawesome/free-solid-svg-icons`, `@fortawesome/free-regular-svg-icons` и `@fortawesome/free-brands-svg-icons`), © Fonticons, Inc. Значки распространяются по лицензии [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/) (CC BY 4.0).

Изменения: каждый контур сдвинут по горизонтали в общее поле 640×512, чтобы значки разной ширины стояли по центру; значки «Картинка в картинке», мини-плеер, широкий экран и выход из него нарисованы по мотивам набора (скруглённые прямоугольники), к значку `chromecast` для подключённой трансляции добавлена заливка; фигуры «пуск» и «пауза» для плавного перехода между ними повторяют контуры `play` и `pause` из набора Solid.

Значки соцсетей — товарные знаки их владельцев; плеер показывает их только как ссылки на соответствующие сервисы.

Текст лицензии набора (раздел о шрифтах сокращён: шрифты Font Awesome в кит не входят):

```text
Fonticons, Inc. (https://fontawesome.com)

--------------------------------------------------------------------------------

Font Awesome Free License

Font Awesome Free is free, open source, and GPL friendly. You can use it for
commercial projects, open source projects, or really almost whatever you want.
Full Font Awesome Free license: https://fontawesome.com/license/free.

--------------------------------------------------------------------------------

# Icons: CC BY 4.0 License (https://creativecommons.org/licenses/by/4.0/)

The Font Awesome Free download is licensed under a Creative Commons
Attribution 4.0 International License and applies to all icons packaged
as SVG and JS file types.

--------------------------------------------------------------------------------

# Fonts: SIL OFL 1.1 License

In the Font Awesome Free download, the SIL OFL license applies to all icons
packaged as web and desktop font files. (Rise UI Kit does not include Font
Awesome font files; the full text is at http://scripts.sil.org/OFL.)

--------------------------------------------------------------------------------

# Code: MIT License (https://opensource.org/licenses/MIT)

In the Font Awesome Free download, the MIT license applies to all non-font and
non-icon files.

Copyright 2026 Fonticons, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in the
Software without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

--------------------------------------------------------------------------------

# Attribution

Attribution is required by MIT, SIL OFL, and CC BY licenses. Downloaded Font
Awesome Free files already contain embedded comments with sufficient
attribution, so you shouldn't need to do anything additional when using these
files normally.

We've kept attribution comments terse, so we ask that you do not actively work
to remove them from files, especially code. They're a great way for folks to
learn about Font Awesome.

--------------------------------------------------------------------------------

# Brand Icons

All brand icons are trademarks of their respective owners. The use of these
trademarks does not indicate endorsement of the trademark holder by Font
Awesome, nor vice versa. **Please do not use brand logos for any purpose except
to represent the company, product, or service to which they refer.**
```

## Эмодзи и их названия: emojibase-data и Unicode CLDR

Встроенный набор BaseEmojiPicker (`src/components/BaseEmojiPicker/model/data/emojiEn.ts` и `emojiRu.ts`, в сборке — отдельные файлы в `dist/chunks`) собран скриптом `scripts/generate-emoji-data.mjs` из пакета [emojibase-data](https://github.com/milesj/emojibase) версии 17.0.0, © 2017–2019 Miles Johnson, лицензия MIT. Названия эмодзи в пакете — из [Unicode CLDR](https://cldr.unicode.org), © Unicode, Inc., лицензия Unicode License v3.

Изменения: оставлены эмодзи до версии 14.0 без флагов, модификаторов и вариантов тона кожи; из данных взяты только символ, раздел и краткое название на русском и английском.

Лицензия emojibase-data:

```text
MIT License

Copyright (c) 2017-2019 Miles Johnson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Лицензия Unicode CLDR:

```text
UNICODE LICENSE V3

COPYRIGHT AND PERMISSION NOTICE

Copyright © 2001–2026 Unicode, Inc.

NOTICE TO USER: Carefully read the following legal agreement. BY
DOWNLOADING, INSTALLING, COPYING OR OTHERWISE USING DATA FILES, AND/OR
SOFTWARE, YOU UNEQUIVOCALLY ACCEPT, AND AGREE TO BE BOUND BY, ALL OF THE
TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE, DO NOT
DOWNLOAD, INSTALL, COPY, DISTRIBUTE OR USE THE DATA FILES OR SOFTWARE.

Permission is hereby granted, free of charge, to any person obtaining a
copy of data files and any associated documentation (the "Data Files") or
software and any associated documentation (the "Software") to deal in the
Data Files or Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, and/or sell
copies of the Data Files or Software, and to permit persons to whom the
Data Files or Software are furnished to do so, provided that either (a)
this copyright and permission notice appear with all copies of the Data
Files or Software, or (b) this copyright and permission notice appear in
associated Documentation.

THE DATA FILES AND SOFTWARE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF
THIRD PARTY RIGHTS.

IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE
BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES,
OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THE DATA
FILES OR SOFTWARE.

Except as contained in this notice, the name of a copyright holder shall
not be used in advertising or otherwise to promote the sale, use or other
dealings in these Data Files or Software without prior written
authorization of the copyright holder.

SPDX-License-Identifier: Unicode-3.0
```
