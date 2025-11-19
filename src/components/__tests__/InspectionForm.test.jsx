import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import InspectionForm from '../InspectionForm';
import { inspectionService } from '../../services';

// Mock the inspection service
vi.mock('../../services', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    inspectionService: {
      getFormSchema: vi.fn(),
      getPhotos: vi.fn(),
      deletePhoto: vi.fn(),
    },
    CONDITION_RATINGS: {
      EXCELLENT: 'excellent',
      GOOD: 'good',
      FAIR: 'fair',
      POOR: 'poor',
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

describe('InspectionForm', () => {
  it('renders loading state initially', () => {
    inspectionService.getFormSchema.mockReturnValue(new Promise(() => {}));
    inspectionService.getPhotos.mockReturnValue(new Promise(() => {}));

    renderWithChakra(
      <InspectionForm
        inspectionId="test-123"
        slipReference="SLIP-123"
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/loading inspection form/i)).toBeInTheDocument();
  });

  it('renders form sections when schema is loaded', async () => {
    const mockSchema = {
      sections: [
        {
          name: 'exterior',
          label: 'Exterior Inspection',
          fields: [
            {
              name: 'body_condition',
              label: 'Body Condition',
              type: 'select',
              required: true,
              options: ['excellent', 'good', 'fair', 'poor'],
            },
          ],
        },
      ],
    };

    inspectionService.getFormSchema.mockResolvedValue(mockSchema);
    inspectionService.getPhotos.mockResolvedValue([]);

    renderWithChakra(
      <InspectionForm
        inspectionId="test-123"
        slipReference="SLIP-123"
        onSubmit={vi.fn()}
      />
    );

    // Wait for the form to load - look for the heading specifically
    const sectionHeading = await screen.findByRole('heading', { name: 'Exterior Inspection' });
    expect(sectionHeading).toBeInTheDocument();
  });
});
