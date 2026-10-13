# Аудит: компоненты кита внутри компонентов (Р.38–Р.39)

Задача `compose-audit`, 01.10.2026. Поручение владельца (п. 25): «проверь все компоненты и убедись, что они все используют друг друга». База — `feat/rise-v2` 9f222d5a; номера строк в находках — по базе, в изменённых файлах они сдвинулись.

## Как проверяли

- Все шаблоны `src/components/<BaseX>/ui/**/*.vue` всех 116 компонентов, включая вложенные подкомпоненты (BaseChat — 19 файлов, BaseMediaPlayer — 23). Пять групп по разделам Storybook, по агенту на группу; каждый агент открывал файлы и сверял классы с `__tests__/`.
- Искали: голые `button`, `input`, `textarea`, `select`, `img`, `a`, `hr`, свои svg-иконки, спиннеры, всплывающие панели, бейджи, пустые состояния, HTML-атрибут `title` (правило кита — только BaseTooltip).
- Не находка («норма»): нативный элемент, который и есть сам компонент (`input` в BaseInput, `img` в BaseAvatar); графика на svg (диаграммы, QR, флаги, кольцо прогресса); скрытый `input[type=file]`; собственная механика (ползунки, ячейки PIN, звёзды, разделитель с перетаскиванием); составные строки и карточки, для которых BaseButton не подходит.
- Разработчик открыл и сверил 38 находок вручную (все совпали) и все места, которые заменил.

## Итог

- Проверено: **116 из 116** компонентов (Element 23, Layout 6, Editor 1, Form 30, Data 17, Navigation 10, Chat 7, Overlay 15, Media 7). Проверка — чтение шаблонов, не прогон в браузере.
- Заменено в Р.39: 16 компонентов (столбец «Заменено»). Остальное — в docs/design/FOLLOW_UPS.md, раздел «Эпик compose-audit», пункты C1–C15.
- HTML-атрибут `title` остался в BaseColorModeButton, BaseSubtitleEditor и BaseMediaPlayer — причины в C1.

## Таблица

| Компонент | Раздел | Итог | Уже использует | Заменено (Р.39) | Отложено |
|---|---|---|---|---|---|
| BaseAlert | Element | проверен — находок нет | BaseIcon, BaseButton, BaseText | — | — |
| BaseAnimation | Element | проверен — находок нет (только Transition) | — | — | — |
| BaseAvatar | Element | проверен — норма (`img` и svg-маскот — сам компонент) | — | — | — |
| BaseAvatarGroup | Element | находка | BaseAvatar | — | C8: круг «+N» своей разметкой |
| BaseBadge | Element | проверен — эталон бейджа | — | — | — |
| BaseButton | Element | находка (норма по механике) | — | — | C13: свой спиннер загрузки вместо BaseLoader |
| BaseButtonGroup | Element | проверен — находок нет | слот | — | — |
| BaseCard | Element | проверен — находок нет | BaseText | — | — |
| BaseChip | Element | находка | — | — | C6: свой бейдж-счётчик вместо BaseBadge |
| BaseColorModeButton | Element | находка: HTML `title` | BaseButton, BaseIcon | — | C1: `title` → BaseTooltip меняет корневой элемент |
| BaseFab | Element | находка (норма по механике) | BaseIcon, BaseLink | — | C7: своя кнопка; C1: подсказка у круглой FAB |
| BaseIcon | Element | проверен — эталон иконки | — | — | — |
| BaseImage | Element | находки | BaseIcon, BaseButton | — | C12: шиммер → BaseSkeleton; C5: оверлей зума; C7: миниатюры |
| BaseKbd | Element | проверен — находок нет | — | — | — |
| BaseLoader | Element | проверен — эталон | — | — | — |
| BaseMarkdown | Element | находки | BaseIcon | кнопка «Копировать» → BaseButton | C12: `hr`; C9: ссылка; C8: `img`; C4: отметка задачи |
| BaseProgress | Element | проверен — эталон (svg-кольцо — графика) | — | — | — |
| BaseQrCode | Element | проверен — норма (svg QR) | — | — | — |
| BaseSeparator | Element | проверен — эталон | — | — | — |
| BaseSkeleton | Element | проверен — эталон | — | — | — |
| BaseSplitButton | Element | проверен — находок нет | BaseButton, BaseDropdownMenu, BaseIcon | — | — |
| BaseText | Element | проверен — эталон | — | — | — |
| BaseUser | Element | проверен — находок нет (подписи — свои span, выгоды нет) | BaseAvatar, BaseLink | — | — |
| BaseContainer | Layout | проверен — находок нет | слот | — | — |
| BaseFooter | Layout | проверен — находок нет | BaseContainer, BaseLink | — | — |
| BaseHeader | Layout | проверен — находок нет | BaseContainer, BaseLink, BaseButton, BaseIcon, BaseDrawer | — | — |
| BaseLayout | Layout | проверен — норма (skip-link — особый паттерн) | — | — | — |
| BaseScrollArea | Layout | проверен — норма (свой бар — механика) | — | — | — |
| BaseSplitter | Layout | проверен — норма (разделитель с перетаскиванием) | — | — | — |
| BaseEditor | Editor | находки | BaseButton, BaseIcon, BaseTooltip, BaseSelect, BaseColorPicker, BaseTextarea, BaseInput | — | C5: контекстное окно у точки клика; C7: кнопки загрузки файла на `label` |
| BaseAddressInput | Form | проверен — находок нет | BaseAutocomplete | — | — |
| BaseAutocomplete | Form | находка | BaseDropdown, BaseInput | — | C10: «Загрузка»/«Ничего не найдено» текстом |
| BaseAvatarCropper | Form | проверен — норма (`img` — механика кропа) | BaseRange | — | — |
| BaseCheckbox | Form | проверен — сам компонент | BaseIcon, FormFieldLabel, FormFieldError | — | — |
| BaseCheckboxGroup | Form | проверен — находок нет | BaseCheckbox, FormFieldLabel, FormFieldError | — | — |
| BaseColorPicker | Form | находки: HTML `title`, свои кнопки | BasePopover, BaseIcon | пипетка → BaseButton + BaseTooltip (без `title`); «Без цвета» → BaseButton | C3: поля HEX и каналов; C7: переключатель форматов |
| BaseDadataInput | Form | проверен — находок нет | BaseAutocomplete | — | — |
| BaseDatePicker | Form | находка: HTML `title` | BaseInput, BaseButton, BaseIcon, BaseCalendar | `title` у 4 кнопок навигации → BaseTooltip | — |
| BaseFileUpload | Form | находки: HTML `title` | BaseIcon, BaseImage, BaseProgress, BaseButton, BaseAnimation, FormFieldLabel | `title` у имени файла → BaseTooltip | C6: метки типа и статуса |
| BaseForm | Form | проверен — находок нет | BaseLoader | — | — |
| BaseFormField | Form | находка (основа полей) | BaseText, BaseAnimation | — | C14: свои label/description/error |
| BaseInplace | Form | находка | BaseInput | — | C7: кнопка-текст значения |
| BaseInput | Form | проверен — сам компонент | BaseButton, BaseIcon, BaseText, FormFieldLabel, FormFieldError | — | — |
| BaseInputNumber | Form | находка | BaseInput, BaseIcon | кнопки −/+ → BaseButton | — |
| BaseInputTags | Form | находка | BaseInput, BaseIcon | — | C2: тег и крестик удаления |
| BaseMention | Form | находки | — | подпись → FormFieldLabel, ошибка → FormFieldError | C3: textarea; C5: список у каретки; C8: аватар |
| BaseMoneyInput | Form | проверен — находок нет | BaseInput | — | — |
| BasePhoneInput | Form | проверен — норма (svg флага — графика) | BaseInput, BaseDropdown, BaseIcon | — | — |
| BasePin | Form | проверен — норма (ячейки — механика) | FormFieldError | — | — |
| BaseRadio | Form | проверен — сам компонент | FormFieldLabel, FormFieldError | — | — |
| BaseRange | Form | проверен — норма (ползунки — механика) | BaseTooltip, BaseText | — | — |
| BaseRating | Form | проверен — норма (звёзды — механика) | BaseIcon | — | — |
| BaseRequisiteInput | Form | проверен — находок нет | BaseInput | — | — |
| BaseSearch | Form | находки | BaseInput, BaseButton, BaseIcon, BaseLoader, BaseImage, BaseText, BaseDropdown | — | C5: своя модальная панель; C10: загрузка и пусто текстом |
| BaseSegmented | Form | проверен — сам компонент | BaseIcon, FormFieldLabel, FormFieldError | — | — |
| BaseSelect | Form | находки | BaseDropdown, BaseBadge, BaseIcon, BaseText, FormFieldLabel, FormFieldError | — | C2: крестик тега; C3: поле поиска; отметка пункта — норма |
| BaseSignaturePad | Form | находка | BaseButton | подпись → FormFieldLabel, ошибка → FormFieldError | — |
| BaseSwitch | Form | проверен — сам компонент | FormFieldLabel, FormFieldError, BaseText | — | — |
| BaseTextarea | Form | проверен — сам компонент | FormFieldLabel, FormFieldError | — | — |
| BaseTimePicker | Form | проверен — находок нет | BaseAutocomplete | — | — |
| BaseAccordion | Data | проверен — норма (заголовок — механика) | BaseIcon | — | — |
| BaseCalendar | Data | находки | BaseCard, BaseButton, BaseIcon, BaseInput | — | C7: ячейки лет, месяцев, дней; C5: всплывающее окно дня |
| BaseChecklist | Data | находки | BaseProgress, BaseButton, BaseIcon | — | C4: свой чекбокс; C6: метка «Следующий шаг» |
| BaseEmpty | Data | проверен — эталон | BaseIcon, BaseText | — | — |
| BaseFilterBuilder | Data | находки | BaseIcon | «Удалить условие», «Добавить условие», «Сбросить» → BaseButton | C3: 4 нативных `select` и поля значения |
| BaseHeatmap | Data | проверен — норма (svg-диаграмма) | — | — | — |
| BaseInfiniteScroll | Data | проверен — находок нет | BaseLoader, BaseButton | — | — |
| BaseJsonViewer | Data | проверен — находок нет | BaseButton, BaseTree | — | — |
| BaseKanban | Data | находки: HTML `title`, свои кнопки | BaseContextMenu, BaseIcon, BaseAvatarGroup, BaseButton | `title` приоритета → BaseTooltip; сворачивание колонки и «Добавить карточку» → BaseButton | C3: textarea редактора; C6: цветные метки |
| BasePieChart | Data | проверен — норма (svg-диаграмма) | — | — | — |
| BaseSlider | Data | проверен — норма (точки и миниатюры — механика) | BaseButton, BaseImage, BaseIcon | — | — |
| BaseSparkline | Data | проверен — норма (svg-график) | — | — | — |
| BaseTable | Data | находки | BaseCheckbox, BaseButton, BaseIcon, BaseInput, BaseSelect, BaseDropdown, BaseBadge, BaseLoader, BaseSkeleton, BaseEmpty, BasePagination | — | C2: крестик фильтра в бейдже; кнопка сортировки — норма |
| BaseTextDiff | Data | проверен — норма (`ins`/`del`) | — | — | — |
| BaseTimeline | Data | проверен — находок нет | BaseIcon, BaseImage | — | — |
| BaseTree | Data | проверен — находок нет | BaseIcon, BaseCheckbox, BaseLink | — | — |
| BaseVirtualList | Data | проверен — находок нет | слот | — | — |
| BaseBackTop | Navigation | проверен — находок нет | BaseFab | — | — |
| BaseBreadcrumbs | Navigation | находка | BaseIcon | — | C7: кнопка «…»; ссылки через общий `resolveLink` — норма |
| BaseLink | Navigation | проверен — эталон ссылки | — | — | — |
| BaseMegaMenu | Navigation | находки | BaseLink, BaseIcon | бейдж ссылки → BaseBadge | C7: гамбургер, триггеры, родительские пункты; C8: промо-картинка |
| BaseMenu | Navigation | проверен — норма (пункт меню — механика) | BaseIcon, BaseSeparator | — | — |
| BasePagination | Navigation | проверен — находок нет | BaseButton, BaseIcon | — | — |
| BaseSideBar | Navigation | находки | BaseTooltip, BaseButton, BaseIcon, BaseSkeleton, BaseBadge, BaseDropdownMenu | разделитель → BaseSeparator | C9: ссылки пунктов (общий `linkComponent`) |
| BaseStepper | Navigation | проверен — норма (шаг — составной элемент) | BaseIcon | — | — |
| BaseTabs | Navigation | находка: иконка через `v-html` | BaseButton, BaseIcon | — | C11: `TabItem.icon` — HTML-строка (API) |
| BaseToolbar | Navigation | проверен — находок нет | слот | — | — |
| BaseAiMessage | Chat | находки | BaseIcon, BaseMarkdown | индикатор печати → BaseLoader; «Повторить», «Копировать» → BaseButton | C8: картинка аватара |
| BaseChat | Chat | находки (19 файлов ui/**) | BaseCard, BaseModal, BaseButton, BaseIcon, BaseAvatar, BaseTooltip, BaseImage, BaseCheckbox, BaseLoader, BaseEmpty, BaseSlideover, BaseEmojiPicker, BaseVoiceRecorder, BaseAudioPlayer | — | C3: поиск и поле ввода; C5: подсказки, эмодзи, контекстное меню, меню админа; C7: составные кнопки; C9: ссылки |
| BaseCommentThread | Chat | находка | BaseAvatar, BaseTextarea, BaseButton, BaseIcon | — | C10: «Комментариев нет» текстом |
| BaseEmojiPicker | Chat | находки | BaseIcon | — | C3: поле поиска; C7: вкладки и сетка |
| BasePromptInput | Chat | находки | BaseIcon | «Отправить», «Остановить» → BaseButton | C3: textarea с авторазмером |
| BaseReasoning | Chat | проверен — норма (раскрытие — механика) | BaseIcon, BaseMarkdown | — | — |
| BaseToolCall | Chat | находка | BaseIcon | спиннер → BaseLoader | — |
| BaseApp | Overlay | проверен — находок нет | BaseNotification | — | — |
| BaseCommandPalette | Overlay | находки | BaseModal, BaseIcon, BaseKbd | — | C3: поле combobox; C10: «Ничего не найдено» |
| BaseConfirm | Overlay | проверен — находок нет | BaseModal, BaseButton | — | — |
| BaseContextMenu | Overlay | проверен — находок нет | BaseDropdown, DropdownMenuContent | — | — |
| BaseDrawer | Overlay | проверен — находок нет | BaseText, BaseButton, BaseIcon | — | — |
| BaseDropdown | Overlay | проверен — эталон панели | — | — | — |
| BaseDropdownMenu | Overlay | находка | BaseDropdown, BaseIcon, BaseLink | разделители → BaseSeparator | — |
| BaseModal | Overlay | проверен — находок нет | BaseText, BaseButton, BaseIcon | — | — |
| BaseNotification | Overlay | находка | BaseIcon, BaseButton, BaseText | — | C6: полоса обратного отсчёта |
| BaseNotificationCenter | Overlay | находки | BaseButton, BaseSegmented, BaseAvatar, BaseIcon | — | C6: точка «непрочитано»; C10: пустой список |
| BasePopconfirm | Overlay | проверен — находок нет | BaseDropdown, BaseButton, BaseIcon | — | — |
| BasePopover | Overlay | проверен — находок нет | BaseDropdown | — | — |
| BaseSlideover | Overlay | проверен — находок нет | BaseText, BaseButton, BaseIcon | — | — |
| BaseTooltip | Overlay | проверен — эталон | BaseText | — | — |
| BaseTour | Overlay | находка | BaseText, BaseButton, BaseIcon | — | C6: полоса и точки прогресса |
| BaseAudioPlayer | Media | находка | BaseButton, BaseIcon, BaseWaveform | кнопка скорости → BaseButton | — |
| BaseImageCompare | Media | находка (норма по механике) | BaseIcon | — | C8: `img` в слоях сравнения |
| BaseMap | Media | проверен — находок нет | BaseLoader, BaseEmpty | — | — |
| BaseMediaPlayer | Media | находки (23 файла ui/**) | BaseContextMenu, BaseModal, BaseRadio, BaseTextarea, BaseButton, BaseIcon, BaseLoader, BaseAvatar | — | C15: свой стек плеера; C1: `title` у субтитров и ссылок актёров |
| BaseSubtitleEditor | Media | находки: HTML `title` | BaseButton, BaseIcon | — | C1: 3 `title`; C3: поля времени и текста; C10: пусто |
| BaseVoiceRecorder | Media | проверен — находок нет | BaseButton, BaseIcon, BaseAudioPlayer | — | — |
| BaseWaveform | Media | проверен — норма (бары — механика) | — | — | — |

## Задача compose-1 (13.10.2026)

Заменено по отложенным находкам C4, C9, C10, C12 (`docs/design/FOLLOW_UPS.md`, эпик compose-audit):

- C4: BaseChecklist, MediaSharePanel и отметка задачи BaseMarkdown используют BaseCheckbox (новый проп `isReadonly`).
- C9: BaseMarkdown, BaseChat (текст сообщения и панель ссылок), BaseMediaPlayer (логотип, реклама, актёры, список серий) используют BaseLink (новый проп `hasExternalIcon`). BaseSideBar отложен: стили пункта конфликтуют со стилями BaseLink.
- C10: BaseAutocomplete, BaseCommandPalette, BaseCommentThread, BaseNotificationCenter, BaseSearch, BaseSubtitleEditor, MediaStatsPanel и MediaWatchPanel показывают пусто и загрузку через BaseEmpty (новый проп `isCompact`).
- C12: BaseImage использует BaseSkeleton вместо `__shimmer`, тулбар BaseImageZoom — BaseSeparator. `hr` в BaseMarkdown остаётся: приложения стилизуют `.base-markdown hr`.
