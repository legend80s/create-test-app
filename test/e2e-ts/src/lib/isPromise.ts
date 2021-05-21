export function isPromise(obj: any): boolean {
  return obj && typeof obj.then === 'function';
}
