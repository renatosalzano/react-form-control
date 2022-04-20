import { useRef } from "react";

class Debounce {
  timeout?: NodeJS.Timeout;
  fn: (...args: any[]) => void;
  delay: number;

  constructor(fn: (...args: any[]) => void, delay: number) {
    this.fn = fn;
    this.delay = delay;
  }

  debounce(instance: Debounce[], index: number) {
    this.cancel();
    this.timeout = setTimeout(() => {
      this.fn();
      this.clear(instance, index);
    }, this.delay);
  }

  cancel() {
    if (this.timeout) clearTimeout(this.timeout);
  }
  call(instance: Debounce[], index: number) {
    this.cancel();
    this.fn();
    this.clear(instance, index);
  }
  clear(instance: Debounce[], index: number) {
    instance.splice(index, 1);
  }
  stop(instance: Debounce[], index: number) {
    this.cancel();
    this.clear(instance, index);
  }
  equalDebounce(fn: (...args: any[]) => void, delay: number) {
    const fnEqual = this.fn.toString() === fn.toString();
    const delayEqual = this.delay === delay;
    return fnEqual && delayEqual;
  }
}

export function useDebounce() {
  const ref = useRef({
    instance: [] as Debounce[],
    debounce(fn: (...args: any[]) => void, delay: number) {
      const instance = this.instance;
      let index = instance.findIndex((i) => i.equalDebounce(fn, delay));
      if (index !== -1) {
      } else {
        index = instance.push(new Debounce(fn, delay)) - 1;
      }
      instance[index].debounce(instance, index);

      return {
        call() {
          instance[index].call(instance, index);
        },
        cancel() {
          instance[index].stop(instance, index);
        },
      };
    },
  });

  return ref.current.debounce.bind(ref.current);
}
