import type { App, Component, Plugin } from 'vue'
import { defineAsyncComponent } from 'vue'

// Точечные импорты обходят top-level barrel src/components/index.ts —
// иначе sub-barrel ./components/BaseChat/index.ts тянул бы тяжёлый BaseChat.vue
// статически через цепочку re-export, ломая физический split на async-чанки
// (см. defineAsyncComponent ниже и HEAVY_APP_CHUNKS в build/config/build.ts).
import { BaseAccordion } from './components/BaseAccordion'
import { BaseAlert } from './components/BaseAlert'
import { BaseAnimation } from './components/BaseAnimation'
import { BaseAvatar } from './components/BaseAvatar'
import { BaseBadge } from './components/BaseBadge'
import { BaseBreadcrumbs } from './components/BaseBreadcrumbs'
import { BaseButton } from './components/BaseButton'
import { BaseCard } from './components/BaseCard'
import { BaseCheckbox } from './components/BaseCheckbox'
import { BaseChip } from './components/BaseChip'
import { BaseColorPicker } from './components/BaseColorPicker'
import { BaseDropdown } from './components/BaseDropdown'
import { BaseEmpty } from './components/BaseEmpty'
import { BaseForm } from './components/BaseForm'
import { BaseFormField } from './components/BaseFormField'
import { BaseIcon } from './components/BaseIcon'
import { BaseImage } from './components/BaseImage'
import { BaseInput } from './components/BaseInput'
import { BaseLoader } from './components/BaseLoader'
import { BaseMegaMenu } from './components/BaseMegaMenu'
import { BaseMenu } from './components/BaseMenu'
import { BaseModal } from './components/BaseModal'
import { BaseNotification } from './components/BaseNotification'
import { BasePagination } from './components/BasePagination'
import { BasePin } from './components/BasePin'
import { BasePopover } from './components/BasePopover'
import { BaseProgress } from './components/BaseProgress'
import { BaseRadio } from './components/BaseRadio'
import { BaseRange } from './components/BaseRange'
import { BaseRating } from './components/BaseRating'
import { BaseSearch } from './components/BaseSearch'
import { BaseSelect } from './components/BaseSelect'
import { BaseSeparator } from './components/BaseSeparator'
import { BaseSideBar } from './components/BaseSideBar'
import { BaseSkeleton } from './components/BaseSkeleton'
import { BaseSlideover } from './components/BaseSlideover'
import { BaseSlider } from './components/BaseSlider'
import { BaseStepper } from './components/BaseStepper'
import { BaseSwitch } from './components/BaseSwitch'
import { BaseTabs } from './components/BaseTabs'
import { BaseText } from './components/BaseText'
import { BaseTextarea } from './components/BaseTextarea'
import { BaseTooltip } from './components/BaseTooltip'
import { BaseTour } from './components/BaseTour'
import { BaseTree } from './components/BaseTree'

// Тяжёлые компоненты — ленивая загрузка через async-чанки (см. §5.2 plans/stage-5-code-splitting.md)
const BaseChat = defineAsyncComponent(() => import('./components/BaseChat/BaseChat.vue'))
const BaseEditor = defineAsyncComponent(() => import('./components/BaseEditor/BaseEditor.vue'))
const BaseDatePicker = defineAsyncComponent(() => import('./components/BaseDatePicker/BaseDatePicker.vue'))
const BaseCalendar = defineAsyncComponent(() => import('./components/BaseCalendar/BaseCalendar.vue'))
const BaseTable = defineAsyncComponent(() => import('./components/BaseTable/BaseTable.vue'))
const BaseFileUpload = defineAsyncComponent(() => import('./components/BaseFileUpload/BaseFileUpload.vue'))

export interface UiKitPluginOptions {
	/** Префикс для глобальных имён компонентов. */
	prefix?: string
}

const UI_COMPONENTS: Record<string, Component> = {
	BaseAccordion,
	BaseAlert,
	BaseAnimation,
	BaseAvatar,
	BaseBadge,
	BaseBreadcrumbs,
	BaseButton,
	BaseCalendar,
	BaseCard,
	BaseChat,
	BaseCheckbox,
	BaseChip,
	BaseColorPicker,
	BaseDatePicker,
	BaseDropdown,
	BaseEditor,
	BaseEmpty,
	BaseFileUpload,
	BaseForm,
	BaseFormField,
	BaseIcon,
	BaseImage,
	BaseInput,
	BaseLoader,
	BaseMegaMenu,
	BaseMenu,
	BaseModal,
	BaseNotification,
	BasePagination,
	BasePin,
	BasePopover,
	BaseProgress,
	BaseRadio,
	BaseRange,
	BaseRating,
	BaseSearch,
	BaseSelect,
	BaseSeparator,
	BaseSideBar,
	BaseSkeleton,
	BaseSlideover,
	BaseSlider,
	BaseStepper,
	BaseSwitch,
	BaseTable,
	BaseTabs,
	BaseText,
	BaseTextarea,
	BaseTooltip,
	BaseTour,
	BaseTree,
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
		},
	}
}

export const uiKitPlugin = createUiKitPlugin()

export { UI_COMPONENTS }

export default uiKitPlugin
