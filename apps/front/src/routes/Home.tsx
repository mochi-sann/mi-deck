import type React from "react";
import { TestComponet } from "../Component/TestComponet";
import { AddServerForm } from "../Component/login/AddServerForm";

export const Home: React.FC = () => {
  return (
    <div>
      <AddServerForm />
      <TestComponet />
    </div>
  );
};
