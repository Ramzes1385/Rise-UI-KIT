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

**Не цели MVP:** DRM (EME), live-DVR, собственный демуксинг. Реклама (свои вставки и VAST) и трансляция на устройства (Remote Playback API, Google Cast) вошли в план по решению владельца — раздел 12.

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
- Ядро лежит в `model/` компонента, а не в `src/composables`: всё, что относится к плееру, собрано в одной папке, чтобы вынести его отдельным входом пакета, а затем отдельным репозиторием (порция 4.13 плана).
- Тексты — раздел `player` словаря кита (`defineLocale`), а не prop `labels`.
- Перемотка и громкость — свой `MediaSlider`, а не BaseRange: в BaseRange нет `aria-valuetext`, событий перетаскивания и слоя загруженных отрезков.
- Источник выбирается после монтирования по `canPlayType` самого элемента: до этого `src` не назначается, поэтому браузер не начинает загрузку неподходящего источника. Нет подходящего источника — ошибка `unsupported` без «Повторить».
- Expose отдаёт `getMediaElement()`, а не ref: Vue разворачивает ref в объекте expose, и тип не совпал бы со значением.

Дальше — по разделу 12.

### Субтитры (порция 4.4)

- Реплики выводит сам плеер, а не `<track>`: браузеры не читают SRT, `::cue` почти не оформляется и не перетаскивается. Файл загружается `fetch` (по CORS, с cookie при `crossorigin="use-credentials"`), разбирается `model/subtitles.ts` (WebVTT и SRT, BOM, CRLF, UTF-16, Windows-1251 — русские .srt часто в этой кодировке).
- Во время воспроизведения позиция для субтитров читается из элемента каждый кадр (rAF), а не по `timeupdate` (до 250 мс опоздания); на паузе — из состояния.
- Оформление и место — общие для всех записей: `localStorage` `rise-media:captions`. Положение — центр блока в процентах кадра, блок не выходит за край; у положения «внизу» блок поднимается над панелью, пока она видна.
- Шрифт — от ширины плеера: `container-type: inline-size` на слое субтитров, а не на корне, чтобы не менять позиционирование меню.
- Свой файл зрителя — дорожка `file:<имя>`; дорожки со схемами кроме `http:`, `https:`, `blob:`, `data:` отбрасываются.

### Озвучки (порция 4.5)

- Отдельный аудиофайл играет скрытый `<audio>`: он повторяет за видео запуск, паузу, ожидание, перемотку и скорость; по `timeupdate` расхождение больше 0,3 с исправляется перемоткой аудио. Если аудиофайл сам не успевает загрузиться, видео его не ждёт — звук догонит картинку после загрузки; для медленных сетей лучше HLS с дорожками в потоке (порция 4.6).
- Громкость и «выключить звук» относятся к элементу, который звучит (`useMediaElement(media, sound)`): при переключении громкость переходит к новому элементу, видео с внешней озвучкой всегда без звука. Поэтому `v-model:volume` и `v-model:is-muted` не меняются от смены озвучки.
- Дорожки внутри файла — `HTMLMediaElement.audioTracks` (Safari; в Chrome и Firefox его нет) — показываются, только если `audioTracks` не передан: смешивать два способа нет смысла.
- Озвучки нескольких полных видеофайлов (по файлу на озвучку) пока не поддерживаются: их можно передать разными `sources` и переключать снаружи; при необходимости — отдельная порция.

### HLS (порция 4.6)

- `hls` — класс hls.js, который передаёт приложение; плеер описывает только нужную ему часть API (`MediaHlsConstructor`), совместимость с типами hls.js 1.7 проверена. Адаптер включается для источника .m3u8 (или MIME `mpegurl`), если браузер не играет HLS сам и `Hls.isSupported()`; в Safari работает встроенный HLS.
- Меню качества стало общим: `{ id, label }` — адрес файла, `auto` или `hls:<уровень>`. Выбор уровня — `hls.currentLevel` (сразу, с очисткой буфера), «Авто» — `-1`.
- Субтитры потока: hls.js создаёт `TextTrack` элемента и сам выбирает дорожку по её `mode`. Плеер ставит выбранной дорожке `hidden` (вывод браузера выключен), остальным — `disabled`, и берёт реплики из `activeCues` по `cuechange`. Так же показываются субтитры встроенного HLS Safari и дорожки внутри файла.
- Ошибки: на фатальную ошибку сети hls.js делает `startLoad()`, на ошибку медиа — `recoverMediaError()`, один раз; дальше — ошибка плеера (`network` или `decode`) и «Повторить», которое создаёт hls.js заново и продолжает с той же позиции.

### Серии и главы (порция 4.7)

- Данные серии заменяют одноимённые props плеера (`sources`, `poster`, `tracks`, `audioTracks`, `chapters`); `sources` стал необязательным. Серии идут подряд через сезоны: следующая после последней серии сезона — первая следующего.
- Выбранная серия запускается сразу (выбор из списка, кнопки, Shift+N, отсчёт): браузер разрешает это после первого действия зрителя на странице.
- Позиция: ключ `storageKey:<id серии>`; сохранённая позиция читается после загрузки метаданных новой серии, а до этого позиция не записывается — старое время не попадёт в ключ новой серии. Смена качества позицию заново не предлагает.
- Главы на шкале — разрывы через `mask-image` дорожки; подсказка при наведении — у `MediaSlider` (`hoverText`).
- Панель управления вынесена в `ui/MediaControlBar.vue`: плеер отдаёт ей свой контекст через `provide` (`model/usePlayerContext.ts`), шаблон `BaseMediaPlayer.vue` снова меньше 400 строк.

### Своя реклама (порция 4.8)

- Объявления играют в отдельном `<video>` (или `<img>`) поверх записи: у записи не меняются источник, HLS и позиция. Пауза перед видео запускается по событию `play` записи — так её не обойти ни одной кнопкой, клавишей или `play()` из приложения.
- Пауза в середине — когда позиция во время воспроизведения прошла её секунду (перемотка не считается, пока не закончится). Перемотка вперёд через несколько пауз показывает только последнюю, остальные считаются показанными. Новый список пауз (другая серия) показывается заново.
- «Перейти на сайт» — обычная ссылка `target="_blank"` с `rel="noopener noreferrer sponsored"`; объявление встаёт на паузу. Громкость и «без звука» объявления — от плеера; если браузер не даёт запустить ролик со звуком, он идёт без звука.
- VAST (порция 4.9) превращает ответ рекламной сети в те же объявления: `model/vast.ts` разбирает XML через `DOMParser`, проходит обёртки (трекинг и адреса ошибок обёрток складываются с трекингом объявления) и выбирает ролик. Пиксели — `new Image()` с подстановкой макросов; у своих объявлений можно задать те же `tracking`.
- VAST загружается без cookie (`credentials: 'omit'`): так работают серверы и с `Access-Control-Allow-Origin: *`, и с адресом сайта. Частоту показов по cookie рекламной сети это отключает; если она нужна — отдельная настройка.
- Не поддерживаются: VPAID и SIMID (исполняемый код рекламы), нелинейные и companion-объявления, AdVerifications (OMID).

### Баннеры и достижения (порция 4.10)

- Баннеры и уведомления о достижениях — `ui/MediaNotices.vue` (контекст плеера через `provide`); слот `banner` плеер передаёт в неё дальше.
- Достижение выдаётся, когда позиция во время воспроизведения дошла до `at`: перемотка сама по себе его не даёт. Полученные хранятся в браузере для всех плееров сайта; `earnedAchievements` добавляет полученные на сервере. Уведомления идут по очереди, по 5 с.

### Трансляция на телевизор (порция 4.11)

- Два способа в одной кнопке: `model/useRemotePlayback.ts` — Remote Playback API самого `<video>` (кнопка видна, пока `watchAvailability` сообщает об устройстве; `prompt()` показывает выбор браузера), `model/useCastSdk.ts` — адаптер Google Cast SDK. Скрипт Google подключает приложение; плеер ищет `cast.framework` и `chrome.cast` при монтировании или ждёт `__onGCastApiAvailable`, не затирая чужой обработчик. Зависимостей нет: типы SDK описаны в `types/MediaCast.types.ts` только в нужной плееру части.
- Если есть Cast SDK, кнопка открывает выбор устройства Cast; через Remote Playback — если SDK нет или браузер уже транслирует этот `<video>` сам. В Firefox нет ни того, ни другого — кнопки нет.
- Cast: запись загружается на приёмник (`castReceiverId` или Default Media Receiver) с текущей секунды, с названием и обложкой; здесь запись ставится на паузу. Плеер становится пультом (`ui/MediaCastOverlay.vue`): шкала, пауза, время, «Остановить трансляцию»; Space/K и перемотка клавишами управляют телевизором, смена серии загружает новую серию на телевизор с начала и не запускает её здесь. После отключения просмотр продолжается здесь с последней позиции телевизора, играя — если играл телевизор.
- Remote Playback: браузер сам передаёт `<video>`, поэтому панель, клавиши и серии работают как обычно; плеер только показывает «Воспроизводится на телевизоре» и прячет большую кнопку.
- На телевизор не передаются реклама, баннеры, достижения и субтитры: Default Media Receiver не показывает VAST и свои вставки. Из рекламных пауз, чьё время прошло во время трансляции, после возвращения на это устройство покажется последняя — как после перемотки.

### Проверка целиком (порция 4.12)

- **Скриншот-тест** `__tests__/BaseMediaPlayer.visual.spec.ts`: 12 состояний × 2 темы (описание каждого снимка — [VISUAL_CHANGES.md](../design/VISUAL_CHANGES.md), раздел Media). Эталоны не созданы: их генерирует `npm run test:visual:update` после просмотра владельцем. Снимки для просмотра получены тем же тестом во временную папку и дважды повторно сверены с собой — расхождений нет.
- Stories в тесте открываются без остановки часов: при `page.clock.setFixedTime` Vue пропускает обработчики на родителях, и клик по кнопке «Настройки» не открывает меню (FOLLOW_UPS № 56). Play-функция обязана завершиться без ошибки, иначе тест падает.
- **E2E** `__tests__/BaseMediaPlayer.e2e.spec.ts`, настоящий Chromium: двойной клик по краям — ±10 с и подсказка, удержание — ×2 и возврат скорости; панель прячется через `idleTimeout` без движения мыши и возвращается при движении; блок субтитров перетаскивается мышью; эмуляция Cast — пробел и стрелки управляют телевизором, после остановки просмотр продолжается здесь с позиции телевизора.
- **Доступность (автоматически):** порядок Tab — «Перемотка», «Воспроизвести», «Выключить звук», «Громкость», «Настройки», «Широкий экран», «Во весь экран»; у каждого элемента есть имя и видимое кольцо фокуса 2px. Дерево доступности состояний с сериями, баннером, достижением и трансляцией: у кнопок и ползунков есть имена, меню — `menu` / `menuitemradio` с `checked`, сообщения («Воспроизводится на…», «Достижение получено», подсказки) — `status`. Проход с живым скринридером (NVDA, VoiceOver) не выполнялся: в среде их нет — остаётся владельцу.
- **Производительность** (Chromium, демо-ролик, метрики DevTools): за 3 с воспроизведения — 13 пересчётов раскладки, 21 пересчёт стилей, 5 мс скриптов; за 2 с на паузе — ни одного пересчёта. Панель обновляется с частотой `timeupdate` (около 4 раз в секунду), а не каждый кадр. E2E держит запас: меньше 90 пересчётов раскладки и 0,3 с скриптов за 3 с воспроизведения, на паузе — 0 пересчётов раскладки.
- Найдено: после выбора серии мышью меню «Серии» остаётся открытым — так устроены пункты-переключатели BaseDropdownMenu во всём ките (FOLLOW_UPS № 57). В play-функциях синтетический клик не даёт браузеру «жеста пользователя», поэтому после смены серии в story появляется «Браузер не разрешил автозапуск»; настоящий клик зрителя запуск разрешает.
- Не проверялось: Safari и Firefox (только Chromium), настоящий Chromecast и AirPlay, живой скринридер.

### Плеер отдельно (порция 4.13)

- Вход пакета `@ramzes1385/rise-ui-kit/media` (`dist/media.js`, типы — `dist/components/BaseMediaPlayer/index.d.ts`); из корня, `/components` и плагина плеер убран. Корень пакета больше не тянет код плеера: общий чанк компонентов уменьшился с ≈612 до ≈465 КБ, `media.js` — ≈114 КБ. Стили плеера пока в общем `styles.css`: отдельный CSS появится вместе с разбивкой стилей (Н.2) или в отдельном пакете.
- Строки интерфейса: раздел `player` остаётся в словаре кита, плеер читает его через публичный `useLocale()` (`model/messages.ts`: `UI_PLAYER`, `UI_TEXT`, `UI_ARIA`, `formatMessage`, `formatNumber`). Внутренний `UI_PLAYER` кита удалён.
- Граница проверяется тестом «границы плеера» (`build/tests/packageBoundaries.spec.ts`): каждое имя, которое папка плеера (без тестов и stories) берёт из кита, должно экспортироваться корнем, `/components`, `/composables`, `/utils` или `/icons`. Имена берутся из компилятора TypeScript; проверено, что импорт `currentLocale` или внутреннего `UI_TEXT` тест роняет.
- Заготовка отдельного репозитория — `build/media-package/`: шаблон (`package.json` с китом и Vue в peerDependencies, `vite.config.ts`, `tsconfig`, README пакета) и `extract.mjs`, который копирует плеер без тестов и stories, переписывает импорты на публичные входы кита и кладёт копию SCSS-помощников кита без токенов. Проверено: извлечённый пакет собирается против собранного кита (`index.js` ≈113 КБ, `media.css` ≈21 КБ), `vue-tsc` строит типы без ошибок, тестовая страница с китом из `dist` играет запись, показывает русские подписи и открывает меню «Настройки» без ошибок в консоли.
- Решить при переносе: где жить тестам и stories плеера, переезжает ли словарь `player` в пакет, минимальная версия кита (иконки плеера — в спрайте кита).

### Аудио и субтитры (порция 4.14)

- **Аудиорежим плеера** — `mode`: `auto` (по умолчанию) включает его для аудиоисточника (MIME `audio/*` или расширения .mp3, .m4a, .aac, .ogg, .opus, .wav, .flac, .weba), `audio` и `video` задают вид явно. Компактная панель без кадра: нет пропорций кадра, большой кнопки, субтитров, жестов по кадру, полного и широкого экрана (кнопки скрыты, клавиши F и T не действуют); панель не прячется. Звук по-прежнему играет `<video>` — все возможности (скорость, озвучки, HLS-аудио, трансляция) те же.
- **BaseAudioPlayer и BaseWaveform — компоненты ядра кита**, а не входа `/media`: на них построены голосовые сообщения BaseChat (часть «б»), а корень пакета не должен зависеть от плеера. Своя небольшая модель воспроизведения на `<audio>` вместо модели плеера.
- `formatMediaTime` и `parseMediaTime` переехали из папки плеера в публичные `utils/mediaUtils` вместе с `computeWaveformPeaks`, `resampleLevels` и `decodeWaveformPeaks`: плеер берёт их через публичный вход (граница плеера соблюдается).
- Разбор субтитров (`parseSubtitles`, `decodeSubtitles`) переехал из папки плеера в публичные `utils/subtitleUtils` вместе с `serializeSubtitles` (часть «в»): им пользуются плеер и BaseSubtitleEditor.
- Строки плеера вынесены из `ru.ts` и `en.ts` в `locales/player/ru.ts` и `locales/player/en.ts`: словари снова меньше 400 строк; раздел `player` в словаре кита не изменился. Строки аудиоплеера и волны — новый раздел `audio`.

## 12. Требования владельца (29.09.2026)

Плеер должен уметь всё из списка ниже; порции — в [v2/PLAN.md](../v2/PLAN.md), этап 4.

| № | Требование | Порция |
|---|---|---|
| 1 | Субтитры, блок можно перенести в любое место кадра | 4.4 |
| 2 | Переключение звуковых дорожек (озвучек) | 4.5, 4.6 |
| 3 | Качество | 4.2 (файлы), 4.6 (HLS) |
| 4 | Выбор плейлиста | 4.7 |
| 5 | Выбор серии или видео | 4.7 |
| 6 | Логотип | 4.2 |
| 7 | Название видео | 4.2 |
| 8 | Автовоспроизведение (без звука — готово в 4.1; следующая серия с отсчётом) | 4.7 |
| 9 | Скорость воспроизведения | 4.2 |
| 10 | Сегменты как на YouTube — главы на таймлайне, «Пропустить опенинг» | 4.7 |
| 11 | Фрагменты с рекламой | 4.8, 4.9 |
| 12 | Двойной клик слева или справа — ∓10 с, удержание — ускорение | 4.3 |
| 13 | Широкий экран | 4.2 |
| 14 | Трансляция на телевизор | 4.11 |
| 15 | Обложка (`poster` — готово в 4.1) | 4.2 |
| 16 | Иконка громкости, дуги которой плавно гаснут при убавлении | 4.2 |
| 17 | Тех. информация по правому клику в области плеера | 4.3 |
| 18 | Форма обратной связи, сообщение о проблеме | 4.3 |
| 19 | Копирование ссылки и ссылки с таймкодом | 4.3 |
| 20 | Запоминание позиции | 4.3 |
| 21 | Всплывающие баннеры | 4.10 |
| 22 | Всплывающие достижения как на jut.su | 4.10 |
| 23 | Субтитры в формате .srt без перевода в .vtt | 4.4 |

Решения:
- **Реклама** — все три вида: свои вставки (ролик или картинка перед видео, в середине и после, «Пропустить через N с»), отмеченные интеграции внутри ролика с «Пропустить рекламу», рекламные сети по VAST 3/4 — свой разбор без SDK, без VPAID и SIMID.
- **Озвучки и качества** — все три формата: отдельные файлы (аудио синхронно с видео, качества — разными видеофайлами), HLS через адаптер hls.js, который подключает приложение, и один файл MP4/MKV с несколькими дорожками — переключение через `audioTracks` там, где браузер его поддерживает (Safari); для остальных — рецепт ffmpeg для разделения файла.
- **Трансляция** — оба способа: Remote Playback API по умолчанию (Chrome — Chromecast, Safari — AirPlay; в Firefox кнопки нет), адаптер Google Cast SDK, если приложение подключило скрипт Google.
- **Порядок** — как в таблице: панель, жесты и меню первыми, на них опираются субтитры, дорожки и плейлисты.
- Отправку отзывов, хранение позиции и достижений на сервере делает приложение по событиям плеера; по умолчанию позиция и полученные достижения хранятся в браузере. Новых зависимостей в ките нет: hls.js, рекламные сети и Cast SDK подключаются адаптерами.
- Двойной клик по центру кадра по-прежнему открывает полный экран; по краям — перематывает.

