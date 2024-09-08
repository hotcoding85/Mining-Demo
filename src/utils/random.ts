export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(
  min: number,
  max: number,
  decimalPlaces: number
): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
}

export function getRandomIndex(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
