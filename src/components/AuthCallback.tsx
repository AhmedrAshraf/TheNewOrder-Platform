import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleEmailConfirmation = async (user: any, pendingSignup: any) => {
        try {
            console.log("Completing registration for:", user.email);

            if (!pendingSignup) {
                throw new Error("No pending signup data found");
            }

            const { error: userError } = await supabase.from("users").upsert({
                id: user.id,
                name: pendingSignup.name,
                email: user.email,
                role: pendingSignup.role,
                bio: pendingSignup.bio,
                title: pendingSignup.title,
                last_name: pendingSignup.last_name 
            });

            if (userError) throw userError;

            localStorage.removeItem('pendingSignup');
            setUser({
                id: user.id,
                ...pendingSignup
            });

            navigate("/");  
        } catch (error) {
            console.error("Confirmation error:", error);
        }
    };

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const token = searchParams.get('code');
                const type = searchParams.get('type');

                if (type === 'signup' && token) {
                    const pendingSignup = JSON.parse(localStorage.getItem('pendingSignup') || 'null');

                    if (!pendingSignup) {
                        throw new Error("Your signup session expired. Please sign up again.");
                    }

                    // For email confirmation, use the token hash
                    const { data, error } = await supabase.auth.verifyOtp({
                        email: pendingSignup.email,
                        token,
                        type: 'signup'
                    });

                    if (error) throw error;
                    if (!data.user) throw new Error("User not found in session");

                    await handleEmailConfirmation(data.user, pendingSignup);
                    return;
                }

                const { data: { session }, error } = await supabase.auth.getSession();

                if (error || !session) {
                    console.error("No active session found.");
                    // navigate('/');
                    return;
                }

                // Fetch user data
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (userError) throw userError;
                console.log("added");
                
                localStorage.setItem('authState', JSON.stringify(userData));
                localStorage.setItem('userId', userData.id);
                setUser(userData);

                navigate("/"); 
            } catch (error) {
                console.error("Authentication error:", error);
            }
        };

        handleAuthCallback();
    }, [navigate, searchParams, setUser]);

    return (
        <div className='min-h-screen flex flex-col items-center justify-center'>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className='mt-4 text-gray-600'>Completing authentication...</p>
        </div>
    );
};

export default AuthCallback;
