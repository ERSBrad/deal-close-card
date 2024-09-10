import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, ButtonRow, Flex, Table, TableHead, TableRow, TableHeader, TableBody } from '@hubspot/ui-extensions';
import { LineItemsRow } from '../utils';

export const LineItemsMenu = ({ context, runServerless, setCurrentStep, formData, setFormData, setLineItems }) => {
  const [localLineItems, setLocalLineItems] = useState(formData.lineItems || []);
  const [lineItemOptions, setLineItemOptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    handleFetchLineItems();
  }, []);

  const handleFetchLineItems = async () => {
    setError('');
    try {
      const resp = await runServerless({
        name: 'fetchLineItems',
      });

      if (resp.status === 'SUCCESS') {
        setLineItemOptions(resp.response.lineItems);
      } else {
        setError('Failed to fetch line items');
      }
    } catch (error) {
      setError('Error fetching line items');
    }
  };

  const handleAddLineItem = () => {
    const newLineItems = [...localLineItems, { value: '', price: 0, frequency: '', label: '', productId: '' }];
    setLocalLineItems(newLineItems);
    setLineItems(newLineItems);
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const updateLineItem = (index, updatedItem) => {
    const newLineItems = [...localLineItems];
    newLineItems[index] = updatedItem;
    setLocalLineItems(newLineItems);
    setLineItems(newLineItems);
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const removeLineItem = (index) => {
    const newLineItems = localLineItems.filter((_, i) => i !== index);
    setLocalLineItems(newLineItems);
    setLineItems(newLineItems);
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const handleSelectChange = (index, value) => {
    const selectedItem = lineItemOptions.find((item) => item.value === value);
    const updatedItem = {
      ...localLineItems[index],
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
      ...localLineItems[index],
      price: value,
    };
    updateLineItem(index, updatedItem);
  };

  if (error) {
    return <Alert title="Error">{error}</Alert>;
  }

  return (
    <Flex direction={'column'} gap={'medium'}>
      <Box>
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
            {localLineItems.map((lineItem, index) => (
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
      </Box>
      <Box>
        <ButtonRow disableDropdown={false}>
          <Button onClick={() => setCurrentStep((prev) => prev - 1)} variant="secondary">
            Previous
          </Button>
          <Button onClick={() => setCurrentStep((prev) => prev + 1)} variant="primary">
            Next
          </Button>
        </ButtonRow>
      </Box>
    </Flex>
  );
};
