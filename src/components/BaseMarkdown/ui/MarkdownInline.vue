<template>
	<template v-for="(node, index) in nodes" :key="index">
		<template v-if="node.type === 'text'">{{ node.value }}</template>
		<strong v-else-if="node.type === 'strong'"><MarkdownInline :nodes="node.children" /></strong>
		<em v-else-if="node.type === 'em'"><MarkdownInline :nodes="node.children" /></em>
		<del v-else-if="node.type === 'del'"><MarkdownInline :nodes="node.children" /></del>
		<code v-else-if="node.type === 'code'" :class="ui('code')">{{ node.value }}</code>
		<a
			v-else-if="node.type === 'link'"
			:class="ui('link')"
			:href="node.href"
			:target="node.isExternal ? '_blank' : undefined"
			:rel="node.isExternal ? 'noopener noreferrer' : undefined">
			<MarkdownInline :nodes="node.children" />
		</a>
		<img v-else-if="node.type === 'image'" :class="ui('image')" :src="node.src" :alt="node.alt" loading="lazy" />
		<br v-else-if="node.type === 'br'" />
		<span v-else :class="ui('caret')" aria-hidden="true"></span>
	</template>
</template>

<script setup lang="ts">
import { useMarkdownUi } from '../model/useMarkdownUi'
import type { MarkdownInlineProps } from '../types/MarkdownParts.types'

defineProps<MarkdownInlineProps>()

const ui = useMarkdownUi()
</script>
