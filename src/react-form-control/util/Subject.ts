export class Subject<T> {
  private observer: any[] = [];

  constructor(value: T) {
    this.next(value);
  }

  public next(value: T) {
    this.observer.forEach((obs) => obs(value));
  }
  public subscribe(callback: (value: T) => void) {
    this.observer.push(callback);
  }
}
