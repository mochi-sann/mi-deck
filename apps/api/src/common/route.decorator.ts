export function Get(path: string): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    Reflect.defineMetadata("method", "GET", descriptor.value);
    Reflect.defineMetadata("path", path, descriptor.value);
  };
}

export function Post(path: string): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    Reflect.defineMetadata("method", "Post", descriptor.value);
    Reflect.defineMetadata("path", path, descriptor.value);
  };
}
