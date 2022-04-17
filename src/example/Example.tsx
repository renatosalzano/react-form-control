import { FC } from "react";
import { FormControl } from "../react-form-control/FormControl";
import { FormStore } from "../react-form-control/FormStore";
import { ControlledTextInput } from "./ControlledTextInput";

const formSchema = {
  personal: {
    fristname: new FormControl(""),
    lastname: new FormControl(""),
    alias: new FormControl("", {
      disabled: true,
    })
      .when(["personal.fristname", "personal.lastname"])
      .is()
      .then({ disabled: false }),
  },
};

export const Example: FC = () => {
  return (
    <FormStore schema={formSchema}>
      <ControlledTextInput name="personal.fristname" value="" />
      <ControlledTextInput name="personal.lastname" value="" />
      <ControlledTextInput name="personal.alias" value="" />
    </FormStore>
  );
};
