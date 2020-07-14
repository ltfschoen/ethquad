import * as React from "react";

export interface GreeterProps {
  name: string;
}

export const Greeter = (props: GreeterProps) =>
  <h1>Hello {props.name}</h1>;
