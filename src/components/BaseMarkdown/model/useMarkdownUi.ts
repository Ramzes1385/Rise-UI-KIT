import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { UiClassFn } from '@composables/base/useUi'
import type { BaseMarkdownPart, BaseMarkdownProps } from '../types/BaseMarkdown.types'

const MARKDOWN_UI_KEY: InjectionKey<UiClassFn<BaseMarkdownPart>> = Symbol('base-markdown-ui')

export function provideMarkdownUi(props: BaseMarkdownProps): UiClassFn<BaseMarkdownPart> {
	const ui = useUi(props, 'base-markdown')
	provide(MARKDOWN_UI_KEY, ui)
	return ui
}

export function useMarkdownUi(): UiClassFn<BaseMarkdownPart> {
	return inject(MARKDOWN_UI_KEY)!
}
