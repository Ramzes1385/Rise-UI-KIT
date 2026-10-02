/**
 * Компоненты, которые плагин регистрирует глобально. Импорты — из папок компонентов, а не из общего
 * `src/components/index.ts`: общий индекс статически подключает и тяжёлые компоненты из `./lazy`.
 */

import type { Component } from 'vue'
import { LAZY_COMPONENTS } from './lazy'
import { BaseApp } from '../../components/BaseApp'
import { BaseFab } from '../../components/BaseFab'
import { BaseKbd } from '../../components/BaseKbd'
import { BaseMap } from '../../components/BaseMap'
import { BasePin } from '../../components/BasePin'
import { BaseCard } from '../../components/BaseCard'
import { BaseChip } from '../../components/BaseChip'
import { BaseForm } from '../../components/BaseForm'
import { BaseIcon } from '../../components/BaseIcon'
import { BaseLink } from '../../components/BaseLink'
import { BaseMenu } from '../../components/BaseMenu'
import { BaseTabs } from '../../components/BaseTabs'
import { BaseText } from '../../components/BaseText'
import { BaseTour } from '../../components/BaseTour'
import { BaseTree } from '../../components/BaseTree'
import { BaseUser } from '../../components/BaseUser'
import { BaseAlert } from '../../components/BaseAlert'
import { BaseBadge } from '../../components/BaseBadge'
import { BaseChart } from '../../components/BaseChart'
import { BaseEmpty } from '../../components/BaseEmpty'
import { BaseImage } from '../../components/BaseImage'
import { BaseInput } from '../../components/BaseInput'
import { BaseModal } from '../../components/BaseModal'
import { BaseRadio } from '../../components/BaseRadio'
import { BaseRange } from '../../components/BaseRange'
import { BaseAvatar } from '../../components/BaseAvatar'
import { BaseButton } from '../../components/BaseButton'
import { BaseDrawer } from '../../components/BaseDrawer'
import { BaseFooter } from '../../components/BaseFooter'
import { BaseHeader } from '../../components/BaseHeader'
import { BaseKanban } from '../../components/BaseKanban'
import { BaseLayout } from '../../components/BaseLayout'
import { BaseLoader } from '../../components/BaseLoader'
import { BaseQrCode } from '../../components/BaseQrCode'
import { BaseRating } from '../../components/BaseRating'
import { BaseSearch } from '../../components/BaseSearch'
import { BaseSelect } from '../../components/BaseSelect'
import { BaseSlider } from '../../components/BaseSlider'
import { BaseSwitch } from '../../components/BaseSwitch'
import { BaseBackTop } from '../../components/BaseBackTop'
import { BaseConfirm } from '../../components/BaseConfirm'
import { BaseHeatmap } from '../../components/BaseHeatmap'
import { BaseInplace } from '../../components/BaseInplace'
import { BaseMarquee } from '../../components/BaseMarquee'
import { BaseMention } from '../../components/BaseMention'
import { BasePopover } from '../../components/BasePopover'
import { BaseSideBar } from '../../components/BaseSideBar'
import { BaseStepper } from '../../components/BaseStepper'
import { BaseToolbar } from '../../components/BaseToolbar'
import { BaseTooltip } from '../../components/BaseTooltip'
import { BaseCheckbox } from '../../components/BaseCheckbox'
import { BaseDropdown } from '../../components/BaseDropdown'
import { BaseMarkdown } from '../../components/BaseMarkdown'
import { BaseMegaMenu } from '../../components/BaseMegaMenu'
import { BasePieChart } from '../../components/BasePieChart'
import { BaseProgress } from '../../components/BaseProgress'
import { BaseSkeleton } from '../../components/BaseSkeleton'
import { BaseSplitter } from '../../components/BaseSplitter'
import { BaseTextarea } from '../../components/BaseTextarea'
import { BaseTextDiff } from '../../components/BaseTextDiff'
import { BaseTimeline } from '../../components/BaseTimeline'
import { BaseToolCall } from '../../components/BaseToolCall'
import { BaseWaveform } from '../../components/BaseWaveform'
import { BaseAccordion } from '../../components/BaseAccordion'
import { BaseAiMessage } from '../../components/BaseAiMessage'
import { BaseAnimation } from '../../components/BaseAnimation'
import { BaseChecklist } from '../../components/BaseChecklist'
import { BaseContainer } from '../../components/BaseContainer'
import { BaseFormField } from '../../components/BaseFormField'
import { BaseInputTags } from '../../components/BaseInputTags'
import { BaseReasoning } from '../../components/BaseReasoning'
import { BaseSegmented } from '../../components/BaseSegmented'
import { BaseSeparator } from '../../components/BaseSeparator'
import { BaseSlideover } from '../../components/BaseSlideover'
import { BaseSparkline } from '../../components/BaseSparkline'
import { BaseJsonViewer } from '../../components/BaseJsonViewer'
import { BaseMoneyInput } from '../../components/BaseMoneyInput'
import { BasePagination } from '../../components/BasePagination'
import { BasePhoneInput } from '../../components/BasePhoneInput'
import { BasePopconfirm } from '../../components/BasePopconfirm'
import { BaseScrollArea } from '../../components/BaseScrollArea'
import { BaseTimePicker } from '../../components/BaseTimePicker'
import { BaseAudioPlayer } from '../../components/BaseAudioPlayer'
import { BaseAvatarGroup } from '../../components/BaseAvatarGroup'
import { BaseBreadcrumbs } from '../../components/BaseBreadcrumbs'
import { BaseButtonGroup } from '../../components/BaseButtonGroup'
import { BaseColorPicker } from '../../components/BaseColorPicker'
import { BaseContextMenu } from '../../components/BaseContextMenu'
import { BaseDadataInput } from '../../components/BaseDadataInput'
import { BaseEmojiPicker } from '../../components/BaseEmojiPicker'
import { BaseInputNumber } from '../../components/BaseInputNumber'
import { BasePromptInput } from '../../components/BasePromptInput'
import { BaseSplitButton } from '../../components/BaseSplitButton'
import { BaseVirtualList } from '../../components/BaseVirtualList'
import { BaseAddressInput } from '../../components/BaseAddressInput'
import { BaseAutocomplete } from '../../components/BaseAutocomplete'
import { BaseDropdownMenu } from '../../components/BaseDropdownMenu'
import { BaseImageCompare } from '../../components/BaseImageCompare'
import { BaseNotification } from '../../components/BaseNotification'
import { BaseSignaturePad } from '../../components/BaseSignaturePad'
import { BaseAvatarCropper } from '../../components/BaseAvatarCropper'
import { BaseCheckboxGroup } from '../../components/BaseCheckboxGroup'
import { BaseCommentThread } from '../../components/BaseCommentThread'
import { BaseFilterBuilder } from '../../components/BaseFilterBuilder'
import { BaseVoiceRecorder } from '../../components/BaseVoiceRecorder'
import { BaseCommandPalette } from '../../components/BaseCommandPalette'
import { BaseInfiniteScroll } from '../../components/BaseInfiniteScroll'
import { BaseRequisiteInput } from '../../components/BaseRequisiteInput'
import { BaseSubtitleEditor } from '../../components/BaseSubtitleEditor'
import { BaseColorModeButton } from '../../components/BaseColorModeButton'
import { BaseNotificationCenter } from '../../components/BaseNotificationCenter'

export const UI_COMPONENTS: Record<string, Component> = {
	...LAZY_COMPONENTS,
	BaseAccordion,
	BaseAddressInput,
	BaseAiMessage,
	BaseAlert,
	BaseAnimation,
	BaseApp,
	BaseAudioPlayer,
	BaseAutocomplete,
	BaseAvatar,
	BaseAvatarCropper,
	BaseAvatarGroup,
	BaseBackTop,
	BaseBadge,
	BaseBreadcrumbs,
	BaseButton,
	BaseButtonGroup,
	BaseCard,
	BaseChart,
	BaseCheckbox,
	BaseCheckboxGroup,
	BaseChecklist,
	BaseChip,
	BaseColorModeButton,
	BaseColorPicker,
	BaseCommandPalette,
	BaseCommentThread,
	BaseConfirm,
	BaseContainer,
	BaseContextMenu,
	BaseDadataInput,
	BaseDrawer,
	BaseDropdown,
	BaseDropdownMenu,
	BaseEmojiPicker,
	BaseEmpty,
	BaseFab,
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
	BaseMap,
	BaseMarkdown,
	BaseMarquee,
	BaseMegaMenu,
	BaseMention,
	BaseMenu,
	BaseModal,
	BaseMoneyInput,
	BaseNotification,
	BaseNotificationCenter,
	BasePagination,
	BasePhoneInput,
	BasePieChart,
	BasePin,
	BasePopconfirm,
	BasePopover,
	BaseProgress,
	BasePromptInput,
	BaseQrCode,
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
	BaseSignaturePad,
	BaseSkeleton,
	BaseSlideover,
	BaseSlider,
	BaseSparkline,
	BaseSplitButton,
	BaseSplitter,
	BaseStepper,
	BaseSubtitleEditor,
	BaseSwitch,
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
