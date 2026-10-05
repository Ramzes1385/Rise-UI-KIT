<template>
	<template v-if="animation === 'none'">{{ text }}</template>
	<template v-else>
		<span
			v-for="digit in digits"
			:key="digit.key"
			class="base-countdown__slot"
			:class="{ 'base-countdown__slot--static': !digit.isDigit }">
			<Transition v-if="digit.isDigit" :name="`base-countdown-${animation}`">
				<span :key="digit.char" class="base-countdown__digit" :data-char="digit.char">{{ digit.char }}</span>
			</Transition>
			<template v-else>{{ digit.char }}</template>
		</span>
	</template>
</template>

<script setup lang="ts">
import type { CountdownDigitsProps } from '../types/BaseCountdown.types'

defineProps<CountdownDigitsProps>()
</script>
