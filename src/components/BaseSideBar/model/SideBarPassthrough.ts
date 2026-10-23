import { defineComponent } from 'vue'

export const SideBarPassthrough = defineComponent({
	name: 'SideBarPassthrough',
	inheritAttrs: false,
	setup(_, { slots }) {
		return () => slots.default?.()
	},
})
