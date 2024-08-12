import React from 'react';
import { useState, useEffect } from 'react';
import logo from '../../../assets/img/itwo_logo.png';
import userSettingsImg from '../../../assets/img/user-settings.png';

const UserSettings = ({ supabase, userSettings, setIsSignedIn, openStores, setUserSettings }) => {

    console.log("USER SETTINGS", userSettings)
    const [name, setName] = useState(userSettings.name)
    const [email, setEmail] = useState(userSettings.email)
    const [retailBrand, setRetailBrand] = useState(userSettings.retail_brand)
    const [editSettings, setEditSettings] = useState(false)

    const saveUserSettings = () => {
        supabase
            .from('UserSettings')
            .update({
                name: name,
                email: email,
                retail_brand: retailBrand
            })
            .eq('user_id', userSettings.user_id)
            .then(({ data, error }) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(data)
                }
            })

        // Grab user settings from supabase, then set user settings
        supabase
            .from('UserSettings')
            .select('*')
            .eq('user_id', userSettings.user_id)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(data)
                    setUserSettings(data)
                    setEditSettings(false)
                }
            })
    }

    return (
        <div className='user-settings'>
            <div className='stores-header'>
                <img className="signin-logo" src={logo} alt="logo" />
            </div>
            <div className='user-settings-body'>
                <div className='user-settings-body-top'>
                    <h3>User Settings</h3>
                    <div className='close-btn' onClick={() => openStores()}></div>
                </div>
                <div className='user-settings-body-bottom'>
                    <div className='settings-header'>
                        Retail Brand
                    </div>
                    {!editSettings && <p className='settings-brand'>{userSettings.retail_brand !== null ? userSettings.retail_brand : 'N/A'}</p>}
                    {editSettings && <input type="text" value={retailBrand} onChange={(e) => { setRetailBrand(e.target.value) }} />}
                    <div className='settings-header'>
                        User Information
                    </div>
                    {!editSettings && <p className='settings-name'>{userSettings.name !== null ? userSettings.name : 'N/A'}</p>}
                    {editSettings && <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} />}
                    <p className='settings-email'>{userSettings.email !== null ? userSettings.email : 'N/A'}</p>
                    {userSettings.is_admin && <div className='admin-box'>Brand Admin</div>}
                    {!editSettings && <div className='change-password-btn' onClick={() => { }}>Change Password</div>}
                    {editSettings && <div className='change-password-btn' onClick={() => { saveUserSettings() }}>Save Changes</div>}
                    <div className='actions-bar-wrapper'>
                        <div className='actions-bar'>
                            <div className='edit-btn' onClick={() => { setEditSettings(!editSettings); setRetailBrand(userSettings.retail_brand); setName(userSettings.name); setEmail(userSettings.email); }}>Edit User Settings</div>
                            <div className='sign-out-btn' onClick={() => { setIsSignedIn(false) }}>Sign Out</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserSettings