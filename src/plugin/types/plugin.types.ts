import type { LocaleInput } from '../../locales/types/locales.types'
import type { IconMap } from '../../composables/app/useIcon/types/useIcon.types'
import type { LinkComponent } from '../../composables/interaction/useLink/types/useLink.types'
import type { UiKitDefaults } from '../../composables/base/useDefaults/types/useDefaults.types'
import type { Theme, ThemePresetName } from '../../utils/theme/themeUtils/types/themeUtils.types'
import type { TeleportTarget } from '../../composables/app/useTeleportTarget/types/useTeleportTarget.types'
import type { MotionPreset, ReducedMotionMode } from '../../composables/app/useMotion/types/useMotion.types'

/** Настройки кита без регистрации компонентов: `createUiKitConfig(options)` и основа `createUiKitPlugin`. */
export interface UiKitConfigOptions {
	/**
	 * Путь к SVG-спрайту иконок (например '/assets/icons.svg' или URL из импорта '…/icons.svg?url').
	 * По умолчанию 'icons.svg' — относительный путь, который на вложенных маршрутах SPA резолвится неверно.
	 */
	iconSpritePath?: string
	/**
	 * Значения props по умолчанию: `global` — для всех компонентов, по имени компонента — для него.
	 * Например `{ global: { sizeScale: 90 }, BaseButton: { variant: 'soft' } }`. Переопределяются props,
	 * у которых в компоненте есть значение по умолчанию (строки, числа, логические значения)
	 */
	defaults?: UiKitDefaults
	/** Замена иконок кита своими: имя символа в спрайте, полный адрес символа или компонент с `<svg>` */
	icons?: IconMap
	/**
	 * Компонент ссылок на маршруты приложения (RouterLink, NuxtLink). Без него компоненты берут RouterLink,
	 * если подключён vue-router, иначе рендерят `<a href>`
	 */
	linkComponent?: LinkComponent
	/**
	 * Язык кита: `ru` (по умолчанию), `en` или свой словарь из `defineLocale()`. Меняет строки интерфейса,
	 * формат дат и чисел, первый день недели в календаре. Язык один на страницу
	 */
	locale?: LocaleInput
	/**
	 * Куда телепортировать окна, выпадающие панели, тултипы и уведомления: CSS-селектор или элемент.
	 * По умолчанию `body`. Свой контейнер нужен, например, в полноэкранном режиме
	 */
	teleportTo?: TeleportTarget
	/**
	 * Тема приложения: имя пресета (`'corporate'`, `'playful'`, `'minimal'`, `'rise'`) или тема из `createTheme()`.
	 * Ставится на `<html>` при установке плагина; переключение — `useTheme().setTheme()`. При SSR — `useTheme().css`
	 */
	theme?: Theme | ThemePresetName
	/** Свои темы из `createTheme()`: выбираются по имени через `useTheme().setTheme(name)` */
	themes?: Theme[]
	/** CSP nonce для `<style>` тем, которые вставляет кит */
	themeNonce?: string
	/**
	 * Пресет движения всей страницы: `none`, `subtle`, `standard` (сегодняшние значения), `expressive`. Ставит атрибут
	 * `data-rise-motion` на `<html>`, если его там ещё нет; на любой области страницы пресет меняется тем же атрибутом.
	 * Без опции — `standard`
	 */
	motion?: MotionPreset
	/**
	 * `user` (по умолчанию) — системная настройка «уменьшить движение» главнее пресета; `always` — движение выключено
	 * всегда (киоски, тесты): атрибут `data-rise-reduced-motion="always"` на `<html>`. Отключить системную настройку нельзя
	 */
	reducedMotion?: ReducedMotionMode
}

/** Настройки `createUiKitPlugin`: те же, что у `createUiKitConfig`, и префикс имён глобально зарегистрированных компонентов. */
export interface UiKitPluginOptions extends UiKitConfigOptions {
	/** Префикс для глобальных имён компонентов. */
	prefix?: string
}
