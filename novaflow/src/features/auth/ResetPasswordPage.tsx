import { Link } from '../../lib/router';

function ResetPasswordPage() {
  return (
    <div>
      <h2>Reset Password</h2>
      <nav>
        <Link to="/login">Back to Login</Link>
      </nav>
    </div>
  );
}

export default ResetPasswordPage;
