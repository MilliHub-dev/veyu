import { useState } from 'react';
import {
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Grid,
  GridItem,
  Box,
  Heading,
  Text,
  useToast,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import inspectionService from '../../services/inspectionService';

const CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const InspectionData = ({ inspection, onUpdate }) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    exterior_data: inspection.exterior_data || {},
    interior_data: inspection.interior_data || {},
    engine_data: inspection.engine_data || {},
    mechanical_data: inspection.mechanical_data || {},
    safety_data: inspection.safety_data || {},
    inspector_notes: inspection.inspector_notes || '',
    recommended_actions: inspection.recommended_actions || [],
  });
  const [newAction, setNewAction] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await inspectionService.updateInspection(inspection.id, {
        ...formData,
        status: 'in_progress',
      });

      toast({
        title: 'Success',
        description: 'Inspection data saved successfully',
        status: 'success',
        duration: 3000,
      });

      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error.message || 'Failed to save inspection data',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      exterior_data: inspection.exterior_data || {},
      interior_data: inspection.interior_data || {},
      engine_data: inspection.engine_data || {},
      mechanical_data: inspection.mechanical_data || {},
      safety_data: inspection.safety_data || {},
      inspector_notes: inspection.inspector_notes || '',
      recommended_actions: inspection.recommended_actions || [],
    });
    setIsEditing(false);
  };

  const handleAddAction = () => {
    if (newAction.trim()) {
      setFormData({
        ...formData,
        recommended_actions: [...formData.recommended_actions, newAction.trim()],
      });
      setNewAction('');
    }
  };

  const handleRemoveAction = (index) => {
    setFormData({
      ...formData,
      recommended_actions: formData.recommended_actions.filter((_, i) => i !== index),
    });
  };

  const renderConditionField = (section, field, label) => {
    const value = formData[section]?.[field] || '';
    
    if (isEditing) {
      return (
        <FormControl>
          <FormLabel fontSize="sm">{label}</FormLabel>
          <Select
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                [section]: { ...formData[section], [field]: e.target.value },
              })
            }
            size="sm"
          >
            <option value="">Not Inspected</option>
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <Box>
        <Text fontSize="sm" color="gray.600">{label}</Text>
        <Text fontWeight="semibold">
          {value ? CONDITION_OPTIONS.find((o) => o.value === value)?.label : 'Not Inspected'}
        </Text>
      </Box>
    );
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Edit Controls */}
      <HStack justify="space-between">
        <Heading size="md">Inspection Data</Heading>
        {!isEditing ? (
          <Button leftIcon={<EditIcon />} size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <HStack>
            <Button
              leftIcon={<CheckIcon />}
              size="sm"
              colorScheme="green"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save
            </Button>
            <Button
              leftIcon={<CloseIcon />}
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              isDisabled={isSaving}
            >
              Cancel
            </Button>
          </HStack>
        )}
      </HStack>

      {/* Exterior */}
      <Box>
        <Heading size="sm" mb={3}>Exterior</Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>{renderConditionField('exterior_data', 'body_condition', 'Body Condition')}</GridItem>
          <GridItem>{renderConditionField('exterior_data', 'paint_condition', 'Paint Condition')}</GridItem>
          <GridItem>{renderConditionField('exterior_data', 'windshield_condition', 'Windshield')}</GridItem>
          <GridItem>{renderConditionField('exterior_data', 'lights_condition', 'Lights')}</GridItem>
          <GridItem>{renderConditionField('exterior_data', 'mirrors_condition', 'Mirrors')}</GridItem>
        </Grid>
      </Box>

      <Divider />

      {/* Interior */}
      <Box>
        <Heading size="sm" mb={3}>Interior</Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>{renderConditionField('interior_data', 'seats_condition', 'Seats')}</GridItem>
          <GridItem>{renderConditionField('interior_data', 'dashboard_condition', 'Dashboard')}</GridItem>
          <GridItem>{renderConditionField('interior_data', 'steering_condition', 'Steering')}</GridItem>
          <GridItem>{renderConditionField('interior_data', 'ac_condition', 'Air Conditioning')}</GridItem>
        </Grid>
      </Box>

      <Divider />

      {/* Engine */}
      <Box>
        <Heading size="sm" mb={3}>Engine</Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>{renderConditionField('engine_data', 'engine_condition', 'Engine')}</GridItem>
          <GridItem>{renderConditionField('engine_data', 'oil_level', 'Oil Level')}</GridItem>
          <GridItem>{renderConditionField('engine_data', 'coolant_level', 'Coolant Level')}</GridItem>
          <GridItem>{renderConditionField('engine_data', 'battery_condition', 'Battery')}</GridItem>
        </Grid>
      </Box>

      <Divider />

      {/* Mechanical */}
      <Box>
        <Heading size="sm" mb={3}>Mechanical</Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>{renderConditionField('mechanical_data', 'transmission_condition', 'Transmission')}</GridItem>
          <GridItem>{renderConditionField('mechanical_data', 'brakes_condition', 'Brakes')}</GridItem>
          <GridItem>{renderConditionField('mechanical_data', 'suspension_condition', 'Suspension')}</GridItem>
          <GridItem>{renderConditionField('mechanical_data', 'exhaust_condition', 'Exhaust')}</GridItem>
        </Grid>
      </Box>

      <Divider />

      {/* Safety */}
      <Box>
        <Heading size="sm" mb={3}>Safety</Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>{renderConditionField('safety_data', 'airbags_condition', 'Airbags')}</GridItem>
          <GridItem>{renderConditionField('safety_data', 'seatbelts_condition', 'Seatbelts')}</GridItem>
          <GridItem>{renderConditionField('safety_data', 'abs_condition', 'ABS')}</GridItem>
        </Grid>
      </Box>

      <Divider />

      {/* Inspector Notes */}
      <Box>
        <Heading size="sm" mb={3}>Inspector Notes</Heading>
        {isEditing ? (
          <Textarea
            value={formData.inspector_notes}
            onChange={(e) => setFormData({ ...formData, inspector_notes: e.target.value })}
            placeholder="Add detailed notes about the inspection..."
            rows={6}
          />
        ) : (
          <Text whiteSpace="pre-wrap">
            {formData.inspector_notes || 'No notes added yet'}
          </Text>
        )}
      </Box>

      <Divider />

      {/* Recommended Actions */}
      <Box>
        <Heading size="sm" mb={3}>Recommended Actions</Heading>
        <VStack align="stretch" spacing={2}>
          {formData.recommended_actions.map((action, index) => (
            <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
              <Text fontSize="sm">{action}</Text>
              {isEditing && (
                <IconButton
                  icon={<DeleteIcon />}
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleRemoveAction(index)}
                  aria-label="Remove action"
                />
              )}
            </HStack>
          ))}
          {formData.recommended_actions.length === 0 && (
            <Text fontSize="sm" color="gray.500">No recommended actions yet</Text>
          )}
          {isEditing && (
            <HStack>
              <Textarea
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Add a recommended action..."
                size="sm"
                rows={2}
              />
              <IconButton
                icon={<AddIcon />}
                colorScheme="blue"
                onClick={handleAddAction}
                isDisabled={!newAction.trim()}
                aria-label="Add action"
              />
            </HStack>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default InspectionData;
