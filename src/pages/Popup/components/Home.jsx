import React from 'react';
import { useState, useEffect } from 'react';
import UserSettings from './UserSettings';

const Home = ({ supabase, setIsSignedIn }) => {

    const [user, setUser] = useState(null);
    const [userSettings, setUserSettings] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(
            ({ data }) => {
                if (data.session) {
                    setUser(data.session.user);
                    supabase
                        .from('UserSettings')
                        .select('*')
                        .eq('user_id', data.session.user.id)
                        .single()
                        .then(({ data, error }) => {
                            if (error) {
                                console.log(error);
                                if (error.details && error.details == "The result contains 0 rows") {
                                    setShowSettings(true);
                                    return
                                }

                            } else {
                                setShowSettings(false);
                                setUserSettings(data);
                            }
                        })
                } else {
                    setIsSignedIn(false);
                }
            }
        )
    }, [])

    return (
        <div className='home'>
            {!showSettings && <h1>Welcome {user?.email}</h1>}
            {showSettings && <UserSettings supabase={supabase} setIsSignedIn={setIsSignedIn} />}
        </div>
    );
};

export default Home;