export type AnySchema = StringSchema | NumberSchema;

class Schema<T> {
  private valid = false;
  private errors: string[] = [];
  private rules: ((value: T) => void)[] = [];

  public required(message = "Required") {
    this.rules.unshift((value: T) => {
      if (value) {
        this.valid = true;
      } else {
        this.valid = false;
        this.errors.unshift(message);
      }
    });
    return this;
  }
  public validate(value: T, abortEarly = false) {
    this.errors = [];
    this.rules.forEach((rule) => rule(value));
  }
  public resolve() {
    return { valid: this.valid, errors: this.errors };
  }
}

export class StringSchema extends Schema<string> {
  required(message?: string) {
    return super.required(message);
  }
}

export class NumberSchema {}

export class Validator {
  static string() {
    return new StringSchema();
  }
}

export class TestSchema extends Schema<any> {
  validate(value: any, abortEarly = false) {
    return super.validate(value, abortEarly);
  }
}

export function isValidator(validator: any) {
  switch (true) {
    case validator instanceof StringSchema:
    case validator instanceof NumberSchema:
      return true;
    default:
      return false;
  }
}
