import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import PhotoUpload from '../PhotoUpload';

// Mock the services
vi.mock('../../services', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    inspectionService: {
      uploadPhotoFrontend: vi.fn(),
    },
    PHOTO_CATEGORIES: {
      EXTERIOR_FRONT: 'exterior_front',
      EXTERIOR_REAR: 'exterior_rear',
      EXTERIOR_LEFT: 'exterior_left',
      EXTERIOR_RIGHT: 'exterior_right',
      INTERIOR_DASHBOARD: 'interior_dashboard',
      INTERIOR_SEATS: 'interior_seats',
      ENGINE_BAY: 'engine_bay',
      TRUNK: 'trunk',
      WHEELS: 'wheels',
      UNDERCARRIAGE: 'undercarriage',
      DAMAGE: 'damage',
      OTHER: 'other',
    },
  };
});

const renderWithChakra = (component) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('PhotoUpload', () => {
  it('renders photo upload interface', () => {
    renderWithChakra(
      <PhotoUpload
        inspectionId="test-123"
        category="exterior_front"
        onUploadComplete={vi.fn()}
      />
    );

    expect(screen.getByText(/photo category/i)).toBeInTheDocument();
    expect(screen.getByText(/drag and drop a photo here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument();
  });

  it('disables upload button when no file is selected', () => {
    renderWithChakra(
      <PhotoUpload
        inspectionId="test-123"
        category="exterior_front"
        onUploadComplete={vi.fn()}
      />
    );

    const uploadButton = screen.getByRole('button', { name: /upload photo/i });
    expect(uploadButton).toBeDisabled();
  });
});
