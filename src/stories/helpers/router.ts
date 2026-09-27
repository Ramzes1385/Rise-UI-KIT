import { defineComponent, h, markRaw } from 'vue'

/**
 * Ссылка для примеров — как RouterLink: получает `to` и рендерит `<a href>`, но не уходит со страницы Storybook.
 * В приложении передайте в `linkComponent` настоящий RouterLink (или подключите vue-router — кит найдёт его сам).
 * markRaw: args в Storybook реактивны, а компонент не должен превращаться в реактивный объект.
 */
export const StoryRouterLink = markRaw(
	defineComponent({
		name: 'StoryRouterLink',
		props: { to: { type: String, required: true } },
		setup: (props, { slots }) => () => h('a', { href: props.to, onClick: (event: MouseEvent) => event.preventDefault() }, slots.default?.()),
	}),
)
