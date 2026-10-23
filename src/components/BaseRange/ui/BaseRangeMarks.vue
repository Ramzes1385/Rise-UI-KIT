<template>
	<div v-if="marks.length" :class="[ui('marks'), classes.marks]">
		<span
			v-for="mark in marks"
			:key="mark.value"
			:class="[ui('mark'), `base-range__mark--${mark.tickSize ?? 'major'}`, classes.mark]"
			:style="markStyle(mark.value)">
			<span :class="[ui('mark-tick'), classes.markTick]"></span>
			<BaseText v-if="mark.label" tag="span" :class="ui('mark-text')" :custom-class="classes.markText">{{ mark.label }}</BaseText>
		</span>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import type { BaseRangeMarksProps } from '../types/BaseRangeMarks.types'

defineProps<BaseRangeMarksProps>()
</script>
