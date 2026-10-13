<template>
	<div
		ref="rootRef"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			ui('root'),
			{
				'base-file-upload--disabled': isControlDisabled,
				'base-file-upload--dragover': isDragOver,
				'base-file-upload--error': hasError,
			},
			variantClass,
			classes.root,
		]">
		<input
			:id="inputId"
			ref="fileInput"
			type="file"
			class="base-file-upload__input"
			tabindex="-1"
			:accept="accept"
			:multiple="isMultiple"
			:disabled="isControlDisabled"
			@change="handleFileChange" />

		<FormFieldLabel
			v-if="label"
			:for-id="inputId"
			:label="label"
			:is-required="isRequired"
			:class-name="ui('label')"
			:custom-class="classes.label"
			:size-scale="sizeScale" />

		<div
			ref="dropzoneRef"
			role="button"
			:tabindex="isControlDisabled ? -1 : 0"
			:aria-disabled="isControlDisabled || undefined"
			:aria-describedby="hasError ? errorsId : undefined"
			:class="[ui('dropzone'), { 'base-file-upload__dropzone--active': isDragOver }, classes.dropzone]"
			@click="triggerUpload"
			@keydown.enter.self.prevent="triggerUpload"
			@keydown.space.self.prevent="triggerUpload"
			@dragover.prevent="handleZoneDragOver"
			@dragleave="handleDragLeave"
			@drop.prevent="handleZoneDrop">
			<slot name="trigger">
				<BaseIcon name="upload" :class="ui('icon')" />
				<span :class="[ui('text'), classes.text]">{{ buttonText ?? UI_TEXT.FILE_SELECT }}</span>
				<span v-if="emptyText" :class="[ui('drop-text'), classes.dropText]">{{ emptyText }}</span>
				<span v-if="accept || maxSize" :class="[ui('hint'), classes.hint]">
					<span v-if="accept">{{ formatHint }}</span>
					<span v-if="maxSize">{{ UI_TEXT.FILE_MAX_SIZE_PREFIX }} {{ maxSize }} {{ UI_TEXT.FILE_MAX_SIZE_SUFFIX }}</span>
				</span>
			</slot>
		</div>

		<TransitionGroup
			v-if="uploadedFiles.length > 0 || leavingCount > 0"
			tag="ul"
			name="base-file-upload-item"
			:class="[ui('list'), classes.list]"
			@before-leave="pinLeavingItem"
			@after-leave="releaseLeavingItem"
			@leave-cancelled="releaseLeavingItem">
			<li v-for="item in uploadedFiles" :key="item.id" :class="[ui('item'), `base-file-upload__item--${item.status}`, classes.item]">
				<div :class="[ui('preview'), classes.preview]" :style="previewStyle">
					<BaseImage
						v-if="item.previewUrl"
						:src="item.previewUrl"
						:alt="item.name"
						class="base-file-upload__preview-img"
						:custom-class="classes.previewImg"
						fit="cover"
						:border-radius="0"
						:zoom-config="previewZoom" />
					<BaseIcon v-else :name="fileIconName(item)" class="base-file-upload__file-icon" />
				</div>

				<div :class="[ui('info'), classes.info]">
					<BaseTooltip class="base-file-upload__name-tooltip" :text="item.name" :size-scale="sizeScale">
						<span :class="[ui('name'), classes.name]">{{ item.name }}</span>
					</BaseTooltip>
					<div :class="[ui('meta'), classes.meta]">
						<span v-if="item.extension" class="base-file-upload__ext" :class="classes.ext">
							<BaseBadge variant="soft" status="neutral" :label="item.extension.toUpperCase()" :size-scale="sizeScale" />
						</span>
						<span class="base-file-upload__size" :class="classes.size">{{ formatSize(item.size) }}</span>
						<span
							v-if="item.status !== 'selected'"
							:class="[ui('status'), `base-file-upload__status--${item.status}`, classes.status]">
							<BaseBadge variant="soft" :status="fileBadgeStatus(item)" :size-scale="sizeScale">
								<template v-if="item.status === 'done'">{{ UI_TEXT.FILE_STATUS_DONE }}</template>
								<template v-else-if="item.status === 'uploading'">{{ item.progress }}%</template>
								<template v-else>{{ UI_TEXT.FILE_STATUS_ERROR }}</template>
							</BaseBadge>
						</span>
					</div>
					<span v-if="item.status === 'error' && item.error" :class="[ui('file-error'), classes.fileError]">{{
						item.error
					}}</span>
					<BaseProgress
						v-if="item.status === 'uploading'"
						:value="item.progress"
						shape="line"
						:aria-label="item.name"
						:size-scale="sizeScale"
						:custom-class="classes.progress"
						:class="ui('progress')" />
				</div>

				<BaseButton
					v-if="item.status === 'error'"
					variant="ghost"
					:class="ui('retry')"
					:custom-class="classes.retry"
					:aria-label="formatMessage(UI_FILE_UPLOAD.RETRY, { name: item.name })"
					:is-disabled="isControlDisabled"
					:size-scale="sizeScale"
					@click="handleRetry(item)">
					<template #left><BaseIcon name="rotate-right" :size-scale="calcIconScale('sm', sizeScale)" /></template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					:class="ui('remove')"
					:custom-class="classes.remove"
					:aria-label="`${UI_TEXT.DELETE} ${item.name}`"
					:is-disabled="isControlDisabled"
					:size-scale="sizeScale"
					@click="handleRemove(item)">
					<template #left><BaseIcon name="close" :size-scale="calcIconScale('sm', sizeScale)" /></template>
				</BaseButton>
			</li>
		</TransitionGroup>

		<div class="base-file-upload__alert" role="alert">
			<BaseAnimation
				v-if="hasError"
				:id="errorsId"
				name="fade"
				is-group
				tag="ul"
				:custom-class="classes.errors"
				:class="ui('errors')">
				<li v-for="(err, index) in displayErrors" :key="err + index" :class="[ui('error-item'), classes.errorItem]">
					{{ err }}
				</li>
			</BaseAnimation>
		</div>

		<div class="base-file-upload__live" role="status">{{ announcement }}</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseFileUpload.style.scss'
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { BaseImage } from '@components/BaseImage'
import { BaseButton } from '@components/BaseButton'
import { BaseTooltip } from '@components/BaseTooltip'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseProgress } from '@components/BaseProgress'
import { BaseAnimation } from '@components/BaseAnimation'
import { FormFieldLabel } from '@components/BaseFormField'
import { kitDefaults } from '@composables/base/useDefaults'
import { UI_FILE_UPLOAD, UI_TEXT } from '@/locales/messages'
import { useBaseFileUpload } from '../model/useBaseFileUpload'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFileUploadEmits, BaseFileUploadProps, BaseFileUploadSlots } from '../types/BaseFileUpload.types'

const props = withDefaults(
	defineProps<BaseFileUploadProps>(),
	kitDefaults('BaseFileUpload', {
		accept: '',
		isMultiple: false,
		isDisabled: false,
		isRequired: false,
		variant: DEFAULT_VARIANT,
		maxSize: 5,
		maxCount: 10,
		label: '',
		previewSize: undefined,
		allowPreview: true,
		emptyText: () => UI_TEXT.FILE_DROP,
		sizeScale: SIZE_SCALE_DEFAULT,
		error: '',
	}),
)
const emit = defineEmits<BaseFileUploadEmits>()
defineSlots<BaseFileUploadSlots>()

const {
	ui,
	leavingCount,
	pinLeavingItem,
	releaseLeavingItem,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isControlDisabled,
	fileInput,
	rootRef,
	dropzoneRef,
	inputId,
	errorsId,
	uploadedFiles,
	isDragOver,
	announcement,
	previewZoom,
	handleRemove,
	handleRetry,
	handleDragLeave,
	displayErrors,
	hasError,
	previewStyle,
	formatHint,
	formatSize,
	fileIconName,
	fileBadgeStatus,
	triggerUpload,
	handleZoneDragOver,
	handleZoneDrop,
	handleFileChange,
	exposed,
} = useBaseFileUpload(props, emit)

defineExpose(exposed)
</script>
