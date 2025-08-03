import { Link } from '../../lib/router';

function LoginPage() {
  return (
    <div>
      <h2>Login</h2>
      <nav>
        <Link to="/reset-password">Reset Password</Link>
        <br />
        <Link to="/accept-invite">Accept Invite</Link>
      </nav>
    </div>
  );
}

export default LoginPage;
