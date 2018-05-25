declare module 'js-cookie' {
  declare export default {
    get(name: string): ?string,
    getJSON(name: string): ?Object,
    set(name: string, value: Object, options: ?Object): void,
    remove(name: string): void
  }
}
