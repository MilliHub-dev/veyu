import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FileText, Camera, FileSignature, Download } from 'lucide-react';
import InspectionForm from './InspectionForm';
import SignaturePad from './SignaturePad';
import { inspectionService, DOCUMENT_TEMPLATES } from '../services';

/**
 * InspectionWorkflow Component
 * Complete workflow for vehicle inspection with document generation and signing
 */
const InspectionWorkflow = ({ vehi