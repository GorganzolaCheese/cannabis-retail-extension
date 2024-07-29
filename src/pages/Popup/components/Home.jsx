import React from 'react';
import { useState, useEffect } from 'react';
import ProductInfoUpload from './ProductInfoUpload';
import UserSettings from './UserSettings';
import Stores from './Stores';

const Home = ({ supabase, setIsSignedIn }) => {

    const [user, setUser] = useState(null);
    const [userSettings, setUserSettings] = useState(null);
    const [showProductInfoUpload, setShowProductInfoUpload] = useState(false);
    const [showUserSettings, setShowSettings] = useState(false);
    const [showStores, setShowStores] = useState(false);
    const [showMenu, setShowMenu] = useState(true);

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

    const returnToMenu = () => {
        setShowProductInfoUpload(false);
        setShowSettings(false);
        setShowStores(false);
        setShowMenu(true);
    }

    return (
        <div className='home'>
            {showMenu &&
                <>
                    <h1>Menu</h1>
                    <div className='menu'>
                        <button onClick={() => { setShowProductInfoUpload(true); setShowMenu(false) }}>Product Info Upload</button>
                        <button onClick={() => { setShowStores(true); setShowMenu(false) }}>Stores</button>
                        <button onClick={() => { setShowUserSettings(true); setShowMenu(false) }}>User Settings</button>
                    </div>
                </>
            }
            {showProductInfoUpload && <ProductInfoUpload supabase={supabase} userSettings={userSettings} setIsSignedIn={setIsSignedIn} returnToMenu={returnToMenu} />}
            {showUserSettings && <UserSettings supabase={supabase} userSettings={userSettings} setIsSignedIn={setIsSignedIn} returnToMenu={returnToMenu} />}
            {showStores && <Stores supabase={supabase} userSettings={userSettings} setIsSignedIn={setIsSignedIn} returnToMenu={returnToMenu} />}
        </div>
    );
};

export default Home;