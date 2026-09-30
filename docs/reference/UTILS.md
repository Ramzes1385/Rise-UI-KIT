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

## domUtils

`getFixedOrigin(container)` — где на экране начало координат для `position: fixed` внутри `container`. Обычно это окно (`{ x: 0, y: 0 }`), но предок с `transform`, `filter`, `contain` или `container-type` становится точкой отсчёта: так Storybook оборачивает истории на странице Docs, так же ведут себя анимированные окна. Выпадающие панели, подсказки и контекстное меню кита уже учитывают это; функция нужна своим fixed-элементам.

```ts
import { getFixedOrigin } from '@ramzes1385/rise-ui-kit/utils'

const origin = getFixedOrigin(panel.parentElement)
panel.style.top = `${trigger.getBoundingClientRect().bottom - origin.y}px`
```

---

## Список utils

```txt
clipboardUtils
colorUtils
dadataUtils
dateUtils
domUtils
editorDomUtils
fileUtils
formUtils
htmlUtils
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
schemaUtils
subtitleUtils
tableUtils
timeUtils
tooltipUtils
treeUtils
typeUtils
urlUtils
```
