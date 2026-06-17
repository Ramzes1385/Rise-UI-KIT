<template>
	<div class="base-calendar__months" :class="classes.months">
		<BaseButton
			v-for="(name, index) in monthNames"
			:key="index"
			variant="outline"
			class="base-calendar__month-btn"
			:class="{ 'base-calendar__month-btn--current': index === currentMonth }"
			:size-scale="sizeScale"
			:is-disabled="isDisabled"
			@click="emit('select', index)">
			<BaseText tag="span" :size-scale="sizeScale">{{ name }}</BaseText>
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseText } from '@components/BaseText'
import type { BaseCalendarMonthsEmits, BaseCalendarMonthsProps } from '../model/BaseCalendarMonths.types'

defineProps<BaseCalendarMonthsProps>()

const emit = defineEmits<BaseCalendarMonthsEmits>()
</script>
