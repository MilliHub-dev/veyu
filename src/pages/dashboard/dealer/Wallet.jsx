import { useState } from 'react';
import { Box, Container, Heading, useDisclosure } from '@chakra-ui/react';
import {
  WalletOverview,
  DepositModal,
  WithdrawModal,
  TransferModal,
} from '../../../components';

/**
 * Wallet Page
 * Demonstrates integration of WalletOverview with transaction modals
 */
const WalletPage = () => {
  // Modal states
  const {
    isOpen: isDepositOpen,
    onOpen: onDepositOpen,
    onClose: onDepositClose,
  } = useDisclosure();

  const {
    isOpen: isWithdrawOpen,
    onOpen: onWithdrawOpen,
    onClose: onWithdrawClose,
  } = useDisclosure();

  const {
    isOpen: isTransferOpen,
    onOpen: onTransferOpen,
    onClose: onTransferClose,
  } = useDisclosure();

  // Track current balance for modals
  const [currentBalance, setCurrentBalance] = useState(0);

  // Handle transaction success - refresh wallet data
  const handleTransactionSuccess = (transaction) => {
    console.log('Transaction successful:', transaction);
    // The WalletOverview component will auto-refresh
    // You can also manually update the balance here if needed
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={6}>
        My Wallet
      </Heading>

      {/* Wallet Overview with action buttons */}
      <WalletOverview
        onDeposit={onDepositOpen}
        onWithdraw={onWithdrawOpen}
        onTransfer={onTransferOpen}
      />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={onDepositClose}
        onSuccess={handleTransactionSuccess}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={onWithdrawClose}
        currentBalance={currentBalance}
        onSuccess={handleTransactionSuccess}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={onTransferClose}
        currentBalance={currentBalance}
        onSuccess={handleTransactionSuccess}
      />
    </Container>
  );
};

export default WalletPage;
