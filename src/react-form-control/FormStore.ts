/* eslint-disable no-eval */
import { useContext, createContext, createElement, FC, useRef, useState, useEffect } from "react";

import { FormControl, FormControlThenOptions, Modifiers } from "./FormControl";
import { useDebouce } from "./hooks/useDebounce";
import { isEqual } from "./util/isEqual";
import { splitObject } from "./util/splitObject";

import { Subject } from "./util/Subject";
import { AnySchema } from "./Validator";

interface AnyObject {
  [key: string]: any;
}

interface FormStoreProps {
  schema: { [key: string]: any };
}
interface FormStoreContext {
  formGroup: FormGroup;
}

const FormContext = createContext<FormStoreContext>({} as FormStoreContext);
const useFormContext = () => useContext(FormContext);
export const FormStore: FC<FormStoreProps> = ({ schema, children }) => {
  const formGroup = useRef(new FormGroup(schema)).current;
  return createElement(FormContext.Provider, { value: { formGroup } }, children);
};

class FormGroup {
  public values: AnyObject;
  private control: AnyObject;
  private path: { [key: string]: Control } = {};
  public slice: { [key: string]: SliceControl } = {};

  constructor(schema: { [key: string]: any }) {
    if (schema && typeof schema === "object") {
      this.values = schema;
      this.control = schema;
      this.setPath(schema);
    } else {
      throw new Error("Schema must be an Object");
    }
  }

  private setPath(object: { [key: string]: any }, prefix?: string) {
    prefix = prefix ? prefix + "." : "";
    return Object.keys(object).reduce((result: string[], key) => {
      switch (true) {
        case object[key] instanceof FormControl:
          console.log(object[key]);
          const control = new Control(object[key]);
          const path = prefix + key;
          this.path[key] = eval(`this.control.${path}`);
          this.path[key] = control;
          this.path[key].valueChanges.subscribe(eval(`(value) => this.values.${path} = value`));
          eval(`this.values.${path} = this.path[key].value`);
          this.injectDependencies(this.path[key]);
          break;
        /* case object[key] instanceof FormSlice:
          console.log(prefix + key);
          this.slice[key] = new SliceControl(object[key].schema);
          break; */
        default:
          result = [...result, ...this.setPath(object[key], prefix + key)];
          break;
      }
      return result;
    }, []);
  }

  private injectDependencies(control: Control) {
    if (control.hasModifiers()) {
      for (const key of control.getDependencies()) {
        const control = this.getControl(key);
      }
    }
  }
  public getControl(name: string) {
    if (this.path[name] instanceof Control) {
      return this.path[name];
    } else {
      console.error(`${name} not found`);
      return new Control();
    }
  }
}

class SliceControl {
  constructor(schema: { [key: string]: any }) {
    console.log(schema);
  }
}

interface ThenOptions extends FormControlThenOptions {
  reset?: true;
}

type FormError = [boolean, string[]];

interface FormControlDefault {
  value: any;
  validator: any;
  touched: boolean;
  disabled: boolean;
  requiredGroup: number;
  hasModifiers: boolean;
}

interface FormControlChanges {
  value: any;
  touched: boolean;
  disabled: boolean;
  requiredGroup: number;
  error: FormError;
}

class Control {
  private _default: FormControlDefault = {
    value: undefined,
    validator: undefined,
    touched: false,
    disabled: false,
    requiredGroup: 1,
    hasModifiers: false,
  };
  public value: any = null;
  public validator?: AnySchema;
  public touched = false;
  public disabled = false;
  public error: [boolean, string[]] = [false, []];
  public requiredGroup = 1;

  private state: { curr: any; then: ThenOptions } = { curr: {}, then: {} };

  private modifiers: Modifiers = {
    dependencies: [],
    operator: "every",
    condition: undefined,
  };

  public valueChanges: Subject<any> = new Subject(undefined);
  public changes: Subject<FormControlChanges> = new Subject({} as FormControlChanges);

  private cache: { [key: string]: any } = {};
  constructor(formControl?: FormControl) {
    if (formControl) {
      const [defaultValue, modifiers, then] = splitObject(formControl.getDefault(), [
        "modifiers",
        "then",
      ]);
      this._default = Object.freeze(defaultValue);
      this.modifiers = modifiers;
      this.state.then = then;
      this.updateControl(defaultValue);
    }
  }

  private updateControl(options: Partial<ThenOptions>) {
    if (options?.reset) return this.reset();
    if (options?.value !== undefined) this.value = options.value;
    if (options?.validator) this.validator = options.validator;
    if (options?.touched === true) this.touched = options.touched;
    if (options?.disabled === true) this.disabled = options.disabled;
    if (options?.requiredGroup) this.requiredGroup = options.requiredGroup;
    this.changes.next({ value: this.value, ...this.getChanges() });
  }

  public getChanges() {
    const { touched, disabled, error, requiredGroup } = this;
    return { touched, disabled, error, requiredGroup };
  }

  public setValue(value: any) {
    this.value = value;
    this.next();
  }
  public setError(message: string[]) {
    this.error = [true, message];
    this.next();
  }

  private next() {
    const value = this.value;
    const currentState = { value, ...this.getChanges() };
    this.valueChanges.next(value);
    this.changes.next(currentState);
    this.state.curr = currentState;
  }

  public reset() {}

  public hasModifiers() {
    return this._default.hasModifiers;
  }

  public getDependencies() {
    this.modifiers.dependencies.forEach((name) => (this.cache[name] = null));
    return this.modifiers.dependencies;
  }

  public testCondition(name: string, value: any) {
    let test = false;
    const { operator, condition } = this.modifiers;
    switch (operator) {
      case "some":
      case "every":
        this.cache[name] = value;
        const values = Object.values(this.cache);
        test = values[operator]((value) => isEqual(value, condition));
        break;
      case "map":
        const cond = condition as { [key: string]: any };
        this.cache[name] = isEqual(value, cond[name]);
        test = Object.values(this.cache).every((x) => x === true);
        break;
    }
    if (test) {
      this.updateControl(this.state.then);
    } else {
      this.updateControl(this.state.curr);
    }
  }
}

interface UseFormControl {
  name: string;
  label?: string;
}

export const useFormControl = ({ name, label }: UseFormControl) => {
  const { formGroup } = useFormContext();
  const [onchange, test] = [useDebouce(), useDebouce()];
  const formControl = useRef(formGroup.getControl(name)).current;
  const controller = useRef({
    setValue(value: any) {
      formControl.setValue(value);
      setValue(value);
    },
    onMount() {
      console.log(name, formControl);
      formControl.changes.subscribe(({ value, disabled, error }) => {
        setValue(value);
        setDisabled(disabled);
        setError(error[0]);
      });
    },
  }).current;

  const [value, setValue] = useState(formControl.value);
  const [disabled, setDisabled] = useState(formControl.disabled);
  const [error, setError] = useState(formControl.error[0]);

  useEffect(() => {
    controller.onMount();
  }, [controller]);

  return {
    control: {
      name,
      value,
      disabled,
      onChange(event: any) {
        const value = event.target ? event.target.value : event;
        if (event.target) {
          console.log(event.target["type"]);
          _.cancel();
          _.debounce(() => console.log(value), 400);
        }
        controller.setValue(value);
      },
    },
  };
};
