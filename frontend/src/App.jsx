import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./components/LandingPage";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage"; 
import ProtectedRoute from "./components/ProtectedRoute";
import HistoryPage from "./components/HistoryPage";
import HistorySinglePage from "./components/HistorySinglePage";
import Agent from "./components/Agent";

// const App = () => {
//   return (
//     <div className="App">
//       <LandingPage />
//     </div>
//   );
// };

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/SignUp" element={<SignupPage />} />
        <Route path="/LandingPage" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
        {/* <Route path="/HistoryPage" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} /> */}
        <Route path="/History/:timestamp" element={<ProtectedRoute><HistorySinglePage /></ProtectedRoute>} />
        <Route path="/Agent" element={<ProtectedRoute><Agent /></ProtectedRoute>}/>
      </Routes>
    </Router>
  );
}

export default App;