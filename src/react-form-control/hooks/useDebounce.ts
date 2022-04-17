import { useCallback, useEffect, useRef, useState } from "react";

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

export function useDebouncer() {
  const ref = useRef(new Debounce());
  const debouncer = useCallback((callback: (...args: any[]) => any, time: number) => {
    ref.current.cancel();
    ref.current.debounce(callback, time);
  }, []);
  return debouncer;
}

export function useDebounceState<T>(initState: T, timer: number): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initState);
  const ref = useRef(new Debounce());
  const debounceDispatch = useCallback(
    (value: T) => {
      ref.current.cancel();
      ref.current.debounce(() => setState(value), timer);
    },
    [timer],
  );
  return [state, debounceDispatch];
}
