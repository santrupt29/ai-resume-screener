// // frontend/src/hooks/useAuth.js
// import { createContext, useContext, useEffect, useState } from 'react';
// import { getCurrentUser, signIn, signUp, signOut } from '../lib/api';
// import { supabase } from '../lib/supabase';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const currentUser = await getCurrentUser();
//         setUser(currentUser);
//       } catch (error) {
//         console.error('Error fetching user:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUser();

//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         if (event === 'SIGNED_IN') {
//           setUser(session.user);
//         } else if (event === 'SIGNED_OUT') {
//           setUser(null);
//         }
//       }
//     );

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   const value = {
//     user,
//     loading,
//     signIn: async (email, password) => {
//       const { data } = await signIn(email, password);
//       setUser(data.user);
//       return data;
//     },
//     signUp: async (email, password, name) => {
//       const { data } = await signUp(email, password, name);
//       return data;
//     },
//     signOut: async () => {
//       await signOut();
//       setUser(null);
//     },
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react';
// import { getCurrentUser, signIn, signUp, signOut } from '../lib/api';
import { getCurrentUser, signIn, signUp, signOut } from '../lib/api';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (!error) setProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user/profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session.user);
          await fetchUserAndProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    signIn: async (email, password) => {
      const { data } = await signIn(email, password);
      setUser(data.user);
      await fetchUserAndProfile();
      return data;
    },
    signUp: async (email, password, name) => {
      const { data } = await signUp(email, password, name);
      await fetchUserAndProfile();
      return data;
    },
    signOut: async () => {
      await signOut();
      setUser(null);
      setProfile(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}