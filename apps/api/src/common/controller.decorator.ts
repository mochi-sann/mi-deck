export function Controller(path: string): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata("path", path, target);
  };
}
