import { Badge, HStack, Text, Tooltip } from '@chakra-ui/react';
import { TrendingUp } from 'lucide-react';

const BoostBadge = ({ boost, showDetails = false }) => {
  if (!boost || !boost.active) {
    return null;
  }

  return (
    <Tooltip label={`Boosted until ${new Date(boost.end_date).toLocaleDateString()}`}>
      <Badge
        colorScheme="green"
        display="flex"
        alignItems="center"
        gap={1}
        px={2}
        py={1}
        borderRadius="md"
      >
        <TrendingUp size={14} />
        <Text fontSize="xs">Boosted</Text>
        {showDetails && boost.days_remaining && (
          <Text fontSize="xs" ml={1}>
            ({boost.days_remaining} days left)
          </Text>
        )}
      </Badge>
    </Tooltip>
  );
};

export default BoostBadge;
