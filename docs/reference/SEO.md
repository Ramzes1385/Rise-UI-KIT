# SEO-разметка schema.org

Компоненты кита умеют выводить разметку [schema.org](https://schema.org) в формате JSON-LD — её читают Google и Яндекс. Разметка включается пропом `seo`, по умолчанию её нет.

## Как включить

```vue
<BaseBreadcrumbs :items="items" seo />

<BaseRating
	:model-value="4.6"
	is-readonly
	:seo="{ data: { itemReviewed: { '@type': 'Product', name: 'Ноутбук Rise 13' }, ratingCount: 128 } }" />

<BaseFooter :seo="{ data: { name: 'Rise Studio', url: 'https://example.com', logo: 'https://example.com/logo.png' } }" />
```

- `seo` — `true`: поля собираются из пропсов компонента.
- `seo` — объект: `data` — свои поля поверх собранных (кастомное SEO): вложенные объекты сливаются, списки и значения заменяются, `null` убирает поле, `@type` можно заменить на подтип (`Organization` → `LocalBusiness`, `WebPage` → `BlogPosting`). `baseUrl` — адрес сайта: относительные ссылки (`/catalog`) становятся абсолютными (`https://example.com/catalog`), как того ждут поисковики.
- Для всего приложения — настройкой плагина: `createUiKitPlugin({ defaults: { BaseBreadcrumbs: { seo: { baseUrl: 'https://example.com' } } } })`.
- Разметка — тег `<script type="application/ld+json">` внутри корня компонента. На сервере (SSR) и в браузере она одинакова; `<`, `>` и `&` в данных экранированы, строка `</script>` тег не закроет.
- В разработке (`process.env.NODE_ENV !== 'production'`) кит предупреждает в консоли о недостающих обязательных полях: `[rise-ui-kit] BaseRating: в SEO-разметке AggregateRating нет обязательных полей: ratingCount|reviewCount, itemReviewed.name`. `a|b` — достаточно одного из полей. В production предупреждений нет.

## Компоненты

| Компонент | Тип schema.org | Из пропсов | Нужно добавить в `seo.data` |
|---|---|---|---|
| BaseBreadcrumbs | `BreadcrumbList` | весь путь `items` (и свёрнутые `maxItems`): `name` — `label`, `item` — `href` или `to`, у текущей страницы `item` нет | — |
| BaseAccordion | `FAQPage` | вопрос — `label`, ответ — `seoAnswer` пункта или `content` | ответ пункта, если содержимое в слоте, — лучше полем `seoAnswer` |
| BaseRating | `AggregateRating` | `ratingValue` — `modelValue`, `bestRating` — `max` | `itemReviewed` (что оценивают, с `name`), `ratingCount` или `reviewCount` |
| BaseMediaPlayer | `VideoObject` (`mode="audio"` — `AudioObject`) | `name` — `title` и серия, `thumbnailUrl` — `poster`, `contentUrl` — первый источник | `uploadDate`; желательно `description`, `duration` (ISO 8601, `PT1M30S`) |
| BaseImage | `ImageObject` | `contentUrl` — `src`, `caption` — `alt` | один из `creator`, `creditText`, `copyrightNotice`, `license` |
| BaseUser | `Person` | `name`, `description`, `image` — `src`, `url` — `href` или `to` | по желанию `jobTitle`, `worksFor`, `sameAs` |
| BaseFooter | `Organization` | — | `name`; желательно `url`, `logo`, `sameAs`, `contactPoint` |
| BaseCommentThread | `WebPage` с `comment` и `commentCount` | каждый комментарий — `Comment`: `text`, `datePublished`, `author` (`Person`), `upvoteCount`, ответы — `comment` | для статьи — `@type: 'Article'` или `'BlogPosting'`, `headline`, `author`, `datePublished` |
| BaseMap | `Place` | одна метка — её `title` и `geo`; несколько — `ariaLabel`, `geo` из `center`, метки в `containsPlace` | `address` (`PostalAddress`), `telephone`; при нескольких метках — их `title` |

Microdata (`itemscope`, `itemprop`) кит не выводит: одна и та же сущность в двух форматах даёт дубли в валидаторах.

Не всякая разметка даёт расширенный сниппет: FAQ Google показывает только авторитетным сайтам, `Comment` и `Place` без `LocalBusiness` расширенного результата не имеют. Валидаторы при этом не находят в них ошибок, а поисковики используют разметку для понимания страницы.

## Как проверить

Разметку видно в Storybook: у каждого компонента из таблицы есть история «Seo» — под примером блок с JSON-LD, «Show code» даёт точный код примера.

### Google — Rich Results Test

1. Откройте [search.google.com/test/rich-results](https://search.google.com/test/rich-results?hl=ru).
2. Страница уже опубликована — вкладка «URL», адрес страницы. Страница на локальной машине или за авторизацией — вкладка «Код»: вставьте HTML страницы (в браузере — «Просмотр кода страницы» при SSR или `document.documentElement.outerHTML` в консоли при рендере в браузере) или только содержимое `<script type="application/ld+json">`.
3. «Проверить код». В результатах — найденные элементы (`Навигационная цепочка`, `Часто задаваемые вопросы`, `Видео`, `Фрагменты с отзывами`, `Метаданные изображения`…). Ошибки (красные) блокируют расширенный результат; предупреждения (жёлтые) — необязательные поля, которые стоит добавить через `seo.data`.
4. Типы без расширенных результатов (`WebPage` с комментариями, `Place`, `Person`) Rich Results Test покажет как «не найдены» — для них пользуйтесь [validator.schema.org](https://validator.schema.org): тот же ввод URL или кода, там видны все сущности и ошибки синтаксиса.

Google Search Console после публикации покажет разметку по всему сайту: раздел «Улучшения» (и «Видео», «Навигационные цепочки»).

### Яндекс — Вебмастер

1. Откройте [webmaster.yandex.ru/tools/microtest/](https://webmaster.yandex.ru/tools/microtest/) («Инструменты» → «Валидатор микроразметки»). Вход через Яндекс ID; сайт добавлять не обязательно.
2. Вставьте URL страницы или её HTML-код и нажмите «Проверить».
3. В результатах — блок JSON-LD с разобранными сущностями schema.org; ошибки и неизвестные поля подсвечены. Яндекс разбирает все типы из таблицы, включая `Comment` и `Place`.

После публикации и подтверждения прав на сайт в Вебмастере — «Представление в поиске» → «Сниппеты» показывает, что Яндекс нашёл на страницах.

### Что проверить

- Адреса абсолютные: задайте `seo.baseUrl` или передавайте полные URL.
- Нет предупреждений `[rise-ui-kit]` в консоли разработки.
- Одна сущность — один раз на странице: например, `Organization` — в одном подвале, а не в каждом компоненте.
