<template>
	<div v-if="marks.length" class="base-range__marks" :class="classes.marks">
		<span
			v-for="mark in marks"
			:key="mark.value"
			class="base-range__mark"
			:class="[`base-range__mark--${mark.tickSize ?? 'major'}`, classes.mark]"
			:style="markStyle(mark.value)">
			<span class="base-range__mark-tick" :class="classes.markTick"></span>
			<BaseText v-if="mark.label" tag="span" class="base-range__mark-text" :custom-class="classes.markText">{{
				mark.label
			}}</BaseText>
		</span>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import type { BaseRangeMarksProps } from '../model/BaseRangeMarks.types'

defineProps<BaseRangeMarksProps>()
</script>
