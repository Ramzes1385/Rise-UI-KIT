<template>
	<g class="base-flow-map__review-layer" aria-hidden="true" :data-mode="mode" :data-side="side ?? undefined">
		<g
			v-for="item in items"
			:key="item.key"
			class="base-flow-map__review-mark"
			:class="[
				`base-flow-map__review-mark--${item.kind}`,
				item.isGhost && 'base-flow-map__review-mark--ghost',
				item.isHot && 'base-flow-map__review-mark--hot',
			]">
			<title>{{ item.title }}</title>
			<path v-if="item.path" class="base-flow-map__review-path" :d="item.path" />
			<line
				v-if="item.from && item.rect"
				class="base-flow-map__review-move"
				:x1="item.from.x"
				:y1="item.from.y"
				:x2="item.rect.x + item.rect.width / 2"
				:y2="item.rect.y + item.rect.height / 2" />
			<rect
				v-if="item.rect"
				class="base-flow-map__review-frame"
				:x="item.rect.x - 4"
				:y="item.rect.y - 4"
				:width="item.rect.width + 8"
				:height="item.rect.height + 8"
				rx="12" />
			<text
				v-if="item.text && item.rect"
				class="base-flow-map__review-text"
				:x="item.rect.x + item.rect.width / 2"
				:y="item.rect.y + item.rect.height / 2"
				text-anchor="middle"
				dominant-baseline="central">
				{{ item.text }}
			</text>
			<g class="base-flow-map__review-glyph" :transform="`translate(${item.glyphPoint.x} ${item.glyphPoint.y})`">
				<circle r="9" />
				<text text-anchor="middle" dominant-baseline="central">{{ item.glyph }}</text>
				<text v-if="item.author" class="base-flow-map__review-author" x="14" dominant-baseline="central">{{ item.author }}</text>
			</g>
		</g>
	</g>
</template>

<script setup lang="ts">
import { useFlowReviewLayer } from '../../model/review/layer/useFlowReviewLayer'

const { mode, items, side } = useFlowReviewLayer()
</script>
