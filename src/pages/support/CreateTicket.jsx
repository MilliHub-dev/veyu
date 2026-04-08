import { useContext, useEffect, useState } from 'react';
import {
  Box, Container, Heading, Button, VStack, FormControl, FormLabel,
  Input, Textarea, Select, useToast, Card, CardBody, HStack, Tag,
  TagLabel, TagCloseButton, Wrap, WrapItem
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { GlobalStore } from '../../contexts/GlobalStore';
import supportService from '../../services/supportService';

const CreateTicket = () => {
  const { authUser } = useContext(GlobalStore);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    severity_level: 'moderate',
    category_id: '',
    tag_ids: []
  });

  useEffect(() => {
    // Check if user is allowed to create tickets
    if (authUser && authUser.user_type !== 'customer') {
      console.log('⚠️ User type:', authUser.user_type, '- Backend only allows customers to create tickets');
      toast({
        title: 'Access Restricted',
        description: `Support tickets can only be created by customers. Your account type is: ${authUser.user_type}`,
        status: 'warning',
        duration: 5000,
        isClosable: true
      });
      // Optionally redirect back to support list
      // navigate('/support');
    }
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        supportService.listCategories(),
        supportService.listTags()
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      toast({
        title: 'Subject required',
        description: 'Please enter a subject for your ticket',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    try {
      setLoading(true);
      
      // Start with minimal required fields
      const payload = {
        subject: formData.subject.trim(),
        severity_level: formData.severity_level
      };
      
      // Add optional fields only if they have valid values
      // Note: category_id and tag_ids might be causing the 500 error if they reference non-existent records
      if (formData.category_id && formData.category_id !== '') {
        const categoryId = parseInt(formData.category_id);
        if (!isNaN(categoryId)) {
          payload.category_id = categoryId;
        }
      }
      
      if (formData.tag_ids && formData.tag_ids.length > 0) {
        payload.tag_ids = formData.tag_ids;
      }
      
      console.log('📤 Creating ticket with payload:', JSON.stringify(payload, null, 2));
      console.log('📤 Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
      console.log('📤 Available tags:', tags.map(t => ({ id: t.id, name: t.name })));

      const ticket = await supportService.createTicket(payload);
      
      toast({
        title: 'Ticket created',
        description: 'Your support ticket has been created successfully',
        status: 'success',
        duration: 3000
      });
      
      navigate(`/support/tickets/${ticket.id}`);
    } catch (error) {
      console.error('❌ Create ticket error:', error);
      
      // Extract error message from various possible formats
      let errorMessage = 'Failed to create ticket';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error creating ticket',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

  return (
    <Container maxW="3xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Create Support Ticket</Heading>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Severity Level</FormLabel>
                  <Select
                    value={formData.severity_level}
                    onChange={(e) => setFormData({ ...formData, severity_level: e.target.value })}
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="moderate">Moderate - Issue affecting usage</option>
                    <option value="high">High - Critical issue</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <Select
                    placeholder="Select a category"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Tags</FormLabel>
                  <Wrap>
                    {tags.map((tag) => (
                      <WrapItem key={tag.id}>
                        <Tag
                          size="lg"
                          variant={formData.tag_ids.includes(tag.id) ? 'solid' : 'outline'}
                          colorScheme="blue"
                          cursor="pointer"
                          onClick={() => toggleTag(tag.id)}
                        >
                          <TagLabel>{tag.name}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>

                <HStack justify="flex-end" spacing={4}>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/support')}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                  >
                    Create Ticket
                  </Button>
                </HStack>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default CreateTicket;
