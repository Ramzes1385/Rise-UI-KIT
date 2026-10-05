# Utils

Утилиты кита импортируются из подпути `@ramzes1385/rise-ui-kit/utils` или как namespace `utils` из корня пакета (`import { utils } from '@ramzes1385/rise-ui-kit'`).

## fileUtils

Утилиты для работы с файлами.

```ts
import { formatFileSize } from '@ramzes1385/rise-ui-kit/utils'

const size = formatFileSize(1024) // '1.0 КБ'
```

---

## subtitleUtils

Разбор и запись субтитров.

```ts
import { decodeSubtitles, parseSubtitles, serializeSubtitles } from '@ramzes1385/rise-ui-kit/utils'

const cues = parseSubtitles(decodeSubtitles(await file.arrayBuffer())) // [{ start, end, text }]
const vtt = serializeSubtitles(cues) // 'WEBVTT\n\n00:00:01.000 --> …'
const srt = serializeSubtitles(cues, 'srt')
```

---

## mediaUtils

Время записи и амплитуды для волны.

```ts
import { computeWaveformPeaks, decodeWaveformPeaks, formatMediaTime, parseMediaTime } from '@ramzes1385/rise-ui-kit/utils'

formatMediaTime(83) // '1:23'
formatMediaTime(83, 3725) // '0:01:23' — с часами, как у длительности
parseMediaTime('1m30s') // 90
const peaks = await decodeWaveformPeaks('/voice/42.ogg', 48) // амплитуды 0…1 или null без Web Audio
const fromSamples = computeWaveformPeaks(buffer.getChannelData(0), 48)
```

---

## dateUtils

Утилиты для работы с датами.

```ts
import { formatDate } from '@ramzes1385/rise-ui-kit/utils'

const date = formatDate({
	date: new Date(),
	dateFormat: 'dd.MM.yyyy',
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	locale: 'ru-RU',
})
```

`formatRelativeTime(date, { now?, locale? })` — время относительно «сейчас» по правилам языка (`Intl.RelativeTimeFormat`): «сейчас», «5 минут назад», «вчера», «через 2 дня»; дальше недели — дата «3 мая», в другом году — с годом. Язык по умолчанию — язык кита. Так показывают время BaseNotificationCenter и BaseCommentThread.

```ts
import { formatRelativeTime } from '@ramzes1385/rise-ui-kit/utils'

formatRelativeTime(message.sentAt) // «12 минут назад»
formatRelativeTime('2025-05-14T09:00:00', { now: new Date(2025, 4, 15, 10, 30), locale: 'en-US' }) // «yesterday»
```

---

## colorUtils

Утилиты для работы с цветами.

```ts
import { isValidHex } from '@ramzes1385/rise-ui-kit/utils'

const valid = isValidHex('#42b883') // true; допускаются 3 и 6 знаков, с # и без
```

---

## urlUtils

Проверка URL из недоверенных данных (пункты меню, CMS, API) перед переходом, `window.open` или скачиванием. `isSafeUrl` пропускает относительные адреса и схемы из списка: по умолчанию `NAVIGATION_PROTOCOLS` (`http:`, `https:`, `mailto:`, `tel:`), для скачивания — `DOWNLOAD_PROTOCOLS` (`http:`, `https:`, `blob:`, `data:`). Эту же проверку выполняют `openExternalUrl`, `navigateAndEmit` и `downloadFile`.

```ts
import { DOWNLOAD_PROTOCOLS, isSafeUrl } from '@ramzes1385/rise-ui-kit/utils'

isSafeUrl('https://example.com') // true
isSafeUrl('/users/42') // true — относительный адрес
isSafeUrl('javascript:alert(1)') // false
isSafeUrl('blob:https://example.com/7f3c', DOWNLOAD_PROTOCOLS) // true
```

`isEmailFormat` — синтаксис адреса почты (`имя@домен.зона`, без пробелов); существование ящика не проверяет.

```ts
import { isEmailFormat } from '@ramzes1385/rise-ui-kit/utils'

isEmailFormat('team@example.com') // true
isEmailFormat('team@example') // false
```

---

## requisiteUtils

Проверка контрольных чисел реквизитов: `isValidInn` (10 и 12 цифр), `isValidOgrn` (ОГРН 13, ОГРНИП 15), `isValidKpp`, `isValidBik` (формат: 9 цифр, начинается с 04), `isValidAccount` и `isValidCorrespondentAccount` (счёт по БИК), `isValidSnils`. На них построены BaseRequisiteInput и проверка цифр в BaseDadataInput; те же функции по-прежнему экспортирует BaseRequisiteInput.

```ts
import { isValidAccount, isValidInn } from '@ramzes1385/rise-ui-kit/utils'

isValidInn('7707083893') // true
isValidAccount('40702810900000000001', '044525225') // проверка ключа счёта по БИК
```

---

## cardUtils

Банковская карта без зависимостей: таблица марок `CARD_BRANDS` (префиксы IIN, длины номера, группировка цифр, имя и длина кода — CVV2, CVC2, CVP2, CID…; источник — Wikipedia «Payment card number»), `getCardBrand` — марка по самому длинному совпавшему префиксу, `formatCardNumber` — группы по марке, `isValidCardNumber` — длина и Луна (`isLuhnValid`), `parseCardExpiry` и `isValidExpiry` — срок «ММ/ГГ» годен до конца месяца. Своя марка — `defineCardBrand`, её передают в `brands`; там же включаются общие национальные диапазоны (RuPay, Troy).

```ts
import { defineCardBrand, formatCardNumber, getCardBrand, isValidCardNumber, isValidExpiry } from '@ramzes1385/rise-ui-kit/utils'

getCardBrand('2200 1234')?.name // 'Mir'
formatCardNumber('378282246310005') // '3782 822463 10005'
isValidCardNumber('4242 4242 4242 4242') // true
isValidExpiry('09/26', new Date(2026, 9, 2)) // false — истекла в конце сентября
const club = defineCardBrand({ id: 'club', name: 'Club Card', prefixes: ['9999'], lengths: [16] })
getCardBrand('9999 0000', { brands: [club] })?.id // 'club'
```

---

## dadataUtils

Подсказки DaData без зависимостей: `createDadataSource(kind, options)` возвращает источник подсказок для `BaseDadataInput`, `BaseAddressInput` или своего поля. Виды — `DADATA_KINDS`: `address`, `party` (организации и ИП), `bank`, `fio`, `email`. Ключ API и адрес — снаружи: `token` уходит в заголовок `Authorization: Token …`; без ключа запросы идут на `baseUrl` — свой прокси, который сам добавляет ключ (ключ DaData в браузере виден всем). Источник принимает `signal` — устаревший запрос отменяется. `dadataRequisites(suggestion)` достаёт реквизиты организации или банка (`inn`, `kpp`, `ogrn`, `bik`, `correspondentAccount`) — их можно передать в `BaseRequisiteInput`; `dadataAddressText` — адрес организации или банка.

```ts
import { createDadataSource, dadataRequisites } from '@ramzes1385/rise-ui-kit/utils'

const party = createDadataSource('party', { token: import.meta.env.VITE_DADATA_TOKEN, count: 5, params: { status: ['ACTIVE'] } })
const viaProxy = createDadataSource('address', { baseUrl: '/api/dadata/suggest' })
const [first] = await party('сбербанк', { signal: new AbortController().signal })
dadataRequisites(first) // { inn: '7707083893', kpp: '773601001', ogrn: '1027700132195' }
```

---

## scriptUtils

`loadScript(src, options)` загружает внешний скрипт по требованию: один тег `<script async>` на адрес, повторный вызов ждёт ту же загрузку, после ошибки тег удаляется и следующий вызов пробует снова. `callbackName` — имя глобальной функции, которую вызовет сам скрипт (параметр `callback=` у Google Maps), `attributes` — атрибуты тега (`nonce`). `forgetScript(src)` убирает тег и запись о загрузке. На ней BaseMap загружает API поставщиков карт.

```ts
import { loadScript } from '@ramzes1385/rise-ui-kit/utils'

await loadScript('https://api-maps.yandex.ru/v3/?apikey=KEY&lang=ru_RU', { attributes: { nonce: cspNonce } })
```

---

## structuredDataUtils

Разметка schema.org в JSON-LD — основа проп `seo` у компонентов (composable `useStructuredData`).

- `serializeJsonLd(data)` — строка для `<script type="application/ld+json">`: `@context: https://schema.org` первым полем, `<`, `>`, `&`, U+2028 и U+2029 — юникод-эскейпами. Строка `</script>` в данных не закроет тег, JSON остаётся тем же.
- `mergeStructuredData(base, overrides)` — свои поля поверх собранных: вложенные объекты сливаются, списки и значения заменяются, `null` убирает поле, `undefined` оставляет собранное.
- `findMissingFields(data)` — обязательные поля, которых нет, по `STRUCTURED_DATA_REQUIRED` для `@type` и для вложенных объектов знакомых типов (`comment[].author.name`) (требования Google Rich Results и schema.org; путь через точку — вложенный объект, `[]` — каждый элемент списка, `|` — хватит одного). Незнакомый тип не проверяется.
- `resolveStructuredUrl(value, baseUrl)` — абсолютный адрес: поисковики ждут в разметке полные URL.
- `isDevelopmentBuild()` — `process.env.NODE_ENV !== 'production'`; значение подставляет сборщик приложения, без сборщика — `false`.

```ts
import { serializeJsonLd } from '@ramzes1385/rise-ui-kit/utils'

const json = serializeJsonLd({ '@type': 'Organization', name: 'Rise', url: 'https://example.com' })
```

---

## domUtils

`getFixedOrigin(container)` — где на экране начало координат для `position: fixed` внутри `container`. Обычно это окно (`{ x: 0, y: 0 }`), но предок с `transform`, `filter`, `contain` или `container-type` становится точкой отсчёта: так Storybook оборачивает истории на странице Docs, так же ведут себя анимированные окна. Выпадающие панели, подсказки и контекстное меню кита уже учитывают это; функция нужна своим fixed-элементам.

```ts
import { getFixedOrigin } from '@ramzes1385/rise-ui-kit/utils'

const origin = getFixedOrigin(panel.parentElement)
panel.style.top = `${trigger.getBoundingClientRect().bottom - origin.y}px`
```

---

## eventUtils, recurrenceUtils, icsUtils

Календарь событий (BaseEventCalendar): разбор дат событий, повторы и iCalendar — без зависимостей.

```ts
import { getEventsInRange, layoutWeek, layoutDay, expandRecurrence, parseRecurrenceRule, parseIcs, toIcs, readIcsFile, downloadIcs } from '@ramzes1385/rise-ui-kit/utils'

const range = { start: new Date(2026, 9, 1), end: new Date(2026, 10, 1) }
const items = getEventsInRange(events, range) // разобранные события периода, повторы — только в нём
const weekRow = layoutWeek(items, new Date(2026, 8, 28)) // полосы недели: column, span, lane
const dayColumn = layoutDay(items, new Date(2026, 9, 2), { startMinute: 480, endMinute: 1200 }) // top, height, column, columns

const file = toIcs(events, { name: 'Команда' }) // текст .ics: CRLF, перенос по 75 байт, время в UTC
const imported = parseIcs(file) // VEVENT → события; RRULE и EXDATE остаются правилом
```

- `parseEventDate` — `ГГГГ-ММ-ДД` (день, местное время), `ГГГГ-ММ-ДДTЧЧ:ММ` (местное время), ISO с поясом, Date. `normalizeEvent` — даты события, конец по умолчанию (день или час), конец события на весь день — полночь.
- `getEventsInRange(events, range)`, `groupByDay(items, range)` — события периода и дни для списка; `layoutWeek(items, start, days?)` — ряды полос, `layoutDay(items, day, window?)` — колонки пересекающихся событий. Помощники: `addDays`, `startOfDay`, `startOfWeek`, `daysBetween`, `toDayKey`.
- `parseRecurrenceRule` / `formatRecurrenceRule` — подмножество RRULE: `FREQ` (DAILY, WEEKLY, MONTHLY, YEARLY), `INTERVAL`, `BYDAY` (у MONTHLY — с номером: `2MO`, `-1FR`), `COUNT`, `UNTIL`, `WKST`. `expandRecurrence({ start, end, rule, rangeStart, rangeEnd, exdates?, isAllDay? })` — повторы в периоде; 31-е число пропускает короткие месяцы, как в RFC 5545. `parseIcsDate`, `formatIcsDate` — даты iCalendar.
- `parseIcs(text)` — VEVENT с DTSTART: UID, SUMMARY, DESCRIPTION, CATEGORIES (первая), RESOURCES (первый — `resourceId`), DTSTART, DTEND или DURATION, RRULE, EXDATE; время с `TZID` пересчитывается из пояса IANA (`Europe/Moscow`), пояс не из IANA (имена Windows из Outlook) — время считается местным. `toIcs(events, { name?, productId?, now? })` — ещё RESOURCES из `resourceId`. `parseIcsDuration('PT1H30M')` — `{ days, ms }`.
- `readIcsFile(file)` — события из выбранного файла (`Blob`/`File`); `downloadIcs(events, fileName?, options?)` — скачать `.ics` (через `downloadFile`).

---

## codeHighlightUtils

Подсветка кода без зависимостей — основа BaseCode и блоков кода BaseMarkdown.

```ts
import { highlightCode, tokenizeCode, normalizeCodeLanguage, getCodeLanguageName } from '@ramzes1385/rise-ui-kit/utils'

tokenizeCode('const a = 1', 'ts')
// [{ type: 'keyword', value: 'const' }, { type: null, value: ' a = ' }, { type: 'number', value: '1' }]
highlightCode('a\nb', 'js') // фрагменты по строкам — для номеров строк
normalizeCodeLanguage('sh') // 'bash'
getCodeLanguageName('py') // 'Python'
```

- Языки (`CODE_LANGUAGES`): `javascript`, `typescript`, `json`, `html`, `vue` (скрипт и стили внутри, выражения `{{ }}` и директивы), `css`, `scss`, `bash`, `python`; псевдонимы — `js`, `jsx`, `ts`, `tsx`, `jsonc`, `htm`, `xml`, `svg`, `sh`, `shell`, `zsh`, `console`, `py`. Неизвестный язык — один фрагмент простого текста.
- Виды фрагментов (`CODE_TOKEN_TYPES`): `keyword`, `string`, `number`, `comment`, `function`, `tag`, `attribute`, `property`, `variable`; `null` — обычный текст. Цвета — токены `--rise-code-<вид>`.
- Склеенный текст фрагментов всегда равен исходному коду. Выводите фрагменты текстом (`{{ token.value }}`), не через `v-html`.
- Это подсветка для чтения, а не разбор языка: регулярные выражения JavaScript, вложенные `${}` в шаблонных строках и heredoc Bash подсвечиваются как обычный текст или строка.

---

## Список utils

```txt
cardUtils
clipboardUtils
codeHighlightUtils
colorUtils
dadataUtils
dateUtils
domUtils
editorDomUtils
eventUtils
fileUtils
formUtils
htmlUtils
icsUtils
iconUtils
idUtils
imageUtils
mediaUtils
menuUtils
navigationUtils
numberInputUtils
paginationUtils
rangeUtils
ratingUtils
recurrenceUtils
requisiteUtils
scriptUtils
structuredDataUtils
subtitleUtils
tableUtils
timeUtils
tooltipUtils
treeUtils
typeUtils
urlUtils
```
