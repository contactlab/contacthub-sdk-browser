declare module 'js-cookie' {
  declare export default {
    getJSON(name: string): ?Object,
    set(name: string, value: Object): void
  }
}
