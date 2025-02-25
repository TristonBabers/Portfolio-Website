import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { RelationalDatabase } from "./pages/RelationalDatabase";

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/relational_database" element={<RelationalDatabase />} />
          <Route path="/pipelined_processor" element={<PipelinedProcessor />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;