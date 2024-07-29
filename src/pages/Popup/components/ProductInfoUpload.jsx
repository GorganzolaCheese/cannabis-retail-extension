import React from 'react';
import { useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';

const ProductInfoUpload = ({ supabase }) => {

    const [files, setFiles] = useState([]);
    const [csv, setCsv] = useState(null);
    const [productInformation, setProductInformation] = useState(null);

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
            <div className='dropzone-wrapper'>
                {files.length === 0 && <Dropzone onDrop={acceptedFiles => setFiles(acceptedFiles)}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Select your stores product information csv file.</p>
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
            </div>
        </>
    )
};

export default ProductInfoUpload;