# Токены для дизайна: W3C Design Tokens, Figma и Style Dictionary

Токены кита (`--rise-*` из `src/styles/_tokens.scss`) и готовые темы (`THEME_PRESETS`) экспортируются в JSON формата [W3C Design Tokens](https://www.w3.org/community/design-tokens/) (`$value`, `$type`, группы). Файлы собирает `npm run build` (шаг `build:lib:tokens`, скрипт `scripts/build-tokens.mjs`), в npm-пакете они лежат в `dist/`. Зависимостей нет: `_tokens.scss` компилирует Sass, который уже есть в ките, значения считает свой код в `build/tokens/`.

## Файлы

| Файл | Подпуть пакета | Что внутри |
|---|---|---|
| `dist/tokens.json` | `@ramzes1385/rise-ui-kit/tokens.json` | Кит без темы: значения `_tokens.scss`, светлый режим |
| `dist/tokens/<тема>.light.json`, `dist/tokens/<тема>.dark.json` | `@ramzes1385/rise-ui-kit/tokens/<тема>.<режим>.json` | Тема и режим целиком; темы `rise`, `corporate`, `playful`, `minimal` |

Каждый файл полный и самодостаточный: палитры, семантические цвета, шрифты, размеры, скругления, тени, длительности, кривые, слои. Объединять файлы не нужно. `rise.light.json` по токенам равен `tokens.json` (тест это проверяет: пресет `rise` обязан совпадать с `_tokens.scss`).

```ts
import tokens from '@ramzes1385/rise-ui-kit/tokens.json' with { type: 'json' }
import corporateDark from '@ramzes1385/rise-ui-kit/tokens/corporate.dark.json' with { type: 'json' }
```

Значения темы считаются так, как их считает браузер на одном элементе с `data-theme` и `data-rise-theme`: палитры и статика из `_tokens.scss`, поверх них литералы темы (`createTheme(...).vars`, в тёмном режиме и `darkVars`), семантика режима, производные (`calc()`, `color-mix()`, плотность и сила теней).

## Имена токенов

Путь токена строится по имени переменной CSS; полное имя переменной лежит в `$extensions["rise-ui-kit"].cssVariable` каждого токена.

| Переменная | Путь | Тип |
|---|---|---|
| `--rise-color-primary-500`, `--rise-color-neutral-0` | `palette.primary.500`, `palette.neutral.0` | `color` |
| `--rise-bg`, `--rise-text-muted`, `--rise-border`, `--rise-primary`, `--rise-primary-soft`, `--rise-on-primary`, `--rise-overlay`, `--rise-focus-ring` | `color.bg`, `color.text-muted`, `color.border`, `color.primary`, `color.primary-soft`, `color.on-primary`, `color.overlay`, `color.focus-ring` | `color` |
| `--rise-chart-1`…`8`, `--rise-code-keyword`… | `chart.1`…, `code.keyword`… | `color` |
| `--rise-font-sans`, `-heading`, `-mono` | `font.family.sans`… | `fontFamily` (массив имён) |
| `--rise-font-size-sm`, `--rise-line-height-sm` | `font.size.sm`, `font.line-height.sm` | `dimension` |
| `--rise-font-weight-semibold` | `font.weight.semibold` | `fontWeight` |
| `--rise-radius`, `--rise-radius-md`, `--rise-radius-full` | `radius.base`, `radius.md`, `radius.full` | `dimension` |
| `--rise-control-padding-y`, `--rise-control-radius`… | `control.padding-y`, `control.radius`… | `dimension` |
| `--rise-density`, `--rise-shadow-strength` | `density`, `shadow.strength` | `number` |
| `--rise-shadow-md` | `shadow.md` | `shadow` (массив слоёв) |
| `--rise-disabled-opacity`, `--rise-z-toast` | `opacity.disabled`, `z-index.toast` | `number` |
| `--rise-duration-fast`, `--rise-duration`, `--rise-duration-loop` | `duration.fast`, `duration.base`, `duration.loop` | `duration` |
| `--rise-ease`, `--rise-ease-out` | `easing.base`, `easing.out` | `cubicBezier` |
| `--rise-media-backdrop`, `--rise-media-sheet` | `media.backdrop`, `media.sheet` | `color`, `gradient` |

Новая переменная без правила в `build/tokens/tokenMap.ts` ломает сборку и тест `tokensExport.spec.ts` с понятным сообщением: путь и тип нового токена задаются явно.

## Формат значений

- **Цвет** — HEX `#rrggbb`; с прозрачностью `#rrggbbaa` (прозрачность округлена до 1/255). `color-mix()` и `rgb(… / %)` посчитаны в sRGB, как в браузере.
- **Длины** — строка с единицей: `"6px"`. Выражения `calc()` вычислены (`--rise-radius-md` у `corporate` — `"3px"`).
- **Тень** — массив слоёв `{ color, offsetX, offsetY, blur, spread }`; прозрачность = доля режима × сила теней темы (у `minimal` — `#00000000`).
- **Градиент** — массив остановок `{ color, position }` (позиция от 0 до 1); угол и запись CSS целиком — в `$extensions["rise-ui-kit"].css`.
- **Кривая** — четыре числа (`linear` → `[0, 0, 1, 1]`), **длительность** — `"150ms"`, **шрифт** — массив имён без кавычек.
- **Ссылки** — семантические токены, у которых в CSS значение — `var(--rise-…)`, в JSON ссылки: `color.bg` → `"{palette.neutral.0}"`. Тёмный режим меняет, на какой оттенок ссылается токен (`color.primary` светлой темы — `{palette.primary.700}`, тёмной — `{palette.primary.400}`).

## Что в экспорт не входит

- Алиасы 1.x (`--color-*`, `--font-family-*`, `--shadow-*`…): устаревшие имена, в новом коде их нет.
- Шрифтовые стеки `:lang(ja)`: токены описывают язык по умолчанию.
- Токены компонентов (`--rise-button-radius`, `--rise-card-shadow`…, [COMPONENT_TOKENS.md](./COMPONENT_TOKENS.md)): кит их только читает, значений по умолчанию в `_tokens.scss` у них нет.
- Тема приложения из `createTheme({ ... })`: экспорт собирается при сборке кита и знает только четыре пресета (FOLLOW_UPS, задача w16-security-tokens).
- `prefers-reduced-motion`: правило обнуляет длительности на лету, в файле значения обычного режима (у темы `minimal` с `motion: 'none'` длительности `0.01ms` и в файле).

## Figma: Tokens Studio

1. Установите в Figma плагин [Tokens Studio for Figma](https://tokens.studio/).
2. Добавьте токены в проект. Файл берётся из пакета (`node_modules/@ramzes1385/rise-ui-kit/dist/tokens/corporate.light.json`) или из репозитория приложения; для постоянной синхронизации положите файлы в репозиторий и подключите его в настройках синхронизации плагина.
3. Включите формат W3C DTCG в настройках плагина: файлы используют поля `$value` и `$type`, а не `value` и `type`.
4. Один файл — один набор токенов (token set). Для светлой и тёмной темы создайте два набора из `<тема>.light.json` и `<тема>.dark.json` и свяжите их с режимами Figma (Themes в Tokens Studio, при желании — переменные Figma). Файлы полные: вместе с ними базовый `tokens.json` подключать не нужно.
5. Ссылки (`{palette.neutral.0}`) плагин разворачивает сам. Если версия плагина не понимает тип `gradient` или массив слоёв тени, эти токены останутся в наборе, но Figma их не применит: проверьте на своей версии.

Названия пунктов меню зависят от версии плагина. Формат файлов проверен тестом (`build/tests/tokensExport.spec.ts`: структура, типы, значения, ссылки); в самом Figma экспорт не открывался.

## Style Dictionary

Style Dictionary 4 читает формат DTCG (`$value`, `$type`) без настройки. Установите его в своём проекте (в ките его нет).

```js
// style-dictionary.config.mjs
import StyleDictionary from 'style-dictionary'

StyleDictionary.registerTransform({
  name: 'name/rise-css-variable',
  type: 'name',
  transform: token => token.$extensions['rise-ui-kit'].cssVariable.slice(2),
})

export default {
  source: ['node_modules/@ramzes1385/rise-ui-kit/dist/tokens/corporate.light.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['name/rise-css-variable'],
      buildPath: 'build/',
      files: [{ destination: 'tokens.css', format: 'css/variables' }],
    },
  },
}
```

- Имена переменных берутся из `cssVariable`: на выходе те же `--rise-…`, что в ките. Без своего преобразования имя собирается из пути (`color-bg`) — тогда задайте `prefix: 'app'` и стройте код под них.
- Группа `css` переводит `px` в `rem` (преобразование `size/rem`); если нужны пиксели, соберите свою группу без него.
- Тёмный режим — вторая платформа с `source` на `…dark.json` и `options: { selector: '[data-theme="dark"]' }`.
- Для iOS, Android и Compose используйте стандартные группы преобразований Style Dictionary; тени и градиенты зависят от версии и формата платформы.

Пример не запускался: Style Dictionary в ките нет и добавлять его ради документа нельзя. Проверяйте результат на своей версии.

## Как это устроено

- `build/tokens/readTokensScss.ts` компилирует `_tokens.scss` Sass и читает блоки `:root` (палитры и статика), светлую и тёмную семантику и производные значения.
- `build/tokens/cssValue.ts` считает `var()`, `calc()` и `color-mix(in srgb)`; незнакомая запись — исключение, а не неверное значение.
- `build/tokens/tokenMap.ts` задаёт путь и тип токена по имени и переводит значение CSS в значение токена.
- `build/tokens/buildTokens.ts` собирает документы тем и режимов; `scripts/build-tokens.mjs` загружает темы через Vite (код тем импортирует по алиасам) и пишет файлы в `dist/`.
- `build/tests/tokensExport.spec.ts`: каждая переменная `--rise-*` из `_tokens.scss` есть в каждом файле, структура W3C, значения совпадают с `createTheme` для `rise`, `corporate`, `minimal` в обоих режимах.
