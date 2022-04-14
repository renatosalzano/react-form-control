import { useRef } from "react";

export class Debounce {
  private timeout: NodeJS.Timeout;
  constructor() {
    this.timeout = setTimeout(() => null, 0);
  }
  debounce(callback: (...args: any[]) => any, delay: number) {
    this.timeout = setTimeout(callback, delay);
    return this.timeout;
  }
  cancel() {
    clearTimeout(this.timeout);
  }
}

export function useDebouce() {
  const debounce = useRef(new Debounce());
  return debounce.current;
}
