import { FC } from "react";
import { FormControl } from "../react-form-control/FormControl";
import { Form, FormStore } from "../react-form-control/FormStore";
import { Validator } from "../react-form-control/Validator";
import { ControlledTextInput } from "./ControlledTextInput";
import "./style.scss";

const formSchema = {
  personal: {
    fristname: new FormControl("", Validator.string().required()),
    lastname: new FormControl(""),
    alias: new FormControl("", {
      disabled: true,
    })
      .when(["personal.fristname", "personal.lastname"])
      .is("lol")
      .then({ disabled: false }),
  },
};

export const Example: FC = () => {
  return (
    <FormStore schema={formSchema}>
      <Form onSubmit={(value) => console.log(value)}>
        <ControlledTextInput name="personal.fristname" value="" />
        <ControlledTextInput name="personal.lastname" value="" />
        <ControlledTextInput name="personal.alias" value="" />
        <button type="submit"></button>
      </Form>
    </FormStore>
  );
};
