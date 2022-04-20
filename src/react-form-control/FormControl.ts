import { AnySchema, isValidator } from "./Validator";

interface FormControlOptions {
  validator?: any;
  touched?: boolean;
  disabled?: boolean;
  requiredGroup?: 1 | 2 | 3 | 4 | 5;
}

export interface FormControlThenOptions {
  value?: any;
  validator?: any;
  touched?: boolean;
  disabled?: boolean;
  requiredGroup?: 1 | 2 | 3 | 4 | 5;
  error?: string;
}

type FormError = [boolean, string[]];

export type Condition =
  | undefined
  | string
  | number
  | boolean
  | Date
  | { [key: string]: any }
  | ((value: any) => boolean);

export interface Modifiers {
  dependencies: string[];
  operator: "every" | "some" | "map";
  condition: Condition;
}

interface ThenOptions extends FormControlThenOptions {
  reset?: boolean;
}

export class FormControl {
  private value: any;
  private validator?: AnySchema;
  private touched = false;
  private disabled = false;
  private requiredGroup = 1;
  private hasModifiers = false;
  private modifiers: Modifiers = {
    dependencies: [],
    operator: "every",
    condition: undefined,
  };
  private thenOptions: ThenOptions = {};

  constructor(stateValue: any, options?: FormControlOptions | AnySchema) {
    this.value = stateValue;
    switch (this.checkOptions(options)) {
      case "validator":
        this.validator = options as AnySchema;
        break;
      case "options":
        const _ = options as FormControlOptions;
        if (_?.validator) this.validator = _?.validator;
        if (_?.touched) this.touched = _?.touched;
        if (_?.disabled) this.disabled = _?.disabled;
        if (_?.requiredGroup) this.requiredGroup = _?.requiredGroup;
    }
  }

  public getDefault() {
    return Object.freeze({
      value: this.value,
      validator: this.validator,
      touched: this.touched,
      disabled: this.disabled,
      requiredGroup: this.requiredGroup,
      hasModifiers: this.hasModifiers,
      modifiers: this.modifiers,
      then: this.thenOptions,
    });
  }

  private checkOptions(options: any) {
    if (options) {
      if (isValidator(options)) {
        return "validator";
      } else {
        return "options";
      }
    }
  }
  private check() {
    if (this.hasModifiers) {
      throw new Error();
    } else {
      this.hasModifiers = true;
    }
  }

  private setModifiers(operator: "every" | "some", dependencies: string[], condition?: Condition) {
    this.modifiers = {
      dependencies,
      operator,
      condition,
    };
    return { then: this.then.bind(this), reset: this.reset.bind(this) };
  }

  public when(field: string | string[]) {
    this.check();
    const dependencies = Array.isArray(field) ? field : [field];
    const set = this.setModifiers.bind(this);
    return {
      is(condition?: Condition) {
        return set("every", dependencies, condition);
      },
      some(condition?: Condition) {
        return set("some", dependencies, condition);
      },
    };
  }

  public whenMap(mapCondition: { [key: string]: Condition }) {
    this.check();
    const dependencies = Object.keys(mapCondition);
    if (mapCondition && dependencies.length) {
      this.modifiers.dependencies = dependencies;
      this.modifiers.condition = mapCondition;
    } else throw new Error();

    return { then: this.then.bind(this), reset: this.reset.bind(this) };
  }

  private then(formControlThenOptions: FormControlThenOptions) {
    this.thenOptions = formControlThenOptions;
    return this;
  }

  private reset() {
    this.thenOptions = { reset: true };
    return this;
  }
}
