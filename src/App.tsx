import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { URLayout } from './features/breakdown/URLayout';
import BreakdownsPage from './features/breakdown/views/BreakdownsView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/ur/breakdowns" replace />} />
        <Route path="/breakdowns" element={<Navigate to="/ur/breakdowns" replace />} />

        <Route path="/ur" element={<URLayout />}>
          <Route path="breakdowns" element={<BreakdownsPage />} />
        </Route>
        <Route path="*" element={<div style={{ padding: '50px', textAlign: 'center' }}><h2>404 - Strona nie istnieje</h2></div>} />
      </Routes>
    </Router>
  );
}

export default App;