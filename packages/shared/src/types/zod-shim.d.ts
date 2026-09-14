declare namespace z {
  export type infer<T> = any;
}

declare module 'zod' {
  export const z: any;
}
