import React from 'react';
import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { createClient } from '@supabase/supabase-js';
import secrets from '../../../../secrets';
import logo from '../../../assets/img/itwo_logo.png';
import location from '../../../assets/img/location.svg';
import cancel from '../../../assets/img/cancel.svg';
import userSettingsImg from '../../../assets/img/user-settings.png';

const Stores = ({ supabase, userSettings, setIsSignedIn, returnToMenu, openUserSettings, setShowProductInfoUpload, setSelectedStore, setAllStores }) => {

    const [stores, setStores] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [storeSearch, setStoreSearch] = useState('');
    const [fuseSearch, setFuseSearch] = useState(false);
    const [showSetYourStores, setShowSetYourStores] = useState(false);

    const fuseOptions = {
        keys: ['name', 'formatted_address'],
        threshold: 0.1,
        showAllMatches: false,
        minMatchCharLength: 3
    }

    const setupStores = async () => {
        console.log(userSettings)

        let allRows = [];
        let from = 0;
        let to = 999;
        let batch;

        do {
            // Get full store list
            const { data, error } = await supabase.from('Stores').select('*').range(from, to)

            if (error) {
                console.error(error);
                break;
            }

            // Ensure `data` is an array, or use an empty array as fallback
            batch = data || [];
            allRows = [...allRows, ...batch];

            from += 1000;
            to += 1000;
        } while (batch.length > 0)

        setStores(allRows);
        setFuseSearch(new Fuse(allRows, fuseOptions));

        // Get user store IDs
        supabase.from('UserSettings').select('stores_ids').eq('user_id', userSettings.user_id).single().then(({ data, error }) => {
            if (error) {
                console.log(error);
            } else {
                console.log('DATA')
                console.log(data)
                setSelectedStores(data.stores_ids);
            }
        })
    }

    useEffect(() => {
        setupStores();
    }, [])

    const handleSearch = (e) => {
        setStoreSearch(e.target.value);
    }

    const handleAddStore = (store) => {
        if (selectedStores.includes(store.id)) return
        // Remove it from fuse search, temporarily
        setSelectedStores([...selectedStores, store.id])
    }

    const handleRemoveStore = (storeId) => {
        setSelectedStores(selectedStores.filter(store => store != storeId))
    }

    // CALL THIS AFTER EVERY CHANGE
    const saveStores = () => {
        supabase.from('UserSettings').update({ stores_ids: selectedStores }).eq('user_id', userSettings.user_id).then(({ data, error }) => {
            if (error) {
                console.log(error);
            }
        })
    }

    const setStoreAndOpenProductInfoUpload = (store_id, allStores) => {
        setSelectedStore(store_id)
        setAllStores(allStores)
        setShowProductInfoUpload(true)
    }

    useEffect(() => {
        console.log(stores)
    }, [stores])

    return (
        <div className='stores-page'>
            <div className='stores-header'>
                <img className="signin-logo" src={logo} alt="logo" />
                <img onClick={() => openUserSettings()} className="user-settings-image" src={userSettingsImg} alt="logo" />
            </div>
            <div className='stores-inner'>
                <div className={`your-stores ${showSetYourStores ? '' : ' open'}`}>
                    <h2>Select Your Store</h2>
                    <div className='your-stores-list'>
                        {selectedStores.length > 0 && stores.length > 0 && <ul className='stores-list stores-list-selected'>
                            {selectedStores.map((storeId) => {
                                return (
                                    <div className='store-item'>
                                        <img src={location} alt="location" className='location-img' onClick={() => setStoreAndOpenProductInfoUpload(storeId)} />
                                        <li key={storeId} onClick={() => setStoreAndOpenProductInfoUpload(storeId, stores)}>
                                            <b>{stores.find(store => store.id == storeId).name}</b><br></br>
                                            {stores.find(store => store.id == storeId).formatted_address}
                                        </li>
                                        <img src={cancel} alt="cancel" className='cancel-img' onClick={(e) => handleRemoveStore(storeId)} />
                                    </div>
                                )
                            })}
                        </ul>}
                        {selectedStores.length == 0 && <p>No stores assigned to you</p>}
                    </div>
                </div>
                <div className={`set-your-stores ${showSetYourStores ? ' open' : ''}`}>
                    <div className='set-your-stores-header'>
                        <h2>Add Store</h2>
                        <div onClick={() => { setShowSetYourStores(false); saveStores() }} className='close-btn'></div>
                    </div>
                    <ul className='stores-list stores-list-set'>
                        {fuseSearch && fuseSearch.search(storeSearch).map((store) => {
                            if (selectedStores.includes(store.id)) {
                                return null
                            }
                            console.log('STORE')
                            console.log(store)
                            return (
                                <div className={'store-item' + (selectedStores.includes(store.item.id) ? ' selected' : '')} onClick={() => handleAddStore(store.item)}>
                                    <div className='add-btn'></div>
                                    <li key={store.item.id}>
                                        <b>{store.item.name}</b><br></br>
                                        {store.item.formatted_address}
                                    </li>
                                </div>
                            )
                        })}
                    </ul>
                    {stores.length == 0 && <p>No stores found</p>}
                    <div className='search-container'><input type="text" onChange={(e) => handleSearch(e)} placeholder="Search Stores" /></div>
                </div>
                <div className='stores-footer'>
                    <div className='add-stores-btn' onClick={() => { setShowSetYourStores(true) }}>Add Stores</div>
                </div>
            </div>
        </div>
    )
}

export default Stores