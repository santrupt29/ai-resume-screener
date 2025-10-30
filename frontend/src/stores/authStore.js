// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import { supabase } from '../lib/supabase.js';
// import { getCurrentUser, signIn, signUp, signOut } from '../lib/api.js';

// const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       // State
//       user: null,
//       profile: null,
//       loading: true,
//       error: null,
      
//       // Actions
//       setLoading: (loading) => set({ loading }),
//       setError: (error) => set({ error }),
      
//       // Initialize auth state
//       initialize: async () => {
//         try {
//           set({ loading: true, error: null });
          
//           // Get current session
//           const { data: { session } } = await supabase.auth.getSession();
          
//           if (session?.user) {
//             set({ user: session.user });
            
//             // Fetch user profile
//             const { data: profileData, error } = await supabase
//               .from('profiles')
//               .select('*')
//               .eq('id', session.user.id)
//               .single();
              
//             if (!error && profileData) {
//               set({ profile: profileData });
//             }
//           }
//         } catch (error) {
//           console.error('Error initializing auth:', error);
//           set({ error: error.message });
//         } finally {
//           set({ loading: false });
//         }
//       },
      
//       // Sign in
//       signIn: async (email, password) => {
//         try {
//           set({ loading: true, error: null });
          
//           const data = await signIn(email, password);
          
//           // The onAuthStateChange listener will handle updating the state
//           return data;
//         } catch (error) {
//           console.error('Sign in error:', error);
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       // Sign up
//       signUp: async (email, password, name) => {
//         try {
//           set({ loading: true, error: null });
          
//           const data = await signUp(email, password, name);
          
//           // The onAuthStateChange listener will handle updating the state
//           return data;
//         } catch (error) {
//           console.error('Sign up error:', error);
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       // Sign out
//       signOut: async () => {
//         try {
//           set({ loading: true, error: null });
          
//           await signOut();
          
//           // The onAuthStateChange listener will handle updating the state
//         } catch (error) {
//           console.error('Sign out error:', error);
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       // Update profile
//       updateProfile: async (profileData) => {
//         try {
//           const { user } = get();
          
//           if (!user) {
//             throw new Error('No user logged in');
//           }
          
//           const { data, error } = await supabase
//             .from('profiles')
//             .upsert({ id: user.id, ...profileData })
//             .select()
//             .single();
            
//           if (error) throw error;
          
//           set({ profile: data });
//           return data;
//         } catch (error) {
//           console.error('Error updating profile:', error);
//           set({ error: error.message });
//           throw error;
//         }
//       },
      
//       // Reset auth state
//       reset: () => {
//         set({
//           user: null,
//           profile: null,
//           loading: false,
//           error: null,
//         });
//       },
//     }),
//     {
//       name: 'auth-storage',
//       storage: createJSONStorage(() => localStorage),
//       // Only persist user and profile, not loading or error states
//       partialize: (state) => ({ user: state.user, profile: state.profile }),
//     }
//   )
// );

// // Set up auth state listener
// supabase.auth.onAuthStateChange(async (event, session) => {
//   const { initialize, reset } = useAuthStore.getState();
  
//   if (event === 'SIGNED_IN' && session?.user) {
//     // Update user in store
//     useAuthStore.setState({ user: session.user });
    
//     // Fetch user profile
//     try {
//       const { data: profileData, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', session.user.id)
//         .single();
        
//       if (!error && profileData) {
//         useAuthStore.setState({ profile: profileData });
//       }
//     } catch (error) {
//       console.error('Error fetching profile after sign in:', error);
//     } finally {
//       useAuthStore.setState({ loading: false });
//     }
//   } else if (event === 'SIGNED_OUT') {
//     reset();
//   }
// });

// export default useAuthStore;


// // src/stores/authStore.js
// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import { supabase } from '../lib/supabase.js';
// import { getCurrentUser, signIn, signUp, signOut } from '../lib/api.js';

// const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       // State
//       user: null,
//       profile: null,
//       loading: true,
//       error: null,
//       initialized: false, // Add this to track initialization
      
//       // Actions
//       setLoading: (loading) => set({ loading }),
//       setError: (error) => set({ error }),
      
//       // Initialize auth state
//       initialize: async () => {
//         try {
//           set({ loading: true, error: null });
          
//           // Get current session
//           const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
//           if (sessionError) {
//             console.error('Error getting session:', sessionError);
//             set({ error: sessionError.message, initialized: true, loading: false });
//             return;
//           }
          
//           if (session?.user) {
//             set({ user: session.user });
            
//             // Fetch user profile
//             const { data: profileData, error: profileError } = await supabase
//               .from('profiles')
//               .select('*')
//               .eq('id', session.user.id)
//               .single();
              
//             if (profileError) {
//               console.error('Error fetching profile:', profileError);
//               // Don't fail the entire initialization if profile fetch fails
//               set({ error: profileError.message, initialized: true, loading: false });
//               return;
//             }
            
//             set({ profile: profileData });
//           }
//         } catch (error) {
//           console.error('Error initializing auth:', error);
//           set({ error: error.message });
//         } finally {
//           set({ initialized: true, loading: false });
//         }
//       },
      
//       // Sign in
//       signIn: async (email, password) => {
//         try {
//           set({ loading: true, error: null });
          
//           const data = await signIn(email, password);
          
//           // The onAuthStateChange listener will handle updating the state
//           return data;
//         } catch (error) {
//           console.error('Sign in error:', error);
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       // Sign up
//       signUp: async (email, password, name) => {
//         try {
//           set({ loading: true, error: null });
          
//           const data = await signUp(email, password, name);
          
//           // The onAuthStateChange listener will handle updating the state
//           return data;
//         } catch (error) {
//           console.error('Sign up error:', error);
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       // Sign out
//       signOut: async () => {
//         try {
//           set({ loading: true, error: null });
          
//           await signOut();
          
//           // The onAuthStateChange listener will handle updating the state
//         } catch (error) {
//           console.error('Sign out error:', error);
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       // Update profile
//       updateProfile: async (profileData) => {
//         try {
//           const { user } = get();
          
//           if (!user) {
//             throw new Error('No user logged in');
//           }
          
//           const { data, error } = await supabase
//             .from('profiles')
//             .upsert({ id: user.id, ...profileData })
//             .select()
//             .single();
            
//           if (error) throw error;
          
//           set({ profile: data });
//           return data;
//         } catch (error) {
//           console.error('Error updating profile:', error);
//           set({ error: error.message });
//           throw error;
//         }
//       },
      
//       // Reset auth state
//       reset: () => {
//         set({
//           user: null,
//           profile: null,
//           loading: false,
//           error: null,
//           initialized: true, // Keep initialized as true
//         });
//       },
//     }),
//     {
//       name: 'auth-storage',
//       storage: createJSONStorage(() => localStorage),
//       // Only persist user and profile, not loading or error states
//       partialize: (state) => ({ user: state.user, profile: state.profile }),
//       // Add a version to handle migrations if needed
//       version: 1,
//       // Handle migration if needed
//       migrate: (persistedState, version) => {
//         if (version === 0) {
//           // Migration logic for version 0 to 1
//           persistedState.initialized = false;
//         }
//         return persistedState;
//       },
//     }
//   )
// );

// // Set up auth state listener
// supabase.auth.onAuthStateChange(async (event, session) => {
//   const { initialize, reset } = useAuthStore.getState();
  
//   if (event === 'SIGNED_IN' && session?.user) {
//     // Update user in store
//     useAuthStore.setState({ user: session.user });
    
//     // Fetch user profile
//     try {
//       const { data: profileData, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', session.user.id)
//         .single();
        
//       if (!error && profileData) {
//         useAuthStore.setState({ profile: profileData });
//       }
//     } catch (error) {
//       console.error('Error fetching profile after sign in:', error);
//     } finally {
//       useAuthStore.setState({ loading: false, initialized: true });
//     }
//   } else if (event === 'SIGNED_OUT') {
//     reset();
//   }
// });

// export default useAuthStore;



// src/stores/authStore.js
// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import { supabase } from '../lib/supabase.js';
// import { signIn, signUp, signOut } from '../lib/api.js'; // Assuming these are in api.js

// const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       // State
//       user: null,
//       profile: null,
//       loading: true, // Start with loading true
//       error: null,
//       initialized: false, // This is the key flag
      
//       // Actions
//       setLoading: (loading) => set({ loading }),
//       setError: (error) => set({ error }),
      
//       // A simple function to fetch the profile
//       fetchProfile: async (userId) => {
//         try {
//           const { data: profileData, error } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('id', userId)
//             .single();
            
//           if (error) {
//             // Don't throw an error, just log it. A user can exist without a profile.
//             console.error('Error fetching profile:', error);
//             set({ profile: null }); // Ensure profile is null on error
//           } else {
//             set({ profile: profileData });
//           }
//         } catch (err) {
//           console.error('Unexpected error fetching profile:', err);
//           set({ profile: null });
//         }
//       },

//       // Auth actions
//       signIn: async (email, password) => {
//         set({ loading: true, error: null });
//         try {
//           const data = await signIn(email, password);
//           return data;
//         } catch (error) {
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       signUp: async (email, password, name) => {
//         set({ loading: true, error: null });
//         try {
//           const data = await signUp(email, password, name);
//           return data;
//         } catch (error) {
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       signOut: async () => {
//         set({ loading: true, error: null });
//         try {
//           await signOut();
//         } catch (error) {
//           set({ error: error.message, loading: false });
//           throw error;
//         }
//       },
      
//       // Reset auth state
//       reset: () => {
//         set({
//           user: null,
//           profile: null,
//           loading: false,
//           error: null,
//           initialized: true,
//         });
//       },
//     }),
//     {
//       name: 'auth-storage',
//       storage: createJSONStorage(() => localStorage),
//       partialize: (state) => ({ user: state.user, profile: state.profile }),
//     }
//   )
// );

// // THE FIX: A single, robust auth state listener
// supabase.auth.onAuthStateChange(async (event, session) => {
//   console.log('onAuthStateChange event:', event, session?.user?.id);
//   const { fetchProfile } = useAuthStore.getState();

//   if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
//     if (session?.user) {
//       // Set user and loading state immediately
//       useAuthStore.setState({ user: session.user, loading: true, error: null });
      
//       // Fetch the profile
//       await fetchProfile(session.user.id);
      
//       // Mark as initialized and stop loading
//       useAuthStore.setState({ initialized: true, loading: false });
//     } else {
//       // No session, reset state
//       useAuthStore.getState().reset();
//     }
//   } else if (event === 'SIGNED_OUT') {
//     useAuthStore.getState().reset();
//   }
// });

// export default useAuthStore;






// src/stores/authStore.js (SIMPLIFIED VERSION)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase.js';
import { signIn, signUp, signOut } from '../lib/api.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      profile: null,
      loading: false, // Start with false, let the provider control it
      error: null,
      initialized: false,
      
      // Simple actions
      setAuthState: (user, profile, loading, error) => {
        set({ user, profile, loading, error });
      },
      
      setInitialized: (initialized) => {
        set({ initialized });
      },
      
      // Auth actions
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await signIn(email, password);
          // The provider's effect will handle the state update
          return data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      signUp: async (email, password, name) => {
        set({ loading: true, error: null });
        try {
          const data = await signUp(email, password, name);
          // The provider's effect will handle the state update
          return data;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      signOut: async () => {
        set({ loading: true, error: null });
        try {
          await supabase.auth.signOut();
          // Reset state manually
          set({ user: null, profile: null, loading: false, error: null, initialized: true });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);

export default useAuthStore;