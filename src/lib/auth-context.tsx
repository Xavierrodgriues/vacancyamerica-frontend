import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
  _id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  token?: string;
  friends?: string[];
  blocked_users?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: any) => void;
  signup: (userData: any) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => { },
  signup: () => { },
  signOut: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in local storage
    const token = localStorage.getItem('token');
    if (token) {
      // Here we should validate the token with the backend /me endpoint
      fetch('https://vacancyamerica-backend.onrender.com/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch user');
        })
        .then(data => {
          setUser({ ...data, token });
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
  };

  const signup = (userData: User) => {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
