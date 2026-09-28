# План собственного аудио/видеоплеера для Rise UI Kit

> Статус: **в работе.** Готовы headless-ядро и минимальный `BaseMediaPlayer` — порция 4.1 в [v2/PLAN.md](../v2/PLAN.md); что сделано и чем реализация отличается от проекта — [раздел 11](#11-реализация-порция-41). Ниже — исходный проект по аудиту кода (HEAD `9c848ae` + исправления из [REPORT.md](./REPORT.md)): что из кита можно переиспользовать, чего не хватает и в каком порядке это делать. Оценки трудоёмкости ориентировочные.

## 1. Цели и границы

**Цели**
- Один компонент `BaseMediaPlayer` для видео и аудио поверх нативного `HTMLMediaElement`, с собственными контролами в стиле кита (токены, `variant`, `sizeScale`, тёмная тема).
- Доступность уровня WCAG 2.2 AA: клавиатура, скринридеры, субтитры, видимый фокус, `prefers-reduced-motion`.
- API в стиле кита: `is*`/`has*` для булевых props, `v-model` для управляемого состояния, `BaseComponentProps`, экспорт типов Props/Emits/Slots/Expose.
- Headless-ядро (composables) отдельно от UI: плеер можно собрать из своих контролов.
- Без обязательных внешних зависимостей: HLS/DASH — через необязательные адаптеры.
- SSR-безопасность: ни одного обращения к `window`/`document` вне `onMounted`.

**Не цели MVP:** DRM (EME), реклама (VAST/VMAP), трансляция на устройства (Chromecast/AirPlay), live-DVR, собственный демуксинг.

## 2. Архитектура

```
BaseMediaPlayer (UI-оболочка, слоты)
├─ MediaSurface ─ <video>/<audio> + постер + слой субтитров
├─ MediaOverlay ─ индикатор буферизации, ошибка с «Повторить», большая кнопка Play
└─ MediaControls (автоскрытие)
   ├─ MediaPlayButton        (toggle, aria-pressed)
   ├─ MediaSeekBar           (на базе BaseRange: буфер, главы, превью времени)
   ├─ MediaTime              (tabular-nums, «1:23 / 4:56»)
   ├─ MediaVolume            (кнопка mute + BaseRange по вертикали/горизонтали)
   ├─ MediaSettingsMenu      (скорость, качество, субтитры — паттерн menu button)
   ├─ MediaCaptionsButton
   ├─ MediaPipButton         (расширенная версия)
   └─ MediaFullscreenButton

Headless-ядро (src/composables):
  useMediaElement   — состояние и команды поверх HTMLMediaElement (машина состояний)
  useMediaSources   — выбор источника (canPlayType), качество, адаптеры HLS/DASH
  useTextTracks     — дорожки, активная дорожка, cuechange, свой рендер субтитров
  useFullscreen     — Fullscreen API + webkitEnterFullscreen (iOS)
  useMediaHotkeys   — горячие клавиши со скоупом на контейнер плеера
  useIdleControls   — автоскрытие контролов с учётом фокуса и hover
  useMediaSession   — Media Session API (расширенная версия)
```

Правила ядра:
- Состояние **выводится из media-элемента** (как `isAmResolved` в исправлении CAL-2), а не хранится параллельными флагами: `isPaused`, `currentTime`, `volume` читаются из событий элемента.
- `timeupdate` приходит 4–66 раз в секунду: реактивное `currentTime` обновляется через rAF-троттлинг; эмит `update:currentTime` — не чаще 4 раз в секунду.
- Команды возвращают `Promise` (`play()` может быть отклонён политикой автозапуска) — ошибка превращается в состояние, а не в необработанное исключение.
- Все URL (`src`, `poster`, `<track>`, «Скачать») проходят `isSafeUrl` со своим allowlist (`http:`, `https:`, `blob:`, `data:` для постеров): `NAVIGATION_PROTOCOLS` из `urlUtils` для медиа не подходит — он отклоняет `blob:`, который нужен MSE.

## 3. Контракт TypeScript (черновик)

```ts
import type { Ref } from 'vue'
import type { BaseComponentProps } from '@composables/useBaseComponent'

type MediaKind = 'video' | 'audio'

interface MediaSourceItem {
	/** URL источника; проверяется isSafeUrl с MEDIA_PROTOCOLS */
	src: string
	/** MIME с кодеками, например 'video/webm; codecs="vp9, opus"' — для canPlayType */
	type?: string
	/** Подпись в меню качества: «1080p» */
	label?: string
	/** Высота кадра в пикселях — для сортировки качеств */
	height?: number
	isDefault?: boolean
}

interface MediaTextTrackItem {
	src: string
	kind: 'subtitles' | 'captions' | 'chapters' | 'descriptions'
	srclang: string
	label: string
	isDefault?: boolean
}

interface MediaChapter {
	start: number
	end?: number
	title: string
}

type MediaErrorCode = 'aborted' | 'network' | 'decode' | 'unsupported' | 'autoplay-blocked' | 'timeout'

interface MediaPlayerError {
	code: MediaErrorCode
	message: string
	source?: MediaSourceItem
	/** Исходная ошибка (MediaError, DOMException) */
	cause?: unknown
}

interface MediaState {
	currentTime: number
	/** NaN до loadedmetadata, Infinity для live */
	duration: number
	buffered: ReadonlyArray<readonly [start: number, end: number]>
	isPaused: boolean
	isEnded: boolean
	isSeeking: boolean
	/** Ждём данных: показываем индикатор буферизации */
	isWaiting: boolean
	volume: number
	isMuted: boolean
	playbackRate: number
	readyState: number
	isFullscreen: boolean
	isPictureInPicture: boolean
	activeTextTrack: string | null
	activeSource: MediaSourceItem | null
	error: MediaPlayerError | null
}

/** Тексты для локализации (по умолчанию — UI_ARIA/UI_TEXT на русском) */
interface MediaPlayerLabels {
	play: string
	pause: string
	mute: string
	unmute: string
	seek: string
	volume: string
	settings: string
	speed: string
	quality: string
	captions: string
	captionsOff: string
	fullscreen: string
	exitFullscreen: string
	retry: string
	/** «1:23 из 4:56» — для aria-valuetext seek-бара */
	formatTimeValue: (current: number, duration: number) => string
}

interface MediaSourceAdapter {
	/** Может ли адаптер воспроизвести источник (например, .m3u8 без нативной поддержки) */
	canHandle: (source: MediaSourceItem, media: HTMLMediaElement) => boolean
	attach: (media: HTMLMediaElement, source: MediaSourceItem) => Promise<MediaAdapterHandle>
}

interface MediaAdapterHandle {
	levels?: MediaSourceItem[]
	setLevel?: (index: number) => void
	destroy: () => void
}

interface BaseMediaPlayerProps extends BaseComponentProps<string, 'root' | 'surface' | 'controls' | 'overlay'> {
	kind?: MediaKind
	sources: MediaSourceItem[] | string
	poster?: string
	/** Доступное имя плеера (region) */
	title: string
	tracks?: MediaTextTrackItem[]
	chapters?: MediaChapter[]
	/** Автозапуск допускается только без звука (WCAG 1.4.2, политики браузеров) */
	isAutoplay?: boolean
	isLoop?: boolean
	preload?: 'none' | 'metadata' | 'auto'
	crossorigin?: 'anonymous' | 'use-credentials'
	isPlaysinline?: boolean
	aspectRatio?: string
	hasControls?: boolean
	hasKeyboardShortcuts?: boolean
	playbackRates?: number[]
	/** Шаг стрелок ←/→, секунды */
	seekStep?: number
	/** Шаг J/L и PageUp/PageDown, секунды */
	seekStepLarge?: number
	volumeStep?: number
	/** Время бездействия до скрытия контролов, мс (не скрываются, пока фокус внутри) */
	idleTimeout?: number
	adapters?: MediaSourceAdapter[]
	labels?: Partial<MediaPlayerLabels>
	/** Разрешённые схемы URL источников; по умолчанию http:, https:, blob: */
	allowedProtocols?: readonly string[]
}

/** v-model: current-time, volume, is-muted, playback-rate, text-track, quality */
interface BaseMediaPlayerEmits {
	(event: 'update:currentTime', value: number): void
	(event: 'update:volume', value: number): void
	(event: 'update:isMuted', value: boolean): void
	(event: 'update:playbackRate', value: number): void
	(event: 'update:textTrack', value: string | null): void
	(event: 'update:quality', value: MediaSourceItem | null): void
	(event: 'play' | 'pause' | 'ended' | 'waiting' | 'playing' | 'seeking' | 'seeked' | 'loadedmetadata'): void
	(event: 'error', error: MediaPlayerError): void
	(event: 'fullscreen-change', isFullscreen: boolean): void
}

interface BaseMediaPlayerSlots {
	/** Полная замена контролов: состояние + команды */
	controls?: (props: { state: Readonly<MediaState>; actions: MediaPlayerActions }) => unknown
	poster?: () => unknown
	overlay?: (props: { state: Readonly<MediaState> }) => unknown
	error?: (props: { error: MediaPlayerError; retry: () => void }) => unknown
	/** Свой рендер реплики субтитров */
	cue?: (props: { text: string; track: string }) => unknown
	'settings-items'?: () => unknown
}

interface MediaPlayerActions {
	play: () => Promise<void>
	pause: () => void
	togglePlay: () => Promise<void>
	seek: (time: number) => void
	seekBy: (delta: number) => void
	setVolume: (value: number) => void
	toggleMute: () => void
	setPlaybackRate: (rate: number) => void
	setTextTrack: (id: string | null) => void
	setQuality: (source: MediaSourceItem) => void
	enterFullscreen: () => Promise<void>
	exitFullscreen: () => Promise<void>
	retry: () => void
}

interface BaseMediaPlayerExpose extends MediaPlayerActions {
	/** Нативный элемент — для интеграций (аналитика, MSE) */
	mediaElement: Readonly<Ref<HTMLMediaElement | null>>
	state: Readonly<MediaState>
}
```

Решения по контракту:
- Управляемость — через отдельные `v-model` (как `v-model:is-open` в оверлеях кита), неуправляемый режим — по умолчанию; режим не определяется через `useExplicitPropDetection` (EPD-1: снимок props устаревает), только через `props.x !== undefined`/`defineModel`.
- Все тексты — через `labels` с дефолтами в `UI_ARIA`/`UI_TEXT` (по образцу исправлений аудита, где имена кнопок вынесены в константы).
- Ошибки не выбрасываются наружу: `error` в состоянии + событие + слот с `retry`.

## 4. MVP и расширенная версия

| Возможность | MVP | Расширенная |
|---|---|---|
| Видео и аудио, несколько `<source>` с `type`, постер, `preload="metadata"` | ✓ | |
| Play/Pause, перемотка (клик, drag, клавиатура), время, громкость и mute | ✓ | |
| Буферизованный диапазон на seek-баре, индикатор ожидания (`waiting`) | ✓ | |
| Скорость воспроизведения (меню) | ✓ | |
| Субтитры WebVTT: выбор дорожки, свой рендер реплик, стиль | ✓ | Настройки стиля субтитров (размер, фон — BaseColorPicker) |
| Полноэкранный режим (контейнер плеера, iOS — `webkitEnterFullscreen`) | ✓ | |
| Горячие клавиши (скоуп — плеер), автоскрытие контролов | ✓ | Диалог-справка по клавишам |
| Ошибка с «Повторить», отказ автозапуска → большая кнопка Play | ✓ | |
| Качество из нескольких файлов | ✓ | ABR-уровни HLS/DASH через адаптеры |
| HLS/DASH (`hls.js`/`dash.js` как необязательные peer-зависимости) | | ✓ |
| Главы на seek-баре, превью кадра (VTT-спрайты) | | ✓ |
| Picture-in-Picture, Media Session API | | ✓ |
| Плейлист (BaseTable/BaseSlider), автопереход, shuffle/loop | | ✓ |
| Транскрипт с автоследованием и поиском (useAutoScroll, getHighlightedParts из чата) | | ✓ |
| Жесты: двойной тап ±10 с, свайп громкости (useSwipe на Pointer Events) | | ✓ |
| Запоминание громкости и скорости, live с DVR-окном и меткой LIVE | | ✓ |

## 5. Доступность (WCAG 2.2 AA)

| Критерий | Требование к плееру |
|---|---|
| 1.2.2 Субтитры, 1.2.5 Аудиодескрипция | `tracks` kind `captions`/`subtitles`/`descriptions`; кнопка субтитров доступна с клавиатуры |
| 1.4.2 Управление звуком | Автозапуск только без звука; mute и громкость — первые в порядке контролов |
| 1.4.3 / 1.4.11 Контраст | Контролы поверх видео — на подложке (scrim); иконки ≥ 3:1. Учесть TOK-1: белый на `--color-accent` сейчас 2.80:1 (light) / 2.26:1 (dark) |
| 1.4.13 Контент по наведению | Тултипы кнопок показываются и по фокусу, скрываются по Escape (TT-1) |
| 2.1.1 / 2.1.2 Клавиатура, без ловушек | Все контролы — нативные `<button>`/`role="slider"`; из fullscreen есть выход по Escape и кнопкой |
| 2.1.4 Односимвольные сочетания | K/J/L/M/F/C работают только при фокусе внутри плеера, отключаются `hasKeyboardShortcuts=false` |
| 2.2.2 Пауза, остановка | Автозапуск останавливается кнопкой; анимации учитывают `prefers-reduced-motion` |
| 2.4.7 / 2.4.11 Фокус видим и не перекрыт | Контролы не скрываются, пока фокус внутри панели или открыто меню |
| 2.5.7 Перетаскивание | Перемотка и громкость доступны кликом и клавиатурой, не только drag |
| 2.5.8 Размер цели | Кнопки ≥ 24×24 CSS px (нужен квадратный icon-only размер BaseButton) |
| 4.1.2 Имя, роль, значение | Toggle-кнопки с `aria-pressed` или сменой `aria-label`; seek — `aria-valuetext` «1:23 из 4:56»; громкость — «50 %» |
| 4.1.3 Сообщения о статусе | Буферизация и ошибки — через `role="status"`/`alert` без спама (не на каждый `waiting`) |

**Клавиатура** (по умолчанию, при фокусе внутри плеера): Space/K — play/pause; ←/→ — ±`seekStep` (5 с); J/L и PageUp/PageDown — ±`seekStepLarge` (10 с); Home/End — начало/конец; 0–9 — 0–90%; ↑/↓ — громкость ±5% (на seek-баре — перемотка); M — звук; C — субтитры; F — полный экран; `<`/`>` — скорость; Escape — закрыть меню / выйти из полноэкранного режима. Обработчик пропускает события из полей ввода и при `isComposing` (EDT-7/CHAT-13).

## 6. Что переиспользовать из кита и чего не хватает

| Задача плеера | Кандидат в ките | Не хватает (ID из реестров аудита) |
|---|---|---|
| Seek-бар | BaseRange (`role=slider`, стрелки эмитят `change` после RNG-1, точный шаг после RNG-2) | `formatValue`/`aria-valuetext`, отдельный шаг клавиатуры, Home/End/PageUp/PageDown, фокус ползунка после клика (RNG-3); события начала/конца drag — сейчас `timeupdate` перетирает позицию при перемотке; слой буфера и слот трека; превью времени под курсором (RNG-6/TT-1); `NaN`/`Infinity` длительности (RNG-5); Pointer Events и `setPointerCapture` (RNG-4) |
| Громкость | BaseRange вертикальный | `aria-orientation`, `aria-valuetext`, имя, колесо мыши (RNG-3) |
| Меню скорости/качества/субтитров | BaseDropdown/BasePopover + BaseMenu | Паттерн menu button: `aria-haspopup/expanded/controls`, `menuitemradio` + `aria-checked`, стрелки/Home/End/typeahead (DRP-2, MENU-1 развитие); вложенное меню закрывает родителя (CO-1); нет flip у края плеера (DP-1 overlays, FP-1); BaseSelect работает только мышью (SEL-2) |
| Полноэкранный режим | — (новый `useFullscreen`) | Всё телепортируемое в `body` не видно в fullscreen: тултипы, меню, уведомления, диалоги (OVL-1) → нужен `teleportTo`/контейнер слоёв и z-index внутри плеера (OVL-2) |
| Тултипы кнопок | BaseTooltip | Показ по фокусу, Escape, `role=tooltip` + `aria-describedby` (TT-1); стилизация (TT-2); rAF-цикл на каждый тултип (TT-3) |
| Кнопки | BaseButton (фокус в loading — BTN-1, клик в loading не всплывает к поверхности видео — BTN-7) | Toggle `isPressed`/`aria-pressed`, обязательное имя icon-only (BTN-2), квадратный размер, контраст primary (TOK-1) |
| Иконки | BaseIcon + спрайт (путь настраивается после ICON-1) | Иконки volume/mute, fullscreen/exit, settings, captions, PiP, ±10 с, скорость, повтор; корень-`div` внутри `<button>` (ICON-3); проверка имён (ICON-2) |
| Буферизация | BaseLoader | Текст в live-регионе (LDR-1 остаток), оверлей без `z-index: 9999` (LDR-3), reduced motion (ANI-2) |
| Ошибки воспроизведения | BaseNotification (`role=alert` для error после NTF-1) / BaseAlert | Режим без автозакрытия (NTF-3), кнопка действия «Повторить» (NTF-6), дедупликация (NTF-8) |
| Автоскрытие контролов | BaseAnimation | Префиксованные классы переходов (ANI-3), reduced motion (ANI-2), реактивный `show` (ANI-5) |
| Таймкоды | BaseText | Опция `tabular-nums` |
| Диалоги внутри плеера | BaseModal `isContained` + `useFocusTrap` (новый, после аудита) | `isContained` немодален и ограничен `100vh` (MOD-1 остаток); нужна модальность внутри контейнера |
| Жесты | useSwipe (подавление click после drag — SLD-11) | Pointer Events, touchcancel, фиксация оси (SLD-7) |
| Проверка URL | `isSafeUrl`, `DOWNLOAD_PROTOCOLS` | Свой allowlist для медиа (`blob:` для MSE) |
| Ресурсы | — | `useObjectUrl` с revoke при смене источника и unmount (FU-12, EDT-4, CHAT-3r) |
| Плейлист, главы | BaseTable (сортировка после TBL-1), BaseTree, BaseSlider | Активация строки с клавиатуры, `aria-current` (BaseTable); APG Tree (TRE-1/2); APG Carousel и пауза видео неактивных слайдов (SLD-5/6) |

## 7. Этапы

| Этап | Содержание | Оценка |
|---|---|---|
| 0. Предпосылки в ките | Слой оверлеев с `teleportTo` и стеком Escape/клика вне (CO-1, OVL-1/2, ESC-STACK); расширения BaseRange (RNG-3/4/5, drag-события, буфер); паттерн menu button (DRP-2) и меню APG (MENU-1); BaseTooltip по фокусу (TT-1); toggle у BaseButton; новые иконки; миксин reduced motion (OVL-5/ANI-2); `useObjectUrl` | 3–4 недели |
| 1. Headless-ядро | `useMediaElement` (машина состояний, rAF-троттлинг, ошибки), `useMediaSources`, `useTextTracks`, `useFullscreen`, `useMediaHotkeys`, `useIdleControls`; unit-тесты на фейковом `HTMLMediaElement` | 1,5–2 недели |
| 2. MVP UI | `BaseMediaPlayer` и контролы, stories (видео/аудио, субтитры, ошибка, отказ автозапуска, тёмная тема), e2e и visual на локальных фикстурах, документация, метка «экспериментальный» | 2–3 недели |
| 3. Расширения | Адаптеры HLS/DASH, PiP, Media Session, главы и превью кадров, плейлист, транскрипт, жесты | по задачам |

Этапы 0 и 1 можно вести параллельно: ядро не зависит от оверлеев.

## 8. Тестирование

- **Unit (Vitest + jsdom):** jsdom не воспроизводит медиа (`play()` не реализован) — ядро тестируется на фейковом элементе: класс-наследник `EventTarget` с управляемыми `currentTime/duration/buffered/paused` и методом отправки событий. Сценарии: машина состояний, троттлинг `timeupdate`, отказ `play()` (autoplay-blocked), ошибки `MediaError`, смена источника с сохранением позиции, размонтирование во время `await play()`.
- **Integration:** компоненты с фейковым элементом: клавиатура (все сочетания и их отключение), `aria-valuetext`, `aria-pressed`, автоскрытие при фокусе, меню настроек.
- **E2E (Playwright, Chromium):** реальные короткие фикстуры в `public/media/` (несколько секунд, WebM VP9/Opus: сборки Chromium в Playwright не содержат проприетарных кодеков H.264/AAC), WebVTT-дорожка. Проверки: воспроизведение и перемотка, буфер, полноэкранный режим (с оговоркой headless), субтитры, горячие клавиши, фокус после выхода из fullscreen.
- **Visual:** контролы в состояниях (пауза, воспроизведение, буферизация, ошибка, меню открыто, тёмная тема) на локальном постере — без внешних URL (иначе повторится TST-3).
- **Доступность:** axe на всех stories плеера в CI (сейчас play-функции stories в CI не запускаются — TST-2, это нужно решить до плеера), ручной сценарий со скринридером (NVDA + Chrome, VoiceOver + Safari).
- **SSR:** `renderToString` без обращений к `window`/`document`.

## 9. Риски

- **Политики автозапуска:** `play()` отклоняется без жеста пользователя — сценарий «отказ автозапуска» обязателен в MVP.
- **iOS Safari:** полноэкранный режим только у `<video>` (`webkitEnterFullscreen`) — собственные контролы и субтитры в нём не показываются; нужен нативный фолбэк и `playsinline`.
- **Субтитры:** стилизация `::cue` ограничена и различается по браузерам → свой рендер реплик по `cuechange`.
- **Производительность:** реактивное `currentTime` на каждый `timeupdate` перерисовывает панель; тултипы с rAF-циклом (TT-3) и `transition` ширины прогресса (PRG) усиливают нагрузку.
- **Fullscreen и слои:** без общего слоя оверлеев (OVL-1) меню, тултипы и тосты в fullscreen невидимы; Escape в fullscreen перехватывает браузер.
- **Ресурсы:** утечки objectURL/MSE при смене источника и размонтировании.
- **Кодеки в CI:** Chromium из Playwright не играет H.264/AAC — фикстуры только в открытых кодеках.

## 10. Вопросы владельцу

1. Нужен ли HLS/DASH в первой версии или достаточно прогрессивной загрузки?
2. Целевые браузеры (особенно iOS Safari) и минимальные версии.
3. Дизайн панели: собственный брендированный вид или нейтральный в токенах кита?
4. Нужны ли аудио-сценарии (подкасты: главы, скорость, запоминание позиции) наравне с видео?
5. Аналитика: какие события отдавать наружу (процент просмотра, ошибки, смена качества)?

## 11. Реализация (порция 4.1)

Сделано — в `src/components/BaseMediaPlayer/`:

| Часть | Что делает |
|---|---|
| `model/useMediaElement` | Состояние из событий `HTMLMediaElement`, `timeupdate` не чаще раза за кадр (rAF), команды; отказ `play()` — ошибка в состоянии (`AbortError` игнорируется, `NotAllowedError` → `autoplay-blocked`); `retry()` загружает источник заново и продолжает с той же позиции |
| `model/useMediaSources` | Адрес или список с MIME, allowlist схем (`http:`, `https:`, `blob:`), выбор по `canPlayType`, смена источника с сохранением позиции |
| `model/useMediaFullscreen` | Fullscreen API для контейнера, `webkitEnterFullscreen` для видео на iOS |
| `model/useMediaHotkeys` | Клавиши по `event.code` — работают в русской раскладке; пропускает поля ввода, IME, сочетания с Ctrl/Alt/Meta и Space на кнопках |
| `model/useIdleControls` | Автоскрытие панели во время воспроизведения; не скрывает, пока фокус в панели |
| `ui/MediaSlider` | Перемотка и громкость: `role="slider"`, `aria-valuetext` («0:05 из 0:12», «50 %»), Pointer Events с `setPointerCapture`, клавиши, загруженные отрезки |
| `ui/BaseMediaPlayer` | Видео, панель, сообщение об ошибке с «Повторить», слот `error`, события `play`, `pause`, `ended`, `error`, expose: состояние, команды, `getMediaElement()` |

Отличия от проекта:
- Ядро лежит в `model/` компонента, а не в `src/composables`: всё, что относится к плееру, собрано в одной папке, чтобы вынести его отдельным входом пакета, а затем отдельным репозиторием (порция 4.4 плана).
- Тексты — раздел `player` словаря кита (`defineLocale`), а не prop `labels`.
- Перемотка и громкость — свой `MediaSlider`, а не BaseRange: в BaseRange нет `aria-valuetext`, событий перетаскивания и слоя загруженных отрезков.
- Источник выбирается после монтирования по `canPlayType` самого элемента: до этого `src` не назначается, поэтому браузер не начинает загрузку неподходящего источника. Нет подходящего источника — ошибка `unsupported` без «Повторить».
- Expose отдаёт `getMediaElement()`, а не ref: Vue разворачивает ref в объекте expose, и тип не совпал бы со значением.

Дальше: меню скорости и качества, индикатор буферизации, аудио, `v-model`, e2e и visual на фикстурах (4.2); субтитры, дорожки, главы (4.3); отдельный вход пакета (4.4).

