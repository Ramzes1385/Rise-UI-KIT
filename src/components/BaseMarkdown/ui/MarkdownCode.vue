<template>
	<div :class="ui('code-block')">
		<div :class="ui('code-header')">
			<span :class="ui('code-lang')">{{ block.lang || UI_MARKDOWN.CODE }}</span>
			<BaseButton variant="ghost" :class="ui('copy')" :aria-label="copyLabel" @click="copy">
				<template #left><BaseIcon :name="isCopied ? 'check' : 'copy'" /></template>
				{{ isCopied ? UI_MARKDOWN.CODE_COPIED : UI_MARKDOWN.COPY_CODE }}
			</BaseButton>
		</div>
		<pre
			:class="ui('pre')"
			tabindex="0"><code><span v-for="(token, index) in tokens" :key="index" :class="token.type ? [ui('token'), `base-markdown__token--${token.type}`] : undefined">{{ token.value }}</span><span v-if="block.hasCaret" :class="ui('caret')" aria-hidden="true"></span></code></pre>
		<span class="base-markdown__code-status" role="status">{{ status }}</span>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_MARKDOWN } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { useMarkdownCode } from '../model/useMarkdownCode'
import type { MarkdownCodeProps } from '../types/MarkdownParts.types'

const props = defineProps<MarkdownCodeProps>()

const { ui, status, isCopied, copy, copyLabel, tokens } = useMarkdownCode(props)
</script>
