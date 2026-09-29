<template>
	<section
		class="base-subtitle-editor"
		:class="[variantClass, { 'base-subtitle-editor--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="UI_SUBTITLES.EDITOR">
		<div class="base-subtitle-editor__toolbar">
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
		<div
			class="base-subtitle-editor__timeline"
			:class="classes.timeline"
			:title="UI_SUBTITLES.TIMELINE"
			aria-hidden="true"
			@click="seekTimeline">
			<span
				v-for="(cue, index) in cues"
				:key="index"
				class="base-subtitle-editor__block"
				:class="[{ 'base-subtitle-editor__block--active': index === activeIndex }, classes.cue]"
				:style="cueStyle(cue)"
				:title="cueLabel(cue, index)"
				@click.stop="goTo(index)"></span>
			<span class="base-subtitle-editor__playhead" :style="playheadStyle"></span>
		</div>
		<p v-if="!cues.length" class="base-subtitle-editor__empty">{{ UI_SUBTITLES.EMPTY }}</p>
		<ol v-else class="base-subtitle-editor__list" :class="classes.list">
			<li
				v-for="(cue, index) in cues"
				:key="index"
				class="base-subtitle-editor__row"
				:class="{ 'base-subtitle-editor__row--active': index === activeIndex }"
				:aria-current="index === activeIndex ? 'true' : undefined">
				<span class="base-subtitle-editor__number" aria-hidden="true">{{ index + 1 }}</span>
				<span v-for="edge in ['start', 'end'] as const" :key="edge" class="base-subtitle-editor__time">
					<input
						class="base-subtitle-editor__input"
						:value="timeValue(index, edge)"
						:aria-label="label(edge === 'start' ? UI_SUBTITLES.START : UI_SUBTITLES.END, index)"
						:aria-invalid="errors[`${index}:${edge}`] ? 'true' : undefined"
						:title="errors[`${index}:${edge}`] || UI_SUBTITLES.TIME_HINT"
						:disabled="isDisabled"
						inputmode="decimal"
						@input="setDraft(index, edge, ($event.target as HTMLInputElement).value)"
						@change="commitTime(index, edge)" />
					<span v-if="errors[`${index}:${edge}`]" class="base-subtitle-editor__error" role="alert">{{
						errors[`${index}:${edge}`]
					}}</span>
				</span>
				<textarea
					:id="`${idPrefix}-text-${index}`"
					class="base-subtitle-editor__text"
					:value="cue.text"
					rows="2"
					:aria-label="label(UI_SUBTITLES.TEXT, index)"
					:disabled="isDisabled"
					@input="updateText(index, ($event.target as HTMLTextAreaElement).value)"></textarea>
				<span class="base-subtitle-editor__actions">
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
		</ol>
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseSubtitleEditor.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_SUBTITLES } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseSubtitleEditor } from '../model/useBaseSubtitleEditor'
import type { BaseSubtitleEditorEmits, BaseSubtitleEditorProps } from '../types/BaseSubtitleEditor.types'

const props = withDefaults(defineProps<BaseSubtitleEditorProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	currentTime: 0,
	cueLength: 2,
	fileName: 'subtitles',
})

const emit = defineEmits<BaseSubtitleEditorEmits>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	errors,
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
