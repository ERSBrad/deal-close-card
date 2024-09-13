import React, { useState, useEffect } from 'react';
import { 
    Box,
    Button,
    Alert,
    ButtonRow,
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
    ModalFooter
} from '@hubspot/ui-extensions';
import { updateFormField } from '../../utils/reducers';

export const LineItems = ({ context, state, fieldName, dispatch, runServerless, currentStep, actions }) => {

    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);
    const [error, setError] = useState('');
    const [validationMessage, setValidationMessage] = useState("");
    const [productList, setProductList] = useState([]);
    const [lineItems, setLineItems] = useState(state[currentStep]?.[fieldName]?.value || []);
    const [showRemovalConfirmation, setShowRemovalConfirmation] = useState(false);
    updateFormField(dispatch, currentStep, fieldName, valid, lineItems);
   
    useEffect(() => {
        const loadLineItemList = async () => {
            let serverlessFunction = await runServerless({ name: "fetchLineItems", parameters: { currentObjectId: context.crm.objectId } });
            console.log("Serverless Function: ", serverlessFunction);
            if(serverlessFunction.status !== "SUCCESS") {
                setError(true);
                setLoading(false);
                setValidationMessage("Failed to fetch line items. Unable to proceed, please try again in a while to see if the problem has been resolved. Odds are that it's an issue on HubSpot's end, check the console for more information.");
                throw new Error(serverlessFunction.message);
            }
            setError(false);
            setProductList(serverlessFunction.response.lineItems);

            /**
             * Continue tomorrow: I was working on repopulating data from previous steps, it should all work now with the exteption of WebsiteTemplateSelector. All I need now is to test with a "final" step where the data is confirmed (maybe?) and the form actually submits.
             * Figure out where workato webhooks go, and how to test them. Then setup a recipe because their's are trash.
             */
            if(serverlessFunction.response.dealLineItems.numItems > 0 && ( lineItems.length > 0 && lineItems[0]?.value === '')) {
                setLineItems(serverlessFunction.response.dealLineItems.items);
                setValid(true);
            }
            
        }
        loadLineItemList();
    }, [])

    useEffect(() => {
        console.log("showRemovalConfirmation: ", showRemovalConfirmation);
    }, [showRemovalConfirmation])

    const addLineItemRow = () => {
        const newLineItems = [...lineItems, { value: '', price: 0, frequency: '', label: '', productId: '' }];
        setLineItems(newLineItems);
    };
    useEffectLineItems(lineItems, addLineItemRow, setValid);

    const handleSelectChange = (index, value) => {
        const selectedItem = productList.find((item) => item.value === value);
        console.log(selectedItem);
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
                <Button variant="destructive" overlay={
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
        </Flex>
    )

}

const useEffectLineItems = (lineItems, addLineItemRow, setValid) => {
    useEffect(() => {
        const validateLineItems = () => { 
            console.log(lineItems);
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