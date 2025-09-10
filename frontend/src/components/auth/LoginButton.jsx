// src/components/auth/LoginButton.jsx
import { useAuth } from '../../hooks/useAuth';
import  Button  from '../common/Button';

export default function LoginButton() {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    // For simplicity, we'll use a prompt for email and password
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    if (email && password) {
      try {
        await signIn(email, password);
      } catch (error) {
        alert('Login failed: ' + error.message);
      }
    }
  };

  return (
    <Button onClick={handleLogin}>
      Sign In
    </Button>
  );
}