import { useUserData } from '@nhost/react';
import { LoginForm } from './LoginForm';


interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const user = useUserData();

  if (!user) {
    return <LoginForm />;
  }

  return <>{children}</>;
};

export default AuthGuard;