import { defineAsyncComponent } from 'vue'
// Точечные импорты обходят top-level barrel src/components/index.ts —
// иначе sub-barrel ./components/BaseChat/index.ts тянул бы тяжёлый BaseChat.vue
// статически через цепочку re-export, ломая физический split на async-чанки
// (см. defineAsyncComponent ниже и HEAVY_APP_CHUNKS в build/config/build.ts).
import { BaseAccordion } from './components/BaseAccordion'
import { BaseAlert } from './components/BaseAlert'
import { BaseAnimation } from './components/BaseAnimation'
import { BaseApp } from './components/BaseApp'
import { BaseAutocomplete } from './components/BaseAutocomplete'
import { BaseAvatar } from './components/BaseAvatar'
import { BaseAvatarGroup } from './components/BaseAvatarGroup'
import { BaseBackTop } from './components/BaseBackTop'
import { BaseBadge } from './components/BaseBadge'
import { BaseBreadcrumbs } from './components/BaseBreadcrumbs'
import { BaseButton } from './components/BaseButton'
import { BaseButtonGroup } from './components/BaseButtonGroup'
import { BaseCard } from './components/BaseCard'
import { BaseCheckbox } from './components/BaseCheckbox'
import { BaseCheckboxGroup } from './components/BaseCheckboxGroup'
import { BaseChip } from './components/BaseChip'
import { BaseColorModeButton } from './components/BaseColorModeButton'
import { BaseColorPicker } from './components/BaseColorPicker'
import { BaseConfirm } from './components/BaseConfirm'
import { BaseContainer } from './components/BaseContainer'
import { BaseContextMenu } from './components/BaseContextMenu'
import { BaseDrawer } from './components/BaseDrawer'
import { BaseDropdown } from './components/BaseDropdown'
import { BaseDropdownMenu } from './components/BaseDropdownMenu'
import { BaseEmpty } from './components/BaseEmpty'
import { BaseFab } from './components/BaseFab'
import { BaseFooter } from './components/BaseFooter'
import { BaseForm } from './components/BaseForm'
import { BaseFormField } from './components/BaseFormField'
import { BaseHeader } from './components/BaseHeader'
import { BaseIcon } from './components/BaseIcon'
import { BaseImage } from './components/BaseImage'
import { BaseInfiniteScroll } from './components/BaseInfiniteScroll'
import { BaseInplace } from './components/BaseInplace'
import { BaseInput } from './components/BaseInput'
import { BaseInputNumber } from './components/BaseInputNumber'
import { BaseInputTags } from './components/BaseInputTags'
import { BaseKbd } from './components/BaseKbd'
import { BaseLayout } from './components/BaseLayout'
import { BaseLink } from './components/BaseLink'
import { BaseLoader } from './components/BaseLoader'
import { BaseMegaMenu } from './components/BaseMegaMenu'
import { BaseMenu } from './components/BaseMenu'
import { BaseModal } from './components/BaseModal'
import { BaseNotification } from './components/BaseNotification'
import { BasePagination } from './components/BasePagination'
import { BasePin } from './components/BasePin'
import { BasePopconfirm } from './components/BasePopconfirm'
import { BasePopover } from './components/BasePopover'
import { BaseProgress } from './components/BaseProgress'
import { BaseRadio } from './components/BaseRadio'
import { BaseRange } from './components/BaseRange'
import { BaseRating } from './components/BaseRating'
import { BaseScrollArea } from './components/BaseScrollArea'
import { BaseSearch } from './components/BaseSearch'
import { BaseSegmented } from './components/BaseSegmented'
import { BaseSelect } from './components/BaseSelect'
import { BaseSeparator } from './components/BaseSeparator'
import { BaseSideBar } from './components/BaseSideBar'
import { BaseSkeleton } from './components/BaseSkeleton'
import { BaseSlideover } from './components/BaseSlideover'
import { BaseSlider } from './components/BaseSlider'
import { BaseSplitButton } from './components/BaseSplitButton'
import { BaseSplitter } from './components/BaseSplitter'
import { BaseStepper } from './components/BaseStepper'
import { BaseSwitch } from './components/BaseSwitch'
import { BaseTabs } from './components/BaseTabs'
import { BaseText } from './components/BaseText'
import { BaseTextarea } from './components/BaseTextarea'
import { BaseTimeline } from './components/BaseTimeline'
import { BaseTimePicker } from './components/BaseTimePicker'
import { BaseToolbar } from './components/BaseToolbar'
import { BaseTooltip } from './components/BaseTooltip'
import { BaseTour } from './components/BaseTour'
import { BaseTree } from './components/BaseTree'
import { BaseUser } from './components/BaseUser'
import { BaseVirtualList } from './components/BaseVirtualList'
import { DEFAULTS_KEY } from './composables/useDefaults/useDefaults'
import { ICON_MAP_KEY, ICON_SPRITE_PATH_KEY } from './composables/useIcon/useIcon'
import { LINK_COMPONENT_KEY } from './composables/useLink/useLink'
import { TELEPORT_TARGET_KEY } from './composables/useTeleportTarget/useTeleportTarget'
import { setLocale } from './locales/state'
import type { UiKitDefaults } from './composables/useDefaults/useDefaults.types'
import type { IconMap } from './composables/useIcon/useIcon.types'
import type { LinkComponent } from './composables/useLink/useLink.types'
import type { TeleportTarget } from './composables/useTeleportTarget/useTeleportTarget'
import type { LocaleInput } from './locales/state'
import type { App, Component, Plugin } from 'vue'

// Тяжёлые компоненты — ленивая загрузка через async-чанки (см. §5.2 plans/stage-5-code-splitting.md)
const BaseChat = defineAsyncComponent(() => import('./components/BaseChat/ui/BaseChat.vue'))
const BaseEditor = defineAsyncComponent(() => import('./components/BaseEditor/ui/BaseEditor.vue'))
const BaseDatePicker = defineAsyncComponent(() => import('./components/BaseDatePicker/ui/BaseDatePicker.vue'))
const BaseCalendar = defineAsyncComponent(() => import('./components/BaseCalendar/ui/BaseCalendar.vue'))
const BaseTable = defineAsyncComponent(() => import('./components/BaseTable/ui/BaseTable.vue'))
const BaseFileUpload = defineAsyncComponent(() => import('./components/BaseFileUpload/ui/BaseFileUpload.vue'))

export interface UiKitPluginOptions {
	/** Префикс для глобальных имён компонентов. */
	prefix?: string
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
}

const UI_COMPONENTS: Record<string, Component> = {
	BaseAccordion,
	BaseAlert,
	BaseAnimation,
	BaseApp,
	BaseAutocomplete,
	BaseAvatar,
	BaseAvatarGroup,
	BaseBackTop,
	BaseBadge,
	BaseBreadcrumbs,
	BaseButton,
	BaseButtonGroup,
	BaseCalendar,
	BaseCard,
	BaseChat,
	BaseCheckbox,
	BaseCheckboxGroup,
	BaseChip,
	BaseColorModeButton,
	BaseColorPicker,
	BaseConfirm,
	BaseContainer,
	BaseContextMenu,
	BaseDatePicker,
	BaseDrawer,
	BaseDropdown,
	BaseDropdownMenu,
	BaseEditor,
	BaseEmpty,
	BaseFab,
	BaseFileUpload,
	BaseFooter,
	BaseForm,
	BaseFormField,
	BaseHeader,
	BaseIcon,
	BaseImage,
	BaseInfiniteScroll,
	BaseInplace,
	BaseInput,
	BaseInputNumber,
	BaseInputTags,
	BaseKbd,
	BaseLayout,
	BaseLink,
	BaseLoader,
	BaseMegaMenu,
	BaseMenu,
	BaseModal,
	BaseNotification,
	BasePagination,
	BasePin,
	BasePopconfirm,
	BasePopover,
	BaseProgress,
	BaseRadio,
	BaseRange,
	BaseRating,
	BaseScrollArea,
	BaseSearch,
	BaseSegmented,
	BaseSelect,
	BaseSeparator,
	BaseSideBar,
	BaseSkeleton,
	BaseSlideover,
	BaseSlider,
	BaseSplitButton,
	BaseSplitter,
	BaseStepper,
	BaseSwitch,
	BaseTable,
	BaseTabs,
	BaseText,
	BaseTextarea,
	BaseTimePicker,
	BaseTimeline,
	BaseToolbar,
	BaseTooltip,
	BaseTour,
	BaseTree,
	BaseUser,
	BaseVirtualList,
}

function getName(name: string, prefix?: string): string {
	if (!prefix) return name
	return `${prefix}${name}`
}

function installItems(app: App, options?: UiKitPluginOptions): void {
	Object.entries(UI_COMPONENTS).forEach(([name, component]) => {
		app.component(getName(name, options?.prefix), component)
	})
}

export function createUiKitPlugin(options?: UiKitPluginOptions): Plugin {
	return {
		install(app: App): void {
			installItems(app, options)
			if (options?.iconSpritePath) app.provide(ICON_SPRITE_PATH_KEY, options.iconSpritePath)
			if (options?.defaults) app.provide(DEFAULTS_KEY, options.defaults)
			if (options?.icons) app.provide(ICON_MAP_KEY, options.icons)
			if (options?.linkComponent) app.provide(LINK_COMPONENT_KEY, options.linkComponent)
			if (options?.locale) setLocale(options.locale)
			if (options?.teleportTo) app.provide(TELEPORT_TARGET_KEY, options.teleportTo)
		},
	}
}

export const uiKitPlugin = createUiKitPlugin()

export { UI_COMPONENTS }

export default uiKitPlugin
