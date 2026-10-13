<template>
	<section
		:class="[ui('root'), variantClass, { 'base-subtitle-editor--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="UI_SUBTITLES.EDITOR">
		<div :class="ui('toolbar')">
			<BaseButton variant="soft" :size-scale="sizeScale" :is-disabled="isDisabled" @click="add">
				<template #left><BaseIcon name="plus" /></template>
				{{ UI_SUBTITLES.ADD }}
			</BaseButton>
			<BaseButton variant="ghost" :size-scale="sizeScale" :is-disabled="isDisabled" @click="openFile">
				<template #left><BaseIcon name="upload" /></template>
				{{ UI_SUBTITLES.IMPORT }}
			</BaseButton>
			<input
				ref="fileInputRef"
				type="file"
				class="base-subtitle-editor__file"
				accept=".vtt,.srt,text/vtt"
				tabindex="-1"
				aria-hidden="true"
				@change="importFile" />
			<span class="base-subtitle-editor__spacer"></span>
			<BaseButton
				v-for="format in ['vtt', 'srt'] as const"
				:key="format"
				variant="ghost"
				:size-scale="sizeScale"
				:is-disabled="!cues.length"
				@click="exportFile(format)">
				<template #left><BaseIcon name="download" /></template>
				{{ exportLabel(format) }}
			</BaseButton>
		</div>
		<div :class="[ui('timeline'), classes.timeline]" aria-hidden="true" @click="seekTimeline">
			<BaseTooltip v-for="(cue, index) in cues" :key="index" :text="cueLabel(cue, index)" is-wrapperless>
				<span
					:class="[ui('block'), { 'base-subtitle-editor__block--active': index === activeIndex }, classes.cue]"
					:style="cueStyle(cue)"
					@click.stop="goTo(index)"></span>
			</BaseTooltip>
			<span :class="ui('playhead')" :style="playheadStyle"></span>
		</div>
		<BaseEmpty
			v-if="!cues.length && !leavingCount"
			is-compact
			variant="ghost"
			:class="ui('empty')"
			:description="UI_SUBTITLES.EMPTY"
			:size-scale="sizeScale" />
		<TransitionGroup
			v-if="cues.length || leavingCount"
			tag="ol"
			name="base-subtitle-editor-row"
			:class="[ui('list'), classes.list]"
			@before-leave="pinLeavingRow"
			@after-leave="releaseLeavingRow"
			@leave-cancelled="releaseLeavingRow">
			<li
				v-for="(cue, index) in cues"
				:key="keys[index]"
				:class="[ui('row'), { 'base-subtitle-editor__row--active': index === activeIndex }]"
				:aria-current="index === activeIndex ? 'true' : undefined">
				<span :class="ui('number')" aria-hidden="true">{{ index + 1 }}</span>
				<span v-for="edge in ['start', 'end'] as const" :key="edge" :class="ui('time')">
					<BaseTooltip :text="fieldError(index, edge) || UI_SUBTITLES.TIME_HINT" is-wrapperless>
						<input
							:class="ui('input')"
							:value="timeValue(index, edge)"
							:aria-label="label(edge === 'start' ? UI_SUBTITLES.START : UI_SUBTITLES.END, index)"
							:aria-invalid="fieldError(index, edge) ? 'true' : undefined"
							:disabled="isDisabled"
							inputmode="decimal"
							@input="setDraft(index, edge, ($event.target as HTMLInputElement).value)"
							@change="commitTime(index, edge)" />
					</BaseTooltip>
					<span v-if="fieldError(index, edge)" :class="ui('error')" role="alert">{{ fieldError(index, edge) }}</span>
				</span>
				<textarea
					:id="`${idPrefix}-text-${index}`"
					:class="ui('text')"
					:value="cue.text"
					rows="2"
					:aria-label="label(UI_SUBTITLES.TEXT, index)"
					:disabled="isDisabled"
					@input="updateText(index, ($event.target as HTMLTextAreaElement).value)"></textarea>
				<span :class="ui('actions')">
					<BaseButton variant="ghost" :size-scale="sizeScale" :aria-label="label(UI_SUBTITLES.GO_TO, index)" @click="goTo(index)">
						<template #left><BaseIcon name="play" /></template>
					</BaseButton>
					<BaseButton
						variant="ghost"
						:size-scale="sizeScale"
						:aria-label="label(UI_SUBTITLES.DELETE, index)"
						:is-disabled="isDisabled"
						@click="remove(index)">
						<template #left><BaseIcon name="trash" /></template>
					</BaseButton>
				</span>
			</li>
		</TransitionGroup>
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseSubtitleEditor.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_SUBTITLES } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseButton } from '@components/BaseButton'
import { BaseTooltip } from '@components/BaseTooltip'
import { useBaseSubtitleEditor } from '../model/useBaseSubtitleEditor'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseSubtitleEditorEmits, BaseSubtitleEditorProps } from '../types/BaseSubtitleEditor.types'

const props = withDefaults(defineProps<BaseSubtitleEditorProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	currentTime: 0,
	cueLength: 2,
	fileName: 'subtitles',
})

const emit = defineEmits<BaseSubtitleEditorEmits>()

const {
	ui,
	keys,
	leavingCount,
	pinLeavingRow,
	releaseLeavingRow,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	fieldError,
	timeValue,
	setDraft,
	commitTime,
	updateText,
	remove,
	add,
	fileInputRef,
	openFile,
	importFile,
	exportFile,
	activeIndex,
	playheadStyle,
	cueStyle,
	cueLabel,
	seekTimeline,
	goTo,
	idPrefix,
	label,
	exportLabel,
} = useBaseSubtitleEditor(props, emit)
</script>
