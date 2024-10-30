import React from 'react';
import { useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import logo from '../../../assets/img/itwo_logo.png';
import uploadIcon from '../../../assets/img/upload-icon.png';
import location from '../../../assets/img/location.svg';
import userSettingsImg from '../../../assets/img/user-settings.png';
import secrets from '../../../../secrets';

const ProductInfoUpload = ({ supabase, userSettings, openUserSettings, setSelectedStore, selectedStore, openStores }) => {

    const [files, setFiles] = useState([]);
    const [csv, setCsv] = useState(null);
    const [productInformation, setProductInformation] = useState(null);
    const [stores, setStores] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [currentStore, setCurrentStore] = useState(null);
    const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
    const [storesListLoaded, setStoresListLoaded] = useState(false);
    const [showUpload, setShowUpload] = useState(true);
    const [showOpportunities, setShowOpportunities] = useState(false);
    const [productResults, setProductResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpload, setLastUpload] = useState('');

    const setupStoresAndSettings = async () => {
        console.log(userSettings)
        console.log("SELECTED STORE: ", selectedStore)

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

            from += 1000
            to += 1000
        } while (batch.length > 0)

        allRows.forEach(store => {
            if (store.id == selectedStore) {
                setCurrentStore(store)
            }
        })

        // Get user store IDs
        supabase.from('UserSettings').select('stores_ids').eq('user_id', userSettings.user_id).single().then(({ data, error }) => {
            if (error) {
                console.log(error);
            } else {
                setSelectedStores(data.stores_ids);

                let userStores = [];

                allRows.forEach(store => {
                    if (data.stores_ids.includes(store.id)) {
                        userStores.push(store)
                    }
                })

                setStores(userStores);
            }
        })

        setStoresListLoaded(true);
    }

    useEffect(() => {
        setupStoresAndSettings()
    }, [])

    useEffect(() => {
        if (currentStore != null) {
            console.log("CURRENT STORE: ", currentStore)
            loadProductInformation();
        }
    }, [currentStore])

    useEffect(() => {
        if (productResults != null) {
            // Find the date of the last upload then set it (xx/xx/xxxx)
            let date = new Date(productResults[productResults.length - 1].created_at);
            setLastUpload(date.toLocaleDateString('en-US'));
        }
    }, [productResults])

    const loadProductInformation = () => {
        // Get product information for store and user_id
        supabase.from('ProductInformation').select('*').eq('store_id', currentStore.slug).eq('user_id', userSettings.user_id).then(({ data, error }) => {
            if (error) {
                console.log(error);
            } else {
                if (data.length > 0) {
                    console.log('PRODUCTS', data)
                    setProductResults(data);
                    setShowUpload(false);
                    setLoading(false);
                } else {
                    setShowUpload(true);
                    setLoading(false);
                }
            }
        })
    }

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
        if (productInformation != null && productInformation.length > 0) {
            getProductInformation();
        }
    }, [productInformation])

    const getProductInformation = async () => {

        setLoading(true);
        let toBeProcessed = [];

        try {
            await supabase.from('ProductInformation').delete().eq('store_id', currentStore.slug).eq('user_id', userSettings.user_id)
        } catch (error) {
            console.log(error)
        }
        // Delete all previous product information for this store

        let processCount = 0;

        // Loop through each object in productInformation and make a request to the API
        if (typeof currentStore._geo == "string") {
            let geoString = currentStore._geo.replace(/'/g, '"');
            currentStore._geo = JSON.parse(geoString);
            console.log("CURRENT STORE GEO PARSED", currentStore._geo)
        }
        productInformation.forEach(async (product, i) => {
            // "595 18 St, Castlegar, BC V1N 2N1, Canada" Parse the city from this address string
            const parseCity = (address) => {
                const parts = address.split(', ');
                return parts[parts.length - 3];
            }
            const city = parseCity(currentStore.formatted_address);
            const requestBody = [{
                "storeName": currentStore.name,
                "latitude": currentStore._geo.lat,
                "longitude": currentStore._geo.lng,
                "city": city,
                "productData": [
                    {
                        "gtin": product.gtin ? product.gtin : "",
                        "category": product.Classification ? product.Classification : "",
                        "brand": product.Brand ? product.Brand : "",
                        "weight": `${product["Net Weight"]}g`,
                        "name": product.Product ? product.Product : "",
                        "price": product["Regular Price"] ? product["Regular Price"] : "",
                        "quantity": product["In Stock Qty"] != null ? product["In Stock Qty"] : ""
                    }
                ]
            }]
            console.log("REQUEST BODY", requestBody)
            await fetch('https://init-api-dev.neobi.io/api/RetailerExtension/GetCompetitorPricing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Ocp-Apim-Subscription-Key": secrets.NEOBI_API_KEY
                },
                body: JSON.stringify(requestBody)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success!');
                    console.log(data)
                    uploadProducts(data)
                    processCount++;
                    if (processCount == productInformation.length) {
                        loadProductInformation();
                        setShowUpload(false);
                        setLoading(false);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    processCount++;
                    if (processCount == productInformation.length) {
                        loadProductInformation();
                        setShowUpload(false);
                        setLoading(false);
                    }
                })
        })
    }

    useEffect(() => {
        if (!showUpload && !loading) {
            loadProductInformation();
        }
    }, [showUpload])

    const uploadProducts = (product) => {
        const requestBody = {
            "product_id": product.productId,
            "product_name": product.productName,
            "category": product.category,
            "store_id": currentStore.slug,
            "regular_price": product.retailStore.regularPrice,
            "average_price": product.pricingAnalysis.averagePrice,
            "lowest_competitor_price": product.pricingAnalysis.lowestCompetitorPrice,
            "provincial_average_price": product.pricingAnalysis.provincialAveragePrice,
            "user_id": userSettings.user_id,
            "brand": product.brand
        }

        supabase.from("ProductInformation").insert([requestBody]).select().then(({ data, error }) => {
            console.log(data)
        }).catch((error) => {
            console.log(error)
        })
    }

    /*
        // Response example
        {
            "productId": "848876002724",
            "productName": "24K Gold Hybrid Crumbled & Infused (1g)",
            "category": "Extracts",
            "brand": "DEBUNK",
            "retailStore": {
                "storeId": "To be mapped to Neobi ID",
                "storeName": "FivePoint Cannabis",
                "coordinates": {
                    "latitude": "90",
                    "longitude": "100"
                },
                "regularPrice": 50
            },
            "competitorPricing": [
                {
                    "competitorId": "Wychwood Cannabis - 4309",
                    "competitorName": "Wychwood Cannabis - 673 St Clair Avenue West",
                    "coordinates": {
                        "latitude": "43.68179591510118",
                        "longitude": "-79.42511352883564"
                    },
                    "regularPrice": 32.99,
                    "salePrice": 32.99
                },
                {
                    "competitorId": "5ff4f821ddc0b12d071da662",
                    "competitorName": "Ace of Spades Weed Limited - 2135 Lake Shore Boulevard",
                    "coordinates": {
                        "latitude": "43.6266741",
                        "longitude": "-79.47905589999999"
                    },
                    "regularPrice": 32,
                    "salePrice": 32
                }
            ],
            "pricingAnalysis": {
                "averagePrice": 32.5,
                "lowestCompetitorPrice": 32,
                "provincialAveragePrice": 39.12
            },
            "lastUpdated": "2024-10-02T02:21:37.0507971+00:00"
        }
    */

    /*
        https://init-api-dev.neobi.io/api/BrowserExtension/GetCompetitorPricing
        // REQUEST BODY EXAMPLE
        [
            {
                "storeName": "FivePoint Cannabis",
                "latitude": 90,
                "longitude": 100,
                "city": "Toronto",
                "productData": [
                    {
                        "gtin": "",
                        "category": "Flower",
                        "brand": "DEBUNK",
                        "weight": "1g",
                        "name": "24K Gold Hybrid Crumbled",
                        "price": 10.99,
                        "quantity": 10
                    }
                ]
            }
        ]
    */

    const changeStore = (store) => {
        setCurrentStore(store)
        setStoreDropdownOpen(false)
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
                                        <div className='store-item' key={store.id} onClick={() => changeStore(store)}>
                                            <img src={location} alt="location" className='location-img' />
                                            <li key={store.id}>
                                                <b>{store.name}</b><br></br>
                                                {store.formatted_address}
                                            </li>
                                        </div>
                                    )
                                }
                            })}
                            <div className='store-item empty' onClick={() => openStores()} >Add another store</div>
                        </div>
                    </div>
                </div>}
                {showUpload && <div className={`dropzone-wrapper ${!storesListLoaded ? 'loading' : ''}`}>
                    {files.length === 0 && !loading && <Dropzone onDrop={acceptedFiles => setFiles(acceptedFiles)}>
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
                    {loading && <div className='loading-wrapper'>
                        <div className='loading'></div>
                    </div>}
                </div>}
                {!showUpload && !showOpportunities && <div className='product-opportunities'>
                    <div className='opportunities-wrapper' onClick={() => setShowOpportunities(true)}>
                        <div className='opportunities-count'>
                            {/* Show the number of products where product.regular_price > product.average_price */}
                            {productResults && productResults.filter(product => product.regular_price > product.average_price).length}
                        </div>
                        <div className='opportunities-header'>
                            Opportunities
                        </div>
                        <div className='right-arrow'></div>
                    </div>
                    {false && <><div className='market-data-wrapper'>
                        <div className='market-data-header'>Market Data</div>
                    </div>
                        <div className='available-deals-wrapper'>
                            <div className='available-deals-header'>Available Deals</div>
                        </div></>}
                </div>}
                {showOpportunities && !showUpload &&
                    <div className='product-opportunities'>
                        <div className='product-opportunities-header'>
                            <div className='opportunities-header'>Opportunities</div>
                            <div className='back-btn' onClick={() => setShowOpportunities(false)}>
                                <div className='left-arrow'></div>
                                <div>Back</div>
                            </div>
                        </div>
                        <div className='opportunities-list'>
                            {
                                productResults.map((product) => {
                                    return (
                                        <div className='opportunity-item' key={product.id}>
                                            <div className='opportunity-name'>{product.product_name}</div>
                                            <div className='opportunity-brand'><b>Brand:</b> {product.brand}</div>
                                            <div className='opportunity-price'><b>Your Price:</b> ${product.regular_price}</div>
                                            <div className='opportunity-price'><b>Average Price:</b> ${product.average_price}</div>
                                            <div className='opportunity-price'><b>Lowest Price:</b> ${product.lowest_competitor_price}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                }
                <div className='product-opportunities-footer'>
                    <div className='last-upload'>
                        Last Upload: {lastUpload}
                    </div>
                    <div className='upload-btn-wrapper' onClick={() => { setShowUpload(true); setShowOpportunities(false) }}>
                        <div className='upload-btn'>New Upload</div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default ProductInfoUpload;