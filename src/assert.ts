export function assertIncludes(actual: string, expected: string, message?: string) {
  if (!actual.includes(expected)) {
    throw new Error(message || `Se esperaba que "${actual}" incluyera "${expected}"`);
  }
}