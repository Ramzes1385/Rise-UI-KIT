/** Цвет в модели OKLCH: светлота `l` 0–1, хрома `c` от 0 (серый), тон `h` 0–360 градусов */
export interface OklchColor {
	l: number
	c: number
	h: number
}

/** Три числа: строка матрицы, каналы sRGB 0–1 или компоненты OKLab */
export type OklchVector = [number, number, number]
