export function Controller(path: string): ClassDecorator {
  // biome-ignore lint:
  return (target: Function) => {
    Reflect.defineMetadata("path", path, target);
  };
}
