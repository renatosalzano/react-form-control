import { FC } from "react";
import { useFormControl } from "../react-form-control/FormStore";

interface Props {
  name: string;
  value: "";
}

export const ControlledTextInput: FC<Props> = ({ name, value }) => {
  const { control } = useFormControl({ name });
  return <input type="text" {...control} />;
};
