import { Route, Routes } from "react-router";
import "./App.css";
import { TestComponet } from "./Component/TestComponet";
import { AddServerForm } from "./Component/login/AddServerForm";
import { Home } from "./routes/Home";

function App() {
  return (
    <div>
      <Routes>
        <Route index element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
