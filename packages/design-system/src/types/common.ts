export type ComponentProps<T = {}> = T & {
  readonly className?: string;
  readonly children?: React.ReactNode;
};
