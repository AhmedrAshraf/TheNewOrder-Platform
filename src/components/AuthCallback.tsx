import React,{useEffect, useState} from 'react'
import { supabase } from '../lib/supabase'
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AuthCallback = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const {setUser} = useAuth()

    useEffect(()=>{
    const handleAuthCallback = async() =>{
        try{
            const params = new URLSearchParams(window.location.search)
            console.log("🚀 ~ handleAuthCallback ~ params:", params)
            const token = params.get('token') || params.get('code');
            console.log("🚀 ~ handleAuthCallback ~ token:", token)
            const type = params.get("type");
            console.log("🚀 ~ handleAuthCallback ~ type:", type)

            // email confirmation
            if(token && type === 'signup'){
                const pendingSignup = JSON.parse(localStorage.getItem('pendingSignup') || 'null');
                if(!pendingSignup){
                    throw new Error("Couldn' find your signup data. please signup again")
                }
            
                const {data, error} = await supabase.auth.verifyOtp({
                    email: pendingSignup.email,
                    token, 
                    type: 'signup'
                });
                if(error) throw error
                if(!data.session?.user) throw new Error("session creation failed")
                
                await handleEmailC
            }
        }catch(error){
            console.error("Authentication process failed", error)
            alert("Authentication process failed" + error.mesage)
        }
        navigate('auth/signin')
    }
    handleAuthCallback()
    },[navigate, setUser])

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className='mt-4 text-gray-600'>Completing authentication...</p>
        </div>
    )
}

export default AuthCallback
