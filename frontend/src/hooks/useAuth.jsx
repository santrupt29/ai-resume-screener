// import React from 'react';
// import { createContext, useContext, useEffect, useState } from 'react';
// import { getCurrentUser, signIn, signUp, signOut } from '../lib/api.js';
// import { supabase } from '../lib/supabase.js';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchUserAndProfile = async (currentUser = null) => {
//     try {
//       const userToFetch = currentUser || await getCurrentUser();
//       console.log('Found currentUser', userToFetch);
//       setUser(userToFetch);

//       if (userToFetch) {
//         const { data: profileData, error } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('id', userToFetch.id)
//           .single();
//         console.log('Found profile', profileData);

//         if (!error) setProfile(profileData);
//       } else {
//         setProfile(null);
//       }
//     } catch (error) {
//       console.error('Error fetching user/profile:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserAndProfile();

//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         console.log('Auth state changed:', event, session);
//         if (event === 'SIGNED_IN') {
//           // Use the session user directly instead of relying on state
//           await fetchUserAndProfile(session.user);
//         } else if (event === 'SIGNED_OUT') {
//           setUser(null);
//           setProfile(null);
//           setLoading(false);
//         }
//       }
//     );

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   const value = {
//     user,
//     profile,
//     loading,
//     signInFunction: async (email, password) => {
//       console.log('Signing in...', email, password);
//       const data = await signIn(email, password);
//       // Use the returned user data directly instead of relying on state
//       await fetchUserAndProfile(data.user);
//       return data;
//     },
//     signUpFunction: async (email, password, name) => {
//       const data = await signUp(email, password, name);
//       // Use the returned user data directly instead of relying on state
//       await fetchUserAndProfile(data.user);
//       return data;
//     },
//     signOutFunction: async () => {
//       await signOut();
//       setUser(null);
//       setProfile(null);
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



// import useAuthStore from "../stores/authStore.js";
// export function useAuth() {
//   const store = useAuthStore();
  
//   return {
//     user: store.user,
//     profile: store.profile,
//     loading: store.loading,
//     error: store.error,
//     isAuthenticated: !!store.user,
    
//     signIn: store.signIn,
//     signUp: store.signUp,
//     signOut: store.signOut,
//     updateProfile: store.updateProfile,
//     setError: store.setError,
//   };
// }






// src/hooks/useAuth.js
import  useAuthStore  from '../stores/authStore.js';
export function useAuth() {
  const store = useAuthStore();
  console.log('useAuth Hook State:', {
    userId: store.user?.id,
    userEmail: store.user?.email,
    loading: store.loading,
    error: store.error,
    initialized: store.initialized,
    isAuthenticated: !!store.user,
  });
  
  return {
    // State
    user: store.user,
    profile: store.profile,
    loading: store.loading,
    error: store.error,
    initialized: store.initialized,
    isAuthenticated: !!store.user,
    
    // Actions
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    updateProfile: store.updateProfile,
    setError: store.setError,
  };
}

export default useAuth;