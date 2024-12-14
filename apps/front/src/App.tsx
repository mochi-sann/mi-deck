import "./App.css";
import { TestComponet } from "./Component/TestComponet";
import { AddServerForm } from "./Component/login/AddServerForm";

function App() {
  return (
    <div>
      <AddServerForm />
      <TestComponet />
    </div>
  );
}

export default App;
