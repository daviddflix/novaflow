import { LoginPage, AcceptInvitePage, ResetPasswordPage } from './features/auth';
import { useRouter } from './lib/router';

function App() {
  const { path } = useRouter();

  switch (path) {
    case '/accept-invite':
      return <AcceptInvitePage />;
    case '/reset-password':
      return <ResetPasswordPage />;
    case '/login':
    default:
      return <LoginPage />;
  }
}

export default App;
