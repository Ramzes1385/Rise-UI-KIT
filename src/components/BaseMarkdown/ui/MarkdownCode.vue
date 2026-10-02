<template>
	<div class="base-markdown__code-block">
		<div class="base-markdown__code-header">
			<span class="base-markdown__code-lang">{{ block.lang || UI_MARKDOWN.CODE }}</span>
			<BaseButton variant="ghost" class="base-markdown__copy" @click="copy">
				<template #left><BaseIcon :name="isCopied ? 'check' : 'copy'" /></template>
				{{ isCopied ? UI_MARKDOWN.CODE_COPIED : UI_MARKDOWN.COPY_CODE }}
			</BaseButton>
		</div>
		<pre
			class="base-markdown__pre"
			tabindex="0"><code><span v-for="(token, index) in tokens" :key="index" :class="token.type ? `base-markdown__token base-markdown__token--${token.type}` : undefined">{{ token.value }}</span><span v-if="block.hasCaret" class="base-markdown__caret" aria-hidden="true"></span></code></pre>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_MARKDOWN } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { useMarkdownCode } from '../model/useMarkdownCode'
import type { MarkdownCodeProps } from '../types/MarkdownParts.types'

const props = defineProps<MarkdownCodeProps>()

const { isCopied, copy, tokens } = useMarkdownCode(props)
</script>
