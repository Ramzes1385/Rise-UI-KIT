import { defineAsyncComponent } from 'vue'
import { setLocale } from '../locales/state'
import { BaseApp } from '../components/BaseApp'
import { BaseFab } from '../components/BaseFab'
import { BaseKbd } from '../components/BaseKbd'
import { BasePin } from '../components/BasePin'
import { BaseCard } from '../components/BaseCard'
import { BaseChip } from '../components/BaseChip'
import { BaseForm } from '../components/BaseForm'
import { BaseIcon } from '../components/BaseIcon'
import { BaseLink } from '../components/BaseLink'
import { BaseMenu } from '../components/BaseMenu'
import { BaseTabs } from '../components/BaseTabs'
import { BaseText } from '../components/BaseText'
import { BaseTour } from '../components/BaseTour'
import { BaseTree } from '../components/BaseTree'
import { BaseUser } from '../components/BaseUser'
import type { App, Component, Plugin } from 'vue'
import { BaseAlert } from '../components/BaseAlert'
import { BaseBadge } from '../components/BaseBadge'
import { BaseEmpty } from '../components/BaseEmpty'
import { BaseImage } from '../components/BaseImage'
import { BaseInput } from '../components/BaseInput'
import { BaseModal } from '../components/BaseModal'
import { BaseRadio } from '../components/BaseRadio'
import { BaseRange } from '../components/BaseRange'
import { BaseAvatar } from '../components/BaseAvatar'
import { BaseButton } from '../components/BaseButton'
import { BaseDrawer } from '../components/BaseDrawer'
import { BaseFooter } from '../components/BaseFooter'
import { BaseHeader } from '../components/BaseHeader'
import { BaseKanban } from '../components/BaseKanban'
import { BaseLayout } from '../components/BaseLayout'
import { BaseLoader } from '../components/BaseLoader'
import { BaseRating } from '../components/BaseRating'
import { BaseSearch } from '../components/BaseSearch'
import { BaseSelect } from '../components/BaseSelect'
import { BaseSlider } from '../components/BaseSlider'
import { BaseSwitch } from '../components/BaseSwitch'
import { BaseBackTop } from '../components/BaseBackTop'
import { BaseConfirm } from '../components/BaseConfirm'
import { BaseHeatmap } from '../components/BaseHeatmap'
import { BaseInplace } from '../components/BaseInplace'
import { BaseMention } from '../components/BaseMention'
import { BasePopover } from '../components/BasePopover'
import { BaseSideBar } from '../components/BaseSideBar'
import { BaseStepper } from '../components/BaseStepper'
import { BaseToolbar } from '../components/BaseToolbar'
import { BaseTooltip } from '../components/BaseTooltip'
import { BaseCheckbox } from '../components/BaseCheckbox'
import { BaseDropdown } from '../components/BaseDropdown'
import { BaseMarkdown } from '../components/BaseMarkdown'
import { BaseMegaMenu } from '../components/BaseMegaMenu'
import { BasePieChart } from '../components/BasePieChart'
import { BaseProgress } from '../components/BaseProgress'
import { BaseSkeleton } from '../components/BaseSkeleton'
import { BaseSplitter } from '../components/BaseSplitter'
import { BaseTextarea } from '../components/BaseTextarea'
import { BaseTextDiff } from '../components/BaseTextDiff'
import { BaseTimeline } from '../components/BaseTimeline'
import { BaseToolCall } from '../components/BaseToolCall'
import { BaseWaveform } from '../components/BaseWaveform'
// Точечные импорты обходят top-level barrel src/components/index.ts —
// иначе sub-barrel ./components/BaseChat/index.ts тянул бы тяжёлый BaseChat.vue
// статически через цепочку re-export, ломая физический split на async-чанки
// (см. defineAsyncComponent ниже и HEAVY_APP_CHUNKS в build/config/build.ts).
import { BaseAccordion } from '../components/BaseAccordion'
import { BaseAiMessage } from '../components/BaseAiMessage'
import { BaseAnimation } from '../components/BaseAnimation'
import { BaseChecklist } from '../components/BaseChecklist'
import { BaseContainer } from '../components/BaseContainer'
import { BaseFormField } from '../components/BaseFormField'
import { BaseInputTags } from '../components/BaseInputTags'
import { BaseReasoning } from '../components/BaseReasoning'
import { BaseSegmented } from '../components/BaseSegmented'
import { BaseSeparator } from '../components/BaseSeparator'
import { BaseSlideover } from '../components/BaseSlideover'
import { BaseSparkline } from '../components/BaseSparkline'
import { BaseJsonViewer } from '../components/BaseJsonViewer'
import { BaseMoneyInput } from '../components/BaseMoneyInput'
import { BasePagination } from '../components/BasePagination'
import { BasePhoneInput } from '../components/BasePhoneInput'
import { BasePopconfirm } from '../components/BasePopconfirm'
import { BaseScrollArea } from '../components/BaseScrollArea'
import { BaseTimePicker } from '../components/BaseTimePicker'
import type { UiKitPluginOptions } from './types/plugin.types'
import { BaseAudioPlayer } from '../components/BaseAudioPlayer'
import { BaseAvatarGroup } from '../components/BaseAvatarGroup'
import { BaseBreadcrumbs } from '../components/BaseBreadcrumbs'
import { BaseButtonGroup } from '../components/BaseButtonGroup'
import { BaseColorPicker } from '../components/BaseColorPicker'
import { BaseContextMenu } from '../components/BaseContextMenu'
import { BaseEmojiPicker } from '../components/BaseEmojiPicker'
import { BaseInputNumber } from '../components/BaseInputNumber'
import { BasePromptInput } from '../components/BasePromptInput'
import { BaseSplitButton } from '../components/BaseSplitButton'
import { BaseVirtualList } from '../components/BaseVirtualList'
import { BaseAddressInput } from '../components/BaseAddressInput'
import { BaseAutocomplete } from '../components/BaseAutocomplete'
import { BaseDropdownMenu } from '../components/BaseDropdownMenu'
import { BaseImageCompare } from '../components/BaseImageCompare'
import { BaseNotification } from '../components/BaseNotification'
import { BaseCheckboxGroup } from '../components/BaseCheckboxGroup'
import { BaseFilterBuilder } from '../components/BaseFilterBuilder'
import { BaseVoiceRecorder } from '../components/BaseVoiceRecorder'
import { BaseCommandPalette } from '../components/BaseCommandPalette'
import { BaseInfiniteScroll } from '../components/BaseInfiniteScroll'
import { BaseRequisiteInput } from '../components/BaseRequisiteInput'
import { BaseSubtitleEditor } from '../components/BaseSubtitleEditor'
import { BaseColorModeButton } from '../components/BaseColorModeButton'
import { DEFAULTS_KEY } from '../composables/base/useDefaults/useDefaults'
import { LINK_COMPONENT_KEY } from '../composables/interaction/useLink/useLink'
import { ICON_MAP_KEY, ICON_SPRITE_PATH_KEY } from '../composables/app/useIcon/useIcon'
import { TELEPORT_TARGET_KEY } from '../composables/app/useTeleportTarget/useTeleportTarget'

// Тяжёлые компоненты — ленивая загрузка через async-чанки (см. §5.2 plans/stage-5-code-splitting.md)
const BaseChat = defineAsyncComponent(() => import('../components/BaseChat/ui/BaseChat.vue'))
const BaseEditor = defineAsyncComponent(() => import('../components/BaseEditor/ui/BaseEditor.vue'))
const BaseDatePicker = defineAsyncComponent(() => import('../components/BaseDatePicker/ui/BaseDatePicker.vue'))
const BaseCalendar = defineAsyncComponent(() => import('../components/BaseCalendar/ui/BaseCalendar.vue'))
const BaseTable = defineAsyncComponent(() => import('../components/BaseTable/ui/BaseTable.vue'))
const BaseFileUpload = defineAsyncComponent(() => import('../components/BaseFileUpload/ui/BaseFileUpload.vue'))

const UI_COMPONENTS: Record<string, Component> = {
	BaseAccordion,
	BaseAddressInput,
	BaseAiMessage,
	BaseAlert,
	BaseAnimation,
	BaseApp,
	BaseAudioPlayer,
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
	BaseChecklist,
	BaseChip,
	BaseColorModeButton,
	BaseColorPicker,
	BaseCommandPalette,
	BaseConfirm,
	BaseContainer,
	BaseContextMenu,
	BaseDatePicker,
	BaseDrawer,
	BaseDropdown,
	BaseDropdownMenu,
	BaseEditor,
	BaseEmojiPicker,
	BaseEmpty,
	BaseFab,
	BaseFileUpload,
	BaseFilterBuilder,
	BaseFooter,
	BaseForm,
	BaseFormField,
	BaseHeader,
	BaseHeatmap,
	BaseIcon,
	BaseImage,
	BaseImageCompare,
	BaseInfiniteScroll,
	BaseInplace,
	BaseInput,
	BaseInputNumber,
	BaseInputTags,
	BaseJsonViewer,
	BaseKanban,
	BaseKbd,
	BaseLayout,
	BaseLink,
	BaseLoader,
	BaseMarkdown,
	BaseMegaMenu,
	BaseMention,
	BaseMenu,
	BaseModal,
	BaseMoneyInput,
	BaseNotification,
	BasePagination,
	BasePhoneInput,
	BasePieChart,
	BasePin,
	BasePopconfirm,
	BasePopover,
	BaseProgress,
	BasePromptInput,
	BaseRadio,
	BaseRange,
	BaseRating,
	BaseReasoning,
	BaseRequisiteInput,
	BaseScrollArea,
	BaseSearch,
	BaseSegmented,
	BaseSelect,
	BaseSeparator,
	BaseSideBar,
	BaseSkeleton,
	BaseSlideover,
	BaseSlider,
	BaseSparkline,
	BaseSplitButton,
	BaseSplitter,
	BaseStepper,
	BaseSubtitleEditor,
	BaseSwitch,
	BaseTable,
	BaseTabs,
	BaseText,
	BaseTextDiff,
	BaseTextarea,
	BaseTimePicker,
	BaseTimeline,
	BaseToolCall,
	BaseToolbar,
	BaseTooltip,
	BaseTour,
	BaseTree,
	BaseUser,
	BaseVirtualList,
	BaseVoiceRecorder,
	BaseWaveform,
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
