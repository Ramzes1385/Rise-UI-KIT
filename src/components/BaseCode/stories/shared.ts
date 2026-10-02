import type { CodeLanguage } from '@utils/data/codeHighlightUtils'

export const TS_SAMPLE = [
	"import { computed, ref } from 'vue'",
	'',
	'// Счётчик с шагом и пределом',
	'export function useCounter(step = 1, max = 10) {',
	'\tconst count = ref<number>(0)',
	'\tconst isMax = computed(() => count.value >= max)',
	'\tconst increment = () => (count.value = Math.min(count.value + step, max))',
	'\treturn { count, isMax, increment }',
	'}',
].join('\n')

export const CODE_SAMPLES: Record<CodeLanguage, string> = {
	javascript: 'const total = items.reduce((sum, item) => sum + item.price, 0)\nconsole.log(`Итого: ${total} ₽`)',
	typescript: 'interface User {\n\tid: number\n\tname: string\n}\nexport const isAdult = (age: number): boolean => age >= 18',
	json: '{\n\t"name": "rise-app",\n\t"private": true,\n\t"version": "2.0.0",\n\t"files": ["dist"]\n}',
	html: '<!-- Карточка -->\n<article class="card" data-id="42">\n\t<h2>Заголовок</h2>\n\t<a href="/more">Подробнее</a>\n</article>',
	vue: '<template>\n\t<BaseButton :is-disabled="!isValid" @click="save">{{ label }}</BaseButton>\n</template>\n\n<script setup lang="ts">\nconst label = \'Сохранить\'\n</script>',
	css: '.card:hover {\n\tcolor: var(--rise-text);\n\tpadding: 12px 16px;\n\tbox-shadow: 0 1px 2px rgb(0 0 0 / 10%) !important;\n}',
	scss: '$gap: 8px;\n\n.list {\n\t// Отступ между пунктами\n\t> li + li {\n\t\tmargin-top: $gap * 2;\n\t}\n}',
	bash: '# Установка и сборка\nnpm install @ramzes1385/rise-ui-kit\nexport NODE_ENV="production"\nnpm run build -- --mode $NODE_ENV',
	python: '@dataclass\nclass Order:\n\tid: int\n\ttotal: float = 0.0\n\n\tdef is_paid(self) -> bool:\n\t\treturn self.total > 0  # оплачен',
}

export const LONG_SAMPLE = [
	"const response = await fetch('/api/orders?status=paid&from=2026-10-01&to=2026-10-31&limit=100&sort=-createdAt', { headers })",
	"const orders = (await response.json()).items.filter(order => order.total > 0 && order.currency === 'RUB')",
	'console.log(`Найдено заказов: ${orders.length}`)',
].join('\n')
