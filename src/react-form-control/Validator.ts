export type AnySchema = StringSchema | NumberSchema;

class Schema<T> {
  public valid = false;
  public errors: string[] = [];
  public rules: ((value: any) => void)[] = [];

  public required(message = "Required") {
    this.rules.unshift((value: any) => {
      if (value) {
        this.valid = true;
      } else {
        this.valid = false;
        this.errors.unshift(message);
      }
    });
    return this;
  }
}

export class StringSchema extends Schema<string> {
  required(message?: string) {
    return super.required(message);
  }
}

export class NumberSchema extends Schema<number> {
  required(message?: string) {
    return super.required(message);
  }
}

export class Validator {
  static string() {
    return new StringSchema();
  }
}

export class ValidateSchema {
  constructor(private schema: AnySchema) {}

  validate(value: any) {
    this.schema.valid = true;
    this.schema.errors = [];
    this.schema.rules.forEach((rule) => rule(value));
    return {
      valid: this.schema.valid,
      errors: this.schema.errors,
    };
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
