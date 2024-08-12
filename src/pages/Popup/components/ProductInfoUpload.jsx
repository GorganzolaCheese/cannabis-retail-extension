import React from 'react';
import { useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import logo from '../../../assets/img/itwo_logo.png';
import uploadIcon from '../../../assets/img/upload-icon.png';
import location from '../../../assets/img/location.svg';
import userSettingsImg from '../../../assets/img/user-settings.png';

const ProductInfoUpload = ({ supabase, userSettings, openUserSettings, setSelectedStore, selectedStore }) => {

    const [files, setFiles] = useState([]);
    const [csv, setCsv] = useState(null);
    const [productInformation, setProductInformation] = useState(null);
    const [stores, setStores] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [currentStore, setCurrentStore] = useState(null);
    const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
    const [storesListLoaded, setStoresListLoaded] = useState(false);
    const [showUpload, setShowUpload] = useState(true);

    useEffect(() => {

        console.log(userSettings)

        // Get full store list
        supabase.from('Stores').select('*').then(({ data, error }) => {
            if (error) {
                console.log(error);
            } else {
                setStores(data);
                data.forEach(store => {
                    if (store.id == selectedStore) {
                        setCurrentStore(store)
                    }
                })
                setStoresListLoaded(true);
            }
        })
        // Get user store IDs
        supabase.from('UserSettings').select('stores_ids').eq('user_id', userSettings.user_id).single().then(({ data, error }) => {
            if (error) {
                console.log(error);
            } else {
                setSelectedStores(data.stores_ids);
            }
        })
    }, [])

    useEffect(() => {
        console.log(files)
        if (files.length > 0) {
            setCsv(files[0]);
        }
    }, [files])

    useEffect(() => {
        if (csv != null) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const csvData = e.target.result;

                // Split the CSV string into lines
                const lines = csvData.split('\n');

                // Find the first empty line that separates parameters and data
                const dataStartIndex = lines.findIndex(line => line.trim() === '') + 1;

                // Extract only the data lines
                const dataLines = lines.slice(dataStartIndex).join('\n');

                // Parse the CSV content
                Papa.parse(dataLines, {
                    header: true,
                    dynamicTyping: true,
                    complete: function (results) {
                        setProductInformation(results.data); // This will be an array of objects
                    }
                });
            };

            reader.readAsText(csv);
        }
    }, [csv])

    useEffect(() => {
        console.log(productInformation)
    }, [productInformation])

    const getProductInformation = () => {
    }

    return (
        <>
            <div className='upload-page'>
                <div className='stores-header'>
                    <img className="signin-logo" src={logo} alt="logo" />
                    <img onClick={() => openUserSettings()} className="user-settings-image" src={userSettingsImg} alt="logo" />
                </div>
                {storesListLoaded && <div className='store-selection-dropdown'>
                    <div className='dropdown-header' onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}>
                        <div className='store-item'>
                            <img src={location} alt="location" className='location-img' />
                            <li key={currentStore.id}>
                                <b>{currentStore.name}</b><br></br>
                                {currentStore.formatted_address}
                            </li>
                            <div className={'dropdown-arrow ' + (storeDropdownOpen ? 'open' : '')}></div>
                        </div>
                    </div>
                    <div className={'dropdown-wrapper ' + (storeDropdownOpen ? 'open' : '')}>
                        <div className={'store-dropdown'}>
                            {stores.map((store) => {
                                if (selectedStores.includes(store.id) && store.id != currentStore.id) {
                                    return (
                                        <div className='store-item' key={store.id} onClick={() => setCurrentStore(store)}>
                                            <img src={location} alt="location" className='location-img' />
                                            <li key={store.id}>
                                                <b>{store.name}</b><br></br>
                                                {store.formatted_address}
                                            </li>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                    </div>
                </div>}
                {showUpload && <div className='dropzone-wrapper'>
                    {files.length === 0 && <Dropzone onDrop={acceptedFiles => setFiles(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                            <section className='dropzone'>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <img src={uploadIcon} alt="upload" />
                                    <p>Drag & Drop</p>
                                    <h3>Upload Product Info</h3>
                                    <p>(.csv file)</p>
                                </div>
                            </section>
                        )}
                    </Dropzone>}
                    {files.length > 0 &&
                        <div className='file-uploaded'>
                            <button className='btn' onClick={() => getProductInformation()}>
                                Get Product Market Information
                            </button>
                        </div>
                    }
                </div>}
                {!showUpload && <div className='product-opportunities'>

                </div>}
            </div>
        </>
    )
};

export default ProductInfoUpload;