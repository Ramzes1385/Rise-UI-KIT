<template>
	<header :class="chrome.ui('header')">
		<h2 v-if="chrome.title" class="base-flow-map__title">{{ chrome.title }}</h2>
		<div v-if="chrome.modes.length > 0" class="base-flow-map__modes" role="group" :aria-label="UI_FLOW_MAP.MODES">
			<BaseButton
				v-for="mode in chrome.modes"
				:key="mode.value"
				:variant="mode.isActive ? 'soft' : 'ghost'"
				:aria-pressed="mode.isActive"
				@click="chrome.setMode(mode.value)">
				{{ mode.label }}
			</BaseButton>
		</div>
	</header>
</template>

<script setup lang="ts">
import { UI_FLOW_MAP } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { useFlowChromeContext } from '../../model/context/flowContext'

const chrome = useFlowChromeContext()
</script>
