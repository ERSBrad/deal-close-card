import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, ButtonRow, Flex, Table, TableHead, TableRow, TableHeader, TableBody } from '@hubspot/ui-extensions';
import { updateFormField } from '../../utils/reducers';

export const LineItems = ({ context, state, fieldName, dispatch, runServerless }) => {

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [lineItems, setLineItems] = useState([]);
    const [valid, setValid] = useState(false);
    const [error, setError] = useState('');
    updateFormField(dispatch, fieldName, valid, lineItems);

    useEffect(() => {
        const getProductList = async () => {
            let serverlessFunction = await runServerless({ type: "fetchLineItems" });
            if(serverlessFunction.status !== "SUCCESS") {
                setValid(false);
                showError(true);
                setLoading(false);
                return;
            }
            console.log(serverlessFunction.response);
        }
        getProductList();
    }, []);

    const handleAddLineItem = () => {
        const newLineItems = [...lineItems, { value: '', price: 0, frequency: '', label: '', productId: '' }];
        setLineItems(newLineItems);
      };
    
      const updateLineItem = (index, updatedItem) => {
        const newLineItems = [...lineItems];
        newLineItems[index] = updatedItem;
        setLineItems(newLineItems);
      };
    
      const removeLineItem = (index) => {
        const newLineItems = lineItems.filter((_, i) => i !== index);
        setLineItems(newLineItems);
      };
    
      const handleSelectChange = (index, value) => {
        const selectedItem = lineItemOptions.find((item) => item.value === value);
        const updatedItem = {
          ...lineItems[index],
          value,
          price: selectedItem?.price || 0,
          frequency: selectedItem?.frequency || '',
          label: selectedItem?.label || '',
          productId: selectedItem?.productId || '',
        };
        updateLineItem(index, updatedItem);
      };
    
      const handlePriceChange = (index, value) => {
        const updatedItem = {
          ...lineItems[index],
          price: value,
        };
        updateLineItem(index, updatedItem);
      };
    
      if (error) {
        return <Alert title="Error">{error}</Alert>;
      }


    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>Price</TableHeader>
                        <TableHeader>Frequency</TableHeader>
                        <TableHeader></TableHeader>
                    </TableRow>
            </TableHead>
            <TableBody>
                {lineItems.map((lineItem, index) => (
                <LineItemsRow
                    key={index}
                    index={index}
                    lineItem={lineItem}
                    lineItemOptions={lineItemOptions}
                    updateLineItem={updateLineItem}
                    removeLineItem={removeLineItem}
                    selectedSKU={lineItem.value}
                    handleSelectChange={(value) => handleSelectChange(index, value)}
                    handlePriceChange={(value) => handlePriceChange(index, value)}
                />
                ))}
            </TableBody>
            </Table>
            <Button onClick={handleAddLineItem}>Add</Button>
        </>
    )

}

export const LineItemsRow = ({ lineItem, lineItemOptions, updateLineItem, removeLineItem, index, selectedSKU, handleSelectChange, handlePriceChange }) => (
    <TableRow>
        <TableCell>
            <Select
                name="line-item"
                placeholder="Select an item"
                required
                value={selectedSKU}
                options={lineItemOptions}
                onChange={handleSelectChange}
            />
        </TableCell>
        <TableCell>
            <Input type="number" value={lineItem.price} onChange={handlePriceChange} />
        </TableCell>
        <TableCell>
            <Input type="text" value={lineItem.frequency} readOnly />
        </TableCell>
        <TableCell>
            <Button onClick={() => removeLineItem(index)} variant="destructive" size="extra-small">-</Button>
        </TableCell>
    </TableRow>
);