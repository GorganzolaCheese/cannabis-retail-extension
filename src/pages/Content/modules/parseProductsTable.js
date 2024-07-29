const parseProductsTable = () => {
    const tableHeaders = document.querySelectorAll('.euiDataGridHeaderCell')
    const headings = [];
    const productData = [];

    console.log(tableHeaders)
    console.log(tableHeaders.length)
    if (tableHeaders.length === 0) {
        console.log('No table headers found');
        return;
    }

    for (let i = 0; i < tableHeaders.length; i++) {
        // Find the element with the text
        const headingElement = tableHeaders[i].querySelector('.hHYCJM');

        if (headingElement) {
            headings.push(headingElement.textContent);
        }
    }

    console.log(headings)

    const tableRows = document.querySelector('.euiDataGrid__content').querySelectorAll('.euiDataGridRow');

    console.log(tableRows)
    console.log(tableRows.length)

    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        const rowData = {};
        for (let j = 0; j < headings.length; j++) {
            const colId = headings[j];

            if (colId === 'SKU') {
                continue;
            }

            console.log("COL ID: ")
            console.log(colId)

            const dataParent = row.querySelector(`[data-gridcell-column-id="${colId}"]`);
            console.log("DATA PARENT: ")
            console.log(dataParent)

            if (!dataParent) {
                console.log("NO DATA PARENT")
                continue;
            }

            let data = dataParent.querySelector('.euiDataGridRowCell__content').textContent;

            console.log("DATA: ")
            console.log(data)

            if (data) {
                data.replace("$", "");
                rowData[colId] = data;
            }
        }
        console.log("ROW DATA: ")
        console.log(rowData)
        if (rowData['Location'] === "Totals") {
            console.log("Skip Totals")
            continue
        }
        productData.push(rowData);
    }

    console.log("PRODUCT DATA: ")
    console.log(productData)
};

export const injectHeaderProductTable = () => {
    const mainWrapper = document.querySelector('body');
    console.log(mainWrapper)
    const header = document.createElement('div');
    const loadButton = document.createElement('button');
    loadButton.classList.add('btn');
    loadButton.textContent = 'Load Table Data';
    header.style.height = '50px';
    header.classList.add('header');
    loadButton.addEventListener('click', () => {
        parseProductsTable();
    })
    header.appendChild(loadButton);
    // Make header the first child
    mainWrapper.insertBefore(header, mainWrapper.firstChild);
}