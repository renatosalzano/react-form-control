import { FC } from "react";
import { useFormControl } from "../react-form-control/FormStore";

interface Props {
  name: string;
  value: "";
}

export const ControlledTextInput: FC<Props> = ({ name, value }) => {
  const { control, errorMessage } = useFormControl({ name });
  return (
    <div className="input-test">
      <input type="text" {...control} />
      <small>{errorMessage[0]}</small>
    </div>
  );
};
