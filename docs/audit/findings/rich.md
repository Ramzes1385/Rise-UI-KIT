# Находки группы «Редактор и чат»

Состав: BaseEditor, BaseChat и их подкомпоненты, composables, utils и константы.

Реестр подтверждённых находок аудита. Номера строк в «Где» — по исходному коммиту `9c848ae` (после исправлений строки сдвинулись). Статусы — на момент завершения аудита: **Исправлено** (правка в рабочей копии и тест), **Частично** (что осталось — в тексте), **Не исправлено** (причина — в тексте). Приоритеты: P0 — блокирующая, P1 — значимый дефект, P2 — локальный дефект или пробел в тестах/доступности, P3 — улучшение. Строки матрицы компонентов — в [COMPONENT_MATRIX.md](../COMPONENT_MATRIX.md), кандидаты в план — в [ROADMAP.md](../ROADMAP.md), выводы для плеера — в [MEDIA_PLAYER_PLAN.md](../MEDIA_PLAYER_PLAN.md).

Термины: «ревью» — первичный разбор группы, «этап исправлений» и «отчёт агента» — правки и отчёт исполнителя по группе, «координатор» — сводная перепроверка и правки после этапа исправлений.

## A. Реестр находок

### A1. P0 и P1

#### EDT-1 · P0 · BaseEditor — DOM/stored-XSS через конвертацию набранного inline-HTML
- **Где:** `src/composables/useEditorToolbar/useToolbarCommands.ts:250-287`: `:262` — гейт по подстроке `</tag>`, `:264-265` — `document.createElement('div').innerHTML = text`, `:278` — замена узла живым HTML. Вызов на каждый `input`: `src/components/BaseEditor/ui/BaseEditor.vue:209` (HEAD 9c848ae).
- **Условия:** Text-узел под кареткой содержит подстроку вида `</tag>`. Источники: экранированный текст из `modelValue` (в том числе после корректной серверной санитизации), вставка text/plain (pastejacking), drag&drop, ручной ввод.
- **Последствие:** `<img onerror>` исполняется в основном документе при любом вводе в этом абзаце, живой HTML уходит в `update:modelValue` (stored XSS у следующих читателей). Буквальный текст `</div>` стирается (потеря данных), каретка прыгает в конец блока.
- **Воспроизведение:** `modelValue='<p>x &lt;img src=x onerror=alert(document.domain)&gt;&lt;/b&gt;</p>'` → клик в конец абзаца → ввести «!» → alert; в emit приходит `<img src="x" onerror=…>` (`scratch/rich-editor-xss.out.txt`, случаи A/B/D).
- **Исправление:**
  - `useToolbarCommands.ts`: `convertInlineHtml` больше не парсит текст через `innerHTML`. Распознаётся только пара `<b|strong|i|em|u|s|strike|del|code>текст</тег>` без атрибутов, закрытая прямо перед кареткой. Элемент строится через `createElement` + `textContent` и ставится через `node.replaceWith`, каретка — сразу после элемента.
  - `src/utils/editorDomUtils/editorDomUtils.ts` (+ `.types.ts`, `index.ts`): новые `matchTypedInlineTag`, `TYPED_INLINE_TAGS`, `TypedInlineTagMatch`.
  - Доработка координатора после отчёта: `node.replaceWith` вместо `parent.replaceChild`, недостижимая ветка удалена (в diff есть).
- **Проверка:**
  - `src/components/BaseEditor/__tests__/BaseEditor.integration.spec.ts`: «экранированный в modelValue HTML остаётся текстом после ввода символа, литерал </div> сохраняется», «не переносит атрибуты из набранного тега в живую разметку», «набранная пара разрешённого тега форматирования превращается в элемент без исполнения разметки».
  - `src/composables/useEditorToolbar/useEditorToolbar.spec.ts`: «convertInlineHtml: одиночный закрывающий тег остаётся буквальным текстом» (переписан: раньше закреплял потерю `</b>`), «convertInlineHtml: не трогает буквальные теги, если каретка стоит не сразу после пары», «convertInlineHtml: пара, закрытая прямо перед кареткой, становится элементом без атрибутов», «convertInlineHtml: пара в самом начале абзаца не создаёт пустой текстовый узел перед элементом» (добавил координатор).
  - `src/utils/editorDomUtils/editorDomUtils.spec.ts`: describe «matchTypedInlineTag» (1 позитивный тест + `it.each` из 8 отрицательных случаев).
  - Падали до исправления: регрессионные тесты — да (по отчёту агента). Позитивные тесты сохранённой функции и тест координатора проверяют новую реализацию: неприменимо / не проверялось.
- **Статус:** Исправлено. Остаток — EDT-1r (P3).

#### EDT-2 · P1 · BaseEditor — HTML не санитизируется на входе, выходе и при вставке
- **Где:** `src/components/BaseEditor/ui/BaseEditor.vue:231` (watch) и `:238` (mount): `innerHTML = modelValue`; `:210`: emit сырого `innerHTML`; `src/composables/useEditorToolbar/useToolbarCodeMode.ts:55`: `innerHTML = codeContent` при выходе из режима кода (HEAD).
- **Условия:** приложение передаёт в `modelValue` HTML других пользователей (CMS, вики, модерация) и не санитизирует его при сохранении. Также вставка из буфера и режим кода.
- **Последствие:**
  - `<img onerror>`, `<svg onload>`, `<iframe srcdoc>`, `<style>` исполняются или применяются сразу при mount, в том числе при `isReadonly`;
  - `javascript:`-ссылки в readonly кликабельны;
  - `update:modelValue` отдаёт сырой HTML.
- **Воспроизведение:** `<BaseEditor model-value="<img src=x onerror=alert(1)>" />` → alert при монтировании (браузер; в jsdom после mount в DOM присутствует `[onerror]`).
- **Исправление:**
  - Код не менялся. Добавлено предупреждение в JSDoc `modelValue` (`src/components/BaseEditor/model/BaseEditor.types.ts`).
  - README: предупреждение безопасности добавлено в раздел «BaseEditor» (`git diff HEAD -- README.md`). В нём сказано, что `modelValue` вставляется через innerHTML без санитизации, `<img onerror>`, `<svg onload>`, `<iframe srcdoc>`, `<style>` и `javascript:` сработают и при `is-readonly`, санитизировать нужно на сервере по allowlist. Это документирование риска, дефект кода не устранён.
  - Предложение:
    - опциональный `sanitize?: (html: string) => string`, по умолчанию identity (обратно совместимо);
    - применять перед `innerHTML` (mount, watch, выход из режима кода), к `text/html` при вставке (нужен свой обработчик `paste`) и перед emit;
    - плюс `pasteAsPlainText?: boolean`.
- **Проверка:** не проверено: исправления нет. Предлагаемый unit-тест: `modelValue` с `onerror`/`<script>`/`<style>`/`javascript:` и переданным `sanitize` → в DOM и emit нет `on*`, `script`, `style`, `javascript:`.
- **Статус:** Не исправлено — изменение контракта, предложен sanitize-проп. Риск задокументирован в JSDoc и README.

#### EDT-3 · P1 · BaseEditor — readonly обходится через контекстное меню медиа
- **Где:** `src/components/BaseEditor/ui/BaseEditor.vue:58` (`@contextmenu` навешан без условия), `src/composables/useEditorToolbar/useToolbarMediaMenu.ts:23-51` (проверки readonly нет) (HEAD).
- **Условия:** `isReadonly=true`, правый клик по `<img>`/`<video>`.
- **Последствие:** «Удалить» и «Применить» (размер) меняют документ и эмитят `update:modelValue`. При автосохранении пользователь без прав на редактирование теряет или меняет данные.
- **Воспроизведение:** см. тесты ниже: на HEAD меню открывалось, `removeMedia` эмитил без картинки.
- **Исправление:**
  - `useToolbarMediaMenu.ts` (+ types): опция `isReadonly`. В readonly своё меню не открывается (остаётся нативное меню браузера), `applyMediaSize`/`removeMedia` только закрывают меню.
  - `useEditorToolbar.ts` (+ types) пробрасывает опцию.
  - `BaseEditor.vue` передаёт `isReadonly: () => props.isReadonly`.
- **Проверка:** `BaseEditor.integration.spec.ts` › «не открывает контекстное меню медиа и не меняет v-model по правому клику на изображении»; `useEditorToolbar.spec.ts` › «режим только для чтения: меню медиа не открывается, размер и удаление не применяются». Падали до исправления: да (по отчёту агента).
- **Статус:** Исправлено. Остаток — EDT-3r (P3).

#### EDT-4 · P1 · BaseEditor — загруженные медиа сохраняются как blob:-URL и теряются
- **Где:** `src/composables/useEditorToolbar/useToolbarCommands.ts:219,226` (изображение), `:236,242-244` (видео) (HEAD).
- **Условия:** загрузка изображения или видео через тулбар (в том числе в режиме кода).
- **Последствие:**
  - в сохранённом HTML `src="blob:…"` → после перезагрузки или на другом устройстве медиа пропадают (потеря данных);
  - `URL.revokeObjectURL` не вызывается (утечка памяти);
  - хука загрузки файла на сервер нет;
  - размер и тип не проверяются (`accept` — только подсказка диалога).
- **Воспроизведение:** существующий тест `useEditorToolbar.spec.ts` › «handleImageUpload / handleVideoUpload» ожидает `execCommand('insertImage', false, 'blob:test')`, то есть закрепляет это поведение.
- **Исправление:** не исправлялось. Предложение:
  - prop `uploadMedia?: (file: File) => Promise<string>` (или emit `upload` с resolve), вставлять постоянный URL;
  - без него — документировать поведение и эмитить список blob-URL;
  - `maxFileSize` и типы;
  - `revokeObjectURL` при удалении медиа и при unmount.
- **Проверка:** не проверено: исправления нет. Предлагаемый unit-тест: mock `uploadMedia` → в emit `src="https://cdn/…"`; spy на `revokeObjectURL` при `removeMedia` и unmount.
- **Статус:** Не исправлено — нужен новый контракт загрузки (prop/emit); в задание этапа исправлений не входило.

#### CHAT-1 · P1 · BaseChat — пункты контекстного меню не работают при клике мышью
- **Где:** `src/composables/useChatMessageActions/useChatMessageActions.ts:18,28-32`; `src/components/BaseChat/ui/ChatMessageList/ui/ChatMessageList.vue:46`; `…/ChatMessageList/ui/ChatMessageContextMenu.vue:2` (HEAD).
- **Условия:** любой клик указателем (pointerdown → mousedown → click) по пункту меню или реакции.
- **Последствие:**
  - click-outside сравнивал цель с `$el` компонента, корень которого — `<Teleport>` (плейсхолдер, не HTMLElement);
  - поэтому mousedown по пункту считался кликом «снаружи»: меню закрывалось, `message` обнулялся ещё до `click`;
  - мышью не работали «Закрепить» (другого UI для закрепления нет), реакции из меню, «Копировать», «Удалить» одного сообщения, «Ответить/Выбрать».
- **Воспроизведение:** `scratch/rich-chat-clickoutside.out.txt`; на HEAD `user.click(getByText('Закрепить'))` у админа не эмитил `pin-message`.
- **Исправление:** `useChatMessageActions.ts`: целью click-outside стал `computed(() => contextMenuRef.value?.menuRef ?? null)` — реальный div меню из `defineExpose`. Тип `contextMenuRef` исправлен на `ChatMessageContextMenuExpose`.
- **Проверка:** `src/components/BaseChat/ui/ChatMessageList/__tests__/ChatMessageList.spec.ts` › «должен выполнять действия пунктов меню и реакций при клике мышью» (user-event: закрепить/ответить/реакция/удалить), «не должен закрывать меню по mousedown внутри меню и должен закрывать после выбора пункта». Падали до исправления: да (по отчёту агента).
- **Статус:** Исправлено. Остаток — CHAT-1r (P3). Следствие: «Открепить» из меню теперь достижимо мышью и эмитит `pin-message` (CHAT-5).

#### CHAT-2 · P1 · BaseChat — демо-данные «Металл-Арт» в панели «Информация»
- **Где:** `src/components/BaseChat/ui/ChatSlideover/ChatSlideover.vue:44-49` (описания «Металл-Арт» / «Анна — ведущий скульптор…»), `:118-142` (телефон `+7 (999) 123-45-67`, `info@metal-art.ru`); `src/constants/chat.ts:93-96` (HEAD).
- **Условия:** любое открытие вкладки «Инфо» в любом приложении.
- **Последствие:** пользователи видят чужие описания и контакты. Тест `ChatSlideover.spec.ts:70-75` закреплял это поведение.
- **Воспроизведение:** открыть «Инфо» в личном чате → виден демо-телефон и e-mail.
- **Исправление:**
  - `ChatSlideover.vue`: демо-описания и блок телефон/e-mail удалены.
  - Новый опциональный prop `description` (`BaseChat.types.ts`, `ChatSlideover.types.ts`, проброс в `BaseChat.vue`, default `''`); блок описания показывается только при переданном значении.
  - Stories: argType `description` и значение в `GroupChat`.
- **Проверка:**
  - `src/components/BaseChat/__tests__/ChatSlideover.spec.ts` › «должен показывать подзаголовок и не показывать захардкоженные демо-контакты и описание» (изменён: раньше ожидал демо-телефон), «должен показывать описание из prop description», «не должен показывать захардкоженное демо-описание группы», «должен показывать описание группы из prop description».
  - `…/BaseChat.integration.spec.ts` › «должен показывать в панели только описание из props, без демо-данных».
  - Падали до исправления: да (по отчёту агента).
- **Статус:** Исправлено. Остаток — CHAT-2r (P3).

#### CHAT-3 · P1 · BaseChat — черновик и вложения теряются при входе в выделение
- **Где:** `src/components/BaseChat/ui/BaseChat.vue:57-76` (`<ChatInput v-if>` / `<ChatSelectionToolbar v-else>`); состояние `text`/`attachments` хранится локально в `src/composables/useChatInputState/useChatInputState.ts:13-15` (HEAD).
- **Условия:** набрать текст, прикрепить файл → «Выбрать» сообщение → «Отмена».
- **Последствие:** ChatInput размонтировался, текст и превью вложений пропадали; blob-URL вложений не освобождались.
- **Воспроизведение:** см. тест.
- **Исправление:** `BaseChat.vue`: `ChatInput v-show="selectedMessageIds.length === 0"`, `ChatSelectionToolbar v-if="selectedMessageIds.length > 0"`.
- **Проверка:** `BaseChat.integration.spec.ts` › «должен сохранять черновик и вложения после входа в режим выделения и отмены» (падал до исправления: да, по отчёту агента). Изменённый тест «должен показывать тулбар массовых действий и скрывать панель ввода при выделении»: `queryBy…→toBeNull()` заменено на `getBy…→not.toBeVisible()`.
- **Статус:** Исправлено. Остаток — CHAT-3r (P3).

#### CHAT-4 · P1 · BaseChat — закрытие поиска не сбрасывает фильтр ленты
- **Где:** `src/components/BaseChat/ui/BaseChat.vue:20` (`@toggle-search="isSearching = !isSearching"`); `src/composables/useChatSearch/useChatSearch.ts:11-15` (HEAD).
- **Условия:** открыть поиск, ввести запрос, закрыть поле.
- **Последствие:** лента остаётся отфильтрованной по запросу, которого уже не видно; новые сообщения, не подходящие под него, не отображаются.
- **Воспроизведение:** см. тесты.
- **Исправление:** `useChatSearch.ts`: `watch(isSearching)` — при закрытии `searchQuery = ''`.
- **Проверка:** `BaseChat.integration.spec.ts` › «должен возвращать полную ленту и очищать запрос при закрытии поиска»; `src/composables/useChatSearch/useChatSearch.spec.ts` › «сбрасывает запрос и фильтр при закрытии поиска». Падали до исправления: да (по отчёту агента).
- **Статус:** Исправлено. Объявленный, но не эмитимый `search` остаётся в CHAT-5.

### A2. P2

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| EDT-5 | BaseEditor | `useToolbarCommands.ts:145-157`; режим кода `:83,94,149` | URL из `prompt` уходит в `createLink` без проверки схемы → `javascript:`/`data:` принимаются, а в readonly ссылки кликабельны (исполнится у читателя, если приложение не санитизирует). `example.com` становится относительной ссылкой. В режиме кода URL и цвет интерполируются без экранирования `"` → инъекция атрибута (self; `scratch/rich-editor-links.out.txt`) | Не исправлялось. Предложение: `isSafeUrl` из нового `src/utils/urlUtils` (уже есть), нормализация до `https://`, экранирование или сборка через DOM в режиме кода. Тест: `promptForUrl → 'javascript:alert(1)'` → `execCommand` не вызывается | Не исправлено — P2, вне объёма этапа (брались P0–P1) |
| EDT-6 | BaseEditor | `BaseEditor.vue:45-58` (нет `@paste`/`@drop`) | Вставка `text/html` из Word/Docs/веба идёт «сырой»: `style`, `class`, `<meta>`, `<o:p>`, трекинг-`<img>`. Что именно вырежет браузер — ГИПОТЕЗА (A4). После исправления EDT-1 вставленный text/plain с `</tag>` больше не превращается в HTML | Не исправлялось. Предложение: обработчик `paste` (санитайзер/allowlist, `pasteAsPlainText`), `drop` файлов через `uploadMedia` | Не исправлено — изменение контракта (вместе с EDT-2) |
| EDT-7 | BaseEditor | `useToolbarCommands.ts:203-213` | Enter во время IME-композиции → вставляется `<br>`, композиция срывается (японский, китайский, корейский) | Не исправлялось. `if (event.isComposing \|\| event.keyCode === 229) return`; тест: keydown Enter с `isComposing:true` → `preventDefault` не вызван | Не исправлено |
| EDT-8 | BaseEditor | `BaseEditor.vue:179` | Ссылка вводится только нативным `prompt` (опция `promptForUrl` composable наружу не проброшена): диалог не стилизуется, в sandbox-iframe без `allow-modals` вставка молча не работает, при пустом выделении `createLink` ничего не делает | Не исправлялось. prop/emit `request-link` или слот-диалог; при пустом выделении вставлять текст URL | Не исправлено — расширение API |
| EDT-9 | BaseEditor (Toolbar) | `BaseEditorToolbar.vue:158` | `headingValue = ref('p')`; `activeStates.formatBlock` вычисляется, но не используется → при курсоре в `<h2>` селект показывает последнее выбранное значение | Не исправлялось. `computed(() => activeStates.formatBlock \|\| 'p')`; integration-тест | Не исправлено |
| EDT-10 | BaseEditor | API (`BaseEditor.types.ts`, нет `defineExpose`) | Слот `toolbar` без scoped-props (команд не получает); нет `focus()`/`getHtml`, `isDisabled`/`label`/`error`/`name`. Дополнение: после исправления BaseForm (`<fieldset disabled>`, группа forms) contenteditable внутри заблокированной формы остаётся редактируемым с клавиатуры — fieldset блокирует только нативные контролы (следует из спецификации HTML, тестом не проверено) | Не исправлялось. scoped-slot `{ exec, activeStates, isCodeMode, toggleCodeMode }`, `defineExpose({ focus, blur, getHtml })` + тип Expose, `isDisabled` | Не исправлено — расширение API |
| EDT-11 | BaseEditor | `BaseEditor.vue:60-70` (у `BaseTextarea` нет `is-readonly`), `:229`; `useToolbarCodeMode.ts:55` | `isReadonly=true` при включённом режиме кода: textarea редактируема и эмитит `update:modelValue`, тулбар скрыт → выйти из режима нельзя. Внешний `modelValue` в режиме кода игнорируется и затирается при выходе | Не исправлялось. `:is-readonly` на textarea, принудительный выход из режима кода при readonly, обновление `codeContent` в watch | Не исправлено |
| EDT-15 | BaseEditor (+Toolbar) | `BaseEditor.vue:45-58, 72-97`; `BaseEditorToolbar.vue:2, 5-13, 82-101`; `BaseEditor.style.scss:204-205` | У области нет `role="textbox"`, имени, `aria-multiline`, `aria-readonly`, `aria-placeholder`. Тулбар без `role="toolbar"`, 17 иконочных кнопок без имени и `aria-pressed` (BaseTooltip — только по mouseenter). Загрузка медиа недоступна с клавиатуры (`input{display:none}` в `<label>`), меню медиа — только мышью | Не исправлялось. Предложения — в ревью (роль/имя, roving tabindex, фокусируемый file input, меню по Shift+F10) | Не исправлено — объём |
| CHAT-5 | BaseChat | `useChatState.ts:28-30`, `BaseChat.vue:25` (pinnedMessages); `BaseChat.types.ts:95,105` (search, add-member); `useChatMessageActions.ts:138-144` («Открепить»); `useChatActions.ts:57-59`, `:39-47` | Контракт не совпадает с поведением:<br>• prop `pinnedMessages` игнорируется;<br>• `search`/`add-member` не эмитятся;<br>• «Открепить» в меню эмитит `pin-message` (после CHAT-1 это стало достижимо мышью);<br>• «Написать сообщение» эмитит `avatar-click`;<br>• скачивание всегда выполняется и одновременно эмитится `download-file` (двойное действие, файлы с авторизацией не скачать);<br>• типы `ChatMember`, `ChatCommand`, `ChatMessageAttachment`, `ChatMessageReaction`, `ChatInfoTab` не экспортированы | Не исправлялось. Использовать prop, если передан; `unpin-message` для закреплённых; `write-message`; `autoDownload`; экспорт типов | Не исправлено — изменения контракта |
| CHAT-6 | BaseChat (PinnedPanel) | `useChatState.ts:31-38` (clamp только в неиспользуемом `currentPinnedMessage`); `ChatPinnedPanel.vue:83` | 3 закрепа → перейти к 3-му → открепить → «Закреплённое сообщение (3 из 2)», пустое превью, ✕ и клик не работают (`scratch/rich-chat-misc.out.txt` §2) | Не исправлялось. watch длины + clamp индекса | Не исправлено |
| CHAT-7 | BaseChat (MessageList) | `ChatMessageList.vue:115-119`; `useAutoScroll.ts:26-43` | (а) `enabled: () => true` — лента прыгает вниз при любом изменении длины, даже при чтении истории или prepend; (б) отслеживается сумма `messages.length + isTyping` — если «печатает…» сменяется сообщением в одном тике, новое сообщение не прокручивается в видимую область; (в) — ГИПОТЕЗА (A4) | Не исправлялось. watch `[id последнего сообщения, isTyping]`, прокрутка только если пользователь у низа, кнопка «к новым» | Не исправлено |
| CHAT-8 | BaseChat (MessageList) | `useChatMessageActions.ts:158` | `querySelector('#message-'+id)` без экранирования: id с `.`, `:`, `$`, `@` → `SyntaxError` при клике по цитате/закрепу; `msg.1` или пробел → найден не тот элемент (`scratch/rich-chat-misc.out.txt` §3) | `useChatMessageActions.ts`: `escapeCssIdentifier` (`CSS.escape`, иначе встроенная реализация CSSOM). Тест `ChatMessageList.spec.ts` › «должен находить сообщение, id которого содержит спецсимволы CSS-селектора» (`$ev:matrix.org`, `msg.1`, `a b`, `42`); падал: да (SyntaxError, по отчёту). В jsdom проверяется запасная реализация | Исправлено (остаток — CHAT-8r) |
| CHAT-9 | BaseChat (Header) | `useChatActions.ts:10-13` | Клик по аватару в шапке → `emit('avatar-click', <URL аватара>)`, `selectedMemberId` = URL. Тест `BaseChat.integration.spec.ts` › «должен эмитить avatar-click и открывать профиль при клике по аватару с заданным avatar» закрепляет баг | Не исправлялось. Отдельный `header-avatar-click` или prop `companionId` | Не исправлено |
| CHAT-10 | BaseChat (Slideover) | `ChatSlideover.vue:258-261` | Статус определяется по подстроке: «не в сети», «был(а) в сети 2 часа назад», «last seen online» → `online` (`scratch/rich-chat-misc.out.txt` §1) | Не исправлялось. prop `status: 'online' \| 'offline'` | Не исправлено |
| CHAT-12 | BaseChat (Input, MessageText) | `ChatInput.vue:129-137`, `useChatInputState.ts:192`; `ChatMessageText.vue:2`, `_text.scss:4-7` | Ввод однострочный (`<input>`), хотя код ожидает Shift+Enter; во входящих сообщениях `\n` схлопывается (нет `white-space: pre-wrap`) | Не исправлялось. textarea с авто-высотой, `pre-wrap` | Не исправлено |
| CHAT-13 | BaseChat (Input) | `useChatInputState.ts:188-196` | Enter во время IME-композиции отправляет сообщение | Не исправлялось. Как в EDT-7 | Не исправлено |
| CHAT-14 | BaseChat | состояние `useChatReply`, `useChatInputState`, `useChatSelection`, `useChatSearch`, `useChatState` | При смене `messages`/`title` у одного экземпляра (мессенджер с сайдбаром) в другой чат переносятся `replyingTo` (в `send` уходит `replyToId` из чужого чата), черновик, выделение, запрос, индекс закрепа, открытая панель. Про `:key` в документации ничего нет | Не исправлялось. prop `chatId` + сброс в watch или документировать `:key` | Не исправлено |
| CHAT-15 | BaseChat (Slideover) | `ChatSlideover.vue:98-111, 322-330`, `:187`, `:76` | «Исключить»/«Забанить» срабатывают сразу, без подтверждения. `reason` и `warningsCount: 1` захардкожены, максимум предупреждений `/ 3`. «Себя» админ определяет по `member.id !== 'me'`, поэтому при реальных id видит действия над собой. Меню без click-outside, Escape, `aria-expanded` | Не исправлялось. Подтверждение через BaseModal, prop `currentUserId`, payload без хардкода | Не исправлено |
| CHAT-16 | BaseChat (все подкомпоненты) | `ChatMessageList.vue:2-6`; `_list.scss:180-187`; `ChatMessage.vue:28`; `ChatMessageContextMenu.vue:3-52`; `ChatMessageReactions.vue:3-8`; `ChatMessageReply.vue:2`; `ChatSlideoverFiles.vue:7-11,24-28`; `ChatSlideoverLinks.vue:7-11`; `ChatSlideover.vue:2,21-30,59`; `ChatEmojiPicker.vue:3-15`; `ChatInput.vue:90-127`; `ChatPinnedPanel.vue:3`; `ChatHeader.vue:35` | С клавиатуры нельзя ответить, выбрать, отреагировать, закрепить или удалить сообщение; новые сообщения не озвучиваются:<br>• нет `role="log"`/`aria-live`;<br>• действия сообщения скрыты `visibility:hidden` до `:hover`;<br>• меню открывается только ПКМ, без роли, стрелок, Escape и фокуса;<br>• `div @click` без роли и tabindex;<br>• закрытый слайдовер остаётся в tab-порядке;<br>• вкладки без `tablist`;<br>• эмодзи-пикер и автокомплит без `aria-expanded`/`listbox`;<br>• `aria-label` поиска попадает на `div` BaseInput (нет `inheritAttrs:false`);<br>• поле поиска не фокусируется при открытии, Escape его не закрывает | Не исправлялось. Вне группы: подтверждение удаления получило `role="dialog"` + `aria-labelledby` (BaseModal, группа overlays; в `is-contained` — без ловушки фокуса) | Не исправлено — объём |
| CHAT-18 | BaseChat (README) | `README.md:959-979`; пути тестов `README.md:1506` | Пример нерабочий: поле `createdAt` не существует, нет обязательных `sender`, `time` и prop `title` → Vue-warning, шапки нет, класс `--undefined`. Указанные пути spec не существуют | README исправлен: `ChatMessage` с `id`, `text`, `sender`, `senderName`, `time`, обязательный `title`, `description`, `@send`, описание обязательных полей; путь к тесту — существующий `src/components/BaseChat/__tests__/ChatInput.spec.ts`. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2322 «missing … sender, time», текущий — без ошибок); путь к spec сверен по файловой системе | Исправлено (README) |
| CHAT-19 | BaseChat | `src/constants/chat.ts` (`UI_CHAT_TEXT`) | Все тексты и `aria-label` — русские константы, публично не экспортированы, переопределить через props нельзя → i18n невозможна (то же в редакторе, см. EDT-14) | Не исправлялось | Не исправлено — дизайн API |
| EDT-T1 | BaseEditor (tests/stories) | `BaseEditor.stories.ts`; `useEditorToolbar.spec.ts:862,877`; `BaseEditor.spec.ts:212` | Stories: 6 из 13 play без assert'ов (Default/`playShiftTab`, BlockQuoteAndPre, ColorPickerInput, MediaUploadFlow, ContextMenuMedia, ContextMenuRemove), плюс молчаливые `if (!el) return`.<br>Тесты «ради покрытия»: «покрытие оставшихся веток» (`not.toThrow`), тавтология «должен возвращать isActive для useClickOutside»; «должен обновлять headingValue при выборе формата в селекте» проверяет только `modelValue` дочернего BaseSelect.<br>Внешние `picsum.photos` (случайная картинка) и `placehold.co`. Play-функции в CI не запускаются | Не исправлялось | Не исправлено |
| CHAT-T1 | BaseChat (tests/stories) | `BaseChat.stories.ts` (пример: `:1263-1279`); `BaseChat.integration.spec.ts` | 76 play-функций обёрнуты в 104 `try {…} catch { /* ignore */ }` → упасть не могут (шаг «Reply через context menu» в `MessageInteractions` из-за CHAT-1 обязан был падать).<br>Stories несуществующих фич: `MessageListEditFlow`, `MessageListLoadOlder`, `MessageListUnreadDivider`, `MessageListDateSeparator`, `InputKeyboardTabComplete`, `InputKeyboardPageNavigation`. У `LongContent` отключена a11y-проверка (`tags: ['!a11y']`).<br>Меню на уровне BaseChat проверяется через `fireEvent.click` без mousedown (CHAT-1 закрыт тестами уровня ChatMessageList).<br>Нет spec для `useChatActions`, `useChatInputState`, `useChatMessageActions`; они же исключены из порогов `test:composables:coverage` | Не исправлялось | Не исправлено |
| CHAT-T2 | BaseChat (stories/visual) | `BaseChat.stories.ts`; `BaseChat.visual.spec.ts` | Недетерминизм: `Math.random()`-id (7 мест), `new Date()`, `setTimeout` 1000/2500 мс (Interactive); внешние `images.unsplash.com` (39 ссылок), `placehold.co` (6), `metal-art.ru` (4). Visual-снимки ждут unsplash через `networkidle` → хрупкие. `Interactive` делает поверхностную копию и мутирует общий `MOCK_MESSAGES`. `FileExtensions` запускает реальные скачивания `#` и ищет несуществующий `.base-chat__preview-modal-footer` | Не исправлялось | Не исправлено |

### A3. P3

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| EDT-13 | BaseEditor | все команды `useToolbarCommands.ts` | Зависимость от устаревшего `execCommand`, результат нигде не проверяется. `<font color>` без `styleWithCSS`; `formatBlock` не снимается той же кнопкой; `stripInlineStyle` снимает цвет со всего пересекаемого элемента, а не с выделения | — | Не исправлено |
| EDT-14 | BaseEditor | `useEditorState.ts:23`; `constants/editor.ts:40`; `BaseEditor.style.scss:461-463`; `README.md:1441`; `useToolbarSelection.ts`; `editorDomUtils.ts` (`getBlockAlign`) | • `isEmpty` считается по `textContent` → при контенте только из медиа виден placeholder;<br>• `textColor`/`backgroundColor` никогда не меняются, `isTextColorActive` глобальный;<br>• `DEFAULT_TEXT_COLOR '#000000'` невидим в тёмной теме;<br>• телепортированное меню медиа без `--size-scale` и `data-theme`, не закрывается по Escape/scroll;<br>• тексты UI только на русском (`UI_EDITOR` не экспортирован);<br>• в README указан несуществующий `editorDomInspect`;<br>• после внешнего `innerHTML` `savedRange` ссылается на отсоединённые узлы → курсор в начало;<br>• `getBlockAlign` не учитывает атрибут `align` | README-пункт исправлен: в «Список utils» вместо несуществующего `editorDomInspect` — `editorDomUtils` (сверено с `git diff HEAD -- README.md`). Остальные пункты не менялись: `useEditorState.ts` и `constants/editor.ts` в diff нет, в `editorDomUtils.ts` и `useToolbarMediaMenu.ts` правки относятся к EDT-1/EDT-3 | Частично — исправлен только README-пункт |
| CHAT-20 | BaseChat | `useMessageParser.ts:41-53`; `useChatInputState.ts:234`; `ChatInput.vue:145`; `BaseChat.vue:167` | Парсер:<br>• email → упоминание `@example`;<br>• хвостовая пунктуация попадает в ссылку;<br>• команда после `\n`/`\t` даёт `command-click('/help')`;<br>• і/ї/є не входят в упоминание;<br>• **новое при перепроверке:** split-regex чувствителен к регистру, а проверка `/^https?:\/\//i` — нет. Поэтому сегмент, начинающийся с `Https://` (автозаглавная на мобильных), целиком, с пробелами и хвостом текста, становится одной «мёртвой» ссылкой (схема остаётся http(s), на безопасность не влияет).<br>Ввод:<br>• эмодзи добавляется в конец текста, фокус не возвращается;<br>• Enter на подсказке @ сразу отправляет сообщение (намеренно, CHANGELOG a401700);<br>• «Отправить» блокируется атрибутом `disabled`, а не `is-disabled` → визуально активна.<br>Прочее:<br>• `default`-слот объявлен, но не рендерится;<br>• не используются `isGroup` (ChatInput) и `variant`/`customClass`/`color` (ChatMessageList);<br>• копирование без fallback и обратной связи;<br>• нет `prefers-reduced-motion`, `scrollIntoView` может прокрутить страницу;<br>• глобальные `@keyframes fadeIn/slideDown/popUp`;<br>• у ChatSelectionToolbar нет Escape и «выбрать всё», устаревшие id не очищаются;<br>• нет `accept`/лимитов файлов, нет состояния «не отправлено»;<br>• «Удалить сообщения?» и для одного сообщения, кнопка не в стиле danger;<br>• ссылки слайдовера — `div` + `window.open` вместо `<a>`;<br>• поиск без `trim`, фильтр (`includes`) и подсветка (regex `/i`) расходятся на σ | — | Не исправлено |
| EDT-1r | BaseEditor | `useToolbarCommands.ts` (`convertInlineHtml`); вызов `BaseEditor.vue:209` | Конвертация выполняется на любой `input` без проверки `inputType` (предложено в ревью, не сделано). Backspace/Delete/вставка, после которых каретка оказалась сразу после буквальной пары из сохранённого текста (`&lt;b&gt;x&lt;/b&gt;`), превращают её в форматирование. Прямой DOM-патч вне стека undo (EDT-12) | Проверять `inputType === 'insertText'` | Не исправлено |
| EDT-3r | BaseEditor | `useToolbarMediaMenu.ts` | Меню медиа, открытое до переключения в readonly, остаётся на экране до первого действия. Действия заблокированы и закрывают меню, но предложенное в ревью закрытие при переключении не сделано | watch `isReadonly` → `closeContextMenu` | Не исправлено |
| CHAT-1r | useClickOutside (чат) | `src/composables/useClickOutside/useClickOutside.ts:10-18` | Если цель — компонент, чей `$el` не Element (корень Teleport или фрагмент), она молча даёт `null` («всегда снаружи»). Предложенный в ревью dev-warning не добавлен — ловушка для других потребителей | dev-warning | Не исправлено |
| CHAT-2r | BaseChat | `constants/chat.ts:73, 93-96`; `ChatSlideover.vue` (иконка роли) | Ключи `DEMO_*` и `PHONE` больше не используются, но остаются в бандле (агенту удалять было запрещено). У роли в профиле участника иконка `calendar`. Prop/слот `contacts` не добавлен | Удалить ключи | Не исправлено |
| CHAT-3r | BaseChat (Input) | `useChatInputState.ts` (нет `onBeforeUnmount`) | blob-URL неотправленных вложений не освобождаются при размонтировании ChatInput/BaseChat | `revokeObjectURL` на unmount | Не исправлено |
| CHAT-8r | BaseChat (MessageList) | `id="message-${id}"` в ленте | Глобальные id дублируются при нескольких чатах на странице (невалидный HTML). `scrollToMessage` это не ломает: поиск идёт внутри контейнера | `data-message-id` | Не исправлено |
| CHAT-11r | BaseChat | `useChatActions.ts:39-47` + текущий `fileUtils.ts` | При блокировке небезопасного URL `downloadFile` пишет только `console.warn` и возвращает `void` → `download-file` эмитится как при успехе, `error` не эмитится | Возвращать результат или бросать → `emit('error')` | Не исправлено |
| EDT-CC1 | BaseEditor | `BaseEditorToolbar.types.ts:4` / `useEditorToolbar.types.ts:4` | `EditorActiveStates` объявлен дважды и уже разошёлся (в первом нет `formatBlock`) — вероятная причина EDT-9 | — | Не исправлено |
| EDT-CC2 | editorDomUtils | `editorDomUtils.ts:10,21,47`; `utils/index.ts` | Мёртвые экспорты `ALIGN_MAP`, `INLINE_FORMAT_TAGS`, `findAncestorByTags`; дубликат `toHTMLElement` (реэкспортируется как `editorToHTMLElement`). Часть про `istanbul ignore` в `convertInlineHtml` ушла вместе со старым кодом | — | Не исправлено |
| CHAT-CC1 | BaseChat | `useChatState.ts:31-38` | Мёртвый API: `currentPinnedMessage` (с побочным эффектом внутри computed), `handleNextPinned/PrevPinned` дублирует ChatPinnedPanel. Тесты покрывают мёртвый код, живой путь (CHAT-6) не покрыт | — | Не исправлено |
| CHAT-CC2 | BaseChat | `useChatMessageActions.ts:18`; `BaseChat.vue:148`; `useChatActions.types.ts:4`; `ChatMessageList.types.ts:50` | Типы не отражали реальность (это прямо породило CHAT-1). Тип `contextMenuRef` исправлен на `ChatMessageContextMenuExpose`. Остались: `MessageListExposed` объявлен дважды, `ChatMessageListExpose` не используется | `useChatMessageActions.ts` (в составе CHAT-1) | Частично — дубли типов остались |

### A4. Гипотезы (не подтверждены)
- **EDT-12** (P2) — undo/redo. Прямые DOM-мутации (`convertInlineHtml`, `removeMedia`, `applyMediaSize`, `stripInlineStyle`, watch `innerHTML=`) не попадают в стек undo браузера, Ctrl+Z их не отменяет. Нужно: Playwright — Ctrl+Z после «Удалить» возвращает `<img>`.
- **CHAT-11 / FU-13 (media)** (P2) — исполнится ли `javascript:` при программном клике по `<a href download target=_blank>`; зависит от браузера.
  - **Закрыто превентивно вне группы:** `downloadFile` в `src/utils/fileUtils/fileUtils.ts` проверяет URL через `isSafeUrl(url, DOWNLOAD_PROTOCOLS)` (новый `src/utils/urlUtils`: http/https/blob/data/относительные).
  - Тесты: `fileUtils.spec.ts` › «не переходит по javascript: URL из данных вложения», «разрешает blob: URL локально созданного файла», «кликает по временной ссылке с download для безопасного URL и удаляет её»; `urlUtils.spec.ts` (регистр, ведущие пробелы и NUL, `java\tscript:`).
  - Для безопасности проверка в браузере больше не нужна. Остаток — CHAT-11r.
- **CHAT-17** (P2) — в Chromium `target.value = ''` сразу после `emit('attach', target.files)` (`useChatInputState.ts:208,222`), вероятно, опустошает тот же `FileList`, и асинхронный потребитель получит пустой список. Нужно: Chrome/Firefox/Safari. По коду подтверждено другое: в `send.attachments` нет `File`, только blob-URL. Предложение: `Array.from(files)`.
- **EDT-6, браузерная часть** — что именно Chrome, Firefox и Safari вырезают при нативной вставке `text/html` (скрипты, `on*`). Нужно: Playwright в трёх движках.
- **CHAT-7 (в)** — картинки догружаются после `nextTick`, и лента оказывается не у самого низа. Нужно: браузер.
- **Stories `DarkTheme` (чат)** — телепортированное контекстное меню не получает `data-theme` обёртки и остаётся светлым. Нужно: визуальная проверка. В редакторе то же самое следует из кода (EDT-14).

---

---

## Примечания к перепроверке

1. **Отчёт исправлений ↔ код и тесты: расхождений нет.**
   - Все заявленные правки есть в `git diff HEAD`: EDT-1, EDT-3, CHAT-1, CHAT-2, CHAT-3, CHAT-4, «селектор `#message-…`» (в отчёте без ID — это CHAT-8), JSDoc для EDT-2.
   - Все названные тесты существуют, число тестов совпадает с отчётом. Исключение ожидаемое: `useEditorToolbar.spec.ts` — 74 вместо 73, из-за теста координатора. `editorDomUtils.spec.ts` — 73 = 65 `it` + `it.each` × 8.
   - Все три изменённых существующих теста соответствуют описанию.
2. **Доработка координатора после отчёта** (`node.replaceWith`, удалена недостижимая ветка, тест «пара в самом начале абзаца…») в diff есть.
3. **Правки в файлах группы, сделанные другими агентами** (в отчёте rich не упоминаются):
   - `ChatMessageAttachments.vue:13` и `ChatSlideoverMedia.vue:12`: `:has-zoom` → `:zoom-config` (IMG-3, группа media). На HEAD зум и галерея вложений чата были молча выключены. **Ревью rich этого не заметило.**
   - `fileUtils.downloadFile` + новый `utils/urlUtils` закрывают CHAT-11/FU-13. Авторство в отчётах исправлений не указано, пункт есть в черновике раздела «Изменения поведения» README.
   - `BaseModal` получил `role="dialog"`/`aria-labelledby` (группа overlays) — это касается подтверждения удаления в чате.
4. **Перепроверка по запросу: как URL из сообщений чата попадают в href.** Итог: `javascript:` не проходит нигде, отдельной находки нет.

   | Синк | Фильтрация схемы |
   |---|---|
   | `ChatMessageText.vue:4-12` `<a :href>` | Токен-ссылка создаётся, только если сегмент совпадает с `/^https?:\/\//i` (`useMessageParser.ts:41,46`) → схема всегда http(s); `javascript:`/`data:` остаются текстом (`scratch/rich-chat-parser.out.txt` §1). Атрибут экранирует Vue, есть `rel="noopener noreferrer"` |
   | `ChatSlideoverLinks.vue:51,64` → `window.open` | Только совпадения `/(https?:\/\/[^\s]+)/gi`, `noopener,noreferrer` |
   | Вложения → `downloadFile` | На HEAD проверки не было (CHAT-11); сейчас `isSafeUrl(DOWNLOAD_PROTOCOLS)` |
   | `BaseImage`/`BaseAvatar`/`ChatFilePreview` | Только `<img src/srcset>`; в BaseImage и BaseAvatar нет `href`/`window.open` |
   | Упоминания, команды | `<button>` + emit |

   - Уточнение к §0 ревью (строка 9): split-regex регистрозависим, а проверка сегмента — нет. Отсюда P3-глитч с `Https://…` (добавлен в CHAT-20), на безопасность он не влияет.
   - Для сравнения, в редакторе ссылки по-прежнему не фильтруются: EDT-5 и EDT-2. Готовый `isSafeUrl` можно переиспользовать.
5. **Неполные исправления** (предложенное в ревью сделано не целиком) вынесены в строки `r`: EDT-1r (`inputType`), EDT-3r (закрытие меню при переключении в readonly), CHAT-1r (dev-warning в `useClickOutside`), CHAT-3r (revoke при unmount), CHAT-8r (`data-message-id`). Следствие исправления CHAT-1: «Открепить» из меню стало достижимо мышью и эмитит `pin-message` (учтено в CHAT-5).
6. **Неверных находок при перепроверке не обнаружено.** Номера строк для P0/P1 сверены с `git show HEAD`.
7. **Обновление статусов (координатор), 26.09.** Изменено 2 статуса после сверки с итоговым README:
   - CHAT-18 (P2): «Не исправлено (в работе)» → «Исправлено (README)». Проверка — vue-tsc strictTemplates по примерам README (`проверка примеров README (REPORT.md §5)`); путь к spec существует.
   - EDT-14 (P3): «Не исправлено» → «Частично». Исправлен только README-пункт (`editorDomInspect` → `editorDomUtils` в списке utils), остальные пункты в коде не менялись.
   - Без смены статуса: EDT-2 (P1) остаётся «Не исправлено». В README добавлено предупреждение безопасности — это документирование риска, санитизации нет. Из строки C убрано «предупреждение в README»; docs-story по-прежнему без предупреждения.
   - Docgen (`vue()` раньше docgen-плагина в `build/storybook/main.ts`): находок про описания props в Docs в группе нет. Пометки матрицы «argTypes — 8 props» (BaseEditor) и «основные props» (BaseChat) могли быть следствием сломанного docgen. Перепроверить по сборке Storybook.
