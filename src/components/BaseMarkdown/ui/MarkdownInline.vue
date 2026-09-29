<template>
	<template v-for="(node, index) in nodes" :key="index">
		<template v-if="node.type === 'text'">{{ node.value }}</template>
		<strong v-else-if="node.type === 'strong'"><MarkdownInline :nodes="node.children" /></strong>
		<em v-else-if="node.type === 'em'"><MarkdownInline :nodes="node.children" /></em>
		<del v-else-if="node.type === 'del'"><MarkdownInline :nodes="node.children" /></del>
		<code v-else-if="node.type === 'code'" class="base-markdown__code">{{ node.value }}</code>
		<a
			v-else-if="node.type === 'link'"
			class="base-markdown__link"
			:href="node.href"
			:target="node.isExternal ? '_blank' : undefined"
			:rel="node.isExternal ? 'noopener noreferrer' : undefined">
			<MarkdownInline :nodes="node.children" />
		</a>
		<img v-else-if="node.type === 'image'" class="base-markdown__image" :src="node.src" :alt="node.alt" loading="lazy" />
		<br v-else-if="node.type === 'br'" />
		<span v-else class="base-markdown__caret" aria-hidden="true"></span>
	</template>
</template>

<script setup lang="ts">
import type { MarkdownInlineProps } from '../types/MarkdownParts.types'

defineProps<MarkdownInlineProps>()
</script>
