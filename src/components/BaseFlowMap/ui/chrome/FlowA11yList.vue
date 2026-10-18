<template>
	<section
		:class="[chrome.ui('list'), !chrome.hasList && 'base-flow-map__sr']"
		:tabindex="chrome.hasList ? 0 : undefined"
		:aria-label="UI_FLOW_MAP.LIST_TITLE">
		<h3 class="base-flow-map__list-title">{{ UI_FLOW_MAP.LIST_NODES }}</h3>
		<ul>
			<li v-for="item in canvas.nodes" :key="item.id">
				<button type="button" :tabindex="chrome.hasList ? 0 : -1" @click="canvas.pick.pick({ entity: 'node', id: item.id })">
					{{ item.ariaLabel }}
				</button>
			</li>
		</ul>
		<h3 class="base-flow-map__list-title">{{ UI_FLOW_MAP.LIST_EDGES }}</h3>
		<ul>
			<li v-for="item in canvas.edges" :key="item.id">
				<button type="button" :tabindex="chrome.hasList ? 0 : -1" @click="canvas.pick.pick({ entity: 'edge', id: item.id })">
					{{ item.ariaLabel }}
				</button>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import { UI_FLOW_MAP } from '@/locales/messages'
import { useFlowCanvasContext, useFlowChromeContext } from '../../model/context/flowContext'

const canvas = useFlowCanvasContext()
const chrome = useFlowChromeContext()
</script>
