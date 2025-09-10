// src/components/auth/LogoutButton.jsx
import { useAuth } from '../../hooks/useAuth';
import  Button  from '../common/Button';

export default function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      alert('Logout failed: ' + error.message);
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Sign Out
    </Button>
  );
}