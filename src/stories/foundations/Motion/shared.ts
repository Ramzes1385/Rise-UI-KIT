import { defineComponent, onMounted, ref } from 'vue'

export const MOTION_TOKENS = [
	'--rise-duration-fast',
	'--rise-duration',
	'--rise-duration-slow',
	'--rise-duration-xslow',
	'--rise-ease-emphasized',
	'--rise-ease-spring',
	'--rise-motion-distance',
	'--rise-motion-scale-from',
	'--rise-motion-stagger',
	'--rise-motion-loop-state',
]

const VALUE_TEMPLATE = `<code ref="el" class="fnd-motion-value">{{ value }}</code>`

const VALUE_SCRIPT = [
	'const props = defineProps<{ token: string }>()',
	'const el = ref<HTMLElement | null>(null)',
	"const value = ref('')",
	'onMounted(() => {',
	'\tvalue.value = getComputedStyle(el.value!).getPropertyValue(props.token).trim()',
	'})',
].join('\n')

/** Значение токена, вычисленное на месте: внутри области с `data-rise-motion` — значение её пресета */
export const MotionTokenValue = defineComponent({
	props: { token: { type: String, required: true } },
	setup(props) {
		const el = ref<HTMLElement | null>(null)
		const value = ref('')
		onMounted(() => {
			value.value = getComputedStyle(el.value!).getPropertyValue(props.token).trim()
		})
		return { el, value }
	},
	template: VALUE_TEMPLATE,
})

export const MOTION_TOKEN_VALUE_SOURCE = { template: VALUE_TEMPLATE, imports: [], script: VALUE_SCRIPT, vue: ['onMounted', 'ref'] }
