export const Random = {
	int(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	float(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	},
};
