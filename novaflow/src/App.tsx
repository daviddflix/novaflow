import { Routes, Route } from 'react-router-dom';
import { LoginPage, SetPasswordPage, PasswordResetPage, PasswordResetConfirmPage, FirstAdminSetup } from './features/auth';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/accept-invite" element={<SetPasswordPage />} />
      <Route path="/reset-password" element={<PasswordResetPage />} />
      <Route path="/reset-password/confirm" element={<PasswordResetConfirmPage />} />
      <Route path="/" element={<FirstAdminSetup />} /> {/* TODO: Remove in production */}
    </Routes>
  );
}

export default App; 
