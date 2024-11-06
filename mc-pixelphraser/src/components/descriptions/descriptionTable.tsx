// src/components/Descriptions/components/DescriptionsTable.tsx
import { SecondaryButton, PrimaryButton } from '@commercetools-uikit/buttons';
import DataTable from '@commercetools-uikit/data-table';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import { TemporaryDescription } from '../../interfaces/temporaryDescription';
import { formatDate } from '../../utils/formatDate';
import { updateProductDescription } from '../../hooks/updateProductDescription';
import { deleteTemporaryDescription } from '../../hooks/deleteTemporaryDescriptions';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';

interface DescriptionsTableProps {
  data: TemporaryDescription[];
  processing: string | null;
  setProcessing: (id: string | null) => void;
  setError: (error: string | null) => void;
  showSuccessMessage: (message: string) => void;
  onImageClick: (url: string) => void;
  loadDescriptions: () => Promise<void>;
}

export const DescriptionsTable = ({
  data,
  processing,
  setProcessing,
  setError,
  showSuccessMessage,
  onImageClick,
  loadDescriptions
}: DescriptionsTableProps) => {
  const dispatch = useAsyncDispatch();

  const handleAccept = async (tempDesc: TemporaryDescription) => {
    setProcessing(tempDesc.id);
    try {
      await updateProductDescription(
        dispatch,
        tempDesc.key,
        tempDesc.value.temporaryDescription || ''
      );
      await deleteTemporaryDescription(dispatch, tempDesc.id, tempDesc.version);
      await loadDescriptions();
      showSuccessMessage('Description accepted and updated successfully');
    } catch (error) {
      setError(
        error instanceof Error 
          ? `Error accepting description: ${error.message}` 
          : 'An unexpected error occurred while accepting the description'
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (tempDesc: TemporaryDescription) => {
    setProcessing(tempDesc.id);
    try {
      await deleteTemporaryDescription(dispatch, tempDesc.id, tempDesc.version);
      await loadDescriptions();
      showSuccessMessage('Description rejected and removed successfully');
    } catch (error) {
      setError(
        error instanceof Error 
          ? `Error rejecting description: ${error.message}` 
          : 'An unexpected error occurred while rejecting the description'
      );
    } finally {
      setProcessing(null);
    }
  };

  const columns = [
    { key: 'imageUrl', label: 'Image', flexGrow: 1 },
    { key: 'productName', label: 'Product Name', flexGrow: 2 },
    { key: 'description', label: 'Description', flexGrow: 2 },
    { key: 'generatedAt', label: 'Generated At', flexGrow: 1 },
    { key: 'actions', label: 'Actions', flexGrow: 1 }
  ];

  const itemRenderer = (item: any, column: any) => {
    switch (column.key) {
      case 'imageUrl':
        return (
          <img 
            src={item.imageUrl} 
            alt="Product" 
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'cover', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => onImageClick(item.imageUrl)}
          />
        );
      case 'productName':
        return <Text.Body>{item.productName}</Text.Body>;
      case 'description':
        return (
          <div style={{ maxHeight: '8rem', overflowY: 'auto', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <Text.Body>{item.description}</Text.Body>
          </div>
        );
      case 'generatedAt':
        return <Text.Body tone="secondary">{formatDate(item.generatedAt)}</Text.Body>;
      case 'actions':
        return (
          <Spacings.Inline scale="s">
            <PrimaryButton
              label="Accept"
              onClick={() => handleAccept(data.find(d => d.id === item.id)!)}
              isDisabled={processing === item.id}
            />
            <SecondaryButton
              label="Reject"
              onClick={() => handleReject(data.find(d => d.id === item.id)!)}
              isDisabled={processing === item.id}
            />
          </Spacings.Inline>
        );
      default:
        return item[column.key];
    }
  };

  return (
    <DataTable
      columns={columns}
      rows={data.map(desc => ({
        imageUrl: desc.value.imageUrl,
        productName: desc.value.productName,
        description: desc.value.temporaryDescription,
        generatedAt: desc.value.generatedAt,
        actions: 'actions',
        id: desc.id
      }))}
      itemRenderer={itemRenderer}
    />
  );
};