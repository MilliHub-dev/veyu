
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CreateListing from '../CreateListing';
import { GlobalStore } from '../../../../../App';

// Mock child components to simplify testing and focus on CreateListing logic
vi.mock('../../../../../components/forms', () => ({
  StepIndicator: () => <div data-testid="step-indicator" />,
  DocumentUploader: () => <div data-testid="document-uploader" />,
  ImageUploader: () => <div data-testid="image-uploader" />,
  ListingReviewCard: () => <div data-testid="listing-review-card" />,
  // Mock forms to allow manipulating formData
  CreateSaleForm: ({ formData, setFormData }) => (
    <div data-testid="create-sale-form">
      <input 
        required 
        placeholder="Brand"
        value={formData.brand || ''} 
        onChange={e => setFormData({ ...formData, brand: e.target.value })} 
      />
      <input 
        required 
        placeholder="Model"
        value={formData.model || ''} 
        onChange={e => setFormData({ ...formData, model: e.target.value })} 
      />
      <input 
        required 
        placeholder="Year"
        value={formData.year || ''} 
        onChange={e => setFormData({ ...formData, year: e.target.value })} 
      />
      <input 
        required 
        placeholder="Price"
        value={formData.price || ''} 
        onChange={e => setFormData({ ...formData, price: e.target.value })} 
      />
      <button type="button" onClick={() => setFormData({ 
        ...formData, 
        brand: 'Test Brand', 
        model: 'Test Model', 
        year: '2023', 
        price: '10000',
        fuel_system: 'Electric',
        transmission: 'Automatic',
        currency: 'USD',
        body_type: 'suv'
      })}>
        Fill Valid Data
      </button>
    </div>
  ),
  CreateRentalForm: () => <div data-testid="create-rental-form" />,
}));

// Mock nav components
vi.mock('../../../../../components/nav', () => ({
  BackButton: () => <button>Back</button>,
}));

const renderWithProviders = (component, contextValue) => {
  return render(
    <ChakraProvider>
      <GlobalStore.Provider value={contextValue}>
        {component}
      </GlobalStore.Provider>
    </ChakraProvider>
  );
};

describe('CreateListing', () => {
  let mockAxios;
  let mockNotify;
  let mockRedirect;

  beforeEach(() => {
    mockAxios = {
      post: vi.fn(),
    };
    mockNotify = vi.fn();
    mockRedirect = vi.fn();
    vi.clearAllMocks();
  });

  it('renders vehicle category buttons', () => {
    renderWithProviders(
      <CreateListing />, 
      { axios: mockAxios, notify: mockNotify, redirect: mockRedirect, authUser: {} }
    );

    expect(screen.getByText('🚗 Car')).toBeInTheDocument();
    expect(screen.getByText('🏍️ Bike')).toBeInTheDocument();
    expect(screen.getByText('⛵ Boat')).toBeInTheDocument();
    expect(screen.getByText('✈️ Aircraft')).toBeInTheDocument();
    expect(screen.getByText('🚁 UAV')).toBeInTheDocument();
  });

  it('selects UAV category and submits payload correctly', async () => {
    mockAxios.post.mockResolvedValue({ status: 200, data: { uuid: 'new-uuid' } });

    renderWithProviders(
      <CreateListing />, 
      { axios: mockAxios, notify: mockNotify, redirect: mockRedirect, authUser: {} }
    );

    // 1. Select UAV Category
    const uavButton = screen.getByText('🚁 UAV');
    fireEvent.click(uavButton);

    // 2. Fill Form Data (using our mocked button for speed)
    const fillButton = screen.getByText('Fill Valid Data');
    fireEvent.click(fillButton);

    // 3. Click Continue
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });

    // 4. Verify Payload
    const callArgs = mockAxios.post.mock.calls[0];
    const url = callArgs[0];
    const formData = callArgs[1];

    expect(url).toBe('/admin/dealership/listings/create/');
    expect(formData).toBeInstanceOf(FormData);
    
    // Check key fields in FormData
    expect(formData.get('vehicle_category')).toBe('uav');
    expect(formData.get('vehicle_type')).toBe('uav');
    expect(formData.get('brand')).toBe('Test Brand');
    expect(formData.get('uav_type')).toBe('quadcopter'); // Default check
    expect(formData.get('fuel_system')).toBe('Electric'); // UAV default
  });

  it('selects Car category and submits payload correctly', async () => {
    mockAxios.post.mockResolvedValue({ status: 200, data: { uuid: 'new-uuid' } });

    renderWithProviders(
      <CreateListing />, 
      { axios: mockAxios, notify: mockNotify, redirect: mockRedirect, authUser: {} }
    );

    // 1. Select Car Category (default, but clicking to be sure)
    const carButton = screen.getByText('🚗 Car');
    fireEvent.click(carButton);

    // 2. Fill Form Data
    const fillButton = screen.getByText('Fill Valid Data');
    fireEvent.click(fillButton);

    await waitFor(() => expect(screen.getByPlaceholderText('Brand')).toHaveValue('Test Brand'));

    // 3. Click Continue
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });

    // 4. Verify Payload
    const formData = mockAxios.post.mock.calls[0][1];
    
    expect(formData.get('vehicle_category')).toBe('car');
    expect(formData.get('vehicle_type')).toBe('car');
    expect(formData.get('brand')).toBe('Test Brand');
    expect(formData.get('currency')).toBe('USD');
    expect(formData.get('fuel_system')).toBe('Electric'); // From our fill button
    expect(formData.get('body_type')).toBe('suv'); // From our fill button
  });

  it('selects Bike category and submits payload correctly', async () => {
    mockAxios.post.mockResolvedValue({ status: 200, data: { uuid: 'new-uuid' } });

    renderWithProviders(
      <CreateListing />, 
      { axios: mockAxios, notify: mockNotify, redirect: mockRedirect, authUser: {} }
    );

    const bikeButton = screen.getByText('🏍️ Bike');
    fireEvent.click(bikeButton);

    const fillButton = screen.getByText('Fill Valid Data');
    fireEvent.click(fillButton);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });

    const formData = mockAxios.post.mock.calls[0][1];
    expect(formData.get('vehicle_category')).toBe('bike');
    expect(formData.get('vehicle_type')).toBe('bike');
    expect(formData.get('seats')).toBe('2'); // Bike default
    expect(formData.get('doors')).toBe('0'); // Bike default
  });

  it('selects Boat category and submits payload correctly', async () => {
    mockAxios.post.mockResolvedValue({ status: 200, data: { uuid: 'new-uuid' } });

    renderWithProviders(
      <CreateListing />, 
      { axios: mockAxios, notify: mockNotify, redirect: mockRedirect, authUser: {} }
    );

    const boatButton = screen.getByText('⛵ Boat');
    fireEvent.click(boatButton);

    const fillButton = screen.getByText('Fill Valid Data');
    fireEvent.click(fillButton);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });

    const formData = mockAxios.post.mock.calls[0][1];
    expect(formData.get('vehicle_category')).toBe('boat');
    expect(formData.get('vehicle_type')).toBe('boat');
    expect(formData.get('boat_type')).toBe('motorboat'); // Default
    expect(formData.get('hull_material')).toBe('fiberglass'); // Default
  });

  it('selects Aircraft category and submits payload correctly', async () => {
    mockAxios.post.mockResolvedValue({ status: 200, data: { uuid: 'new-uuid' } });

    renderWithProviders(
      <CreateListing />, 
      { axios: mockAxios, notify: mockNotify, redirect: mockRedirect, authUser: {} }
    );

    const aircraftButton = screen.getByText('✈️ Aircraft');
    fireEvent.click(aircraftButton);

    const fillButton = screen.getByText('Fill Valid Data');
    fireEvent.click(fillButton);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });

    const formData = mockAxios.post.mock.calls[0][1];
    expect(formData.get('vehicle_category')).toBe('aircraft');
    expect(formData.get('vehicle_type')).toBe('plane');
    expect(formData.get('aircraft_type')).toBe('single-engine'); // Default
    expect(formData.get('doors')).toBe('2'); // Aircraft default
  });
});
