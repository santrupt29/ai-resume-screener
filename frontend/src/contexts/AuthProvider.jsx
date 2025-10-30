// // import React, { useEffect } from 'react';
// // import useAuthStore from '../stores/authStore';

// // export function AuthProvider({ children }) {
// //   const initialize = useAuthStore((state) => state.initialize);
  
// //   useEffect(() => {
// //     // Initialize auth state when the app loads
// //     initialize();
// //   }, [initialize]);
  
// //   return <>{children}</>;
// // }


// // src/contexts/AuthProvider.jsx
// import React, { useEffect } from 'react';
// import useAuthStore from '../stores/authStore';

// export function AuthProvider({ children }) {
//   const initialize = useAuthStore((state) => state.initialize);
//   const initialized = useAuthStore((state) => state.initialized);
  
//   useEffect(() => {
//     // Initialize auth state when the app loads
//     if (!initialized) {
//       initialize();
//     }
//   }, [initialize, initialized]);
  
//   // Don't render children until auth is initialized
//   if (!initialized) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return <>{children}</>;
// }



// src/contexts/AuthProvider.jsx
// import React, { useEffect } from 'react';
// import useAuthStore from '../stores/authStore';

// export function AuthProvider({ children }) {
//   const initialize = useAuthStore((state) => state.initialize);
//   const initialized = useAuthStore((state) => state.initialized);
  
//   useEffect(() => {
//     // Initialize auth state when the app loads
//     if (!initialized) {
//       initialize();
//     }
//   }, [initialize, initialized]);
  
//   // Don't render children until auth is initialized
//   if (!initialized) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return <>{children}</>;
// }



// src/contexts/AuthProvider.jsx
// import React, { useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import useAuthStore from '../stores/authStore';

// export function AuthProvider({ children }) {
//   const initialized = useAuthStore((state) => state.initialized);
  
//   useEffect(() => {
//     // This will trigger the onAuthStateChange listener with the 'INITIAL_SESSION' event
//     // The listener will handle the rest.
//     supabase.auth.getSession();

//     // No need to call initialize() here anymore
//   }, []);

//   // Don't render children until auth is initialized
//   if (!initialized) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return <>{children}</>;
// }













// src/contexts/AuthProvider.jsx (EXPLICIT CONTROL VERSION)
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../stores/authStore';

export function AuthProvider({ children }) {
  const { setAuthState, setInitialized } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component

    const initializeAuth = async () => {
      console.log("AuthProvider: Starting initialization...");
      setIsInitializing(true);
      setAuthState(null, null, true, null); // Set loading to true

      try {
        // 1. Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("AuthProvider: Session error:", sessionError);
          if (isMounted) {
            setAuthState(null, null, false, sessionError.message);
            setInitialized(true);
            setIsInitializing(false);
          }
          return;
        }

        if (session?.user) {
          console.log("AuthProvider: Found session for user:", session.user.id);
          if (isMounted) {
            setAuthState(session.user, null, true, null); // Set user, start loading for profile
          }

          // 2. Fetch the user's profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("AuthProvider: Profile fetch error:", profileError);
            // Don't fail completely, just proceed without a profile
          }

          if (isMounted) {
            setAuthState(session.user, profileData, false, null); // Set user and profile, stop loading
          }
        } else {
          console.log("AuthProvider: No session found.");
          if (isMounted) {
            setAuthState(null, null, false, null); // No user, not loading
          }
        }
      } catch (err) {
        console.error("AuthProvider: Unexpected error during initialization:", err);
        if (isMounted) {
          setAuthState(null, null, false, err.message);
        }
      } finally {
        if (isMounted) {
          console.log("AuthProvider: Initialization finished.");
          setInitialized(true);
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    // 3. Listen for auth changes (e.g., sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`AuthProvider: Auth state changed. Event: ${event}`);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // This will be triggered by the signIn function
        // The effect will re-run and fetch the profile, so we can just set the user here
        setAuthState(session.user, null, false, null);
      } else if (event === 'SIGNED_OUT') {
        setAuthState(null, null, false, null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthState, setInitialized]);

  // Show a loading screen ONLY during the very first initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing Application...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}