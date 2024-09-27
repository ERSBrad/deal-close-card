import React, { useState, useEffect } from 'react';
import { 
    Box,
    Button,
    Alert,
    Flex,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableHeader,
    TableBody,
    Select,
    Input,
    StepperInput,
    Text,
    Modal,
    ModalBody,
    ModalFooter,
    LoadingSpinner
} from '@hubspot/ui-extensions';
import { updateFormField } from '../../utils/reducers';
import { handleErrors } from '../../utils';

export const LineItems = ({ context, state, fieldName, dispatch, runServerless, currentStep, actions }) => {

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);
    const [error, setError] = useState('');
    const [enableClear, setEnableClear] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [productList, setProductList] = useState([]);
    const [lineItems, setLineItems] = useState(state[currentStep]?.[fieldName]?.value || []);
    const [clearedLineItems, setClearedLineItems] = useState([]);
    updateFormField(dispatch, currentStep, fieldName, valid, lineItems);
   
    useEffect(() => {
        const loadLineItemList = async () => {
            let serverlessFunction = await runServerless({ name: "fetchLineItems", parameters: { currentObjectId: context.crm.objectId } });
            handleErrors(serverlessFunction, context, setError, setValidationMessage);
            if(serverlessFunction.response.dealLineItems.numItems > 0 && (!lineItems.length || lineItems[0]?.value === '')) {
                setLineItems(serverlessFunction.response.dealLineItems.items);
                setValid(true);
            }
            setProductList(serverlessFunction.response.products);
            setError(false);
            setLoading(false);
        }
        loadLineItemList();
    }, []);

    const addLineItemRow = () => {
        const newLineItems = [...lineItems, { value: '', price: 0, frequency: '', label: '', productId: '' }];
        setLineItems(newLineItems);
    };
    useEffectLineItems(lineItems, addLineItemRow, setValid, setEnableClear);

    const handleSelectChange = (index, value) => {
        const selectedItem = productList.find((item) => item.value === value);
        if(!selectedItem) {
            console.error("No matching item found in the list of products. A reload will mostly fix this, if not contact an administrator.");
        }
        const updatedItem = {
          ...lineItems[index],
          id: selectedItem.id || null,
          label: selectedItem.label || '',
          value: value || '',
          price: selectedItem.price || 0,
          frequency: selectedItem.frequency || '',
          isPlanType: selectedItem.isPlanType || false,
          productId: selectedItem.productId || null,
        };
        updateLineItem(index, updatedItem);
    };

    const updateLineItem = (index, updatedLineItem) => {
        const updatedLineItems = [...lineItems];
        updatedLineItems[index] = updatedLineItem;
        setLineItems(updatedLineItems);
    };

    const handleClearLineItems = () => {
        setLineItems([{ value: '', price: 0, frequency: '', label: '', productId: '' }]);
        actions.closeOverlay('clearLineItemModal');
    };

    const removeLineItem = (index) => {
        const newLineItems = lineItems.filter((_, i) => i !== index);
        setLineItems(newLineItems);
    };

    const handlePriceChange = (index, value) => {
        const updatedItem = {
            ...lineItems[index],
            price: value,
        };
        updateLineItem(index, updatedItem);
    };
    
    if (error) {
        return <Alert title="Unable to Load Line Items" variant="danger">{validationMessage}</Alert>;
    }

    return (
        <Flex direction="column" gap="small">
        {loading ? (
            <LoadingSpinner
                size="medium"
                label="Loading Line Items..."
                layout="centered"
                showLabel
            />
        ) : (
            <>
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
                        {lineItems.map((lineItem, index) => (
                            <LineItemsRow
                                key={index}
                                index={index}
                                lineItem={lineItem}
                                lineItemList={productList}
                                updateLineItems={updateLineItem}
                                removeLineItem={removeLineItem}
                                handleSelectChange={(value) => handleSelectChange(index, value)}
                                handlePriceChange={(value) => handlePriceChange(index, value)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </Box>
            <Box alignSelf="end">
                <Button variant="primary" onClick={addLineItemRow}>+ Add Line Item</Button>
                <Button 
                variant="destructive"
                disabled={!enableClear}
                overlay={
                    <Modal 
                    id="clearLineItemModal"
                    title="Are you sure you want to clear all line items?"
                    variant="danger"
                    aria-label='Clear Line Items Modal'
                    width="md"
                    >
                        <ModalBody>
                            <Flex align='center' justify='center'>
                                <Text >Are you sure that you would like to clear all line items from this deal? Any line items that already exist prior to closing this deal will remain until this form is completed.</Text>
                            </Flex>
                        </ModalBody>
                        <ModalFooter>
                            <Flex align='center' justify='center'>
                                <Button variant="destructive" onClick={handleClearLineItems}>Clear Line Items Now</Button>
                            </Flex>
                        </ModalFooter>
                    </Modal>
                }>Clear Line Items</Button>
            </Box>
            {/* If lineItems exist, show Website Template, Website Type, Unit #, etc. */}
            </>
        )}
        </Flex>
    );
}

const useEffectLineItems = (lineItems, addLineItemRow, setValid, setEnableClear) => {
    useEffect(() => {
        const validateLineItems = () => {
            if(lineItems.length < 1) {
                addLineItemRow();
                setValid(false);
            } else {
                let lineItemsValid = lineItems.every((lineItem) => lineItem.value !== '' && lineItem.price > 0 && lineItem.frequency !== '');
                if(!lineItemsValid) {
                    setValid(false);
                } else {
                    setValid(true);
                }
            }
            if(lineItems.length >= 1 && (lineItems.length && lineItems[0]?.value !== '')) {
                setEnableClear(true);
            } else {
                setEnableClear(false);
            }
        }
        validateLineItems();
    }, [lineItems]);
}

export const LineItemsRow = ({ index, lineItem, lineItemList, handleSelectChange, handlePriceChange, removeLineItem }) => {

    let [priceError, setPriceError] = useState(false);

    useEffect(() => {
        let lineItemPrice = parseInt(lineItem.price);
        if(lineItemPrice < 0) {
            setPriceError(true);
        } else {
            setPriceError(false);
        }
    }, [lineItem]);
    
    return (
        <TableRow>
            <TableCell>
                <Select
                    name="line-item"
                    placeholder="Select a Line Item"
                    value={lineItem.value}
                    options={lineItemList}
                    onChange={handleSelectChange}
                    required
                />
            </TableCell>
            <TableCell>
                <StepperInput 
                    name="price" 
                    formatStyle='decimal'
                    precision={2}
                    value={lineItem.price} 
                    onChange={handlePriceChange} 
                    error={priceError}
                />
            </TableCell>
            <TableCell>
                <Input type="text" value={lineItem.frequency} readOnly />
            </TableCell>
            <TableCell>
                <Button onClick={() => removeLineItem(index)} variant="destructive" size="small">X</Button>
            </TableCell>
        </TableRow>
    )
};