import { createShelfPacker } from '../../geometry/shelfPacker'

describe('createShelfPacker', () => {
	it('кладёт слева направо, затем на следующую полку', () => {
		const packer = createShelfPacker(100, 10)
		expect(packer.place(60)).toEqual({ x: 0, y: 0 })
		expect(packer.place(30)).toEqual({ x: 60, y: 0 })
		expect(packer.place(20)).toEqual({ x: 0, y: 10 })
		expect(packer.place(100)).toEqual({ x: 0, y: 20 })
	})

	it('переполнение: нет места по высоте — null и состояние не портится', () => {
		const packer = createShelfPacker(20, 10)
		expect(packer.place(20)).toEqual({ x: 0, y: 0 })
		expect(packer.place(20)).toEqual({ x: 0, y: 10 })
		expect(packer.place(1)).toBeNull()
		expect(packer.place(1)).toBeNull()
	})

	it('шире холста или выше холста не помещается', () => {
		expect(createShelfPacker(50, 10).place(51)).toBeNull()
		expect(createShelfPacker(5, 10).place(1)).toBeNull()
	})

	it('в свободный остаток полки помещается узкая надпись', () => {
		const packer = createShelfPacker(10, 5)
		packer.place(8)
		expect(packer.place(2)).toEqual({ x: 8, y: 0 })
	})
})
