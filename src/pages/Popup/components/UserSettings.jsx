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
            <img className="signin-logo" src={logo} alt="logo" />
            <div className='user-settings-body'>
                <div className='settings-close' onClick={() => openStores()}>{"< BACK"}</div>
                <h3 className='green-text page-header'>User Settings</h3>
                <div className='user-settings-body-bottom'>
                    <div className='settings-header'>
                        Retail Brand
                    </div>
                    {!editSettings && <input type="text" value={retailBrand} disabled />}
                    {editSettings && <input type="text" value={retailBrand} onChange={(e) => { setRetailBrand(e.target.value) }} />}
                    <button className='change-password-btn mb-30' onClick={() => { openStores() }}>Manage Locations ({userSettings.stores_ids !== null ? userSettings.stores_ids.length : 0})</button>
                    <div className='settings-header'>
                        Name
                    </div>
                    {!editSettings && <input type="text" value={name} disabled />}
                    {editSettings && <input type="text" value={name} onChange={(e) => { setName(e.target.value) }} />}
                    {userSettings.is_admin && <div className='admin-box'>Brand Admin</div>}
                    {!editSettings && <button className='change-password-btn mb-10' onClick={() => { }}>Change Password</button>}
                    {editSettings && <button className='change-password-btn mb-10' onClick={() => { saveUserSettings() }}>Save Changes</button>}
                    <button className='edit-btn mb-15 light-bg' onClick={() => { setEditSettings(!editSettings); setRetailBrand(userSettings.retail_brand); setName(userSettings.name); setEmail(userSettings.email); }}>Edit User Settings</button>
                    <button className='sign-out-btn light-bg' onClick={() => { setIsSignedIn(false) }}>Sign Out</button>
                </div>
            </div>
        </div>
    )
}

export default UserSettings