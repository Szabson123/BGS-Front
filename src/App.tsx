import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { URLayout } from './features/breakdown/URLayout';
import BreakdownsPage from './features/breakdown/views/BreakdownsView';
import LoginPage from './features/auth/views/LoginView';
import MachineList from './features/breakdown/views/MachineList';
import CreateBreakdown from './features/breakdown/views/CrateBreakDown';


function App() {
  return (
    <AuthProvider> 
      <Router>
        <Routes>
          {/* Publiczne trasy */}
          <Route path="/login" element={<LoginPage />} />

          {/* Automatyczne przekierowania */}
          <Route path="/" element={<Navigate to="/ur/breakdowns" replace />} />
          <Route path="/breakdowns" element={<Navigate to="/ur/breakdowns" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/ur" element={<URLayout />}>
              <Route path="breakdowns" element={<BreakdownsPage />} />
              <Route path="machines" element={<MachineList />} />
              <Route path="create-breakdown" element={<CreateBreakdown />} />
            </Route>
          </Route>

          <Route path="*" element={
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <h2>404 - Strona nie istnieje</h2>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;