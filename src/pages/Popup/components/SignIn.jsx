import React from "react";
import { useState } from "react";
import logo from '../../../assets/img/itwo_logo.png';

const SignIn = ({ setIsSignedIn, supabase }) => {

    const [showSignIn, setShowSignIn] = useState(true);
    const [showSignUp, setShowSignUp] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        if (password == '' || email == '') {
            setError('Please enter all fields');
            return;
        }


        supabase.auth.signInWithPassword(
            {
                email: email,
                password: password
            }
        ).then(({ data, error }) => {
            if (error) {
                setError(error.message);
                console.log(error);
            } else {
                chrome.storage.sync.set({ user: { signedIn: true, id: data.user.id, accessToken: data.session.access_token, refreshToken: data.session.refresh_token } }, async () => {
                    supabase.auth.setSession(data.session).then(({ data, error }) => {
                        if (error) {
                            setError(error.message);
                            console.log(error);
                        } else {
                            setIsSignedIn(true);
                        }
                    })
                })
            }
        })
    }

    const handleSignUp = async () => {
        if (password == '' || email == '' || confirmPassword == '') {
            setError('Please enter all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        supabase.auth.signUp({
            email: email,
            password: password
        }).then(async ({ data, error }) => {
            if (error) {
                setError(error.message);
            } else {
                chrome.storage.sync.set({ user: { signedIn: true, id: data.user.id, accessToken: data.session.access_token, refreshToken: data.session.refresh_token } }, async () => {
                    supabase.auth.setSession(data.session).then(async ({ data, error }) => {
                        if (error) {
                            setError(error.message);
                        } else {
                            setIsSignedIn(true);
                        }
                    })
                })
            }
        })
    }

    return (
        <div className="signin-page">
            {!showSignIn && !showSignUp && <>
                <button onClick={() => setShowSignIn(true)}>Sign In</button>
                <p>Don't have an account?</p>
                <button onClick={() => setShowSignUp(true)}>Sign Up</button>
            </>}

            {(showSignIn || showSignUp) && <>
                <img className="signin-logo" src={logo} alt="logo" />
                <div className="signin-form">
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {showSignUp &&
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    }
                    {error && <p className="error-message">{error}</p>}
                    {showSignIn && <button className="mb-60" onClick={handleSignIn}>Sign In</button>}
                    {showSignUp && <button className="mb-60" onClick={handleSignUp}>Sign Up</button>}
                </div>
                {showSignIn && <div className="flex j-sb swap-signin-type">
                    <p>Don't have an account?</p>
                    <button className="simple-btn" onClick={() => { setShowSignUp(true); setShowSignIn(false); setError(''); setEmail(''); setPassword(''); }}>Sign Up</button>
                </div>}
                {showSignUp && <div className="flex j-sb swap-signin-type">
                    <p>Already have an account?</p>
                    <button className="simple-btn" onClick={() => { setShowSignUp(false); setShowSignIn(true); setError(''); setEmail(''); setPassword(''); setConfirmPassword(''); }}>Sign In</button>
                </div>}
            </>}
        </div>
    )
};

export default SignIn;