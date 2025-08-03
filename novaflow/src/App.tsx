import { Routes, Route } from 'react-router-dom';
import { LoginPage, SetPasswordPage, PasswordResetPage, FirstAdminSetup } from './features/auth';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/accept-invite" element={<SetPasswordPage />} />
      <Route path="/reset-password" element={<PasswordResetPage />} />
      <Route path="/setup" element={<FirstAdminSetup />} /> {/* TODO: Remove this once we have a proper landing page */}
    </Routes>
  );
}

export default App; 
