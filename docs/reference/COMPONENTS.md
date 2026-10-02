# Компоненты

Справочник компонентов `@ramzes1385/rise-ui-kit`: назначение, основные props и события, примеры. Все состояния вживую и полная таблица props, событий и слотов — в [Storybook](https://ramzes1385.github.io/Rise-UI-KIT/); установка и подключение — в [README](../../README.md).

Видеоплеер `BaseMediaPlayer` и презентация `BasePresentationPlayer` подключаются отдельным входом `@ramzes1385/rise-ui-kit/media`; остальные компоненты — из корня пакета.

---

## BaseButton

Базовая кнопка.

Подходит для действий, форм, тулбаров, модальных окон и карточек.

Текст кнопки передаётся в слот по умолчанию (иконки — в слоты `left` / `right`). По умолчанию `type="button"`; кнопке отправки формы нужен `type="submit"`. `is-loading` показывает индикатор и подавляет клики.

### Пример

```vue
<script setup lang="ts">
import { BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseButton>Сохранить</BaseButton>

	<BaseButton variant="ghost">Отмена</BaseButton>

	<BaseButton is-disabled>Недоступно</BaseButton>
</template>
```

---

## BaseButtonGroup

Склеенные кнопки связанных действий: общие скругления у крайних, рамки соседей совпадают. `role="group"` с именем `aria-label`; каждая кнопка — отдельный таб-стоп (стрелки между кнопками — у `BaseToolbar`).

```vue
<BaseButtonGroup aria-label="Период">
	<BaseButton variant="outline">День</BaseButton>
	<BaseButton variant="outline">Неделя</BaseButton>
	<BaseButton variant="outline">Месяц</BaseButton>
</BaseButtonGroup>
```

---

## BaseSplitButton

Основное действие и меню похожих: `click` — основная кнопка, `select` — пункт меню (формат пунктов — как у `BaseDropdownMenu`). Кнопка меню называется «Другие действия» (`menu-label`).

```vue
<BaseSplitButton label="Сохранить" :items="[{ label: 'Сохранить как черновик' }, { label: 'Сохранить и закрыть' }]" @click="save" @select="handleMenu" />
```

---

## BaseFab

Плавающая кнопка главного действия страницы в углу окна (`position`), слоем под окнами и панелями. Круглая с иконкой — имя из `label`; `is-extended` — широкая с подписью; `is-contained` — в углу контейнера; `to`/`href` — ссылка.

```vue
<BaseFab label="Новая задача" icon="plus" @click="createTask" />
```

---

## BaseBackTop

Кнопка «Наверх» (BaseFab): появляется после прокрутки на `visibility-height` и возвращает окно или контейнер (`target`) к началу — плавно, если пользователь не включил уменьшение движения. После прокрутки фокус переходит в контейнер или в `<main>` страницы (`focus-target` — своё место).

```vue
<BaseBackTop :visibility-height="600" />
<BaseBackTop target="#feed" is-contained label="К началу ленты" is-extended />
```

---

## BaseToolbar

Панель инструментов по образцу APG Toolbar: `role="toolbar"` с именем, в порядке Tab один элемент, ←/→ (у вертикальной — ↑/↓) ведут по элементам, Home/End — первый и последний, в текстовом поле стрелки двигают курсор, отключённые кнопки пропускаются.

```vue
<BaseToolbar aria-label="Форматирование">
	<BaseButton variant="ghost" aria-label="Полужирный"><BaseIcon name="bold" /></BaseButton>
	<BaseButton variant="ghost" aria-label="Курсив"><BaseIcon name="italic" /></BaseButton>
</BaseToolbar>
```

---

## BaseInput

Базовое поле ввода.

### Пример

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput } from '@ramzes1385/rise-ui-kit'

const value = ref('')
</script>

<template>
	<BaseInput v-model="value" placeholder="Введите текст" />
</template>
```

У `BaseInput` и `BaseTextarea` имя без видимой подписи задаёт `aria-label`, атрибуты нативного поля — `input-attrs`:

```vue
<BaseInput v-model="email" type="email" aria-label="E-mail" :input-attrs="{ name: 'email', autocomplete: 'email', 'data-testid': 'email' }" />
```

---

## BaseTextarea

Многострочное поле ввода.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTextarea } from '@ramzes1385/rise-ui-kit'

const description = ref('')
</script>

<template>
	<BaseTextarea v-model="description" placeholder="Описание" />
</template>
```

---

## BaseInplace

Текст с правкой на месте: по клику, Enter или пробелу — поле с выделенным текстом, Enter сохраняет, Escape отменяет, выход из поля сохраняет (`is-save-on-blur`). В просмотре — кнопка «что: значение» с подсказкой для скринридера; шрифт наследуется от окружения.

```vue
<h2><BaseInplace v-model="title" label="Название проекта" placeholder="Без названия" /></h2>
```

---

## BaseInputNumber

Поле числа: кнопки −/+ по краям, ввод `1,5` и `1.5`, границы `min`/`max`, шаг `step`, знаков после запятой — `precision`. По образцу APG Spinbutton: ↑/↓ — шаг, PageUp/PageDown — десять шагов, Home/End — границы. Число вне границ при выходе из поля поднимается или опускается до границы, нечисло возвращает прежнее значение.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseInputNumber } from '@ramzes1385/rise-ui-kit'

const guests = ref<number | null>(2)
</script>

<template>
	<BaseInputNumber v-model="guests" label="Гостей" :min="1" :max="10" :format-value-text="n => `${n} гостей`" />
</template>
```

---

## BasePhoneInput

Поле телефона: слева флаг и код страны («+7»), справа номер по маске страны. `v-model` — номер в международном формате без пробелов, `v-model:country` — код страны ISO.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BasePhoneInput } from '@ramzes1385/rise-ui-kit'

const phone = ref('')
const country = ref('RU')
</script>

<template>
	<BasePhoneInput v-model="phone" v-model:country="country" label="Телефон" :error="phone && phone.length < 12 ? 'Введите номер полностью' : ''" />
</template>
```

Страны — `PHONE_COUNTRIES` (Россия, Казахстан, Беларусь, Узбекистан, Киргизия, Таджикистан, Армения, Азербайджан, Грузия, Турция, Китай, США, Великобритания) или свои `countries` вида `{ code: 'RS', dialCode: '381', mask: '(##) ###-####' }`, где `#` — цифра. Названия стран — на языке кита через `Intl.DisplayNames`. Страна выбирается в списке с флагами: он открывается кликом или с клавиатуры (стрелки, Enter, пробел), плавно вырастает из поля, буквы ищут страну по названию, Enter выбирает, Escape закрывает — как у BaseSelect (`role="combobox"` и список `role="listbox"`). Флаги нарисованы в SVG для всех стран `PHONE_COUNTRIES`; у своей страны без флага — плашка с кодом («DE»). Вставка полного номера («+375 29 123-45-67», «8 916 123-45-67», «7 916…») сама выбирает страну и убирает код или восьмёрку. Поле — `type="tel"` с `autocomplete="tel-national"`, варианты и размеры — как у BaseInput.

---

## BaseCardInput

Поля банковской карты: номер, срок «ММ/ГГ», код с оборота и имя владельца латиницей. Марка определяется по первым цифрам (таблица `CARD_BRANDS` из `cardUtils` — Visa, Mastercard, Мир, Maestro, American Express, UnionPay, JCB, Discover, Diners Club, Troy, RuPay, UzCard, HUMO, Verve, Dankort, BORICA, InterPayment, LankaPay) и видна значком в поле; цифры группируются по марке («4242 4242 4242 4242», у American Express — «3782 822463 10005»), курсор при вводе и удалении в середине номера остаётся на месте. Вставка номера с пробелами и дефисами работает, заполненное поле само переводит фокус на следующее, Backspace в пустом начале поля возвращает к предыдущему.

```vue
<BaseCardInput ref="card" v-model="card" :brands="['mir', 'visa', 'mastercard']" :tokenize="tokenizer" />
```

- `v-model` — сводка без номера и кода: `{ brand, last4, expiry, holder, isComplete }`; её можно держать в `state` BaseForm и проверять схемой (`isComplete: true`). Сами данные карты отдают только `getCardData()` и `tokenize()` (адаптер эквайера из пропа `tokenize`, например `createCloudPaymentsTokenizer`).
- `brands` — принимаемые марки (id или свои через `defineCardBrand`); карта другой марки — ошибка «Карты American Express не принимаются». Общие национальные диапазоны (RuPay 60 и 65, Troy 65) распознаются, только если марка есть в `brands`.
- `layout`: `stacked` (номер и имя во всю ширину, срок и код рядом) или `inline` (номер, срок и код в строку; на узком экране — как `stacked`). `hasHolder: false` убирает имя.
- Ошибки появляются после ухода из поля; `validate()` показывает все сразу, `reset()` очищает, `focus(field?)` ставит фокус на поле или первое незаполненное. Событие `complete` — когда все поля заполнены верно.
- Внутри BaseFormField группа полей (`fieldset`) называется подписью обёртки, её описание и ошибка связываются с группой; без обёртки и без `label` у группы скрытая подпись «Банковская карта».
- Значки марок: Visa, Mastercard, American Express, Discover, JCB, Diners Club — Font Awesome Free 7.3.1 Brands (CC BY 4.0, Fonticons, Inc.); остальные — плашка с названием, пока приложение не передаст официальный знак из брендбука в `brandIcons` (`{ mir: '/img/mir.svg' }`).
- Безопасность: у полей нет `name` (обычная отправка формы не унесёт номер на сервер магазина), `autocomplete` — `cc-number`, `cc-exp`, `cc-csc`, `cc-name`, клавиатура цифровая; ничего не пишется в `localStorage` и консоль. Свои поля карты на странице магазина — это PCI DSS SAQ A-EP (у CloudPayments ещё ежеквартальное ASV-сканирование); для SAQ A нужна форма эквайера в iframe или переход на его страницу.
- Карта-превью (`hasPreview`): над полями — лицевая сторона с номером (ненабранные цифры — точки), именем, сроком и маркой; пока фокус в поле кода, карта переворачивается оборотом с кодом (точками). Фон — по марке (`CARD_BRAND_BACKGROUNDS`, градиенты палитры кита, не фирменные цвета) или свой `previewBackground` (любое значение CSS `background`). Превью скрыто от чтения с экрана — всё то же есть в полях; при `prefers-reduced-motion` карта переворачивается без анимации.
- Оплата через CloudPayments: скрипт `https://checkout.cloudpayments.ru/checkout.js` подключает приложение, кит его не грузит.

```ts
import { createCloudPaymentsTokenizer } from '@ramzes1385/rise-ui-kit'

const tokenizer = createCloudPaymentsTokenizer({ publicId: 'pk_…' })
const cryptogram = await card.value.tokenize() // криптограмма → на сервер магазина, оплата методом API «по криптограмме»
```

Адаптер вызывает `new cp.Checkout({ publicId }).createPaymentCryptogram({ cardNumber, expDateMonth, expDateYear, cvv, name })`. Нет скрипта — `Error` «скрипт CloudPayments Checkout не подключён»; платёжная система отклонила данные — `Error` «не приняла данные карты», коды (`CardNumber_Invalid`…) — в `error.cause`. Свой эквайер — функция `(data: CardData) => Promise<string>` в проп `tokenize`.

---

## BaseBankCard

Сохранённая банковская карта: марка, `•••• 4242`, срок и «Истекла». Полный вид — лицевая сторона карты с фоном по марке (как превью BaseCardInput); `isCompact` — строка для списков выбора карты.

```vue
<BaseBankCard brand="visa" last4="4242" expiry="12/30" holder="IVAN IVANOV" label="Основная" />
<BaseBankCard v-for="card in cards" :key="card.id" v-bind="card" is-compact variant="soft" />
```

- `brand` — id марки, своя марка (`defineCardBrand`) или `null`; `last4`; `expiry` — `{ month, year }` или `ММ/ГГ`; `holder` — только в полном виде; `label` или слот `default` — название карты («Основная»).
- «Истекла» — по `expiry` и текущей дате; `isExpired` задаёт явно (например, по ответу эквайера).
- Значки марок — как в BaseCardInput (Font Awesome Free Brands или `brandIcons`, иначе плашка с названием); свой фон полной карты — `background`.
- Варианты (`default`, `soft`, `outline`, `ghost`) меняют только строку `isCompact`. Компонент только показывает карту: выбор делает обёртка приложения (BaseRadio, пункт BaseSelect, кнопка).
- Чтение с экрана получает одну фразу — «Visa, номер заканчивается на 4242, срок до 12/30» (или «срок истёк …»); точки, значок и подписи скрыты.

---

## BaseMoneyInput

Поле суммы: разряды расставляются при вводе, курсор остаётся на месте, знак валюты стоит там, где принято в языке кита («1 234,50 ₽», в английском — «$1,234.50»). `v-model` — число или `null`.

```vue
<BaseMoneyInput v-model="amount" label="Сумма перевода" currency="RUB" :max="100000" />
```

`currency` — код ISO 4217: от него зависят знак и число знаков после запятой (у иены — ни одного). Запятая и точка обе ставят десятичный разделитель, буквы и лишние знаки отбрасываются. После ухода из поля сумма округляется до копеек и приводится к `min` и `max`; отрицательные суммы вводятся, только если `min` меньше нуля. На телефоне открывается цифровая клавиатура (`inputmode="decimal"`).

---

## BaseRequisiteInput

Поле реквизита с проверкой контрольного числа. `kind` — `inn`, `kpp`, `ogrn`, `ogrnip`, `bik`, `account`, `correspondentAccount` или `snils`; подпись по умолчанию — название реквизита. В `v-model` — только цифры (у КПП — ещё заглавные латинские буквы), маска и длина — по виду реквизита.

```vue
<BaseRequisiteInput v-model="company.inn" kind="inn" @validate="isInnValid = $event" />
<BaseRequisiteInput v-model="company.bik" kind="bik" />
<BaseRequisiteInput v-model="company.account" kind="account" :bik="company.bik" />
```

ИНН (10 и 12 цифр), ОГРН, ОГРНИП и СНИЛС проверяются по алгоритмам ФНС и ПФР, расчётный и корреспондентский счёт — по ключу вместе с БИК. Ошибка появляется, когда введены все знаки или поле потеряло фокус: «Неверное контрольное число», «Счёт не подходит к БИК», «Нужно цифр: 10 или 12»; своя ошибка в `error` важнее. Событие `validate` сообщает `true`, `false` или `null` (пусто или не хватает знаков). Те же проверки есть отдельными функциями для схем форм: `isValidInn`, `isValidKpp`, `isValidOgrn`, `isValidBik`, `isValidAccount(счёт, бик)`, `isValidCorrespondentAccount(счёт, бик)`, `isValidSnils`.

---

## BaseAddressInput

Адрес с подсказками: BaseAutocomplete, который загружает варианты из источника `source`. Готовый источник — «Подсказки» DaData.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseAddressInput, createDadataAddressSource } from '@ramzes1385/rise-ui-kit'

const address = ref('')
const source = createDadataAddressSource({ token: import.meta.env.VITE_DADATA_TOKEN, locations: [{ region: 'Москва' }] })
</script>

<template>
	<BaseAddressInput v-model="address" :source="source" label="Адрес доставки" @select="suggestion => (delivery.postal = suggestion.data?.postal_code)" />
</template>
```

Свой сервер подключается функцией `(query, { signal }) => Promise<{ value, unrestrictedValue?, data? }[]>`. Запрос уходит после паузы `debounce` (300 мс) и с `min-chars` знаков (3); прежний запрос отменяется через `AbortSignal`, ошибка сервиса просто оставляет список пустым. `v-model` — адрес строкой (выбранная подсказка или свой текст), `select` — подсказка со всеми данными сервиса. Ключ DaData виден в браузере: используйте публичный ключ с ограничением по домену или свой прокси через `url`.

---

## BaseDadataInput

Поле с подсказками DaData пяти видов (`kind`): `address` — адрес, `party` — организация или ИП, `bank` — банк, `fio` — ФИО, `email` — почта. Основа — BaseAutocomplete: список с ролью `listbox`, стрелки, Enter, Escape, объявление числа вариантов. У организации и банка во второй строке подсказки — ИНН или БИК и адрес.

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { BaseDadataInput, BaseRequisiteInput } from '@ramzes1385/rise-ui-kit'

const company = ref('')
const requisites = reactive({ inn: '', kpp: '', ogrn: '' })
</script>

<template>
	<BaseDadataInput v-model="company" kind="party" base-url="/api/dadata/suggest" @select="(_, found) => Object.assign(requisites, found)" />
	<BaseRequisiteInput v-model="requisites.inn" kind="inn" />
</template>
```

Ключ API — проп `token` или для всех полей настройка плагина `createUiKitPlugin({ defaults: { BaseDadataInput: { token } } })`; ключ в браузере виден всем, поэтому для открытого сайта лучше свой прокси (`base-url`), который добавит ключ сам. `count` — сколько подсказок, `params` — прочие поля запроса DaData (`locations`, `status`, `type`), `source` — свой источник вместо DaData. Запрос уходит после паузы `debounce` (300 мс) и с `min-chars` знаков (3), прежний отменяется. `select` передаёт подсказку и реквизиты из неё (`inn`, `kpp`, `ogrn`, `bik`, `correspondentAccount`) для BaseRequisiteInput. Без `label` имя поля — название вида («Организация или ИП»).

---

## BaseMap

Карта с общим API для поставщиков (`provider`: `yandex` — Яндекс Карты API v3, `google` — Google Maps JavaScript API): центр (`v-model:center`, `{ lat, lng }`), масштаб (`v-model:zoom`), метки (`markers`: `{ id, coordinates, title?, color? }`), события `click` (координаты точки), `marker-click`, `ready`, `error`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseMap, type MapMarker } from '@ramzes1385/rise-ui-kit'

const center = ref({ lat: 55.751244, lng: 37.618423 })
const zoom = ref(12)
const markers: MapMarker[] = [{ id: 'office', coordinates: { lat: 55.7494, lng: 37.5912 }, title: 'Офис' }]
</script>

<template>
	<BaseMap v-model:center="center" v-model:zoom="zoom" :api-key="yandexKey" :markers="markers" height="360px" @marker-click="m => open(m.id)" />
</template>
```

Скрипт поставщика загружается по требованию и один раз на страницу — только когда есть `apiKey`; ключ можно задать для всех карт настройкой плагина `defaults: { BaseMap: { apiKey } }`. Без ключа или при ошибке — заглушка (слот `placeholder` со `status`). Если API уже загружено приложением (`window.ymaps3`, `window.google.maps`), скрипт не загружается повторно. Для Google обязателен Map ID стиля карты (`map-id` или `defaults.BaseMap.mapId`): метки — `AdvancedMarkerElement`, без Map ID они не работают, поэтому карта без него не загружается и показывает заглушку «Нужен Map ID». Язык подписей — по языку кита или `language`. Метки — кнопки с подписью (Tab, Enter), область карты — `role="region"` с именем «Карта» (`ariaLabel`).

---

## BaseInputTags

Поле тегов: Enter или запятая (`separators`) добавляют тег, вставка «a, b, c» — несколько тегов, повторы не добавляются (`isUnique`), `maxTags` ограничивает число, `validate` отклоняет тег (текст остаётся в поле). В пустой строке ← или Backspace ведут к последнему тегу, ←/→ — между тегами, Backspace и Delete удаляют тег.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseInputTags } from '@ramzes1385/rise-ui-kit'

const skills = ref(['Vue', 'TypeScript'])
</script>

<template>
	<BaseInputTags v-model="skills" label="Навыки" placeholder="Добавьте навык" :max-tags="10" />
</template>
```

---

## BaseSelect

Компонент выбора значения из списка.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSelect } from '@ramzes1385/rise-ui-kit'
import type { BaseSelectProps } from '@ramzes1385/rise-ui-kit'

// string | number | (string | number)[] (массив — при is-multiple); undefined — ничего не выбрано
const selected = ref<BaseSelectProps['modelValue']>()

const options = [
	{ label: 'Активен', value: 'active' },
	{ label: 'Неактивен', value: 'inactive' },
]
</script>

<template>
	<BaseSelect v-model="selected" :options="options" placeholder="Выберите статус" />
</template>
```

Клавиатура по образцу APG (combobox со списком): ↓/↑, Enter и пробел открывают список, Home/End — первая и последняя опция, буквы — опция по началу подписи, Escape закрывает список.

---

## BaseAutocomplete

Поле с подсказками: список фильтруется по вводу, выбор — мышью или ↓/↑ и Enter (APG Combobox: фокус остаётся в поле, `aria-activedescendant`). Escape закрывает список, а при закрытом — очищает поле. Текст без выбора при выходе из поля заменяется выбранным значением; `is-custom-allowed` делает его значением (`normalize` — привести текст к значению). Варианты с сервера — `is-remote`, событие `search` и `is-loading`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseAutocomplete } from '@ramzes1385/rise-ui-kit'
import type { AutocompleteOption } from '@ramzes1385/rise-ui-kit'

const city = ref<string | number | null>(null)
const cities: AutocompleteOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'kzn', label: 'Казань' },
]
</script>

<template>
	<BaseAutocomplete v-model="city" :options="cities" label="Город доставки" placeholder="Начните вводить город" />
</template>
```

---

## BaseTimePicker

Время `HH:MM`: список с шагом `step` (по умолчанию 30 минут) в границах `min-time`–`max-time` и свободный ввод — «930», «9:30», «9.30» становятся 09:30. Построено на `BaseAutocomplete`.

```vue
<BaseTimePicker v-model="time" label="Время звонка" :step="15" min-time="09:00" max-time="18:00" />
```

---

## BaseCheckbox

Чекбокс.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckbox } from '@ramzes1385/rise-ui-kit'

const checked = ref(false)
</script>

<template>
	<BaseCheckbox v-model="checked" label="Согласен с условиями" />
</template>
```

`is-indeterminate` — частичный выбор (флажок с чертой, скринридер слышит «частично отмечен»): например, «Выбрать все», когда отмечена часть. Клик отмечает флажок, снимать частичный выбор — задача родителя.

---

## BaseCheckboxGroup

Группа флажков: `v-model` — массив отмеченных значений в порядке вариантов, `options` — `value`, `label`, `isDisabled`. Группа — `role="group"` с именем из `label` (или подписи `BaseFormField` вокруг), ошибка описывает группу. `has-select-all` добавляет флажок «Выбрать все»: при части отмеченных он частично отмечен, клик отмечает все доступные варианты.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckboxGroup } from '@ramzes1385/rise-ui-kit'

const channels = ref<(string | number)[]>(['email'])

const options = [
	{ value: 'email', label: 'Электронная почта' },
	{ value: 'push', label: 'Push-уведомления' },
	{ value: 'sms', label: 'SMS', isDisabled: true },
]
</script>

<template>
	<BaseCheckboxGroup v-model="channels" :options="options" label="Каналы уведомлений" has-select-all />
</template>
```

---

## BaseRadio

Группа radio button: варианты передаются в `options`, `name` (имя группы нативных `input`) обязателен.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRadio } from '@ramzes1385/rise-ui-kit'

const value = ref<string | number>('email')

const options = [
	{ value: 'email', label: 'Email' },
	{ value: 'phone', label: 'Телефон' },
]
</script>

<template>
	<BaseRadio v-model="value" name="contact" :options="options" label="Способ связи" />
</template>
```

---

## BaseSegmented

Переключатель сегментами для двух–пяти коротких вариантов: период отчёта, вид списка. Нативные radio с общим `name` — один таб-стоп, стрелки переключают выбор; группа названа `label`, `aria-label` или подписью `BaseFormField`. `is-block` — во всю ширину, у сегмента может быть иконка.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSegmented } from '@ramzes1385/rise-ui-kit'

const period = ref<string | number | null>('week')
const periods = [
	{ value: 'day', label: 'День' },
	{ value: 'week', label: 'Неделя' },
	{ value: 'month', label: 'Месяц' },
]
</script>

<template>
	<BaseSegmented v-model="period" :options="periods" aria-label="Период отчёта" />
</template>
```

---

## BaseSwitch

Переключатель.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSwitch } from '@ramzes1385/rise-ui-kit'

const enabled = ref(false)
</script>

<template>
	<BaseSwitch v-model="enabled" label="Включить уведомления" />
</template>
```

---

## BaseForm

Контейнер формы.

Событие `submit` приходит без перезагрузки страницы (нативная отправка отменяется). Кнопке отправки нужен `type="submit"` — у `BaseButton` по умолчанию `type="button"`. При `is-loading` / `is-disabled` `submit` не эмитится, нативные поля блокируются через `<fieldset disabled>`, а кастомные контролы кита (`BaseSelect`, `BaseRange`, `BaseRating`, `BaseFileUpload`, `BaseEditor`, `BaseCheckboxGroup`) — через контекст формы. Заблокированные поля не попадают в FormData — собирайте данные до перевода формы в `is-loading`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseForm, BaseInput, BaseButton } from '@ramzes1385/rise-ui-kit'

const email = ref('')

function handleSubmit(): void {
	console.log(email.value)
}
</script>

<template>
	<BaseForm @submit="handleSubmit">
		<BaseInput v-model="email" type="email" placeholder="Email" />
		<BaseButton type="submit">Отправить</BaseButton>
	</BaseForm>
</template>
```

Проверка по схеме: `schema` — любая схема [Standard Schema](https://standardschema.dev) (Zod 3.24+, Valibot 1.0+, ArkType 2.0+), `state` — данные формы. При отправке кит проверяет `state`: ошибки показывают `BaseFormField` с тем же `name` (путь через точку: `address.city`), приходит событие `invalid`, фокус уходит на первое поле с ошибкой. После первой отправки ошибки исчезают по мере исправления. Без ошибок `submit` получает вторым аргументом данные после схемы. Через ref доступны `validate()`, `reset()` и `errors`. Кит не зависит от библиотеки схем — её ставит приложение.

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { z } from 'zod'
import { BaseButton, BaseForm, BaseFormField, BaseInput } from '@ramzes1385/rise-ui-kit'

const schema = z.object({
	name: z.string().trim().min(1, 'Введите имя'),
	email: z.string().email('Введите e-mail'),
})
const state = reactive({ name: '', email: '' })

function handleSubmit(_event: Event, data: unknown): void {
	console.log(data as z.infer<typeof schema>)
}
</script>

<template>
	<BaseForm :schema="schema" :state="state" @submit="handleSubmit">
		<BaseFormField label="Имя" name="name" is-required><BaseInput v-model="state.name" /></BaseFormField>
		<BaseFormField label="E-mail" name="email" is-required><BaseInput v-model="state.email" type="email" /></BaseFormField>
		<BaseButton type="submit">Отправить</BaseButton>
	</BaseForm>
</template>
```

---

## BaseFormField

Обёртка для поля формы.

Обычно используется для label, ошибок и вспомогательного текста. Контрол кита внутри (`BaseInput`, `BaseTextarea`, `BaseSelect`, `BaseCheckboxGroup`) сам получает от обёртки id, описание, ошибку и обязательность: подпись становится его именем, описание или ошибка — описанием (`aria-describedby`), ошибка обёртки красит поле. Для другого поля подпись связывает `for`, без него содержимое — группа с именем из подписи. `name` — имя поля в данных `BaseForm`: ошибку проверки по схеме обёртка показывает сама.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseFormField, BaseInput } from '@ramzes1385/rise-ui-kit'

const email = ref('')
</script>

<template>
	<BaseFormField label="Email" error="Некорректный email">
		<BaseInput v-model="email" placeholder="example@mail.com" />
	</BaseFormField>
</template>
```

---

## BaseModal

Модальное окно. Кнопки действий — в слоте `footer`, обработчики на них. Блокирующий диалог, который закрывает только своя кнопка, — `:close-on-escape="false" :close-on-overlay="false"`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseModal, BaseButton } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseButton @click="isOpen = true">Открыть</BaseButton>

	<BaseModal v-model:is-open="isOpen" title="Подтверждение">
		<p>Вы уверены?</p>
	</BaseModal>
</template>
```

Открытием управляет `v-model:is-open`. Окно — модальный диалог: фокус переводится внутрь, Tab не выходит за его пределы, после закрытия фокус возвращается на элемент, с которого окно открыли (composable `useFocusTrap`). Для подтверждений есть готовый `BaseConfirm`; открыть окно из кода — `useOverlay()` (см. `BaseApp`).

---

## BaseConfirm
BaseCountdown

Окно подтверждения: вопрос, последствия и две кнопки. Из кода — `useConfirm()` внутри `BaseApp` (см. [«BaseApp: уведомления и окна из кода»](../../README.md#baseapp-уведомления-и-окна-из-кода)), в шаблоне — так:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseConfirm } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseButton @click="isOpen = true">Удалить проект</BaseButton>

	<BaseConfirm
		v-model:is-open="isOpen"
		title="Удалить проект?"
		description="Задачи и файлы удалятся без возможности восстановления."
		confirm-label="Удалить"
		is-danger
		@confirm="deleteProject" />
</template>
```

`role="alertdialog"`: скринридер читает вопрос и описание вместе. `isDanger` красит кнопку подтверждения цветом ошибки и ставит фокус при открытии на «Отмену». События: `confirm`, `cancel`, `close(result)`.

---

## BaseApp

Корень приложения для `useToast()`, `useOverlay()`, `useConfirm()` и `useLoadingBar()`: рендерит слот без обёртки, а поверх страницы — уведомления, окна и полосу загрузки. Проп `toaster` настраивает уведомления, `loadingBar` — толщину и имя полосы. Пример — в разделе [«BaseApp: уведомления и окна из кода»](../../README.md#baseapp-уведомления-и-окна-из-кода).

---

## BaseSlideover

Выезжающая панель. С затемнением (`hasOverlay`, по умолчанию) — модальный диалог: фокус заперт внутри, прокрутка страницы заблокирована. `:has-overlay="false"` — немодальная панель: страница под ней кликается и прокручивается, фокус свободно переходит между страницей и панелью, Escape закрывает её, только когда фокус в панели. Оформление — `variant`: `default`, `shadow`, `ghost` (как у BaseModal).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSlideover, BaseButton } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseButton @click="isOpen = true">Открыть панель</BaseButton>

	<BaseSlideover v-model:is-open="isOpen" title="Настройки"> Содержимое панели </BaseSlideover>
</template>
```

---

## BaseDrawer

Выдвижная панель у края окна: нижний лист (`direction="bottom"`), сверху или сбоку. Модальный диалог: имя из `title`, описание из `description`, фокус заперт внутри и возвращается к кнопке. Закрывают кнопка «Закрыть», Escape, клик по затемнению и перетаскивание за ручку или шапку к краю (`is-draggable`).

```vue
<BaseButton @click="isOpen = true">Фильтры</BaseButton>
<BaseDrawer v-model:is-open="isOpen" title="Фильтры" description="Заказы за сентябрь">
	<BaseCheckboxGroup v-model="statuses" :options="options" label="Статус" is-vertical />
	<template #footer><BaseButton @click="isOpen = false">Показать</BaseButton></template>
</BaseDrawer>
```

---

## BaseDropdown

Выпадающее меню.

Триггер — слот по умолчанию, содержимое панели — слот `dropdown`. Открытием управляет `v-model:is-open`: открывает панель приложение, закрывается она сама — по клику снаружи и Escape.

Клавиатура: Tab с последнего элемента панели закрывает её и переводит фокус к элементу после триггера, Shift+Tab с первого — закрывает и возвращает фокус на триггер; стрелки, Home и End переводят фокус по пунктам с ролями `menuitem*` и `option`. Панель с полями и кнопками (выбор периода, форма) — `trap-focus`: фокус переходит в панель и ходит по кругу внутри неё (содержимому — `role="dialog"` и имя).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseDropdown, BaseButton } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseDropdown v-model:is-open="isOpen">
		<BaseButton @click="isOpen = !isOpen">Меню</BaseButton>

		<template #dropdown>
			<div>Пункт меню</div>
		</template>
	</BaseDropdown>
</template>
```

---

## BaseDropdownMenu

Меню у кнопки по паттерну APG Menu Button: действия, флажки, переключатели, подменю, ссылки. Кнопка — слот по умолчанию: кит ставит ей `aria-haspopup="menu"`, `aria-expanded` и `aria-controls` и открывает меню по клику, Enter, Space и стрелкам.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, BaseDropdownMenu } from '@ramzes1385/rise-ui-kit'
import type { DropdownMenuItem } from '@ramzes1385/rise-ui-kit'

const showAuthor = ref(true)

const items = computed((): DropdownMenuItem[][] => [
	[
		{ label: 'Переименовать', icon: 'code', shortcut: 'F2', onSelect: rename },
		{ label: 'Скачать', icon: 'download', children: [{ label: 'Видео MP4' }, { label: 'Субтитры SRT' }] },
		{ label: 'Открыть на сайте', href: 'https://example.com/episodes/3', target: '_blank' },
	],
	[{ type: 'checkbox', label: 'Показывать автора', isChecked: showAuthor.value, onUpdateChecked: value => (showAuthor.value = value) }],
	[{ label: 'Удалить', icon: 'trash', isDanger: true, onSelect: remove }],
])
</script>

<template>
	<BaseDropdownMenu :items="items" @select="item => console.log(item.label)">
		<BaseButton variant="outline">Действия</BaseButton>
	</BaseDropdownMenu>
</template>
```

- Пункты — список или группы (группы разделены линией). Типы: `item`, `checkbox`, `radio`, `label` (подпись группы), `separator`. Пункт с `to` или `href` — ссылка (`BaseLink`), `isDanger` — цвет ошибки, `shortcut` — подпись сочетания клавиш, `children` — подменю.
- Клавиатура: стрелки по кругу, Home/End, буквы — поиск по началу подписи, стрелка вправо открывает подменю, влево — закрывает, Escape закрывает верхнее меню и возвращает фокус на кнопку, Tab из меню не уходит.
- Обычный пункт закрывает меню. Флажок и переключатель по клику и Space меню не закрывают, по Enter — закрывают; `close-on-check` закрывает меню и по клику — для меню выбора одного значения (скорость, качество, серия). Отметки хранит приложение: `isChecked` и `onUpdateChecked`.

---

## BaseContextMenu

Меню по правому клику на области — те же пункты и клавиатура, что у `BaseDropdownMenu`. Открывается у указателя, клавишей «Меню» или Shift+F10 — у элемента с фокусом; `isDisabled` возвращает меню браузера.

```vue
<template>
	<BaseContextMenu :items="items" @select="handleSelect">
		<EpisodeCard :episode="episode" />
	</BaseContextMenu>
</template>
```

Правый клик — не единственный путь: то же действие должно быть доступно кнопкой или меню у кнопки.

---

## BasePopover

Панель с содержимым у кнопки: форма, фильтр, подробности. Кнопка — слот `trigger`: кит ставит ей `aria-haspopup="dialog"`, `aria-expanded` и `aria-controls`, панель — немодальный диалог с именем кнопки. Закрывается повторным кликом, Escape и кликом снаружи (событие `close` во всех трёх случаях).

```vue
<script setup lang="ts">
import { BasePopover, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BasePopover>
		<template #trigger>
			<BaseButton>Открыть popover</BaseButton>
		</template>

		<div>Контент popover</div>
	</BasePopover>
</template>
```

Если кнопка вложена глубже (в своём компоненте), привяжите атрибуты из слота: `<template #trigger="{ triggerProps }"><MyButton v-bind="triggerProps" /></template>`.

---

## BasePopconfirm

Вопрос у кнопки перед действием: «Снять с публикации?», «Удалить комментарий?». Легче окна `BaseConfirm`: не закрывает страницу. Ответ — события `confirm` и `cancel`; Escape и клик снаружи — отмена.

```vue
<template>
	<BasePopconfirm
		title="Удалить комментарий?"
		description="Ответы на него тоже удалятся."
		confirm-label="Удалить"
		is-danger
		@confirm="removeComment">
		<BaseButton variant="ghost">Удалить</BaseButton>
	</BasePopconfirm>
</template>
```

`isDanger` — значок предупреждения, кнопка цвета ошибки и фокус на «Отмене». Панель — `role="alertdialog"`, Tab ходит между кнопками по кругу.

---

## BaseTooltip

Короткая подсказка к элементу: по наведению и по фокусу, Escape скрывает. Пока подсказка на экране, элемент описан ею (`aria-describedby`); на подсказку можно навести указатель — она не пропадает. У края окна подсказка переворачивается и сдвигается.

```vue
<script setup lang="ts">
import { BaseTooltip, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseTooltip text="Подсказка">
		<BaseButton>Наведи на меня</BaseButton>
	</BaseTooltip>
</template>
```

Подсказка — описание, а не имя: у кнопки-иконки нужен свой `aria-label`. Пустой `text` подсказку не показывает.

---

## BaseTable

Таблица данных.

Значения ячеек строки лежат в `data` под ключами из `columns[].key` (типы `TableColumn`, `TableRow`).

```vue
<script setup lang="ts">
import { BaseTable } from '@ramzes1385/rise-ui-kit'

const columns = [
	{ key: 'name', label: 'Название' },
	{ key: 'status', label: 'Статус' },
]

const rows = [
	{ id: 1, data: { name: 'Задача 1', status: 'Активна' } },
	{ id: 2, data: { name: 'Задача 2', status: 'Завершена' } },
]
</script>

<template>
	<BaseTable :columns="columns" :rows="rows" />
</template>
```


Тысячи строк без пагинации — виртуальная прокрутка: `is-virtual` вместе с `height`. В DOM только видимые строки и запас, таблица объявляет полное число строк (`aria-rowcount`), строки — своё место (`aria-rowindex`); `row-height` — высота строки до замера.

```vue
<BaseTable :columns="columns" :rows="orders" height="480px" is-virtual />
```
---

## BasePagination

Пагинация.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BasePagination } from '@ramzes1385/rise-ui-kit'

const page = ref(1)
</script>

<template>
	<BasePagination v-model="page" :total="100" :page-size="10" />
</template>
```

Корень — ориентир `<nav>` «Пагинация» (`aria-label` — своё имя, если пагинаций на странице несколько), номера названы «Страница N», текущая — `aria-current="page"`. Клик по текущей странице событий не эмитит. `show-last-page="false"` — без последней страницы: окно номеров доходит до конца, справа «…», пока дальше есть страницы.

---

## BaseInfiniteScroll

Бесконечная прокрутка: событие `load` приходит, когда конец списка подходит к краю окна или контейнера (`root`), и несёт `done` — итог подгрузки: `ok`, `empty` (конец списка) или `error` (кнопка «Повторить»). Пока идёт загрузка — `aria-busy`, состояние объявляет `role="status"`. `mode="manual"` — подгрузка кнопкой «Загрузить еще»; `reset()` через ref — начать заново после смены фильтра.

```vue
<BaseInfiniteScroll @load="loadMore">
	<OrderRow v-for="order in orders" :key="order.id" :order="order" />
</BaseInfiniteScroll>

<script setup lang="ts">
async function loadMore({ done }: InfiniteScrollLoadEvent) {
	try {
		const page = await api.orders(orders.value.length)
		orders.value.push(...page)
		done(page.length < 20 ? 'empty' : 'ok')
	} catch {
		done('error')
	}
}
</script>
```

---

## BaseVirtualList

Список на тысячи строк: в DOM только видимые строки и запас. Строки разной высоты замеряются после отрисовки (`item-size` — высота до замера), ключ — `item-key` (по умолчанию `id`). Список — `role="list"` с именем, строки — `listitem` с `aria-setsize` и `aria-posinset`; строка с фокусом не уходит из DOM при прокрутке. `scrollToIndex(index, align)` через ref; та же логика — в composable `useVirtualList`.

```vue
<BaseVirtualList :items="orders" :height="480" aria-label="Заказы">
	<template #default="{ item }">
		<OrderRow :order="item" />
	</template>
</BaseVirtualList>
```

---

## BaseTabs

Табы.

`v-model` хранит `id` активной вкладки; содержимое панели передаётся в слот по умолчанию.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTabs } from '@ramzes1385/rise-ui-kit'

const activeTab = ref('main')

const tabs = [
	{ id: 'main', label: 'Основное' },
	{ id: 'settings', label: 'Настройки' },
]
</script>

<template>
	<BaseTabs v-model="activeTab" :items="tabs">
		<p v-if="activeTab === 'main'">Основные параметры</p>
		<p v-else>Настройки профиля</p>
	</BaseTabs>
</template>
```

- Значок вкладки — `icon` с именем иконки BaseIcon (`{ id: 'settings', label: 'Настройки', icon: 'settings' }`), своя разметка — слот `icon` (`{ item }`). Значок декоративный, имя вкладки — `label`.
- `change` и `update:modelValue` приходят только при смене вкладки: клик по выбранной вкладке их не вызывает.

---

## BaseAccordion

Аккордеон.

Элементы передаются в `items`: заголовок — `label`, текст — `content`, либо имя слота в `slot` для произвольной разметки. `is-multiple` разрешает открывать несколько элементов.

Разметка — по шаблону Accordion WAI-ARIA: заголовок `<h3>` (уровень — `heading-level`) с кнопкой `aria-expanded`, панель — `region`. Открытые пункты — `v-model:open`, список ключей: поле пункта `id`, иначе `label`; без него аккордеон открывает пункты сам, начиная с `defaultOpen`.

```vue
<BaseAccordion v-model:open="opened" :items="faq" is-multiple :heading-level="2" />
```

```vue
<script setup lang="ts">
import { BaseAccordion } from '@ramzes1385/rise-ui-kit'

const items = [
	{ label: 'Подробнее', content: 'Контент аккордеона' },
	{ label: 'Доставка', slot: 'delivery' },
]
</script>

<template>
	<BaseAccordion :items="items">
		<template #delivery>
			<p>Произвольная разметка из слота</p>
		</template>
	</BaseAccordion>
</template>
```

---

## BaseCard

Карточка.

```vue
<script setup lang="ts">
import { BaseCard } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseCard>
		<h3>Заголовок</h3>
		<p>Описание карточки</p>
	</BaseCard>
</template>
```

---

## BaseAlert

Alert-сообщение.

```vue
<script setup lang="ts">
import { BaseAlert } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAlert type="success" title="Успешно" description="Данные сохранены" />
</template>
```

---

## BaseNotification

Всплывающее уведомление. В приложении их удобнее показывать через `useToast()` внутри `BaseApp`; сам компонент нужен для отдельного списка уведомлений.

```vue
<script setup lang="ts">
import { BaseNotification } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseNotification title="Новое уведомление" description="Данные обновлены" />
</template>
```

Список — методом `add()` через ref (возвращает id) или управляемым `items` с событием `remove(id)`. Уведомление закрывается кнопкой и само через `duration` мс; пока указатель над уведомлениями или фокус внутри, таймер стоит. `isPersistent` — без автозакрытия, `actions` — кнопки под текстом: нажатие вызывает `onClick` и закрывает уведомление.

---

## BaseNotificationCenter

Центр уведомлений: список уведомлений приложения с непрочитанными, «Прочитать все» и фильтром «Все / Непрочитанные». Обычно открывается из кнопки с колокольчиком в шапке — в BasePopover.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseBadge, BaseButton, BaseIcon, BaseNotificationCenter, BasePopover, type NotificationCenterItem } from '@ramzes1385/rise-ui-kit'

const items = ref<NotificationCenterItem[]>([]) // заполняет приложение: API, WebSocket
const unread = computed(() => items.value.filter(item => !item.isRead).length)
</script>

<template>
	<BasePopover position="bottom">
		<template #trigger>
			<BaseButton variant="ghost" :aria-label="unread ? `Уведомления, новых: ${unread}` : 'Уведомления'">
				<template #left><BaseIcon name="bell" /></template>
				<BaseBadge v-if="unread" :label="String(unread)" aria-hidden="true" />
			</BaseButton>
		</template>
		<BaseNotificationCenter v-model:items="items" variant="ghost" @select="item => router.push(`/inbox/${item.id}`)" @read="ids => api.markRead(ids)" />
	</BasePopover>
</template>
```

Уведомление — `{ id, title, text?, date, isRead?, avatar?, icon? }`: картинка или иконка слева (по умолчанию колокольчик `bell`), время — «5 минут назад», «вчера», дальше недели — дата (`formatRelativeTime`, точка отсчёта — `now`). Клик по уведомлению отмечает его прочитанным и даёт событие `select`, кнопка справа переключает «прочитано»; события `read` и `unread` передают id изменившихся — для записи на сервер. Непрочитанное — точка, полужирный заголовок и подложка; для скринридера в названии кнопки — «не прочитано», число новых в шапке — `role="status"`. `v-model:filter` — фильтр, `maxHeight` — высота списка до прокрутки (360px), слот `actions` — свои кнопки в шапке.

---

## BaseBadge

Badge-компонент.

```vue
<script setup lang="ts">
import { BaseBadge } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseBadge label="New" />
</template>
```

---

## BaseKbd

Клавиша в тексте: `<kbd>`, служебные клавиши (`meta`, `shift`, `enter`, стрелки…) — символом с названием для скринридера; `meta` и `alt` на macOS — ⌘ и ⌥, на других системах — Ctrl и Alt.

```vue
<p>Нажмите <BaseKbd value="meta" /> + <BaseKbd value="K" />, чтобы открыть поиск</p>
```

---

## BaseChip

Индикатор-счётчик поверх вложенного элемента (например, число непрочитанных): обёртываемый элемент — слот по умолчанию, значение индикатора — проп `content`, позиция — `placement`. С `has-overflow` значения больше `max-value` (по умолчанию 99) выводятся как `99+`.

```vue
<script setup lang="ts">
import { BaseChip, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseChip :content="5">
		<BaseButton>Сообщения</BaseButton>
	</BaseChip>

	<BaseChip :content="120" has-overflow>
		<BaseButton>Уведомления</BaseButton>
	</BaseChip>
</template>
```

---

## BaseAvatar

Аватар пользователя.

```vue
<script setup lang="ts">
import { BaseAvatar } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAvatar name="Иван Иванов" src="/avatar.png" />
</template>
```

---

## BaseAvatarGroup

Аватары внахлёст с остатком «+N»: список, скринридер слышит имена и «и ещё N»; если сверх `max` остаётся один человек, показывается он.

```vue
<BaseAvatarGroup :items="[{ name: 'Анна Смирнова', src: '/anna.jpg' }, { name: 'Иван Петров' }]" :max="4" aria-label="Участники" />
```

---

## BaseUser

Человек: аватар, имя и подпись. Аватар скрыт от скринридера, статус «в сети» — скрытым текстом; `to`/`href` делают блок ссылкой на профиль, `orientation="vertical"` — аватар над текстом.

```vue
<BaseUser name="Анна Смирнова" description="Дизайнер" src="/anna.jpg" to="/users/1" is-online />
```

---

## BaseImage

Компонент изображения.

`<source>` в форматах AVIF/WebP добавляются только по явным `convert-to-avif` / `convert-to-webp` (оба по умолчанию `false`). Включайте их, только если рядом с файлом на сервере лежит копия `.avif` / `.webp`: при 404 браузер не вернётся к `src`.

```vue
<script setup lang="ts">
import { BaseImage } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseImage src="/image.jpg" alt="Описание изображения" />

	<!-- рядом на сервере лежит /photo.avif -->
	<BaseImage src="/photo.jpg" alt="Фото" convert-to-avif />
</template>
```

Просмотр (`:zoom-config="{ hasZoom: true }"`) — модальное окно: «+», «-» и «0» меняют масштаб, ← → листают галерею — только пока фокус в окне. `gallery` — адреса строками или `{ src, alt }`: имя окна меняется при листании («Просмотр изображения: Долина, изображение 3 из 5»). Атрибуты самого `<img>` (`crossorigin`, `fetchpriority`, `referrerpolicy`) — `img-attrs`; события `zoom-open`, `zoom-close` и `zoom` (масштаб изменился); через `ref` — `openZoom()` и `closeZoom()`.

```vue
<BaseImage
	src="/photos/1.jpg"
	alt="Горы"
	:zoom-config="{ hasZoom: true }"
	:gallery="[{ src: '/photos/1.jpg', alt: 'Горы' }, { src: '/photos/2.jpg', alt: 'Долина' }]"
	:img-attrs="{ fetchpriority: 'high' }" />
```

---

## BaseIcon

Компонент иконки. Иконки берутся из SVG-спрайта пакета — как сделать его доступным приложению, см. [«Иконки»](../../README.md#иконки) в README.

```vue
<script setup lang="ts">
import { BaseIcon } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseIcon name="search" />
</template>
```

Иконки кита можно заменить своими для всего приложения: `createUiKitPlugin({ icons: { close: 'x-mark', search: SearchIcon } })` — имя символа в спрайте, полный адрес символа (`/brand.svg#search`) или компонент, который рисует `<svg>`.

---

## BaseColorModeButton

Кнопка тёмной темы для шапки приложения.

```vue
<script setup lang="ts">
import { BaseColorModeButton, useColorMode } from '@ramzes1385/rise-ui-kit'

const { mode } = useColorMode() // 'light' | 'dark' | 'system'
</script>

<template>
	<BaseColorModeButton />
</template>
```

Кнопка-переключатель: имя «Тёмная тема» постоянное, нажатое состояние (`aria-pressed`) — тёмная тема. Тему меняет `useColorMode()`: ставит `data-theme` на `<html>` и сохраняет выбор в localStorage. Режим «как в системе» — `mode.value = 'system'`. Проп `colorMode` принимает свой экземпляр `createColorMode({ target })`, чтобы переключать тему части интерфейса.

---

## BaseLoader

Loader.

```vue
<script setup lang="ts">
import { BaseLoader } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseLoader />
</template>
```

---

## BaseSkeleton

Skeleton-заглушка.

Размеры задаются `width` / `height` (число — px, строка — любое CSS-значение). Без `height` заглушка формы `rect` (по умолчанию) и `circle` имеет нулевую высоту; у `shape="text"` высота строки задана.

```vue
<script setup lang="ts">
import { BaseSkeleton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseSkeleton width="100%" :height="120" />

	<BaseSkeleton shape="text" width="60%" />

	<BaseSkeleton shape="circle" :width="40" :height="40" />
</template>
```

---

## BaseEmpty
BaseEventCalendar

Empty state.

```vue
<script setup lang="ts">
import { BaseEmpty } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseEmpty title="Нет данных" description="Попробуйте изменить фильтры" />
</template>
```

---

## BaseProgress

Progress bar.

```vue
<script setup lang="ts">
import { BaseProgress } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseProgress :value="65" ariaLabel="Загрузка файла" />
</template>
```

Проп `ariaLabel` — доступное имя индикатора для скринридеров (по умолчанию «Прогресс»). В шаблоне он записан в camelCase: атрибут `aria-label` Vue тоже передаст в проп, но vue-tsc со `strictTemplates` считает `aria-*` HTML-атрибутами и не сопоставляет их с пропами.

---

## BaseRange

Range input.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRange } from '@ramzes1385/rise-ui-kit'

const value = ref(50)
</script>

<template>
	<BaseRange v-model="value" :min="0" :max="100" />
</template>
```

---

## BaseSlider

Slider/carousel.

```vue
<script setup lang="ts">
import { BaseSlider } from '@ramzes1385/rise-ui-kit'

// src обязателен; type: 'video' — для видео
const slides = [
	{ src: '/slides/1.jpg', alt: 'Слайд 1', title: 'Слайд 1' },
	{ src: '/slides/2.jpg', alt: 'Слайд 2', title: 'Слайд 2' },
]
</script>

<template>
	<BaseSlider :items="slides" has-caption />
</template>
```

Доступность — по APG Carousel: область с ролью «карусель» и именем `label` (по умолчанию «Карусель»), слайды — группы «2 из 5», смена слайда озвучивается. С `is-autoplay` первой в порядке Tab стоит кнопка «Остановить/Запустить автопрокрутку»; указатель над слайдером — пауза, фокус на слайде или стрелке, запуск видео и `prefers-reduced-motion` останавливают прокрутку до кнопки. Через `ref` — `goTo(index)`, `goNext()`, `goPrev()`, `stopAutoplay()`, `playAutoplay()`.

```vue
<BaseSlider ref="slider" :items="slides" label="Новинки" is-autoplay :autoplay-interval="5000" />
```

---

## BaseMediaPlayer

Видеоплеер со своей панелью управления — отдельный вход пакета `@ramzes1385/rise-ui-kit/media`: в корень пакета и в плагин он не входит, поэтому приложения без плеера его код не загружают. Стили плеера — в общем `styles.css`. Играет первый источник из `sources`, который поддерживает браузер; абсолютные адреса — только `http:`, `https:` и `blob:` (`allowed-protocols`). Ошибки загрузки и отказ автозапуска показываются в плеере и приходят событием `error`; запуск, пауза и конец записи — событиями `play`, `pause` и `ended`, полный экран — `fullscreen-change`.

```vue
<script setup lang="ts">
import { BaseMediaPlayer } from '@ramzes1385/rise-ui-kit/media'
import type { MediaPlayerError } from '@ramzes1385/rise-ui-kit/media'

const sources = [
	{ src: '/video/intro.webm', type: 'video/webm; codecs="vp9, opus"' },
	{ src: '/video/intro.mp4', type: 'video/mp4' },
]

function handleError(error: MediaPlayerError): void {
	console.warn('Видео не воспроизводится:', error.code)
}
</script>

<template>
	<BaseMediaPlayer :sources="sources" title="Знакомство с сервисом" poster="/video/intro.webp" @error="handleError" />
</template>
```

Все контролы панели — отдельные кнопки (по прежнему плееру VideoStack): пуск, «Точная перемотка» — раскрывает второй ряд с перемоткой на 30, `seek-step-large` и `seek-step` секунд назад и вперёд, звук с вертикальным ползунком громкости над кнопкой, время и глава; справа — переключатель «Автовоспроизведение» (у сериалов), скорость (на кнопке — текущая), качество, субтитры, озвучка (только значок, выбранная — в подсказке), трансляция, серии со счётчиком, «Картинка в картинке» (где браузер её поддерживает), широкий и полный экран. Скорость — панель как в YouTube: крупно текущее значение, ползунок от 0,25× до 4× с шагом 0,05, кнопки «−» и «+» и готовые значения `playback-rates`. Меню компактные и без каскадов: вложенный список (вид субтитров, сезон) открывается на месте текущего, сверху — «Назад» с его названием; стрелки, Home и End переходят по пунктам, стрелка вправо открывает вложенный список, влево — возвращает, Escape закрывает меню. Во время воспроизведения панель и название плавно уходят через `idle-timeout`, а когда мышь уходит с плеера — сразу; панель остаётся, пока указатель над ней, открыто меню или панель серий и глав, или фокус в ней после ввода с клавиатуры. «Продолжить с …» появляется по центру над панелью. Анимации плавные, в духе Kinescope: значки сменяются с поворотом и растворением (пуск и пауза перетекают друг в друга), кнопки чуть увеличивают значок при наведении и сжимаются при нажатии, подсказки и меню появляются от кнопки, вложенные списки сменяются сдвигом, шкала утолщается, большая кнопка при запуске увеличивается и растворяется, элементы панелей и второго ряда появляются по очереди; позиция на шкале движется плавно, без скачков. Длительности берутся из токенов кита, поэтому при `prefers-reduced-motion` движения нет. Если кнопки первого ряда не помещаются, плеер убирает лишнее по порядку, пока ряд не поместится: подписи на кнопках, главу, кнопки соседних серий, длительность, широкий экран, затем сужает кнопки и убирает «Картинку в картинке», «Точную перемотку», громкость и время — кнопки не наезжают друг на друга при любом наборе. Ширина ряда считается по самим кнопкам: открытые меню, подсказки и ползунок громкости её не меняют, поэтому панель не мигает при открытии и закрытии меню. Значки — Font Awesome Free 7 (Solid, Regular и Brands, лицензия CC BY 4.0): скруглённые, залитые и одной высоты — все стоят по центру общего поля 640×512; «Картинка в картинке», мини-плеер и широкий экран нарисованы по мотивам набора. Значки встроены в плеер и не загружаются из сети. При наведении значок чуть двигается: шестерёнка качества поворачивается, стрелки серий и перемотки сдвигаются в свою сторону, полный экран «раскрывается». Весь набор — в истории Icons. По умолчанию плеер оранжево-чёрно-белый, как палитра кита: оранжевый акцент (#f97316, для кнопок с белым текстом — #c2410c), чёрные полупрозрачные панели с размытием, белый текст. Акцент меняет `accent-color` — «цвет плеера», как у Kinescope: большая кнопка, шкала, переключатели, счётчики, выбранные пункты меню и серии; для кнопок с белым текстом плеер сам берёт затемнённый вариант. Остальное — CSS-переменные корня: `--media-panel` (меню и панели), `--media-overlay` (подсказки), `--media-hover`, `--media-text`, `--media-muted`, `--media-border` и `--media-radius` (скругление углов плеера, 12px). Круглых элементов нет: большая кнопка, индикатор перемотки, крестики, счётчики и бегунки — квадраты с небольшим скруглением. Варианты цвета — в истории Colors.

Обложка (`poster`) лежит поверх кадра до первого запуска и заполняет его целиком; анимированные GIF, WebP, APNG и AVIF проигрываются. `poster-video` — видео-обложка: короткий ролик без звука по кругу (тизер), пока он грузится, виден `poster`; у серии плейлиста — свои `poster` и `posterVideo`. Щелчок по кадру запускает запись, обложка плавно гаснет. На паузе кадр затемняется, в центре — большая оранжевая кнопка «Воспроизвести» со скруглёнными углами (в конце записи — «Повторить»); двойной клик по краю показывает индикатор с секундами перемотки, долгая загрузка — вращающийся значок. Ошибка — экран со значком, заголовком, причиной и «Повторить» на анимированном фоне `error-effect`: `retro` (по умолчанию) — ретро-сетка с солнцем, `aurora` — переливы, `noise` — помехи «нет сигнала», `glitch` — сбой картинки, `none` — затемнение; фон берёт цвета плеера, при `prefers-reduced-motion` неподвижен, слот `error` меняет только текст — фон остаётся. Варианты — в истории ErrorEffects. Кнопки «Пропустить опенинг/эндинг» и «Пропустить интро/аутро» — белые, справа над панелью.

Позиция, громкость, звук, скорость и широкий экран связываются через `v-model:current-time`, `v-model:volume`, `v-model:is-muted`, `v-model:playback-rate` и `v-model:is-theater`; позиция обновляется не чаще 4 раз в секунду. Качество выбирается в меню кнопки «Качество» из источников с подписью `label`; логотип — `logo`, `logo-alt`, `logo-href` и угол `logo-position` (по умолчанию `top-right`), название поверх кадра убирает `:has-title="false"`.

Вид и поведение: `mode` — вид плеера (`auto`: для аудиофайла — компактная панель без кадра, полного и широкого экрана и субтитров; `audio` и `video` задают вид явно), `aspect-ratio` — пропорции кадра (`16 / 9`), `preload` — что загружать до запуска (`metadata`), `is-autoplay` — запуск без звука сразу после загрузки, `is-loop` — повтор, `idle-timeout` — через сколько миллисекунд без движения мыши во время воспроизведения прячется панель (3000; при фокусе в панели она не прячется). Скорости для Shift+. и Shift+, задаёт `playback-rates` (`[0.5, 0.75, 1, 1.25, 1.5, 2]`), шаг громкости для ↑/↓ — `volume-step` (0,05). Через ref плееру доступны `play()`, `pause()`, `togglePlay()`, `seek(секунды)`, `seekBy(секунды)`, `setVolume()`, `toggleMute()`, `setMuted()`, `setPlaybackRate()`, `retry()`, `state`, `getMediaElement()` и `awardAchievement(id)`.

Правый клик по плееру открывает его меню: повтор, «Поделиться…» (с `has-share`), копирование ссылки (`share-url`) и ссылки с таймкодом (`?t=754`, параметр — `time-param`), «Сообщить о проблеме» и «Данные для отладки». Форму жалобы плеер показывает сам, а отправляет приложение — по событию `report` с причиной, комментарием, позицией и отчётом для отладки в `details`. «Данные для отладки» — панель поверх кадра: на вкладке «Показатели» источник, формат, разрешение, пропущенные кадры, буфер, скорость, громкость и состояние элемента (обновляются раз в секунду), на вкладке «События» — лог событий `<video>` (`loadstart`, `waiting`, `seeked`, `error` …) и плеера (`play`, `ad`, `banner`, `update:volume` …) со временем и позицией, 200 последних. «Скопировать отчёт» кладёт в буфер обмена время, браузер, страницу (без параметров адреса), показатели и лог. Там же — «Повернуть картинку» (90° по кругу, картинка вписывается в кадр; во весь экран на телефоне плеер поворачивает экран по картинке, где браузер это позволяет) и «Подсветка» — свечение цветами краёв кадра вокруг плеера (ещё — кнопка во втором ряду панели); выбор подсветки запоминается в браузере, для записи с другого домена без CORS свечение ровное синее.

«Поделиться» включает `has-share`: кнопка на панели (при нехватке места она уходит вместе с кнопкой широкого экрана) и пункт «Поделиться…» в контекстном меню открывают окно внутри плеера. В окне — ряд соцсетей и мессенджеров со стрелками прокрутки: ВКонтакте, Telegram, WhatsApp, Одноклассники, Viber, X, Facebook, Reddit, LinkedIn, Pinterest, Tumblr, Threads, Bluesky, LINE, Weibo, XING, Hacker News, Flipboard и почта; набор и порядок задаёт `share-networks` (список — `MEDIA_SHARE_NETWORKS`). Ссылка (`share-url`, по умолчанию адрес страницы) копируется кнопкой «Копировать» — на ней 2 с горит «Скопировано», а если браузер не дал доступа к буферу обмена, ссылка выделяется для Ctrl+C. Переключатель «Начать с 1:23» добавляет позицию, на которой окно открыли (`time-param`). Где браузер умеет системное окно «Поделиться» (Web Share API — телефоны и часть настольных систем), появляется «Ещё». Каждое действие приходит событием `share` — `{ target, url, time? }`, где `target` — соцсеть, `copy` или `system`. Pinterest получает обложку (`poster`), остальные сети — название записи.

Совместный просмотр включает `watch-party` — ссылка-приглашение и участники, которых ведёт приложение. Кнопка «Совместный просмотр» со счётчиком смотрящих открывает окно: ссылка с «Копировать», приглашение по почте и список участников («Ведущий», «Смотрит», «Приглашён»). Письмо со ссылкой отправляет приложение по событию `watch-invite`. Запуск, пауза, перемотка и скорость приходят событием `watch-sync` — `{ type: 'play' | 'pause' | 'seek' | 'rate', time, rate? }`; приложение рассылает их участникам через свой сервер, а команды других участников передаёт в `applyWatchEvent(event)` через ref плеера: плеер перематывает, если расхождение больше 0,5 с, и не отвечает повторным `watch-sync`.

```vue
<BaseMediaPlayer
	ref="player"
	:sources="sources"
	title="Серия 1"
	:watch-party="{ link: room.link, members: room.members }"
	@watch-invite="email => api.invite(room.id, email)"
	@watch-sync="event => socket.send(JSON.stringify(event))" />
```

Мини-плеер включает `has-mini-player`: если идущая запись прокручена выше края окна, плеер переезжает в правый нижний угол окна и продолжает играть, на его месте остаётся подпись; «Вернуть плеер на место» прокручивает к нему, «Закрыть мини-плеер» ставит запись на паузу, а когда место плеера снова видно, плеер возвращается сам. Мини-плеер держится в углу через `position: fixed`, поэтому у предков плеера не должно быть `transform`, `filter` и `contain`. «Картинка в картинке» браузера — отдельной кнопкой панели. С `storage-key` плеер запоминает позицию в браузере и предлагает продолжить; `?t=` в адресе страницы открывает запись с этой позиции (`:has-url-time="false"` отключает).

Субтитры передаются в `tracks`: файлы WebVTT (.vtt) и SubRip (.srt) без перекодирования, в UTF-8, UTF-16 или Windows-1251. Дорожка с `isDefault` включается сразу; выбранная дорожка связывается через `v-model:text-track` (`src` дорожки или `null` — выключены). Зритель выбирает дорожку в меню кнопки «Субтитры» (клавиша C включает и выключает), меняет размер, цвет, фон и положение в «Виде субтитров» того же меню и перетаскивает блок субтитров мышью; оформление и место запоминаются в браузере. Свой файл .srt или .vtt зритель добавляет пунктом «Загрузить файл субтитров…» или перетаскиванием на плеер (`:has-caption-upload="false"` отключает). Файлы с другого домена загружаются по CORS: сервер должен отдавать `Access-Control-Allow-Origin`, а с `crossorigin="use-credentials"` плеер передаёт и cookie.

```vue
<BaseMediaPlayer
	v-model:text-track="subtitles"
	:sources="sources"
	:tracks="[
		{ src: '/subs/ep1.ru.vtt', label: 'Русский', srclang: 'ru', isDefault: true },
		{ src: '/subs/ep1.en.srt', label: 'English', srclang: 'en' },
	]"
	title="Серия 1" />
```

Озвучки отдельными аудиофайлами передаются в `audio-tracks`: выбранная озвучка звучит синхронно с видео, звук самого видео при этом выключен, а громкость и кнопка звука управляют озвучкой. Пункт без `src` — звук самого видео. Выбранная озвучка связывается через `v-model:audio-track` (`src` или `null` — звук видео). Если в файле несколько звуковых дорожек (MP4, MKV), меню «Озвучка» без `audio-tracks` показывает их там, где браузер видит дорожки (Safari). Для остальных браузеров дорожки выносятся в отдельные файлы:

```sh
# видео с оригинальной дорожкой (первой) — без перекодирования
ffmpeg -i episode.mkv -map 0:v:0 -map 0:a:0 -c copy episode.mp4
# вторая дорожка отдельным файлом: AAC — без перекодирования, остальные — в Opus
ffmpeg -i episode.mkv -map 0:a:1 -vn -c copy dub-2.m4a
ffmpeg -i episode.mkv -map 0:a:1 -vn -c:a libopus -b:a 128k dub-2.webm
```

```vue
<BaseMediaPlayer
	v-model:audio-track="dub"
	:sources="[{ src: '/video/ep1.mp4', type: 'video/mp4' }]"
	:audio-tracks="[
		{ label: 'Оригинал' },
		{ src: '/audio/ep1.anilibria.m4a', label: 'AniLibria', type: 'audio/mp4', isDefault: true },
	]"
	title="Серия 1" />
```

Потоки HLS (.m3u8) Safari играет сам. В остальных браузерах плееру нужен hls.js: его подключает приложение, в ките такой зависимости нет.

```vue
<script setup lang="ts">
import Hls from 'hls.js'
import { BaseMediaPlayer } from '@ramzes1385/rise-ui-kit/media'
</script>

<template>
	<BaseMediaPlayer :hls="Hls" :hls-config="{ maxBufferLength: 30 }" sources="/stream/ep1/master.m3u8" title="Серия 1" />
</template>
```

С потоком меню «Качество» показывает «Авто» с текущим уровнем и уровни потока, «Озвучка» — звуковые дорожки потока, «Субтитры» — его субтитры WebVTT; их оформление и перетаскивание — те же, что у `tracks`. Сбой сети или декодирования hls.js сначала пытается исправить сам, затем плеер показывает сообщение с «Повторить».

Сезоны и серии передаются в `playlists`: у серии свои источники, обложка, субтитры, озвучки и главы, а выбранная серия связывается через `v-model:episode`. В панели появляются «Предыдущая серия» и «Следующая серия» (Shift+P и Shift+N) и кнопка «Серии» со счётчиком: она открывает панель справа внутри плеера — вкладки сезонов и карточки с номером, картинкой серии (`poster`), названием, описанием (`description`, две строки) и длительностью (`duration`, секунды); текущая серия выделена, Escape, крестик и щелчок мимо закрывают панель. Актёры (`actors` у плейлиста — состав сезона, у серии — например, приглашённые звёзды) открываются вкладкой «В ролях» в той же панели: фото (`photo`, без него — инициалы), имя, роль и ссылки на соцсети (`links`) — значок плеер узнаёт по адресу: Instagram, ВКонтакте, Telegram, X, Facebook, YouTube, TikTok, Threads, IMDb, Одноклассники, остальное — «Сайт»; ссылки открываются в новой вкладке, у каждой имя вида «Instagram: Мира Звёздная». Если актёры заданы и у серии, и у сезона, вкладка делится на группы «В этой серии» и «В сезоне». После конца серии плеер показывает карточку «Следующая серия через 5» с кольцом отсчёта (`next-countdown`, 0 — переход сразу); переключатель «Автовоспроизведение» в панели — `v-model:is-auto-next`. С `storage-key` позиция запоминается для каждой серии отдельно.

```vue
<BaseMediaPlayer
	v-model:episode="episode"
	title="Сериал"
	storage-key="show-42"
	:playlists="[
		{
			id: 's1',
			title: 'Сезон 1',
			episodes: [
				{
					id: 's1e1',
					title: 'Серия 1',
					sources: '/video/s1e1.mp4',
					chapters: [
						{ start: 0, title: 'Пролог' },
						{ start: 95, end: 185, title: 'Опенинг', kind: 'intro' },
						{ start: 185, title: 'Серия' },
						{ start: 1320, title: 'Эндинг', kind: 'outro' },
					],
				},
			],
		},
	]" />
```

Шкала — как в VideoStack, но крупнее: дорожка 6px, при наведении 10px, бегунок 18px с белой рамкой появляется при наведении, фокусе и перетаскивании (на сенсорных экранах виден всегда). Главы (`chapters` у серии или у плеера) делят шкалу на отрезки с зазором: просмотренная часть — цветом плеера (или цветом главы `color`), непросмотренная — белым 35%, отрезок под указателем растёт. Текущая глава видна рядом со временем; щелчок по ней открывает полупрозрачную панель глав слева внутри плеера — название, начало и просмотренная часть текущей главы; выбор главы перематывает к её началу. Над шкалой при наведении — превью со стрелкой, которая указывает точно на место под указателем, даже когда окно прижато к краю. На отрезках `intro`, `outro` и `recap` появляется «Пропустить опенинг», «Пропустить эндинг» или «Пропустить краткое содержание»; эндинг в конце серии сразу включает следующую.

При наведении на шкалу над ней появляется превью: кадр 160×90, название главы и время; окно не выходит за края шкалы. С `thumbnails` кадры берутся из файла WebVTT, где каждому отрезку времени соответствует картинка или её часть (`sprite.jpg#xywh=0,0,160,90`, как у Video.js и JW Player; адреса — относительно файла). Без файла плеер сам берёт кадры из записи: скрытое видео (самое низкое качество, только метаданные и нужные отрезки) перематывается к позиции под указателем, кадр рисуется только после перемотки (`seeked`) и с учётом плотности пикселей экрана, последние 40 кадров запоминаются; для потока HLS нужен `hls` (отдельный экземпляр на самом низком качестве) или Safari. `:has-seek-preview="false"` отключает кадры из записи (время и глава остаются).

Интро и аутро — отдельные ролики `intro` и `outro` (`{ sources, title?, skipAfter? }`) у плеера, плейлиста или серии; ближний уровень главнее, `null` отключает ролик, заданный выше. Интро играет, когда зритель запускает серию с начала (не при продолжении с середины), аутро — после конца серии, до отсчёта следующей; поверх кадра — подпись («Интро», «Аутро» или `title`), пауза, прогресс и «Пропустить интро» или «Пропустить аутро» (сразу или через `skipAfter` секунд), панель и горячие клавиши на это время скрыты. Реклама в начале и в конце идёт раньше роликов.

Своя реклама — `ad-breaks` и `ad-segments` (у серии — свои). Рекламная пауза — картинка или ролик перед видео (`at: 'pre'`), на заданной секунде (`at: 90`) или после (`at: 'post'`); во время неё панель плеера заменяет метка «Реклама · 1 из 2», пауза, «Перейти на сайт» (`clickUrl`) и «Пропустить через N» (`skipAfter`); щелчок в любом месте объявления тоже открывает сайт рекламодателя. Интеграция — отрезок ролика с «Пропустить рекламу». Паузы и интеграции отмечены на шкале жёлтым; показы, досмотры, пропуски, клики и ошибки приходят событием `ad`.

```vue
<BaseMediaPlayer
	:sources="sources"
	title="Серия 1"
	:ad-breaks="[
		{ at: 'pre', ads: [{ id: 'promo', src: '/ads/promo.webm', type: 'video/webm', skipAfter: 5, clickUrl: 'https://example.com' }] },
		{ at: 600, ads: [{ src: '/ads/banner.webp', duration: 5, skipAfter: 3 }] },
	]"
	:ad-segments="[{ id: 'sponsor', start: 250, end: 310, title: 'Спонсор серии' }]"
	@ad="trackAd" />
```

Рекламная сеть подключается адресом VAST вместо списка объявлений: `{ at: 'pre', vast: 'https://ads.example.com/vast?slot=preroll' }`. Когда подходит время паузы, плеер загружает ответ (без cookie; сервер должен отвечать с CORS), проходит обёртки Wrapper (до 5), выбирает ролик, который воспроизводит браузер, и показывает его как свою рекламу; пиксели показа, квартилей, паузы, звука, клика, пропуска, досмотра и ошибок (с кодом VAST в `[ERRORCODE]`) отправляются сами. VPAID и SIMID не поддерживаются. Свои объявления тоже могут нести пиксели в `tracking`.

Баннеры (`banners`) появляются в заданное время: по умолчанию — полосой во всю ширину над панелью (`position: 'bottom'`), или карточкой в углу кадра (`top-left`, `top-right`, `bottom-left`, `bottom-right`). В баннере — картинка, текст до двух строк, стрелка, если есть ссылка (открывается в новой вкладке), и «Закрыть»; пока полоса видна, субтитры, «Пропустить», «Продолжить с …» и карточки над панелью поднимаются над ней. Свой вид — слот `banner`, события — `banner`. Достижения (`achievements`) всплывают компактным уведомлением по центру сверху — с картинкой `icon` или кубком, когда зритель досмотрел до секунды `at` или до конца (`at: 'end'`); каждое выдаётся один раз — полученные хранятся в браузере, а приложение может передать свои в `earned-achievements` и сохранить новые по событию `achievement`. Выдать достижение из кода — `awardAchievement(id)` через ref плеера.

```vue
<BaseMediaPlayer
	:sources="sources"
	title="Серия 1"
	:banners="[{ id: 'merch', start: 120, end: 135, text: 'Мерч сериала', href: 'https://shop.example.com', position: 'top-right' }]"
	:achievements="[{ id: 'ep1', title: 'Начало пути', description: 'Досмотрите первую серию', icon: '/badges/ep1.png', at: 'end' }]"
	:earned-achievements="user.achievements"
	@achievement="saveAchievement" />
```

Кнопка «Трансляция на телевизор» появляется, когда рядом есть устройство, и открывает выбор устройства. Список телевизоров и приставок в сети показывает браузер (Chrome — окно «Трансляция», Safari — AirPlay): страница сама получить его не может, браузер не даёт сайтам сканировать сеть; отказ от выбора — без ошибки. Без настройки работает Remote Playback API браузера (Chrome — Chromecast, Safari — AirPlay), управление плеером остаётся прежним. Если приложение подключает скрипт Google Cast, плеер находит его сам: запись уходит на телевизор с текущей секунды, плеер становится пультом (пауза, перемотка, клавиши, смена серии), а «Остановить трансляцию» продолжает просмотр на этом устройстве с того же места. Своё приложение-приёмник задаёт `cast-receiver-id`, по умолчанию — стандартный Default Media Receiver. Реклама, баннеры и субтитры на телевизор не передаются.

```html
<script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
```

Клавиши работают, пока фокус внутри плеера: Space/K — пуск и пауза, ←/→ — 5 с (`seek-step`), J/L — 10 с (`seek-step-large`), 0–9 — переход к доле записи, ↑/↓ — громкость, M — звук, F — полный экран, T — широкий экран, C — субтитры, Shift+. и Shift+, — скорость, Shift+N и Shift+P — следующая и предыдущая серия. Отключаются `:has-keyboard-shortcuts="false"`.

### MediaIcon — значки плеера

Значки панели управления плеера (контуры Font Awesome Free 7, лицензия CC BY 4.0) — для своих кнопок рядом с плеером: та же форма и толщина, что у его кнопок. Вход тот же — `@ramzes1385/rise-ui-kit/media`; список имён — история BaseMediaPlayer «Icons».

```vue
<script setup lang="ts">
import { MediaIcon } from '@ramzes1385/rise-ui-kit/media'
import type { MediaIconName } from '@ramzes1385/rise-ui-kit/media'

const icon: MediaIconName = 'share'
</script>

<template>
	<button type="button" aria-label="Поделиться"><MediaIcon :name="icon" /></button>
</template>
```

| Проп | Тип | Описание |
|---|---|---|
| `name` | `MediaIconName` | Имя значка: значок интерфейса (`play`, `pause`, `share`, `fullscreen`…) или соцсети (`telegram`, `vk`…) |

Значок — `<svg aria-hidden="true">` 24×24, масштаб — переменная `--size-scale` предка, цвет — `currentColor`: подпись для скринридера даёт кнопка. Смена `name` анимируется (пуск и пауза перетекают друг в друга); переходы берут длительность из переменных плеера, вне плеера значок меняется сразу.

---

## BasePresentationPlayer

Презентация с озвучкой в виде плеера: обучающие и ознакомительные слайды, которые идут сами по голосу — тот же вид, панель, клавиши, скорость и полный экран, что у BaseMediaPlayer. Вход — `@ramzes1385/rise-ui-kit/media`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BasePresentationPlayer } from '@ramzes1385/rise-ui-kit/media'
import type { PresentationSlide, PresentationSlideComplete } from '@ramzes1385/rise-ui-kit/media'

const slide = ref(0)
const slides: PresentationSlide[] = [
	{ id: 'intro', title: 'Кто мы', image: '/course/1.webp', audio: '/course/1.opus', minDuration: 20 },
	{ id: 'rules', title: 'Правила', image: '/course/2.webp', audio: '/course/2.opus' },
	{ id: 'map', title: 'Схема офиса', image: '/course/3.webp', duration: 15 },
]

function report(event: PresentationSlideComplete) {
	// отправить на сервер: сервер сверяет время между slide-complete с длительностью озвучки
}
</script>

<template>
	<BasePresentationPlayer v-model:slide="slide" :slides="slides" title="Вводный курс" navigation="linear" storage-key="intro-course" @slide-complete="report" />
</template>
```

- **Слайд** — `image` или `video` (или слот `slide` со своим HTML), `alt`, `title`. Время слайда: своя озвучка `audio` → видео слайда → `duration` (секунды) → без них слайд стоит, пока его не перелистнут. Общая дорожка на всю презентацию — проп `audio` и начала слайдов `slides[].at`.
- **Переход дальше** — по концу озвучки, видео или `duration`. «Предыдущий» и «Следующий слайд», шкала из отрезков-слайдов, ←/→ (также J/L, PageUp/PageDown, Shift+N/P), Space/K — пауза, F — полный экран, M — звук, ↑/↓ — громкость. «Слайд 3 из 12: Название» — в `role="status"`.
- **Режимы** (`navigation`): `free` — свободно; `linear` — вперёд только после прохождения слайда: кончилась озвучка и прошло `minDuration` (что позже), «Следующий слайд» — `aria-disabled` с кольцом отсчёта и подсказкой «Доступно через 12 с»; шкала, клавиши и кнопки не пускают дальше первого непройденного слайда, назад — свободно. `strict` — то же, плюс скорость не выше `maxRate` (1), без перемотки озвучки вперёд внутри непройденного слайда, показ встаёт на паузу, когда вкладка скрыта. Время `minDuration` засчитывается, только пока вкладка видна и идёт показ.
- **Учёт** — события `slide-complete` (`{ id, index, at }`, `at` — `Date.now()`), `progress` (`{ completed, total }`), `complete`; после последнего слайда — экран «Пройдено». `storageKey` сохраняет в localStorage место и пройденные слайды и предлагает «Продолжить со слайда 5?».
- **Субтитры** — `slides[].captions` (WebVTT или SRT, время от начала слайда) или `captions` для общей дорожки (время от начала дорожки). Разбор — `parseSubtitles` из `subtitleUtils`, вывод — как у BaseMediaPlayer (курсив, жирный, подчёркивание). Кнопка «Субтитры» и клавиша C — когда субтитры есть; `v-model:is-captions-on` (по умолчанию включены).
- **Список слайдов и стенограмма** — выдвижная панель в стиле серий плеера: миниатюры, длительность, отметка «пройден», замок у недоступных в `linear`/`strict` (выбор недоступного — подсказка «Доступно через …»). `slides[].notes` — стенограмма текущего слайда, абзацы через пустую строку. Escape и клик снаружи закрывают панель, фокус возвращается на кнопку.
- **Синтез речи** — `slides[].speech`: текст для `speechSynthesis`, если у слайда нет `audio` и нет общей дорожки. Голос — `speechVoice` (`name` или `voiceURI`), иначе по языку кита; голосов нет (ждём `voiceschanged` 1,5 с) — слайд идёт по `duration`. Голоса и качество зависят от браузера и системы, а смена скорости и громкости применяется со следующей фразы: для обучения лучше запись.
- **Слайд-вопрос** — `isInteractive: true` и слот `slide`: слот получает `complete()` и `isCompleted`; слайд пройден только после `complete()` (и конца озвучки, `minDuration`). После озвучки показ ждёт ответа, «Следующий слайд» в `linear`/`strict` — «Ответьте на вопрос, чтобы продолжить».

```vue
<BasePresentationPlayer :slides="slides" title="Тест" navigation="linear">
	<template #slide="{ slide, complete, isCompleted }">
		<QuizCard v-if="slide.isInteractive" :done="isCompleted" @answered="complete" />
	</template>
</BasePresentationPlayer>
```
- **Что не делает.** Не разбирает .pptx и .pdf — экспортируйте слайды в картинки. Не отправляет данные в LMS и не заменяет проверку на сервере: localStorage и режимы — удобство зрителя, строгий учёт — на сервере по времени `slide-complete`.

## BaseAudioPlayer

Компактный аудиоплеер: голосовые сообщения, подкасты, короткие записи. Кнопка пуска, волна с перемоткой, время (до запуска — длительность, после — позиция) и скорость по кругу (`playback-rates`, по умолчанию 1×, 1,5×, 2×). По умолчанию на странице играет один такой плеер: запуск ставит остальные на паузу (`:is-exclusive="false"` отключает).

```vue
<BaseAudioPlayer src="/voice/42.ogg" title="Голосовое сообщение" :duration="9" :peaks="message.peaks" variant="ghost" />
```

Волну задают `peaks` (амплитуды от 0 до 1, например сохранённые при записи); без них плеер считает её из файла через Web Audio — файл должен быть с того же сайта или отдаваться по CORS. Варианты: `default` — карточка с рамкой, `soft` — приподнятый фон, `ghost` — без фона, цвета от текста вокруг (для пузыря сообщения). События `play`, `pause`, `ended`, `error`, `v-model:current-time`; через ref — `play()`, `pause()`, `getMediaElement()`.

---

## BaseVoiceRecorder

Запись голосового сообщения с микрофона: запрос доступа, время, живой уровень звука, «Остановить» и «Отменить», затем прослушивание с «Удалить» и «Отправить». Готовая запись приходит событием `record`: `{ blob, mimeType, duration, peaks }` — файл загружает приложение, `peaks` пригодятся для волны. Формат — первый поддерживаемый браузером (Opus в WebM или Ogg, в Safari — MP4), свой — `mime-type`; `max-duration` останавливает запись сама (по умолчанию 300 с), `:has-preview="false"` отдаёт запись сразу после остановки. Ошибки (нет доступа, нет микрофона, страница не по HTTPS, браузер не умеет записывать) видны в компоненте и приходят событием `error`: коды `denied`, `no-device`, `insecure`, `unsupported`, `failed`. Браузер даёт микрофон только на странице с HTTPS или на localhost. Свой источник звука вместо микрофона — `request-stream`: функция возвращает `MediaStream` (заранее выбранное устройство, звук из Web Audio для демо и тестов).

```vue
<BaseVoiceRecorder :max-duration="120" @record="uploadVoice" />
```

В `BaseChat` голосовые включает `has-voice-messages`: пока поле пустое, вместо «Отправить» — микрофон, запись идёт прямо в поле ввода. Событие `send-voice` отдаёт `{ recording, replyToId }`; после загрузки добавьте сообщение с вложением `{ type: 'audio', url, duration, peaks }` — в ленте оно играет в BaseAudioPlayer. Свой источник звука — `request-voice-stream`, как `request-stream` у диктофона.

---

## BaseSubtitleEditor

Редактор субтитров: реплики списком (начало, конец, текст) и на шкале времени. Позиция связывается с плеером через `v-model:current-time` у обоих: текущая реплика подсвечена, «Перейти к реплике» и щелчок по шкале перематывают. Время вводится как `1:02.5`, `0:01:02,500` или `62.5`; неверное время и конец раньше начала не применяются. «Добавить реплику» ставит новую в текущую позицию на `cue-length` секунд; «Загрузить .vtt или .srt» читает файл в UTF-8, UTF-16 или Windows-1251; «Скачать .vtt» и «Скачать .srt» сохраняют файл (`file-name`) и присылают событие `export` с текстом.

```vue
<BaseMediaPlayer v-model:current-time="time" :sources="sources" :tracks="[{ src: draftUrl, label: 'Черновик', isDefault: true }]" title="Серия 1" />
<BaseSubtitleEditor v-model:cues="cues" v-model:current-time="time" :duration="1420" file-name="episode-1" />
```

Черновик для плеера — `URL.createObjectURL(new Blob([serializeSubtitles(cues)], { type: 'text/vtt' }))`: правки сразу видны в кадре.

---

## BaseWaveform

Волна записи: столбики амплитуд, сыгранная часть цветом, перемотка клавишами (←/→ — `step` секунд, PageUp/PageDown — десятая часть, Home/End) и мышью: позиция встаёт под указатель сразу при нажатии и идёт за ним, пока кнопка нажата. Волна всегда на всю ширину: число столбиков подстраивается под ширину, `peaks` растягиваются или сжимаются (при сжатии остаётся пик отрезка). С `is-selectable` выделяет фрагмент перетаскиванием или стрелками с Shift, Escape снимает выделение.

```vue
<BaseWaveform
	v-model:current-time="time"
	v-model:selection="range"
	:peaks="peaks"
	:duration="65"
	label="Перемотка"
	is-selectable />
```

Амплитуды считают `computeWaveformPeaks(отсчёты, столбики)` и `decodeWaveformPeaks(адрес, столбики)` из utils.

---

## BaseRating

Рейтинг.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRating } from '@ramzes1385/rise-ui-kit'

const rating = ref(4)
</script>

<template>
	<BaseRating v-model="rating" />
</template>
```

---

## BaseSearch

Поиск.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSearch } from '@ramzes1385/rise-ui-kit'

const query = ref('')
</script>

<template>
	<BaseSearch v-model="query" placeholder="Поиск" />
</template>
```

Переданные в `results` результаты по умолчанию фильтруются на клиенте по подстроке в `title`/`description`. Если их уже отобрал сервер (транслит, опечатки, другие поля), укажите `is-remote` — список покажется как есть (с ограничением `max-results`):

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSearch } from '@ramzes1385/rise-ui-kit'
import type { SearchResult } from '@ramzes1385/rise-ui-kit'

const query = ref('')
const results = ref<SearchResult[]>([])

async function handleSearch(value: string): Promise<void> {
	const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
	results.value = await response.json()
}
</script>

<template>
	<BaseSearch v-model="query" :results="results" is-remote placeholder="Поиск" @search="handleSearch" />
</template>
```

Поле поиска — `role="combobox"`, результаты — `role="listbox"`: ↓/↑ подсвечивают результат (`aria-activedescendant`), Enter открывает его. Сколько найдено, скринридер слышит из скрытой области `role="status"`.

---

## BaseDatePicker

Выбор даты.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseDatePicker } from '@ramzes1385/rise-ui-kit'

const date = ref<Date | null>(null)
</script>

<template>
	<BaseDatePicker v-model="date" />
</template>
```

---

## BaseCalendar

Календарь.

```vue
<script setup lang="ts">
import { BaseCalendar } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseCalendar />
</template>
```

---

## BaseColorPicker

Выбор цвета.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseColorPicker } from '@ramzes1385/rise-ui-kit'

const color = ref('#42b883')
</script>

<template>
	<BaseColorPicker v-model="color" />
</template>
```

---

## BaseFileUpload

Загрузка файлов.

Событие `change` передаёт массив `File[]` — текущий список выбранных файлов (без `is-multiple` — один файл: новый выбор заменяет прежний). Файлы проверяются по `accept` (MIME, `image/*` или расширения) и `max-size` (в МБ, по умолчанию 5); ошибки приходят в событии `error`.

```vue
<script setup lang="ts">
import { BaseFileUpload } from '@ramzes1385/rise-ui-kit'

function handleFiles(files: File[]): void {
	console.log(files)
}
</script>

<template>
	<BaseFileUpload accept="image/*,.pdf" :max-size="10" is-multiple @change="handleFiles" />
</template>
```

Загрузку выполняет приложение — функция `uploader(file, { onProgress, signal })` (тип `FileUploader`). Кит вызывает её для каждого принятого файла, показывает прогресс из `onProgress` (0–100), после выполненного промиса — «Загружено» и событие `upload-success` (второй аргумент — результат промиса), после отклонённого — «Ошибка», текст `message` под файлом, событие `upload-error` и кнопку повтора. Удаление или замена файла, `reset()` и размонтирование отменяют загрузку через `signal`. Без `uploader` файлы только выбираются (статус `selected`) — без прогресса и «Загружено».

```vue
<script setup lang="ts">
import { BaseFileUpload, type FileUploaderContext } from '@ramzes1385/rise-ui-kit'

function uploadFile(file: File, { onProgress, signal }: FileUploaderContext): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.open('POST', '/api/files')
		xhr.upload.onprogress = event => onProgress((event.loaded / event.total) * 100)
		xhr.onload = () => (xhr.status < 400 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('Не удалось сохранить файл')))
		xhr.onerror = () => reject(new Error('Нет связи с сервером'))
		signal.addEventListener('abort', () => xhr.abort())
		const body = new FormData()
		body.append('file', file)
		xhr.send(body)
	})
}
</script>

<template>
	<BaseFileUpload label="Договор" accept=".pdf" is-required :uploader="uploadFile" @upload-success="(file, saved) => attach(saved)" />
</template>
```

Ошибки выбора (формат, размер, лимит `max-count`) и проп `error` выводятся под зоной в `role="alert"`, итог загрузки озвучивается live-регионом. `allow-preview: false` — иконка вместо миниатюры (миниатюра — objectURL, освобождается при удалении). Через ref (`BaseFileUploadExpose`): `focus()`/`blur()` — зона, `validate()` (с `is-required` без файлов — `false` и ошибка «Обязательное поле»), `reset()` — очищает список и ошибки, `retry(file)` — повтор загрузки файла с ошибкой.

---

## BaseSignaturePad

Поле для подписи: рисуют мышью, пальцем или пером. Значение — штрихи в единицах поля `width` × `height` (по умолчанию 400 × 160): их можно сохранить как JSON и показать снова.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSignaturePad, type BaseSignaturePadExpose, type SignatureStroke } from '@ramzes1385/rise-ui-kit'

const strokes = ref<SignatureStroke[]>([])
const pad = ref<BaseSignaturePadExpose | null>(null)

async function submit(): Promise<void> {
	const png = await pad.value?.toPng({ background: '#ffffff' })
	if (png) await upload(png)
}
</script>

<template>
	<BaseSignaturePad ref="pad" v-model="strokes" label="Подпись клиента" :error="strokes.length ? undefined : 'Распишитесь'" />
</template>
```

Штрих сглаживается кривыми через середины соседних точек; при рисовании прокрутка страницы отключена (`touch-action: none`). «Отменить штрих» и «Очистить» — кнопки под полем. Через ref: `toSvg()` — разметка SVG, `toPng({ pixelRatio, background })` — Blob (по умолчанию вдвое плотнее поля, фон прозрачный), `undo()`, `clear()`. Цвет линий — `penColor`: без него на экране цвет текста темы, в файле — чёрный. Для скринридера поле — группа «Подпись» (или `label`) с картинкой «Подписи нет» или «Подпись: 3 штриха». Нарисовать подпись с клавиатуры нельзя — это ввод, который зависит от пути движения (исключение WCAG 2.1.1); если подпись обязательна, дайте другой способ подтвердить согласие.

---

## BaseAvatarCropper

Кадрирование аватара: круг или квадрат, фото двигают мышью или пальцем, масштаб — колёсиком, ползунком или клавишами.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseAvatarCropper, type AvatarCrop, type BaseAvatarCropperExpose } from '@ramzes1385/rise-ui-kit'

const file = ref<File>()
const src = computed(() => (file.value ? URL.createObjectURL(file.value) : ''))
const crop = ref<AvatarCrop>()
const cropper = ref<BaseAvatarCropperExpose | null>(null)

async function save(): Promise<void> {
	const avatar = await cropper.value?.getBlob({ size: 256 })
	if (avatar) await uploadAvatar(avatar)
}
</script>

<template>
	<BaseAvatarCropper v-if="src" ref="cropper" v-model:crop="crop" :src="src" shape="circle" />
</template>
```

`v-model:crop` — кадр в пикселях исходного фото `{ x, y, size }` (можно отправить на сервер вместе с файлом); без начального кадра — по центру во весь меньший край. `getBlob({ size, type, quality })` — картинка по кадру: по умолчанию PNG 256 × 256, у круга углы прозрачные. Фото с другого сайта без CORS браузер не отдаёт — тогда `null`; выбранный пользователем файл (object URL) работает всегда. Клавиатура: область в порядке Tab, стрелки сдвигают фото на 10px (с Shift — на 50px), `+` и `−` меняют масштаб, `0` возвращает кадр по центру; для скринридера — группа «Кадрирование фото» с подсказкой и ползунок «Масштаб». `maxZoom` — наибольшее увеличение (4), `size` — сторона области (280px).

---

## BaseEditor

Редактор текста.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseEditor } from '@ramzes1385/rise-ui-kit'

const content = ref('')
</script>

<template>
	<BaseEditor v-model="content" />
</template>
```

> BaseEditor очищает HTML при показе `v-model`, вставке из буфера обмена, перетаскивании, выходе из режима кода и в `update:modelValue`: скрипты, обработчики `on*`, ссылки `javascript:`, `<iframe>`, `<svg>` и `<style>` удаляются. Очистку задаёт проп `sanitize` — по умолчанию `sanitizeHtml` из `utils`; для доверенного HTML её можно отключить функцией `html => html`. Ссылка с небезопасной схемой не вставляется. Сохранённый HTML всё равно проверяйте на сервере: клиентскую очистку можно обойти, отправив запрос напрямую.

---

## BaseChat

Компонент чата.

Сообщение (`ChatMessage`) обязательно содержит `id`, `text`, `sender` (`'me'` — своё, `'other'` — собеседника) и `time` — строку для отображения. `title` — заголовок чата (обязателен), `description` — описание чата или собеседника для панели «Информация» (без него блок описания не выводится).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseChat } from '@ramzes1385/rise-ui-kit'
import type { ChatMessage } from '@ramzes1385/rise-ui-kit'

const messages = ref<ChatMessage[]>([
	{
		id: '1',
		text: 'Привет',
		sender: 'other',
		senderName: 'Анна',
		time: '10:15',
	},
])

function handleSend(payload: { text: string }): void {
	messages.value.push({
		id: String(Date.now()),
		text: payload.text,
		sender: 'me',
		time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
	})
}
</script>

<template>
	<BaseChat title="Анна" description="Менеджер проекта" :messages="messages" @send="handleSend" />
</template>
```

---

## BaseCommentThread

Ветка комментариев: ответы с отступом, «Нравится», «Ответить», сворачивание ответов и поле нового комментария. Данные — у приложения: новый комментарий приходит событием `reply`, отметка — событием `like`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseCommentThread, type CommentItem, type CommentReply } from '@ramzes1385/rise-ui-kit'

const comments = ref<CommentItem[]>([]) // заполняет приложение

async function reply({ parentId, text }: CommentReply): Promise<void> {
	comments.value = await api.addComment(taskId, { parentId, text })
}
</script>

<template>
	<BaseCommentThread :comments="comments" :current-user="me" @reply="reply" @like="({ id, isLiked }) => api.like(id, isLiked)" />
</template>
```

Комментарий — `{ id, author: { name, avatar? }, text, date, likes?, isLiked?, replies? }`; `parentId` в `reply` — id комментария, на который ответили, `null` — комментарий в ветку. Глубже `maxDepth` (3) ответы идут без нового отступа. «Ответить» открывает поле и ставит в него фокус; Ctrl+Enter (⌘+Enter) отправляет, Escape отменяет, после этого фокус возвращается на «Ответить». «Нравится» — кнопка-переключатель (`aria-pressed`) со счётчиком, «Показать 3 ответа» — `aria-expanded`. Каждый комментарий — `article` с именем автора, ветка — область «Комментарии» (или `label`); `isReadonly` убирает поле и кнопки «Ответить».

---

## BaseMarkdown

Безопасный Markdown (CommonMark и GFM) без `v-html`: текст разбирается в дерево и выводится элементами Vue, поэтому HTML-теги из источника показываются как текст, а ссылки с `javascript:` и другими схемами — обычным текстом. Поддерживаются заголовки, абзацы, выделение, зачёркивание, код и блоки кода (язык и «Копировать»), цитаты, списки и задачи, таблицы с выравниванием, картинки, линии и автоссылки.

```vue
<BaseMarkdown :source="answer" :is-streaming="isGenerating" />
```

`is-streaming` — потоковый ответ: в конце мигает курсор, незакрытый блок кода показывается до конца. Одиночный перевод строки — перенос, как в чатах; `:has-line-breaks="false"` — пробел, как в CommonMark.

---

## BaseAiMessage, BaseReasoning, BaseToolCall

Блоки ответа ИИ-ассистента. `BaseAiMessage` — аватар, имя, время и ответ в Markdown; пока `is-streaming`, у сообщения `aria-busy`, скринридер слышит «Ассистент отвечает», а без текста видны три точки. `error` показывает ошибку и «Повторить» (событие `retry`), «Копировать ответ» копирует Markdown (событие `copy`). В слот `default` кладутся рассуждения и вызовы инструментов, в слот `actions` — свои действия.

```vue
<BaseAiMessage :content="message.text" :is-streaming="message.isStreaming" :error="message.error" @retry="retry(message)">
	<BaseReasoning :content="message.reasoning" :is-streaming="message.isThinking" />
	<BaseToolCall
		v-for="call in message.toolCalls"
		:key="call.id"
		:name="call.name"
		:title="call.title"
		:status="call.status"
		:args="call.args"
		:result="call.result"
		:error="call.error" />
</BaseAiMessage>
```

`BaseReasoning` раскрыт, пока модель думает, и сворачивается по окончании, показывая «Думал 12 с». Длительность можно передать в `duration`, без неё она замеряется по `is-streaming`; `:has-auto-toggle="false"` отключает раскрытие. `BaseToolCall` показывает состояние словом и значком (`pending`, `running`, `success`, `error`), а параметры и результат — JSON с отступами; свою разметку результата задаёт слот `output`. Оба сворачиваются кнопкой с `aria-expanded` и поддерживают `v-model:is-open`.

---

## BasePromptInput

Поле запроса к ассистенту. Растёт по тексту до `max-rows` строк. Enter отправляет (событие `submit`), Shift+Enter переносит строку, во время набора через IME Enter не отправляет. Пустой запрос не отправляется, после отправки поле очищается, фокус остаётся в нём. Пока идёт ответ (`is-generating`), вместо «Отправить» видна кнопка «Остановить ответ» (событие `stop`).

```vue
<BasePromptInput v-model="prompt" :is-generating="isGenerating" @submit="ask" @stop="abort">
	<template #start>
		<BaseButton variant="ghost" aria-label="Прикрепить файл"><BaseIcon name="attach" /></BaseButton>
	</template>
</BasePromptInput>
```

Без `label` доступное имя поля — «Сообщение». Подсказка про Enter и Shift+Enter связана с полем через `aria-describedby`.

---

## BaseEmojiPicker

Выбор эмодзи: поиск, вкладки разделов, сетка и недавние (`v-model:recent`, выбранный эмодзи встаёт первым). Встроенный набор — эмодзи Unicode до версии 14.0 с названиями CLDR на языке кита. Он загружается отдельным файлом при первом показе и не утяжеляет сборку тех, кто пикер не использует. Свой набор задаёт `emojis`: `{ emoji, label, category }`.

```vue
<BaseEmojiPicker v-model:recent="recentEmojis" @select="item => insert(item.emoji)" />
```

В сетке одна точка Tab. Стрелки двигают фокус, вниз и вверх — по столбцу, в том числе между разделами; Home и End ведут к первому и последнему эмодзи. Из поиска стрелка вниз переводит фокус в сетку, Enter выбирает первый результат. Поиск не различает регистр, «ё» и «е». Данные набора обновляет `npm run generate:emoji-data` (см. `scripts/generate-emoji-data.mjs`).

---

## BaseMention

Поле с упоминаниями. После `@` (свой символ — `trigger`) под полем открывается список из `options` (`{ value, label, description?, avatar? }`), отфильтрованный по имени и нику. Стрелки выбирают вариант, Enter или Tab вставляют `@ник` и пробел, Escape закрывает список до следующего упоминания. Событие `search` сообщает набранный текст для загрузки вариантов с сервера, `mention` — выбранного коллегу.

```vue
<BaseMention v-model="comment" label="Комментарий" :options="team" @search="loadTeam" />
```

---

## BaseKanban

Канбан-доска. Колонки задаёт `columns` (`{ id, title, limit? }`), карточки — `v-model:cards` (`{ id, columnId, title, description?, tags? }`); порядок карточек в колонке — порядок в массиве. После перемещения приходят новый массив и событие `move` — откуда и куда; `can-move` запрещает место, и карточка возвращается.

```vue
<BaseKanban v-model:cards="cards" :columns="columns" :can-move="move => move.to.columnId !== 'done' || isReviewed(move.card)" @open="openTask" />
```

Мышью карточка поднимается после сдвига на 5px: под курсором — её копия, на новом месте — пунктир, Escape отменяет; соседние карточки плавно расступаются, а отпущенная копия долетает до своего места (при `prefers-reduced-motion` — без анимации). Клик без перетаскивания и Enter — событие `open`. Правый клик, Shift+F10 или клавиша меню открывают меню карточки: «Открыть», «Переместить в» другую колонку, «В начало / в конец колонки» и пункты приложения из `card-actions` (`card => [{ label: 'Копировать ссылку', onSelect }]`); места, запрещённые `can-move`, в меню неактивны. С клавиатуры на доске одна точка Tab, стрелки переходят между карточками; Space берёт карточку, стрелки двигают её по колонке и между колонками, Space или Enter кладёт, Escape возвращает — каждый шаг объявляется скринридеру. `limit` — WIP-лимит колонки: счётчик «3 / 3», сверх лимита подсвечен. Свою разметку карточки задаёт слот `card` (без кнопок внутри — карточка сама кнопка), низ колонки — слот `column-footer`. Карточка показывает, как в Jira, Trello и YouGile, обложку (`coverColor` или `coverImage`), цветные метки (`labels`, `tags`), номер задачи (`key`), приоритет (`lowest`…`highest`), срок (`dueDate`: сегодня, завтра и просрочка подсвечены; в колонке с `isDone` — зелёным; «сегодня» задаёт проп `today`), подзадачи (`subtasks`: «2/5»), комментарии, вложения, оценку (`estimate`) и исполнителей (`assignees`). Всё это скринридер слышит в описании карточки. Сенсорное перетаскивание пока не поддерживается.

Рабочая доска:

```vue
<BaseKanban
	v-model:cards="cards"
	v-model:collapsed-columns="collapsed"
	:columns="columns"
	:filter="search ? card => card.title.toLowerCase().includes(search) : undefined"
	is-editable
	is-collapsible
	@create="saveCard"
	@rename="saveCard"
	@delete="removeCard" />
```

- `is-editable` — внизу колонки «Добавить карточку»: Enter добавляет карточку в конец колонки и оставляет поле для следующей, Escape закрывает. Название правится по F2 или пунктом «Переименовать» в меню карточки (Enter сохраняет, Escape отменяет), «Удалить» убирает карточку. События `create`, `rename`, `delete` приходят вместе с `update:cards`; id новой карточки задаёт `create-card-id`.
- `filter` — какие карточки показать (поиск, BaseFilterBuilder). Счётчик колонки — «1 из 3», пустая под фильтром колонка — «Ничего не найдено». Скрытые карточки не теряются: при переносе они сохраняют свои места в `cards`, а `move` сообщает места в полном списке.
- `is-collapsible` — в заголовке колонки кнопка «Свернуть колонку»: колонка становится узкой полосой со счётчиком и вертикальным названием. Список свёрнутых — `v-model:collapsed-columns`; в свёрнутую колонку можно перетащить карточку или перенести её из меню.
- `color` у колонки — точка у заголовка и полоса сверху (`{ id: 'done', title: 'Готово', color: 'var(--rise-success)' }`).

---

## BaseFilterBuilder

Конструктор фильтров. Поля задаёт `fields` (`{ key, label, type, options? }`, тип — `text`, `number`, `date`, `select` или `boolean`), фильтр — `v-model` (`{ match: 'all' | 'any', conditions }`). Строки данных отбирает `createFilterPredicate(фильтр, поля)`; незаполненные условия не учитываются.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseFilterBuilder, createFilterPredicate } from '@ramzes1385/rise-ui-kit'
import type { FilterBuilderField, FilterBuilderGroup } from '@ramzes1385/rise-ui-kit'

const fields: FilterBuilderField[] = [
	{ key: 'title', label: 'Задача', type: 'text' },
	{ key: 'status', label: 'Статус', type: 'select', options: [{ value: 'done', label: 'Готово' }] },
	{ key: 'estimate', label: 'Оценка', type: 'number' },
	{ key: 'due', label: 'Срок', type: 'date' },
]
const filter = ref<FilterBuilderGroup>({ match: 'all', conditions: [] })
const visible = computed(() => tasks.value.filter(createFilterPredicate(filter.value, fields)))
</script>

<template>
	<BaseFilterBuilder v-model="filter" :fields="fields" />
</template>
```

От типа поля зависят сравнения: для текста — «содержит», «не содержит», «равно», «начинается с», «заполнено»; для чисел — «больше», «не меньше», «в диапазоне»; для дат — «раньше», «позже», «в диапазоне» (`ГГГГ-ММ-ДД`); для списков — «равно» и «не равно»; для флажков — «да» и «нет». Текст сравнивается без учёта регистра и «ё». Третий аргумент `createFilterPredicate` читает значение из строки своим способом: `(row, key) => row.data[key]` для строк BaseTable. Для канбана предикат передаётся в `filter`. Каждое условие — группа «Условие N» с полями «Поле», «Сравнение» и «Значение». После добавления фокус переходит в новое условие, после удаления — в соседнее.

---

## BaseChecklist

Чек-лист первых шагов: онбординг, настройка проекта, подготовка к запуску.

```vue
<BaseChecklist
	v-model:completed="done"
	:items="[
		{ id: 'install', title: 'Установить пакет', description: 'npm install @ramzes1385/rise-ui-kit' },
		{ id: 'theme', title: 'Выбрать тему', actionLabel: 'Настроить тему' },
	]"
	@action="openStep" />
```

Шаги — флажки с подписью и пояснением. Первый невыполненный шаг подсвечен и помечен «Следующий шаг», его кнопка действия — основная, у остальных — контурная; кнопка шлёт `action` с шагом. Прогресс — BaseProgress и счётчик «1 из 2», заголовок по умолчанию «Первые шаги» (`title`). Когда всё выполнено — «Всё готово» (слот `done`).

---

## Графики: BaseSparkline, BasePieChart, BaseHeatmap

Три лёгких графика на SVG без сторонних библиотек. Цвета берутся из токенов `--rise-chart-1…8`: восемь оттенков в фиксированном порядке (синий, оранжевый, бирюзовый, жёлтый, розовый, зелёный, фиолетовый, красный), соседние пары различимы при дальтонизме; для тёмной темы — свои оттенки того же порядка.

```vue
<BaseSparkline :values="[182, 190, 176, 214, 238]" :labels="['янв', 'фев', 'мар', 'апр', 'май']" label="Выручка, тыс. ₽" variant="area" />

<BasePieChart
	:segments="[
		{ label: 'Готово', value: 42 },
		{ label: 'В работе', value: 18 },
		{ label: 'К выполнению', value: 27 },
	]"
	label="задач" />

<BaseHeatmap :data="commits" label="Коммиты за год" />
```

- `BaseSparkline` — тренд без осей: `variant` — `line`, `area` (заливка 10% цвета) или `bar`; ширина по контейнеру, высота — `height`, цвет — `mark-color` (по умолчанию основной). Наведение показывает значение и подпись из `labels`, скринридер слышит сводку «от … до …, последнее …».
- `BasePieChart` — доли целого: `variant` — `donut` (итог в центре) или `pie`. Больше `max-segments` (6) частей — хвост собирается в «Другое»; цвет следует за частью, а не за её размером (`color` — свой). Легенда — список со значениями и процентами: её читает скринридер, наведение подсвечивает часть.
- `BaseHeatmap` — календарь активности: недели столбцами, дни с понедельника строками, пять уровней одного цвета от пустого дня до максимума. `end-date` (по умолчанию сегодня), `weeks` (53), `mark-color`, `format-value`; наведение показывает значение и дату, скринридер — сводку за период.

---

## BaseChart

График рядов по общей оси X на своём SVG: линии, области и столбики (группами или стопкой). Цвета рядов — токены `--rise-chart-1…8` в обеих темах.

```vue
<BaseChart
	v-model:hidden-series="hidden"
	variant="bar"
	:labels="['Янв', 'Фев', 'Мар']"
	:series="[
		{ name: 'Выручка', values: [120, 135, 150] },
		{ name: 'Расходы', values: [90, 95, null] },
	]"
	:value-format="{ style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }"
	label="Выручка и расходы, I квартал" />
```

- `variant` — `line` (по умолчанию), `area`, `bar`; `isStacked` — стопка столбиков и областей (отрицательные значения — вниз от нуля). `null` в `values` — нет значения: разрыв линии, пустая ячейка таблицы.
- Ось Y — «круглые» метки (`yTickCount`, по умолчанию 5); у `area` и `bar` шкала всегда включает ноль. Подписи `labels` — строки, числа или даты: даты и числа форматируются через `Intl` языка кита (`labelFormat`, `valueFormat`) или своими `formatLabel`, `formatValue`. Метки оси X прореживаются по ширине графика.
- Наведение показывает подсказку у ближайшей точки (слот `tooltip` получает `point`: подпись и значения видимых рядов). Легенда (`hasLegend`) — кнопки с `aria-pressed`, скрывают ряды; `v-model:hidden-series` — имена скрытых.
- Доступность: область графика — `role="img"` со сводкой («ряды; значения от … до …»), в порядке Tab; стрелки, Home/End, PageUp/PageDown переходят по точкам и объявляют значения в `role="status"`, Escape снимает выбор. Полные данные — скрытая таблица с подписью `label` (заголовок первой колонки — `labelsTitle`).
- Нет рядов или подписей — «Нет данных» или слот `empty`. Высота — `height` (240), ширина — по контейнеру.

---

## BaseImageCompare

Сравнение «до / после»: две картинки друг над другом и граница, которую двигают мышью, пальцем или клавишами.

```vue
<BaseImageCompare
	v-model:position="position"
	:before="rawPhoto"
	:after="retouchedPhoto"
	before-alt="Фото до обработки"
	after-alt="Фото после ретуши"
	before-label="Исходник"
	after-label="Ретушь" />
```

Нажатие в любом месте плавно переносит границу туда, при перетаскивании она идёт за указателем; при «уменьшении движения» — без анимации. Ручка — `role="slider"`: ←/→ — на 1%, с Shift и PageUp/PageDown — на 10%, Home/End — к краям. Подписи в углах по умолчанию — «До» и «После».

---

## BaseJsonViewer

Просмотр JSON деревом: ответы API, настройки, журналы событий. Объекты и массивы раскрываются, у свёрнутого — сводка «3 ключа» или «2 элемента», значения окрашены по типу.

```vue
<BaseJsonViewer :value="order" label="Заказ З-1052" :expand-depth="1" @copy="text => track('json-copied')" />
```

Дерево — BaseTree по образцу APG Tree View: одна точка Tab, стрелки, Home/End, Enter и пробел, поиск по буквам; `label` — имя дерева для скринридера. Над деревом — «Развернуть всё», «Свернуть всё» и «Копировать JSON» (текст с отступом в два пробела, событие `copy`, итог — в `role="status"`); `hasToolbar: false` убирает панель, слот `actions` добавляет свои кнопки. Путь узла — `$.customer.name`, `$.items[0]`. Значения вне JSON (`undefined`, функции) показываются как `null`.

---

## BaseDescriptions

Список «поле — значение» для страниц деталей: реквизиты, карточка заказа, профиль, настройки.

```vue
<BaseDescriptions title="Реквизиты" :items="[
	{ key: 'name', label: 'Компания', value: 'ООО «Ромашка»' },
	{ key: 'inn', label: 'ИНН', value: '7707083893', isCopyable: true },
	{ key: 'address', label: 'Адрес', value: address, span: 'full' },
]" :columns="3" @copy="({ item }) => track('copied', item.key)">
	<template #value-status><BaseBadge label="Оплачен" /></template>
</BaseDescriptions>
```

Разметка — `dl`, у каждого поля `dt` и `dd` в своём `div`. Колонки — по ширине контейнера, а не окна: не больше `columns` (по умолчанию 3), каждая не уже `minItemWidth` (240 px); в узком контейнере — одна. `span` поля — сколько колонок оно занимает (не больше помещающихся), `full` — всю строку. `layout`: `horizontal` — подпись слева шириной `labelWidth` (по умолчанию 40 %), в узкой колонке значение переносится под неё; `vertical` — подпись над значением. Пустое значение (`null`, `undefined`, `''`) — «—» (`emptyValue`), полей нет — «Нет данных» (`emptyText`, слот `empty`). `isCopyable` у списка или поля — кнопка «Копировать: ИНН» (`copyText` — свой текст для буфера), событие `copy` (`{ item, text }`), итог — в `role="status"`. Слоты: `title`, `extra`, `label` и `value` для всех полей, `label-<key>` и `value-<key>` — для одного. Заголовок — не `h*`: свой уровень заголовка ставьте слотом `title`.

---

## BaseTextDiff

Сравнение двух текстов по строкам: редакции договора, описания товара, настройки.

```vue
<BaseTextDiff :before="draft" :after="final" label="Договор, раздел 4" mode="split" before-label="Черновик" after-label="Итог" />
```

Удалённые строки — на красном фоне со знаком «−», добавленные — на зелёном со знаком «+»; в паре «было — стало» с общими словами изменённые слова выделены (`<del>` и `<ins>`, `isWordDiff`). `mode`: `unified` — одной колонкой, как `git diff`, `split` — рядом. Для скринридера у строки есть подпись «Добавлено» или «Удалено», у сравнения — сводка «добавлено строк — 3, удалено — 3». Расчёт — наибольшая общая подпоследовательность строк; функции `diffLines`, `diffWords` и `splitRows` экспортируются для своих отчётов.

---

## BaseQrCode

QR-код для ссылки, оплаты или входа с телефона. Кодировщик свой, без зависимостей: текст в UTF-8, версии 1–10 (до 271 байта при уровне L, до 119 при H), коррекция Рида — Соломона, маска с наименьшим штрафом по стандарту.

```vue
<BaseQrCode value="https://example.com/pay/1052" label="Оплата заказа З-1052" error-correction="Q" :size="192" />
```

`errorCorrection`: L ≈ 7%, M ≈ 15% (по умолчанию), Q ≈ 25%, H ≈ 30% кода можно потерять — чем выше уровень, тем плотнее код. `size` — сторона в пикселях вместе с полем `margin` (в модулях, по стандарту 4). Модули тёмные на светлом фоне в обеих темах: инвертированные коды читают не все сканеры; свои цвета — `moduleColor`, `finderColor` («глазки») и `backgroundColor`, контраст между ними должен оставаться высоким. Для скринридера — картинка с именем «QR-код: <текст>», `label` — своё имя. Текст, который не помещается в версию 10, — сообщение вместо кода. `getSvg()` через ref возвращает разметку SVG для скачивания, `encodeQr(text, level)` — матрицу модулей для своего рисования.

Фирменный код — логотип, формы и цвета:

```vue
<BaseQrCode
	value="https://example.com/app"
	logo="/brand/mark.svg"
	module-shape="rounded"
	finder-shape="rounded"
	module-color="#1e3a8a"
	finder-color="#4f46e5"
	:size="200" />
```

`logo` — картинка в центре, `logoSize` — её доля стороны кода (0.1–0.3, по умолчанию 0.22). Под логотипом модули не рисуются, а коррекция восстанавливает закрытое: уровень с логотипом по умолчанию — H, заданный `errorCorrection` — нижняя граница. Версия кода растёт, пока вырез не займёт не больше 60% запаса коррекции каждого блока, — код с логотипом плотнее; не помещается и в версию 10 — логотип уменьшается. `moduleShape` — `square`, `rounded` (скруглены свободные углы) или `dots`; `finderShape` — `square`, `rounded` или `circle`. Квадратные «глазки» читают и ZXing, и OpenCV; `rounded` и `circle` — ZXing, но не детектор OpenCV, поэтому перед печатью проверьте код своими сканерами. Плотным кодам с точками нужна сторона побольше: в проверке ZXing не прочитал версию 9 с точками и логотипом при 160px, а при 320px прочитал.

---

## BaseTree

Дерево данных.

```vue
<script setup lang="ts">
import { BaseTree } from '@ramzes1385/rise-ui-kit'

const nodes = [
	{
		id: '1',
		label: 'Родитель',
		children: [{ id: '1-1', label: 'Дочерний элемент' }],
	},
]
</script>

<template>
	<BaseTree :items="nodes" />
</template>
```

Выбор узлов включается `selection-mode` (`'single'` / `'multiple'`), раскрытые и выбранные узлы доступны через `v-model:expanded-ids` / `v-model:selected-ids`.

Клавиатура по образцу APG Tree View: в порядке Tab один узел дерева; ↓/↑ — соседний видимый узел, → — раскрыть или перейти к первому вложенному, ← — свернуть или перейти к родителю, Home/End, `*` — раскрыть все ветки уровня, буквы — узел по началу подписи, Enter — действие узла, пробел — выбор. Имя дерева для скринридера — `aria-label`.

Узел с `to` (маршрут) или `href` (внешний адрес) — ссылка: маршрут открывает RouterLink приложения или `linkComponent` плагина. Клик по подписи и Enter переходят по ссылке, в режиме `single` узел становится выбранным:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTree } from '@ramzes1385/rise-ui-kit'
import type { TreeNode } from '@ramzes1385/rise-ui-kit'

const current = ref(['intro'])
const pages: TreeNode[] = [
	{ id: 'intro', label: 'Введение', to: '/docs/intro' },
	{ id: 'guide', label: 'Руководство', to: '/docs/guide', children: [{ id: 'install', label: 'Установка', to: '/docs/install' }] },
	{ id: 'source', label: 'Исходный код', href: 'https://github.com/…', target: '_blank' },
]
</script>

<template>
	<BaseTree v-model:selected-ids="current" :items="pages" selection-mode="single" aria-label="Документация" />
</template>
```


Дерево на тысячи видимых узлов — `is-virtual` и `height`: узлы рисуются плоским списком (`aria-level`, `aria-setsize`, `aria-posinset`), в DOM только видимые; стрелки и Home/End к неотрисованному узлу сначала прокручивают к нему. `item-size` — высота узла до замера.

```vue
<BaseTree :items="staff" is-virtual :height="480" aria-label="Сотрудники" />
```
---

## BaseTimeline

Лента событий: упорядоченный список, дата — `<time datetime>` в формате языка, текущее событие (`current-id`) — `aria-current="step"`, следующие приглушены. Маркер — иконка или точка цвета роли события, `orientation="horizontal"` — лента слева направо.

```vue
<BaseTimeline
	current-id="shipped"
	:items="[
		{ id: 'created', title: 'Заказ оформлен', date: '2026-05-12T10:24:00', icon: 'check', color: 'success' },
		{ id: 'shipped', title: 'Передан в доставку', date: '2026-05-14T16:40:00', icon: 'send' },
		{ id: 'delivered', title: 'Доставлен', date: 'ожидается 15 мая' },
	]" />
```

---

## BaseMegaMenu

Главное меню сайта: строка разделов и под ней широкая панель раздела — колонки ссылок (`groups`) и промо-блок (`promo`).

Раздел с `groups` — кнопка, открывающая панель, раздел с `to` или `href` — ссылка. По умолчанию панель открывается наведением (`trigger="hover"`, задержки `openDelay` и `closeDelay`) и кликом; `trigger="click"` — только кликом. Стрелки ходят между разделами и по ссылкам панели, Escape закрывает панель. Ссылки — BaseLink (RouterLink приложения или `<a href>`), выбор приходит в событии `select`. Уже `mobileBreakpoint` (md) строка сворачивается в кнопку «Меню».

```vue
<script setup lang="ts">
import { BaseMegaMenu } from '@ramzes1385/rise-ui-kit'
import type { MegaMenuItem } from '@ramzes1385/rise-ui-kit'

const items: MegaMenuItem[] = [
	{
		key: 'products',
		label: 'Продукты',
		groups: [
			{
				title: 'Платформа',
				items: [{ label: 'Аналитика', icon: 'star', description: 'Отчёты и дашборды', to: '/analytics' }],
			},
		],
		promo: { title: 'Rise 2.0', description: 'Что нового в версии', to: '/changelog' },
	},
	{ label: 'Цены', to: '/pricing' },
]
</script>

<template>
	<BaseMegaMenu :items="items" />
</template>
```

---

## BaseMenu

Меню.

`items` — массив групп (массив массивов), между группами выводится разделитель. Выбор пункта приходит в событии `select`; у пункта можно задать собственный обработчик `click`.

```vue
<script setup lang="ts">
import { BaseMenu } from '@ramzes1385/rise-ui-kit'
import type { BaseMenuItem } from '@ramzes1385/rise-ui-kit'

const items: BaseMenuItem[][] = [
	[{ label: 'Профиль' }, { label: 'Настройки' }],
	[{ label: 'Выход', click: () => console.log('logout') }],
]

function handleSelect(item: BaseMenuItem): void {
	console.log(item.label)
}
</script>

<template>
	<BaseMenu :items="items" @select="handleSelect" />
</template>
```

---

## BaseLayout

Каркас страницы на всю высоту окна: слоты `header`, `sidebar`, default (содержимое в `<main>`) и `footer`. Первая остановка Tab — ссылка «Перейти к содержимому» (видна только в фокусе) переносит фокус в `<main>`. Шапка прилипает к верху (`is-header-sticky`), боковое меню стоит под ней и прокручивается отдельно, подвал прижат к низу окна. На экране уже 768px боковое меню скрыто — положите навигацию в слот `menu` у BaseHeader.

```vue
<BaseLayout>
	<template #header><BaseHeader title="Rise CRM" to="/" /></template>
	<template #sidebar><BaseSideBar :items="menu" /></template>
	<BaseContainer><RouterView /></BaseContainer>
	<template #footer><BaseFooter>© 2026 Rise</BaseFooter></template>
</BaseLayout>
```

---

## BaseHeader

Шапка (`<header>`, ориентир banner): название `title` (ссылка при `to` / `href`) или слот `start`, навигация в слоте по умолчанию, действия в слоте `end`. Слот `menu` — меню для узкого экрана: ниже 768px навигация прячется, а кнопка «Меню» открывает меню в BaseDrawer; слот получает `close`.

```vue
<BaseHeader title="Rise CRM" to="/" container-size="xl">
	<nav aria-label="Основное"><BaseLink to="/orders">Заказы</BaseLink></nav>
	<template #end><BaseColorModeButton /></template>
	<template #menu="{ close }">
		<BaseLink to="/orders" @click="close">Заказы</BaseLink>
	</template>
</BaseHeader>
```

Раскладки: `nav-align` — где навигация: `center` (лендинг, по умолчанию), `start` — сразу за названием (приложение), `end` — у действий, `stretch` — на всё свободное место (поле поиска). Слот `bottom` — второй ряд (категории магазина), `is-compact` — высота 48px, `is-overlay` — поверх обложки без места в потоке (с `variant="ghost"`, внутри позиционированного блока).

```vue
<BaseHeader title="Rise Docs" to="/" nav-align="stretch">
	<BaseSearch placeholder="Поиск по документации" />
	<template #bottom><CategoryLinks /></template>
</BaseHeader>
```

---

## BaseFooter

Подвал (`<footer>`, ориентир contentinfo): слоты `start`, по умолчанию и `end`; на узком экране зоны встают столбиком. `container-size` — ширина содержимого, как у BaseContainer.

```vue
<BaseFooter container-size="xl">
	<template #start>© 2026 Rise Studio</template>
	<BaseLink href="/terms">Условия</BaseLink>
</BaseFooter>
```

Верхняя часть: `columns` — колонки ссылок `{ title, links: [{ label, to?, href? }] }`, каждая — `<nav>` с именем по заголовку; слот `top` — описание, подписка, приложения слева от колонок. Нижняя строка (`start`, default, `end`) отделяется линией. `is-compact` — меньше отступы.

```vue
<BaseFooter container-size="lg" :columns="columns">
	<template #top><SubscribeForm /></template>
	<template #start>© 2026 Rise Studio</template>
</BaseFooter>
```

---

## BaseContainer

Контейнер страницы: ограничивает ширину (`size`: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `full`), центрирует содержимое и даёт боковые отступы, растущие с экраном.

```vue
<BaseContainer size="lg" tag="section">…</BaseContainer>
```

---

## BaseSplitter
BaseStat

Панели с разделителями по образцу APG Window Splitter: `v-model` — размер первой панели в процентах, `min` / `max` — границы, `change` — итог. Разделитель — `role="separator"`; стрелки двигают его на `step`, Home/End — к границам, Enter сворачивает первую панель и возвращает её. `orientation="vertical"` — панели одна над другой.

```vue
<BaseSplitter v-model="listSize" :min="20" :max="60" label="Список писем" @change="saveLayout">
	<template #start><MailList /></template>
	<template #end><MailView /></template>
</BaseSplitter>
```

Больше двух панелей — `v-model:sizes` (размеры всех панелей, в сумме 100) и слоты `pane-1`, `pane-2`…; итог — `sizes-change`. Разделитель двигает границу двух соседних панелей, `min` / `max` ограничивают каждую, `pane-labels` — имена разделителей. Панели вкладываются: внутри панели — ещё один BaseSplitter с другой `orientation`.

```vue
<BaseSplitter v-model:sizes="sizes" :min="15" :pane-labels="['Папки', 'Список писем']">
	<template #pane-1><MailFolders /></template>
	<template #pane-2><MailList /></template>
	<template #pane-3><MailView /></template>
</BaseSplitter>
```

---

## BaseScrollArea

Область прокрутки с тонкой полосой поверх содержимого, одинаковой во всех системах. Прокручивает родной элемент (колесо, касание, клавиатура работают как обычно), область с прокруткой получает tabindex="0". `orientation`: `vertical`, `horizontal`, `both`; `max-height`; `scrollbar`: `hover` или `always`; `aria-label` делает область ориентиром. Методы через ref: `scrollTo`, `scrollToTop`, `scrollToBottom`, `update`.

```vue
<BaseScrollArea :max-height="320" aria-label="Журнал склада">
	<LogRow v-for="row in rows" :key="row.id" :row="row" />
</BaseScrollArea>
```

---

## BaseSideBar

Боковая панель навигации.

```vue
<script setup lang="ts">
import { BaseSideBar } from '@ramzes1385/rise-ui-kit'

const items = [
	{ label: 'Главная', to: '/' },
	{ label: 'Настройки', to: '/settings' },
]
</script>

<template>
	<BaseSideBar :items="items" />
</template>
```

Пункты с `to` — ссылки: компонент из пропа `linkComponent`, из `createUiKitPlugin({ linkComponent })` или RouterLink подключённого vue-router, иначе `<a href>`. Внешний адрес (`https://…`) открывается обычной ссылкой.

---

## BaseLink

Ссылка на маршрут приложения (`to`) или внешний адрес (`href`).

```vue
<script setup lang="ts">
import { BaseLink } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseLink to="/projects/42/settings">Настройки проекта</BaseLink>
	<BaseLink href="https://example.com/guide" target="_blank">Руководство</BaseLink>
</template>
```

`to` рендерит RouterLink приложения (как и остальные компоненты с навигацией), без роутера — `<a href>`. Небезопасные схемы (`javascript:`, `data:`) в `href` не попадают: ссылка показывается отключённой. Для `target="_blank"` добавляются `rel="noopener noreferrer"`, стрелка и подсказка «откроется в новой вкладке» для скринридера. Шрифт берётся у окружающего текста. Варианты: `default` — цвет ссылки и подчёркивание (в тексте ссылку видно не только по цвету), `ghost` — цвет текста и подчёркивание при наведении, для навигации и списков ссылок.

---

## BaseBreadcrumbs

Хлебные крошки.

```vue
<script setup lang="ts">
import { BaseBreadcrumbs } from '@ramzes1385/rise-ui-kit'

const items = [{ label: 'Главная', to: '/' }, { label: 'Пользователи', to: '/users' }, { label: 'Профиль' }]
</script>

<template>
	<BaseBreadcrumbs :items="items" />
</template>
```

Крошки — ссылки: `to` рендерит RouterLink приложения (из `linkComponent`, плагина или vue-router), без роутера — `<a href>`; `href` открывается в новой вкладке (`target` у крошки меняет это). Небезопасные схемы URL в адрес не попадают. Крошка без адреса — кнопка с событием `item-click`; `navigate(url)` сообщает о переходе по ссылке. При `max-items` лишние крошки сворачиваются в кнопку «…» с именем «Показать ещё N разделов» и `aria-expanded`; она же сворачивает путь обратно.

---

## BaseBottomNav

Нижние вкладки для телефона и PWA: 3–5 главных разделов приложения.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseBottomNav } from '@ramzes1385/rise-ui-kit'
import type { BottomNavItem } from '@ramzes1385/rise-ui-kit'

const active = ref('home')

const items: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home', to: '/' },
	{ value: 'search', label: 'Поиск', icon: 'search', to: '/search' },
	{ value: 'chats', label: 'Чаты', icon: 'comment', to: '/chats', badge: 3 },
	{ value: 'settings', label: 'Настройки', icon: 'settings', to: '/settings' },
]
</script>

<template>
	<BaseBottomNav v-model="active" :items="items" hide-on-scroll />
</template>
```

Корень — ориентир `<nav aria-label="Нижняя навигация">`, выбранный пункт помечен `aria-current="page"`; приложение обычно ставит `v-model` по текущему маршруту. Пункт с `to` — RouterLink приложения (из `linkComponent`, плагина или vue-router), без роутера — `<a href>`; с `href` — внешняя ссылка; без адреса — кнопка с событием `select`. `badge` показывает счётчик BaseBadge («99+» больше `maxBadge`), а скринридер слышит описание «3 новых» (`badgeLabel` меняет его). Панель по умолчанию закреплена внизу окна (`isFixed`) с отступом `env(safe-area-inset-bottom)` — для PWA добавьте `viewport-fit=cover` в meta viewport, а содержимому страницы — нижний отступ под панель. `hideOnScroll` прячет панель при прокрутке вниз и возвращает при прокрутке вверх и при фокусе на пункте.

---

## BaseStepper

Stepper.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseStepper } from '@ramzes1385/rise-ui-kit'

// номер текущего шага — с 1
const step = ref(1)

const steps = [{ label: 'Данные' }, { label: 'Проверка' }, { label: 'Готово' }]
</script>

<template>
	<BaseStepper v-model="step" :items="steps" />
</template>
```

Шаги — список `<ol>`; шаг, который можно выбрать, — кнопка, текущий помечен `aria-current="step"`, пройденный озвучивается «пройден». `clickable`: `all` (по умолчанию), `completed` — вернуться только к пройденным, `none` — только показ прогресса. Клик по текущему шагу событий не эмитит. Слот `item` рисуется внутри кнопки шага: без ссылок и полей.

---

## BaseCommandPalette

Палитра команд: окно с поиском по командам приложения. Открывается по ⌘K на macOS и Ctrl+K на Windows и Linux (`hotkey`, `null` — без сочетания) или через `v-model:is-open`.

```vue
<script setup lang="ts">
import { BaseCommandPalette } from '@ramzes1385/rise-ui-kit'
import type { CommandItem } from '@ramzes1385/rise-ui-kit'

const commands: CommandItem[] = [
	{ id: 'tasks', label: 'Задачи', group: 'Навигация', icon: 'list-bullet', onSelect: () => router.push('/tasks') },
	{ id: 'new', label: 'Новая задача', group: 'Действия', icon: 'plus', shortcut: 'mod+shift+n', keywords: ['создать'] },
	{ id: 'theme', label: 'Переключить тему', group: 'Вид', icon: 'moon', onSelect: toggleTheme },
]
</script>

<template>
	<BaseCommandPalette :commands="commands" @select="command => track(command.id)" />
</template>
```

Поиск — по названию, группе, пояснению и `keywords`, без учёта регистра и «ё»; все слова запроса должны найтись. Группы идут в порядке первого появления, недоступные команды (`isDisabled`) видны, но пропускаются стрелками. Клавиатура по образцу APG Combobox: фокус остаётся в поле поиска, ↑/↓ — команда, Home/End — первая и последняя, Enter — выполнить, Escape — закрыть; после закрытия фокус возвращается туда, где был. `shortcut` у команды — только подсказка (⌘⇧N); сами сочетания подключаются через `useHotkeys`:

```ts
import { useHotkeys } from '@ramzes1385/rise-ui-kit/composables'

useHotkeys({ 'mod+shift+n': createTask, '?': showHelp })
```

`mod` — ⌘ на macOS и Ctrl на остальных системах; буквы и цифры сравниваются по физической клавише, поэтому Ctrl+K работает и в русской раскладке. В полях ввода срабатывают только сочетания с Ctrl, ⌘ или Alt (`isAllowedInFields` — все); `isEnabled` включает и выключает сочетания, `target` — где слушать клавиши.

---

## BaseTour

Компонент пользовательского тура по интерфейсу.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTour } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(true)

const steps = [
	{
		target: '#first-step',
		title: 'Первый шаг',
		content: 'Описание первого шага',
	},
]
</script>

<template>
	<BaseTour v-model:is-open="isOpen" :steps="steps" />
</template>
```

- Шаг без `target`, с неверным селектором или с целью, которой нет на странице, — карточка по центру экрана; цель, появившаяся позже, подсвечивается сразу.
- Подсвеченная цель доступна: по ней можно нажать, Tab из карточки доходит до неё (`behavior.allowTargetInteraction`, по умолчанию `true`; у шага — `isTargetInteractive`). Пока цель доступна, окно не модальное (`aria-modal="false"`).
- Окно названо заголовком шага и описано его текстом; смена шага объявляется: «Шаг 2 из 3: Импорт».

---

## BaseText

Компонент текста.

```vue
<script setup lang="ts">
import { BaseText } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseText tag="p" :weight="600"> Текст </BaseText>
</template>
```

---

## BaseSeparator

Разделитель.

```vue
<script setup lang="ts">
import { BaseSeparator } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseSeparator />
</template>
```

---

## BasePin

Ввод PIN-кода / кода подтверждения по ячейкам (по одному символу в ячейке, `length` — число ячеек, по умолчанию 4). Когда заполнены все ячейки, эмитится `complete`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BasePin } from '@ramzes1385/rise-ui-kit'

const code = ref('')

function handleComplete(value: string): void {
	console.log(value)
}
</script>

<template>
	<BasePin v-model="code" :length="4" @complete="handleComplete" />
</template>
```

---

## BaseAnimation

Компонент анимации.

```vue
<script setup lang="ts">
import { BaseAnimation } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAnimation>
		<div>Анимированный контент</div>
	</BaseAnimation>
</template>
```

---

## BaseAnchor

Оглавление страницы: ссылки на разделы, текущий раздел подсвечивается при прокрутке.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseAnchor } from '@ramzes1385/rise-ui-kit'

const current = ref<string>()
</script>

<template>
	<aside>
		<BaseAnchor v-model:active="current" content="#article" :offset="64" />
	</aside>
	<article id="article">
		<h2 id="intro">Введение</h2>
		…
		<h3 id="install-npm">Через npm</h3>
	</article>
</template>
```

Пункты — `items` (`{ id, label, children? }`) или заголовки `headings` (по умолчанию `h2, h3`) внутри `content`; заголовку без id присваивается id. `target` — прокручиваемый контейнер (по умолчанию окно); `offset` — высота закреплённой шапки. Текущий раздел — последний, чей заголовок поднялся выше линии `offset` + 8px, в конце прокрутки — последний; следит IntersectionObserver за этой линией, конец прокрутки — `scrollend` (без него — пауза в событиях `scroll`). Клик — плавная прокрутка (без анимации при `prefers-reduced-motion`), фокус на разделе, адрес `#id` через `history.replaceState` (`isHashSynced`); клик с Ctrl, Cmd, Shift, Alt или средней кнопкой работает как обычная ссылка. Доступность: `<nav>` с именем «Содержание» (`label`), `aria-current="location"` у текущего пункта. `direction`: `vertical`, `horizontal`; варианты `default`, `soft`; слот `item` (`{ item, isActive }`); методы `refresh()` — после смены заголовков на странице, `scrollTo(id)`. Нет пунктов — компонент ничего не выводит.

---

## BaseCode

Блок кода с подсветкой синтаксиса: примеры в документации, ответы ассистента, команды и настройки.

```vue
<script setup lang="ts">
import { BaseCode } from '@ramzes1385/rise-ui-kit'

const code = "import { ref } from 'vue'\nconst count = ref(0)"
</script>

<template>
	<BaseCode :code="code" language="ts" title="useCounter.ts" :start-line="12" :highlight-lines="[13]" />
</template>
```

`language` — имя или псевдоним: `js`, `ts`, `json`, `html`, `vue`, `css`, `scss`, `bash` (`sh`, `shell`), `python` (`py`); другой язык показывается простым текстом. Подсветка — встроенный токенизатор без зависимостей (`codeHighlightUtils`), цвета — токены `--rise-code-*` (контраст 4.5:1 на подложках всех вариантов в обеих темах). Код выводится только текстом, без `v-html`.

`has-line-numbers` (по умолчанию есть), `start-line`, `highlight-lines`, `title` (по умолчанию — название языка, слот `header`), слот `actions` — свои кнопки в заголовке, `has-copy-button`, `has-header`, `is-wrapped` — перенос длинных строк, `max-height` — вертикальная прокрутка, `label` — имя области; варианты `default`, `soft`, `outline`.

Доступность: номера строк `aria-hidden` и не попадают в выделение; длинный код прокручивается с клавиатуры — область получает `tabindex="0"`, роль `region` и имя «Код, <язык>» только когда есть что прокручивать (`useScrollableRegion`). «Копировать» объявляет результат в `role="status"`; событие `copy` (`{ code, success }`) и метод `copy()` через ref.

Блоки кода BaseMarkdown подсвечиваются тем же токенизатором.

## BaseCryptoProSign

Электронная подпись через КриптоПро ЭЦП Browser plug-in (на `useCryptoPro`): диагностика с подсказками и ссылками на установку, выбор сертификата, подпись текста или файла — присоединённая или отсоединённая, CAdES-BES, CAdES-T и CAdES-X Long Type 1, — и проверка подписи (`mode="verify"`).

**Что поставить пользователю.** КриптоПро CSP 5.0 или новее (лицензия или пробный период), КриптоПро ЭЦП Browser plug-in и расширение для браузера (Chrome, Edge, Яндекс Браузер, Firefox), сертификат с закрытым ключом в личном хранилище («Личное» текущего пользователя; ключ на токене — драйвер токена). Компонент сам проверяет шаги по порядку — расширение, плагин, CSP, объекты подписи — и при ошибке показывает, что поставить, со ссылками на страницы загрузки КриптоПро.

**Что сделать приложению.** Скрипт `cadesplugin_api.js` скачивается с сайта КриптоПро и раздаётся приложением — кит его не содержит. Подключите его на странице или передайте адрес в `script-url` (один раз для всех — `createUiKitPlugin({ defaults: { BaseCryptoProSign: { scriptUrl: '/cades/cadesplugin_api.js' } } })`): компонент загрузит скрипт после монтирования. До монтирования компонент не трогает `window` и `document` (SSR).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseCryptoProSign, type CryptoProSignResult } from '@ramzes1385/rise-ui-kit'

const thumbprint = ref('')
const detached = ref(true)

async function send(result: CryptoProSignResult) {
	await api.saveSignature({ file: result.fileName, signature: result.signature, detached: result.detached })
}
</script>

<template>
	<BaseCryptoProSign
		v-model:thumbprint="thumbprint"
		v-model:detached="detached"
		:data="file"
		level="t"
		tsa-address="http://testca2012.cryptopro.ru/tsp/tsp.srf"
		@signed="send"
		@error="error => console.warn(error.code, error.detail)" />

	<BaseCryptoProSign
		mode="verify"
		:signature="signatureBase64"
		:data="file"
		@verified="result => (isValid = result.isValid)" />
</template>
```

- **Что подписываем:** `data` — текст (подписываются его байты UTF-8) или `File`/`Blob`; без `data` пользователь выбирает файл сам (BaseFileUpload). Имя файла подписи — `<имя файла>.sig`, для текста — `<fileName>.sig` (`fileName`, по умолчанию `document`).
- **Сертификаты** — BaseSelect: ФИО, организация, ИНН, срок («действует до …», за 30 дней — «истекает через N дней»). Просроченные, не прошедшие проверку плагина и без закрытого ключа видны, но недоступны. Первый действующий выбирается сам (`update:thumbprint`).
- **Присоединённая или отсоединённая** — BaseSegmented, `v-model:detached`.
- **Большие файлы.** Плагин передаёт данные через расширение браузера, и большой файл целиком не проходит (ограничение есть и на демостранице КриптоПро). Файл больше `hashThreshold` (по умолчанию 10 МБ) подписывается по хэшу: `CAdESCOM.HashedData` считает ГОСТ Р 34.11-2012 256 или 512 по алгоритму ключа сертификата, файл читается частями по 768 КБ, ход — полосой BaseProgress; подпись `SignHash` — только отсоединённая, вариант «Присоединённая» недоступен с пояснением. Такую подпись проверяет любой инструмент CAdES вместе с файлом.
- **Уровень** `level`: `bes` (по умолчанию), `t` — со штампом времени, `xlt1` — CAdES-X Long Type 1 (штамп и доказательства действительности сертификата, «усовершенствованная» подпись). Для `t` и `xlt1` нужна служба штампов времени `tsaAddress` — без неё предупреждение в консоли и ошибка плагина. Во всех уровнях подпись содержит время подписи (`signingTime`).
- **Результат подписи** — событие `signed`: `{ signature, detached, isHash, level, certificate, fileName }`, `signature` — Base64 без переносов. Кнопка «Скачать подпись» (`hasDownload`) сохраняет `.sig` в DER (двоичный CMS, как у КриптоАРМ и `cryptcp`).
- **Проверка** `mode="verify"`: подпись — `signature` (Base64) или файл, который выберет пользователь (`.sig`, `.sgn`, `.p7s`: DER, Base64 или PEM); данные отсоединённой подписи — `data` или файл. `VerifyCades`, для файла больше `hashThreshold` — `VerifyHash` (сначала хэш 256, затем 512). Событие `verified`: `{ isValid, isDetached, isHash, signers, error }`; у подписанта — ФИО, организация, ИНН, время подписи, время штампа, срок и состояние сертификата.
- **Ошибки** — событие `error` с `CryptoProFailure` (`code`, `message`, `detail`; коды — `useCryptoPro`, docs/reference/COMPOSABLES.md). Неверная подпись — не ошибка, а `verified` с `isValid: false`.
- **Методы** через `ref` (`BaseCryptoProSignExpose`): `check()` — повторная диагностика и чтение сертификатов, `sign()`, `verify()`.
- **Доступность:** корень — область с именем «Электронная подпись» или «Проверка электронной подписи»; шаги диагностики — список с состоянием словами для скринридера; итог подписи и проверки объявляется скрытой областью `role="status"`, ошибки — BaseAlert `role="alert"`; на время работы — `aria-busy`.
- **Эмуляция** для историй, тестов и демо приложения — `createCryptoProSignEmulation(options)`: всё из `createCryptoProEmulation` (сценарии `ready`, `noExtension`, `noPlugin`, `noCsp`, `noCertificates`, `cancel`, сертификаты, `now`, `delay`) и подпись хэша, уровни, время подписи, проверка; `keys512` — отпечатки сертификатов с ключом 512 бит. Подпись фиктивная: её проверяет только эмуляция, данные, изменённые после подписи, проверку не проходят.
- **Ограничения.** Настоящую подпись CI не проверяет — только эмуляция; вторая подпись к документу (`CoSignCades`, `CoSignHash`) пока не поддерживается. Плагин работает только в браузерах с расширением КриптоПро; в мобильных браузерах его нет.

---

## BaseMarquee

Бегущая строка: новости, акции, логотипы партнёров. Содержимое — слот default или `items` со слотами `item` и `separator`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseMarquee } from '@ramzes1385/rise-ui-kit'

const news = ['Курс рубля укрепился', 'Новая линия метро открыта']
const isPaused = ref(false)
</script>

<template>
	<BaseMarquee v-model:is-paused="isPaused" :items="news" label="Новости" has-fade>
		<template #separator>•</template>
	</BaseMarquee>
</template>
```

`direction` — `left` (по умолчанию), `right`, `up`, `down`; `speed` — пикселей в секунду: длительность круга считается по размеру содержимого (ResizeObserver), поэтому длинная и короткая ленты движутся одинаково быстро. `gap` — отступ между элементами и повторами, px. Бесшовный круг — копиями содержимого с `aria-hidden` и `inert`, движение — CSS `transform`.

Доступность: роль `marquee` с именем `label` (по умолчанию «Бегущая строка»); лента стоит под указателем и при фокусе внутри; кнопка паузы (`has-pause-button`, по умолчанию есть) и `v-model:is-paused` — WCAG 2.2.2. При `prefers-reduced-motion` лента не движется, а длинная прокручивается, в том числе с клавиатуры. Вертикальная лента — высота области 160 px, своя — через `customClass.viewport`.

---

## BaseStat и BaseCountdown

Показатель для дашборда и отсчёт до даты. Числа и подписи — по языку кита через `Intl.NumberFormat`.

```vue
<BaseStat
	label="Выручка"
	:value="4820000"
	:value-format="{ style: 'currency', currency: 'RUB', notation: 'compact', maximumFractionDigits: 2 }"
	:change="0.12"
	change-label="к августу">
	<template #chart>
		<BaseSparkline :values="revenue" label="Выручка за 12 недель" variant="area" :height="40" />
	</template>
</BaseStat>

<BaseStat label="Отток" :value="0.031" :value-format="{ style: 'percent', maximumFractionDigits: 1 }" :change="-0.004" is-inverse />

<BaseCountdown :to="saleEnd" label="До конца распродажи" @finish="reload">
	<template #finished>Распродажа закончилась</template>
</BaseCountdown>
```

- `BaseStat` — подпись (`dt`), значение и изменение (`dd`). `value` — число (формат `valueFormat`, параметры `Intl.NumberFormat`) или готовая строка. `change` — изменение: по умолчанию доля для процентов со знаком (`0.12` → «+12 %»), свой формат — `changeFormat` (например, `{ style: 'decimal' }` и `change-label="п. п."`). Знак задаёт стрелку, цвет — оценку: рост зелёный (`--rise-success-text`), снижение красный (`--rise-error-text`), ноль — приглушённый; `is-inverse` — когда рост плох. Слоты `chart` (BaseSparkline), `icon`, а также `label`, `value` (`{ formatted }`), `change` (`{ formatted, trend, tone }`). `is-loading` — заглушки и `aria-busy`. Варианты `default`, `soft`, `outline`, `ghost` (без рамки и отступов — внутри своей карточки).
- `BaseCountdown` — отсчёт до `to` (`Date`, метка времени, ISO-строка; строка без смещения — местное время, только дата — местная полночь; время с сервера передавайте со смещением или `Z`). `format` — единицы из `days`, `hours`, `minutes`, `seconds`: старшая вбирает остаток (без дней — «53:42:17»), младшая округляется вверх. `layout` — `blocks` (ячейки «число и подпись») или `inline` («2 дн. 05:42:17»). Время считается от часов устройства на каждом шаге и при возврате на вкладку. `finish` — один раз на нуле, не вызывается, если дата прошла до монтирования; слот `finished` заменяет нули и доступен скринридеру (ссылки и кнопки в нём работают), слот default получает `{ days, hours, minutes, seconds, total, isFinished }` и только для вида — скрыт от скринридера. При SSR до гидратации — заглушка `--`.
- Доступность отсчёта: `role="timer"`, цифры скрыты от скринридера, вместо них текст с точностью до минуты («До конца распродажи: 2 дня 5 часов 42 минуты», меньше минуты — «меньше минуты»), он меняется не чаще раза в минуту. По умолчанию `aria-live="off"` — время читается, когда пользователь дойдёт до таймера; `is-live` — объявлять изменения (`polite`). Анимаций нет, `prefers-reduced-motion` ничего не меняет.

## BaseEventCalendar

Календарь событий: виды «Месяц», «Неделя», «День» и «Список». События — `events` (`{ id, title, start, end?, allDay?, color?, category?, description?, rrule?, exdates? }`); `end` не входит в событие, как DTEND в iCalendar: событие на весь день 2–3 октября — `start: '2026-10-02', end: '2026-10-04'`. Дата строкой `ГГГГ-ММ-ДД` — день без времени, `ГГГГ-ММ-ДДTЧЧ:ММ` — местное время. Без `end` событие на весь день длится день, событие со временем — час.

```vue
<BaseEventCalendar
	v-model:view="view"
	v-model:date="date"
	:events="events"
	:work-hours="{ start: '09:00', end: '18:00' }"
	@period-change="period => loadEvents(period.start, period.end)"
	@event-click="({ event }) => openEvent(event)" />
```

- Панель: «Сегодня», «Предыдущий / Следующий период», заголовок периода и переключатель видов (`views` — какие виды в нём, один вид — без переключателя). Своя панель — слот `toolbar` (`title`, `view`, `date`, `period`, `today()`, `prev()`, `next()`, `setView()`).
- Месяц: шесть недель, многодневные события — полосы через дни; больше `max-events-per-day` событий в дне — кнопка «+N ещё» с поповером всех событий дня. Сетка — APG Grid: одна точка Tab (выбранный день), стрелки — дни и недели, Home/End — начало и конец недели, PageUp/PageDown — месяц (с Shift — год); события выбранного дня — следующие остановки Tab.
- Неделя и день: строка «Весь день», шкала времени с шагом `slot-duration` (минуты), пересекающиеся события — колонками, линия текущего времени (`has-now-indicator`), рабочие часы `work-hours` (`{ start, end, days? }`, по умолчанию пн–пт) — остальное время приглушено, шкала открывается на начале рабочего дня (без них — на 08:00).
- Список: дни периода (месяц) с событиями; пусто — «Нет событий» или слот `empty`.
- Повторы: `rrule` — подмножество RRULE (`FREQ` DAILY, WEEKLY, MONTHLY, YEARLY; `INTERVAL`, `BYDAY`, `COUNT` или `UNTIL`, `WKST`), `exdates` — пропуски; разворачиваются только в показанном периоде.
- `period-change` приходит при монтировании и при смене вида или периода — `{ view, start, end }` для загрузки событий; `event-click` — `{ event, start, end, allDay }` (у повтора — время этого повтора).
- Первый день недели и форматы дат — из языка кита (`firstDayOfWeek`, Intl); проп `first-day-of-week` переопределяет. `today` — «сегодня» для подсветки и линии времени (тесты, истории).
- Событие — кнопка с полным именем: «Встреча, 2 октября, 10:00–11:00»; смена вида и периода объявляется (`role="status"`). Цвет события — `color` (любой цвет CSS или токен); фон события — смесь цвета с фоном, текст — `--rise-text`.

Динамические слоты:

| Слот | Что | Данные |
|---|---|---|
| `event`, `event-<id>`, `category-<категория>` | содержимое события во всех видах; приоритет — `event-<id>`, `category-…`, `event` | `event`, `start`, `end`, `allDay`, `time`, `view` |
| `day`, `day-<ГГГГ-ММ-ДД>` | число дня в сетке месяца | `date`, `isToday`, `isOutside`, `events` |
| `header-day` | заголовок дня в неделе и дне | `date`, `label`, `isToday` |
| `time-slot` | подпись часа на шкале | `time`, `label` |
| `all-day` | подпись строки «Весь день» | — |
| `toolbar`, `empty` | панель; пустой «Список» | см. выше |

Выделение и правка (new-event-calendar-2) — календарь сообщает, что сделал пользователь, а `events` меняет приложение:

```vue
<BaseEventCalendar
	:events="events"
	is-selectable
	is-editable
	:can-move="({ start }) => start.getDay() !== 0"
	@select="({ start, end, allDay }) => openNewEvent(start, end, allDay)"
	@create="({ start, end, allDay }) => openNewEvent(start, end, allDay)"
	@event-change="({ event, start, end }) => saveEvent(event.id, start, end)" />
```

- `is-selectable`: протянуть мышью по дням месяца или шагам сетки времени — `select` (`{ start, end, allDay }`, `end` не входит); нажать пустое место — `create` (день в месяце, шаг `slot-duration` в неделе и дне). Клавиатура: в месяце Shift со стрелками (и Home/End, PageUp/PageDown) выделяет дни от выбранного; в неделе и дне колонка дня — точка Tab с курсором шага: ↑/↓ — шаг, ←/→ — соседний день, Shift — выделение; Enter — `select` (есть выделение) или `create` (курсор), Escape снимает выделение. Выделение и курсор объявляются в `role="status"` («Выделено: 2 октября, 10:00–11:30»).
- `is-editable`: событие тянут мышью на другой день или время (в месяце, в строке «Весь день», в сетке времени), за нижний край (в сетке времени) или правый край (событие на весь день) — меняют длительность; порог 5 px отличает перенос от нажатия. Escape во время переноса отменяет. Касание не переносит (прокрутка важнее): на телефоне — клавиатурный путь или своё окно правки по `event-click`.
- Клавиатура (WCAG 2.5.7): Space берёт событие, стрелки переносят — в сетке времени на шаг (↑/↓) или день (←/→), в месяце на день или неделю; Shift со стрелками меняет длительность; Enter кладёт, Escape или Tab отменяют. Каждый шаг объявляется, подсказка «Space — перенести событие» — в `aria-describedby` события. Перенос не выходит за показанный период.
- `can-move(change)` — вернуть `false`, чтобы событие нельзя было положить: мышью место помечается (пунктир `--rise-error`), отпускание ничего не меняет; клавиатура объявляет «Сюда событие … положить нельзя» и не двигает событие.
- `event-change` — `{ type: 'move' | 'resize', event, start, end, allDay, oldStart, oldEnd }`. У повторяющегося события — время этого повтора: приложение решает, менять всю серию или добавить исключение (`exdates`) и отдельное событие. Анимаций переноса нет — `prefers-reduced-motion` соблюдается.

Ресурсы (new-event-calendar-3) — комнаты, люди, оборудование: в неделе и дне у каждого ресурса свои колонки.

```vue
<BaseEventCalendar
	v-model:view="view"
	:events="events"
	:resources="[
		{ id: 'room-1', title: 'Переговорная 1', color: 'var(--rise-success)' },
		{ id: 'room-2', title: 'Переговорная 2' },
	]"
	is-selectable
	is-editable
	@create="({ start, end, resourceId }) => openNewEvent(start, end, resourceId)"
	@event-change="({ event, start, end, resourceId }) => saveEvent(event.id, start, end, resourceId)">
	<template #resource="{ resource }">{{ resource.title }}</template>
</BaseEventCalendar>
```

- Событие лежит в колонке своего `resourceId`; без ресурса в неделе и дне оно не видно (в месяце и списке — как обычно). Цвет ресурса — цвет его событий без своего `color`.
- `select`, `create` — ещё `resourceId` колонки; выделение не выходит за колонки ресурса. `event-change` — ещё `resourceId` и `oldResourceId`: перенос мышью или ←/→ с клавиатуры в колонку другого ресурса.
- Слоты `resource` и `resource-<id>` (`{ resource, days }`) — заголовок ресурса. Имена колонок и событий для скринридера дополнены названием ресурса.
- Импорт и экспорт: `readIcsFile(file)` → события для `events` (RESOURCES → `resourceId`), `downloadIcs(events, 'команда')` — файл `.ics`.

Событие остаётся кнопкой — в слотах события не нужны свои кнопки и ссылки. Утилиты календаря (`getEventsInRange`, `layoutWeek`, `layoutDay`, `expandRecurrence`, `parseIcs`, `toIcs` и др.) — docs/reference/UTILS.md.

## BaseTag и BaseTagGroup

Метки: фильтры, теги записи, выбранные значения. `BaseTag` — одна метка, `BaseTagGroup` — набор по `items`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTagGroup, type TagGroupItem, type TagGroupModelValue } from '@ramzes1385/rise-ui-kit'

const tags = ref<TagGroupItem[]>([
	{ value: 'vue', label: 'Vue' },
	{ value: 'react', label: 'React' },
	{ value: 'svelte', label: 'Svelte', tone: 'warning' },
])
const selected = ref<TagGroupModelValue>(['vue'])
const remove = (item: TagGroupItem) => (tags.value = tags.value.filter(tag => tag.value !== item.value))
</script>

<template>
	<BaseTagGroup v-model="selected" :items="tags" selection-mode="multiple" label="Технологии" is-removable @remove="remove" />
</template>
```

`BaseTag`: `label` или слот default, `icon` или слот `icon`, цвет роли `tone` (`neutral`, `primary`, `info`, `success`, `warning`, `error`), варианты `default` и `outline`. Выбираемая — `is-selectable` и `v-model:is-selected`, удаляемая — `is-removable` и событие `remove`; метку убирает приложение.

`BaseTagGroup`: `selectionMode` — `none` (по умолчанию), `single` (`v-model` — значение или `null`), `multiple` (массив); `isRemovable`, `tone`, `variant`, `color`, `sizeScale` — для всех меток, у метки можно задать свой `tone`, `isDisabled`, `isRemovable`; слот `tag` (`{ item, isSelected }`).

Доступность: выбираемая метка — кнопка-переключатель с `aria-pressed` (APG Button, toggle), выбранная показывает галочку — выбор виден не только по цвету. Удаление — кнопка «Удалить метку {label}» и клавиши Delete и Backspace на метке; у выбираемой метки кнопка удаления вне Tab, клавиши — в `aria-keyshortcuts`. Группа — `role="group"` с именем `label` (по умолчанию «Метки»); после удаления фокус переходит на соседнюю метку, если приложение убрало метку из `items` сразу (в том же тике).

---

## BaseImageMap

Интерактивная картинка и карта этажей: точки и фигуры на картинке или плане, подсказки, окна, этажи, масштаб. Данные — свой JSON (`ImageMapData`, версия 1).

```vue
<BaseImageMap v-model:active="activeId" v-model:layer="floor" :data="mallMap" :init-area="{ x: 0.2, y: 0.1, width: 0.6, height: 0.8 }" @select="track" />
```

```ts
const mallMap: ImageMapData = {
	layers: [{ id: 'f1', title: 'Этаж 1', shortTitle: '1', svg: floor1Svg, width: 1000, height: 600 }],
	groups: [{ id: 'food', title: 'Кафе', color: 'var(--rise-warning)', icon: 'star' }],
	objects: [
		{ id: 'cafe', type: 'svg', elementId: 'shop-12', title: 'Кафе «Липа»', group: 'food', description: 'До 22:00' },
		{ id: 'info', type: 'point', x: 0.5, y: 0.5, title: 'Справочная', icon: 'info', action: 'none' },
		{ id: 'parking', type: 'rect', x: 0.8, y: 0.7, width: 0.15, height: 0.2, title: 'Парковка', action: 'link', link: '/parking' },
	],
}
```

- **Слои** — картинка (`image`) или SVG (`svg` строкой, `svgUrl` по адресу); `width` и `height` задают пропорции. SVG очищается по белому списку элементов и атрибутов: без скриптов, `<style>`, комментариев, обработчиков, `data-*`, внешних ссылок в атрибутах и `style`; id получают префикс, поэтому два одинаковых плана на странице не конфликтуют.
- **Объекты** — `point` (значок, подпись, размер постоянный на экране или `isScaled`, `isPulsing`), `rect`, `ellipse`, `polygon` (координаты в долях картинки) и `svg` — элемент SVG слоя по `elementId`. Группы дают цвет и значок; стили `base`, `hover`, `active` — в `styles` по имени или прямо в объекте, цвета лучше токенами.
- **Действия** (`action`, по умолчанию `defaultAction` = `popup`): `popup` — окно BaseModal (на экране уже `sheetBreakpoint` — нижняя панель BaseDrawer) с картинкой, описанием, видео и ссылками (ссылки — только в окне, не в подсказке); `link` — переход (небезопасный адрес отключает действие); `layer` — переход на этаж `targetLayer`; `none`. Подсказка при наведении и фокусе — панель BaseDropdown с `role="tooltip"`, объект ссылается на неё `aria-describedby`; слоты `tooltip`, `popup`, `point`.
- **Масштаб** — кнопки «+», «−», «Сбросить», перетаскивание, щипок; колесо — с Ctrl или ⌘ (`wheelZoom: 'ctrl'`, без него страница прокручивается и появляется подсказка), `always` или `none`; `maxZoom`, `initArea`, `hasZoomToActive`; полный экран (`hasFullscreen`). Методы через ref: `zoomIn`, `zoomOut`, `resetZoom`, `zoomToObject(id)`, `setLayer(id)`.
- **Доступность** — объекты — кнопки или ссылки с именем `title`, одна остановка Tab, стрелки — к ближайшему объекту в направлении, Home/End, Enter и пробел (у ссылок — только Enter); `+`/`−` на объекте масштабируют вокруг него, при увеличении фокус на объекте за краем сдвигает вид к нему, а окно карты получает фокус — стрелки на нём сдвигают вид; окно возвращает фокус на объект; кнопки масштаба подписаны. Список объектов для скринридера и поиска — следующая часть (new-image-map-2).
- **Список объектов** (`hasDirectory`, new-image-map-2) — сбоку от карты (`directoryPosition`: `start`, `end`), в контейнере уже 640 px — под картой. Поиск (`hasSearch`, `v-model:search`) без учёта регистра и «ё» по названию, описанию, группе и `keywords`; группировка `directoryGroupBy`: `group`, `alpha`, `none`; вид `directoryView`: `list` или `grid` с миниатюрами (`image` объекта); `directoryScope`: `all` — объекты всех этажей (выбор переключает этаж), `layer` — текущего. Выбор в списке — как клик по объекту (событие `select`, действие); наведение и фокус в строке подсвечивают объект на карте, наведение на карте — строку. `isHiddenInDirectory` убирает объект из списка (лестницы, лифты). Слоты `directory-item`, `directory-empty`; «Найдено N результатов» — в `role="status"`.
- **Фильтры** (`data.filters`, `hasFilters`, `v-model:filters` — `{ [id]: значения }`, метод `clearFilters()`): вид `type` — `checkbox` (BaseCheckboxGroup), `tags` (кнопки `aria-pressed`), `select` (BaseSelect с вариантом «Все»), `switch` (BaseSwitch); без `options` фильтр — по группам, с `options` — по `tags` объекта; варианты одного фильтра — `logic` `or` (по умолчанию) или `and`, разные фильтры — «и»; `value` — выбор при открытии. Скрытые фильтром точки и фигуры пропадают с карты, элементы SVG слоя бледнеют и не выбираются.
- **Легенда** (`hasLegend`) — группы под картой: цвет, значок, название. **Ссылка на объект** (`hasDeepLinking`, `deepLinkParam` = `location`): при открытии `?location=<id>` выбирает объект, переключает этаж и открывает окно; выбор обновляет адрес через `history.replaceState`.

```vue
<BaseImageMap v-model:active="activeId" v-model:filters="filters" :data="mallMap" has-directory has-legend has-deep-linking />
```

## BaseTreeSelect

Выбор из иерархии в выпадающем списке: регион → город, отдел → сотрудник, категория → подкатегория. Узлы — в формате BaseTree.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTreeSelect } from '@ramzes1385/rise-ui-kit'
import type { TreeNode } from '@ramzes1385/rise-ui-kit'

const regions: TreeNode[] = [
	{ id: 'center', label: 'Центральный округ', children: [{ id: 'moscow', label: 'Москва' }, { id: 'tula', label: 'Тула' }] },
	{ id: 'volga', label: 'Приволжский округ', children: [{ id: 'kazan', label: 'Казань' }] },
]
const city = ref('')
const cities = ref<string[]>([])
</script>

<template>
	<BaseTreeSelect v-model="city" :items="regions" label="Город доставки" is-searchable />
	<BaseTreeSelect v-model="cities" :items="regions" label="Города" is-multiple :max-tag-count="3" />
</template>
```

- `v-model` — id узла (`''` — ничего); при `isMultiple` — массив id. Несколько значений — флажки с каскадом: ветка отмечает доступных потомков, выбор всех доступных детей отмечает родителя, часть — частичный выбор. Отключённые узлы и их ветки в каскаде не участвуют: выбор их не снимает и не добавляет, а выбранный отключённый узел всегда остаётся в значении отдельным id. Вид массива — `checkedStrategy`: `child` (по умолчанию) — узлы без выбранных доступных детей, `parent` — полностью выбранная ветка одним id (ветка считается полной, когда выбраны все её доступные дети; невыбранный отключённый ребёнок этому не мешает и в значение не попадает), `all` — все выбранные узлы. На вход можно отдать массив в любом из видов — выбор согласуется.
- `isSearchable` — поиск по подписям: видны совпавшие узлы, их предки (раскрыты) и потомки совпавших веток. `isDefaultExpandAll`, `isLoading` («Загрузка...» в `role="status"`, у поля `aria-busy`), `maxTagCount` («+N»; `0` — только счётчик). Слоты `node`, `selected`, `tag` (`{ nodes, remove }`), `empty`; событие `toggle` — раскрытие узла.
- Поле формы как BaseSelect: `label`, `error`, `isRequired`, `triggerAttrs`, внутри BaseFormField — имя и описание обёртки; `validate()` и `reset()` через `ref`.
- Клавиатура (APG Combobox, фокус остаётся в поле): Enter, пробел, стрелки открывают список, Home и End — на первой и последней строке; вверх и вниз, Home и End — по строкам; вправо — раскрыть ветку или к первому ребёнку, влево — свернуть или к родителю; Enter (в поле и пробел) — выбрать: одиночный выбор закрывает список, несколько — оставляет открытым; Escape, Tab, Alt+↑ — закрыть. В поле поиска с текстом влево, вправо, Home и End двигают курсор; клавиши ввода через IME (Enter, подтверждающий слово) список не трогают.

Для плоского списка — `BaseSelect`, для дерева на странице — `BaseTree`.

---

## BaseCascader

Выбор из иерархии уровнями-колонками: регион → город → район. Поле — как у `BaseSelect`, панель — `BaseDropdown`, каждая колонка — `listbox`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseCascader, type BaseCascaderNode } from '@ramzes1385/rise-ui-kit'

const regions: BaseCascaderNode[] = [
	{ id: 'ru', label: 'Россия' },
	{ id: 'kz', label: 'Казахстан' },
]
const district = ref<string[]>([])

async function load(node: BaseCascaderNode): Promise<BaseCascaderNode[]> {
	const response = await fetch(`/api/regions/${node.id}/children`)
	return response.json()
}
</script>

<template>
	<BaseCascader v-model="district" :items="regions" :load="load" label="Район доставки" is-searchable />
</template>
```

- `v-model` — путь id от корня (`['ru', 'msk', 'tverskoy']`), в поле — подписи пути через `separator` (по умолчанию « / »); не загруженный ещё узел показывается своим id, своя подпись — слот `selected` (`{ path, labels, nodes }`). `isMultiple` — список путей, выбранные — метками с крестиком, панель не закрывается. `isAnyLevel` — можно выбрать узел любого уровня: щелчок и Enter выбирают его и раскрывают следующий уровень.
- Узлы `BaseCascaderNode`: `id`, `label`, `description`, `icon`, `children`, `isLeaf`, `isDisabled`. id уникальны во всём дереве: повтор и цикл не показываются (индекс — `treeUtils`). Отключённый узел не выбирается и не раскрывается.
- Ленивые уровни: узел без `children` и без `isLeaf` раскрывается через `load(node)` — промис детей. Пока он не выполнен, колонка показывает `BaseLoader`; отклонённый промис — текст «Не удалось загрузить», кнопка «Повторить» и событие `load-error` (`node`, `error`); повторное раскрытие узла с ошибкой загружает снова, загруженное запоминается. Открытие панели раскрывает путь значения и при необходимости загружает уровни по нему. `isLoading` — загружается корневой уровень: индикатор в колонке и `aria-busy` у поля.
- `isSearchable` — поле поиска в панели: ищет по подписи и описанию узлов всех загруженных уровней, результаты — пути до выбираемых узлов (конечных; при `isAnyLevel` — любых), отключённые на пути — `aria-disabled`.
- Поле формы: `label`, `isRequired`, `error`, `placeholder`, `ariaLabel`, `triggerAttrs`; внутри `BaseFormField` имя, описание, ошибка и обязательность берутся из обёртки. Методы `focus`, `blur`, `validate`, `reset`. Слоты `option` (`{ node, isSelected, hasChildren }`), `empty`, `selected`. Варианты — как у `BaseSelect`.
- Доступность (APG Combobox): поле — `combobox` с `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` на колонку активного узла и `aria-activedescendant`; колонка — `listbox` с именем родителя (корневая — имя поля). Клавиши: стрелки вниз и вверх, Enter, пробел открывают; вверх и вниз — по колонке, Home и End — края; вправо — раскрыть узел и перейти в его колонку (у ленивого — после загрузки), влево — назад; Enter и пробел — выбрать конечный узел (или раскрыть); Escape и Tab закрывают. В поле поиска с пустым запросом стрелки работают так же, с запросом — вверх и вниз по результатам, Enter выбирает.

---

## Список компонентов

```txt
BaseAccordion
BaseAddressInput
BaseAiMessage
BaseAlert
BaseAnchor
BaseAnimation
BaseApp
BaseAudioPlayer
BaseAutocomplete
BaseAvatar
BaseAvatarCropper
BaseAvatarGroup
BaseBackTop
BaseBadge
BaseBankCard
BaseBreadcrumbs
BaseButton
BaseButtonGroup
BaseCalendar
BaseCard
BaseCascader
BaseChart

BaseCardInput
BaseChat
BaseCheckbox
BaseCheckboxGroup
BaseChecklist
BaseChip
BaseCode
BaseColorModeButton
BaseColorPicker
BaseCommandPalette
BaseCommentThread
BaseConfirm
BaseContainer
BaseContextMenu
BaseCryptoProSign
BaseDadataInput
BaseDatePicker
BaseDescriptions
BaseDrawer
BaseDropdown
BaseDropdownMenu
BaseEditor
BaseEmojiPicker
BaseEmpty
BaseFab
BaseFileUpload
BaseFilterBuilder
BaseFooter
BaseForm
BaseFormField
BaseHeader
BaseHeatmap
BaseIcon
BaseImage
BaseImageCompare
BaseImageMap
BaseInfiniteScroll
BaseInplace
BaseInput
BaseInputNumber
BaseInputTags
BaseJsonViewer
BaseKanban
BaseKbd
BaseLayout
BaseLink
BaseList
BaseLoader
BaseMap
BaseMarkdown
BaseMarquee
BaseMediaPlayer  # вход @ramzes1385/rise-ui-kit/media
BaseMegaMenu
BaseMention
BaseMenu
BaseModal
BaseMoneyInput
BaseNotification
BaseNotificationCenter
BasePagination
BasePhoneInput
BasePieChart
BasePin
BasePopconfirm
BasePopover
BasePresentationPlayer  # вход @ramzes1385/rise-ui-kit/media
BaseProgress
BasePromptInput
BaseQrCode
BaseRadio
BaseRange
BaseRating
BaseReasoning
BaseRequisiteInput
BaseScrollArea
BaseSearch
BaseSegmented
BaseSelect
BaseSeparator
BaseSideBar
BaseSignaturePad
BaseSkeleton
BaseSlideover
BaseSlider
BaseSparkline
BaseSplitButton
BaseSplitter
BaseStepper
BaseSubtitleEditor
BaseSwitch
BaseTable
BaseTabs
BaseTag
BaseTagGroup
BaseText
BaseTextarea
BaseTextDiff
BaseTimeline
BaseTimePicker
BaseToolbar
BaseToolCall
BaseTooltip
BaseTour
BaseTransfer
BaseTree
BaseTreeSelect
BaseUser
BaseVirtualList
BaseVoiceRecorder
BaseWaveform
```

---

## BaseList (задача new-list)

Список строк: значок или аватар, текст, описание, короткий текст справа (`meta`) и кнопки действий. Строки — `items` (`{ id, title, description?, icon?, avatar?, meta?, isDisabled? }`; свои поля сохраняются — компонент обобщённый). Подпись — `label` или `aria-label`.

```vue
<BaseList v-model="selected" v-model:items="folders" selection-mode="multiple" is-sortable label="Папки" @move="saveOrder" />
```

- `selection-mode` — `none` (по умолчанию: `role="list"`, клик и Enter — событие `activate`, слот `actions` для кнопок), `single` или `multiple` — список выбора по APG Listbox: `role="listbox"`, у строк `role="option"` и `aria-selected`, одна точка Tab, стрелки, Home и End, пробел выбирает, в `multiple` — Shift + стрелки и Shift + клик выбирают подряд, Ctrl+A — все; переход к строке по первым буквам названия. `v-model` — id строки или массив id. В режиме выбора действий в строке нет: у `option` не может быть интерактивного содержимого.
- `is-sortable` — перестановка: мышью за строку (после сдвига на 5px, Escape отменяет), с клавиатуры — в режиме `none` пробел берёт строку, стрелки двигают, пробел или Enter кладут, Escape отменяет; в любом режиме Alt + ↑/↓ сдвигают строку сразу. Каждое новое место объявляется скринридеру («Место 3 из 10»). Новый порядок — `update:items` и событие `move` (`{ item, from, to }`); `can-move` запрещает место. Касанием строки не перетаскиваются (ими прокручивают) — для телефона дайте свои кнопки через метод `moveItem`.
- `filter` — какие строки показать; скрытые строки сохраняют свои места при перестановке.
- `is-virtual` — в DOM только видимые строки (тысячи строк), высота — `height` (по умолчанию 360px), `item-size` — высота строки до замера.
- Через `ref`: `focusItem(id)`, `selectAll()`, `clearSelection()`, `moveItem(id, index)`.
- Слоты: `item` (вся строка), `prefix` (вместо значка), `actions`, `empty`.

---

## BaseTransfer (задача new-transfer)

Перенос строк между двумя списками — «Доступно» и «Выбрано» — на BaseList. Строки — `items` (`ListItem` BaseList; компонент обобщённый). `v-model` — массив id в «Выбрано» в их порядке: перенесённые встают в конец, id без строки в `items` сохраняются. Подпись — `label` или `aria-label`.

```vue
<BaseTransfer v-model="memberIds" :items="employees" label="Участники проекта" is-searchable is-sortable @change="log" />
```

- Панели — BaseList `selection-mode="multiple"` (APG Listbox): стрелки, Home и End, пробел и Enter отмечают, Shift — подряд, Ctrl+A — все показанные. «Выбрать все» (с частичным состоянием) и счётчик «N из M» — по показанным доступным строкам; строки с `isDisabled` не отмечаются и не переносятся.
- Перенос — кнопками между панелями или **Ctrl (или Alt) + →** в «Доступно» и **Ctrl (или Alt) + ←** в «Выбрано». После клавиш фокус остаётся на том же месте списка (панель опустела — на перенесённую строку), после кнопки — на первую перенесённую строку. Перенос объявляется в `role="status"` («Перенесено в «Выбрано»: 2»); подсказка клавиш связана с панелью через `aria-describedby`. Перенесённые строки не остаются отмеченными.
- `is-searchable` — поиск над каждым списком по `title` и `description` без учёта регистра; свой — `filter-method(item, query)`. Переносятся только показанные отмеченные строки; ничего не найдено — «Ничего не найдено».
- `is-sortable` — перестановка в «Выбрано» мышью и Alt + ↑/↓ (как BaseList), меняет порядок `v-model`.
- `titles` — свои заголовки панелей, `height` — высота списков (по умолчанию 280px), `is-virtual` — тысячи строк, `empty-text`, `error`, `is-disabled`, `variant` (`default`, `soft`, `outline`, `ghost`), `size-scale`, `color`.
- Событие `change` — `{ to: 'target' | 'source', ids }`. Через `ref`: `transfer(to, ids?)` — перенести по id (по умолчанию — отмеченные), например для своей кнопки «Перенести всё».
- Слоты: `item` (данные строки BaseList и `side`), `empty` (`{ side }`). На узком экране (меньше 640px) панели идут друг под другом, стрелки кнопок — вниз и вверх.
