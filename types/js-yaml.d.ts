// ponytail: only the two calls the /write pages use; add @types/js-yaml if more is needed.
declare module 'js-yaml' {
  export const JSON_SCHEMA: unknown
  export function load(str: string, opts?: { schema?: unknown }): unknown
  export function dump(obj: unknown, opts?: { lineWidth?: number; flowLevel?: number }): string
}
