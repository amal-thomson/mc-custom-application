import { useState, useEffect } from 'react';
import { useAsyncDispatch } from '@commercetools-frontend/sdk';
import { TemporaryDescriptionsResponse } from '../../interfaces/temporaryDescriptionsResponse';
import { fetchTemporaryDescriptions } from '../../hooks/fetchTemporaryDescriptions';
import { Header } from './header';
import { DescriptionsTable } from './descriptionTable';
import { SearchBar } from './searchBar';
import { StatusMessage } from './statusMessage';
import { ImageModal } from './imageModal';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import { hasResults } from '../../utils/hasResults';
import { NoDescriptionsFound } from './noDescriptionFound';

const Descriptions = () => {
  const dispatch = useAsyncDispatch();
  const [descriptionsData, setDescriptionsData] = useState<TemporaryDescriptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadDescriptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTemporaryDescriptions(dispatch);
      setDescriptionsData(result);
    } catch (error) {
      setError(
        error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unexpected error occurred while fetching descriptions'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDescriptions();
  }, []);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const filteredData = descriptionsData?.results.filter(desc => 
    (desc.value.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (desc.value.temporaryDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div style={{ padding: '1.5rem' }}>
      <Spacings.Stack scale="l">
        <Header onRefresh={loadDescriptions} isLoading={isLoading} />

        <Card>
          <Spacings.Stack scale="m">
            <StatusMessage
              error={error}
              successMessage={successMessage}
            />

            {!isLoading && hasResults(descriptionsData) && (
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}

            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <LoadingSpinner />
              </div>
            ) : !hasResults(descriptionsData) ? (
              <NoDescriptionsFound />
            ) : (
              <DescriptionsTable
                data={filteredData}
                processing={processing}
                setProcessing={setProcessing}
                setError={setError}
                showSuccessMessage={showSuccessMessage}
                onImageClick={setSelectedImage}
                loadDescriptions={loadDescriptions}
              />
            )}
          </Spacings.Stack>
        </Card>
      </Spacings.Stack>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};

export default Descriptions;