<template>
	<g :ref="layer.attach" class="base-flow-map__edit-layer" aria-hidden="true" />
	<Teleport v-if="layer.host.value && layer.isActive.value" :to="layer.host.value">
		<svg class="base-flow-map__edit-svg" aria-hidden="true">
			<rect
				v-if="layer.drop.value"
				class="base-flow-map__edit-drop"
				:x="layer.drop.value.x"
				:y="layer.drop.value.y"
				:width="layer.drop.value.width"
				:height="layer.drop.value.height" />
			<g v-for="ghost in layer.ghosts.value" :key="ghost.id" class="base-flow-map__edit-ghost">
				<rect :x="ghost.rect.x" :y="ghost.rect.y" :width="ghost.rect.width" :height="ghost.rect.height" rx="8" />
				<text
					:x="ghost.rect.x + ghost.rect.width / 2"
					:y="ghost.rect.y + ghost.rect.height / 2"
					text-anchor="middle"
					dominant-baseline="central">
					{{ ghost.label }}
				</text>
			</g>
			<g v-for="guide in layer.guides.value" :key="`${guide.axis}${guide.at}`" class="base-flow-map__edit-guide">
				<line
					:x1="guide.axis === 'x' ? guide.at : guide.from"
					:x2="guide.axis === 'x' ? guide.at : guide.to"
					:y1="guide.axis === 'x' ? guide.from : guide.at"
					:y2="guide.axis === 'x' ? guide.to : guide.at" />
				<text
					v-for="mark in guide.marks"
					:key="mark.at"
					:x="guide.axis === 'x' ? guide.at + 4 : mark.at"
					:y="guide.axis === 'x' ? mark.at : guide.at - 4"
					:text-anchor="guide.axis === 'x' ? 'start' : 'middle'"
					:style="{ fontSize: `${11 * layer.scale.value}px` }">
					{{ mark.size === null ? UI_FLOW_EDITOR.GUIDE_CENTER : mark.size }}
				</text>
			</g>
			<rect
				v-if="layer.marquee.value"
				class="base-flow-map__edit-marquee"
				:x="layer.marquee.value.x"
				:y="layer.marquee.value.y"
				:width="layer.marquee.value.width"
				:height="layer.marquee.value.height" />
			<g v-if="layer.link.value" class="base-flow-map__edit-link" :data-verdict="layer.link.value.verdict">
				<rect
					v-if="layer.link.value.ring"
					class="base-flow-map__edit-ring"
					:x="layer.link.value.ring.x - 4"
					:y="layer.link.value.ring.y - 4"
					:width="layer.link.value.ring.width + 8"
					:height="layer.link.value.ring.height + 8"
					rx="12" />
				<path :d="layer.link.value.path" :stroke-width="2 * layer.scale.value" />
			</g>
			<circle
				v-for="port in layer.ports.value"
				:key="port.key"
				class="base-flow-map__edit-port"
				:class="{ 'base-flow-map__edit-port--hot': layer.hotPort.value === `${port.node}|${port.id}` }"
				:cx="port.point.x"
				:cy="port.point.y"
				:r="5 * layer.scale.value"
				:stroke-width="1.5 * layer.scale.value"
				:data-edit-port="`${port.node}|${port.id}`">
				<title v-if="port.label">{{ port.label }}</title>
			</circle>
		</svg>
	</Teleport>
</template>

<script setup lang="ts">
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useFlowEditLayer } from '../../model/edit/layer/useFlowEditLayer'

const layer = useFlowEditLayer()
</script>
