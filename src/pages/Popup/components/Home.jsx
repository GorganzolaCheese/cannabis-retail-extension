import React from 'react';
import { useState, useEffect } from 'react';
import ProductInfoUpload from './ProductInfoUpload';
import UserSettings from './UserSettings';
import Stores from './Stores';
import logo from '../../../assets/img/itwo_logo.png';

const Home = ({ supabase, setIsSignedIn }) => {

    const [user, setUser] = useState(null);
    const [userSettings, setUserSettings] = useState(null);
    const [showProductInfoUpload, setShowProductInfoUpload] = useState(false);
    const [showUserSettings, setShowUserSettings] = useState(false);
    const [showStores, setShowStores] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [allStores, setAllStores] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(
            ({ data }) => {
                if (data.session) {
                    setUser(data.session.user);
                    console.log("DATA SESSION ", data.session)
                    const userId = data.session.user.id;
                    const email = data.session.user.email;
                    supabase
                        .from('UserSettings')
                        .select('*')
                        .eq('user_id', data.session.user.id)
                        .single()
                        .then(({ data, error }) => {
                            if (error) {
                                console.log(error);
                                if (error.details && error.details == "The result contains 0 rows") {
                                    // Create new user settings
                                    supabase
                                        .from('UserSettings')
                                        .insert({
                                            user_id: userId,
                                            stores_ids: [],
                                            email: email,
                                            name: "New User",
                                        })
                                        .then((res) => {
                                            if (res.error) {
                                                console.log(res.error)
                                                setIsSignedIn(false);
                                                // SIGN OUT
                                                supabase.auth.signOut();
                                                return
                                            }
                                            supabase.
                                                from('UserSettings')
                                                .select('*')
                                                .eq('user_id', userId)
                                                .single()
                                                .then(({ data, error }) => {
                                                    console.log("RECIEVED THIS DATA", data)
                                                    if (error) {
                                                        console.log(error);
                                                        setIsSignedIn(false);
                                                        // SIGN OUT
                                                        supabase.auth.signOut();
                                                    } else {
                                                        setUserSettings(data);
                                                        openUserSettings();
                                                    }
                                                })
                                        })
                                }

                            } else {
                                console.log("USER SETTINGS!", data)
                                setShowUserSettings(false);
                                setUserSettings(data);
                                setShowStores(true);
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
        setShowUserSettings(false);
        setShowStores(false);
        setShowMenu(true);
    }

    const openUserSettings = () => {
        setShowUserSettings(true);
        setShowMenu(false);
        setShowStores(false);
        setShowProductInfoUpload(false);
    }

    const openStores = () => {
        setShowStores(true);
        setShowMenu(false);
        setShowUserSettings(false);
        setShowProductInfoUpload(false);
    }

    const openProductInfoUpload = () => {
        setShowProductInfoUpload(true);
        setShowMenu(false);
        setShowUserSettings(false);
        setShowStores(false);
    }

    return (
        <div className='home'>
            {showMenu &&
                <>
                    <div className='home-header'>
                        <img className="signin-logo" src={logo} alt="logo" />
                    </div>
                    <div className='menu'>
                        <button onClick={() => { setShowProductInfoUpload(true); setShowMenu(false) }}>Product Info Upload</button>
                        <button onClick={() => { setShowStores(true); setShowMenu(false) }}>Stores</button>
                        <button onClick={() => { setShowUserSettings(true); setShowMenu(false) }}>User Settings</button>
                    </div>
                </>
            }
            {showProductInfoUpload && <ProductInfoUpload supabase={supabase} userSettings={userSettings} setIsSignedIn={setIsSignedIn} returnToMenu={returnToMenu} openUserSettings={openUserSettings} setSelectedStore={setSelectedStore} selectedStore={selectedStore} allStores={allStores} openStores={openStores} />}
            {showUserSettings && <UserSettings supabase={supabase} setUserSettings={setUserSettings} userSettings={userSettings} setIsSignedIn={setIsSignedIn} returnToMenu={returnToMenu} openStores={openStores} />}
            {showStores && <Stores supabase={supabase} userSettings={userSettings} setIsSignedIn={setIsSignedIn} returnToMenu={returnToMenu} openUserSettings={openUserSettings} setShowProductInfoUpload={openProductInfoUpload} setSelectedStore={setSelectedStore} setAllStores={setAllStores} />}
        </div>
    );
};

export default Home;