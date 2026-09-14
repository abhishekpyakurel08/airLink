declare namespace React {
  export type FC<P = {}> = (props: P) => any;
}

declare module 'react' {
  export = React;
}
