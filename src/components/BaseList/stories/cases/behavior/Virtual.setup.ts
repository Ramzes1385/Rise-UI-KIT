export function setup() {
	const rows = Array.from({ length: 1000 }, (_, index) => ({ id: `row-${index + 1}`, title: `Строка ${index + 1}` }))

	return { rows }
}
