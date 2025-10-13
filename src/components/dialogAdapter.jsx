import React, { createContext, useContext } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Portal,
  CloseButton,
} from '@chakra-ui/react';

const DialogContext = createContext({ onClose: null });

export const Dialog = {
  Root: ({ children, ...props }) => {
    const { onClose } = props;
    return (
      <DialogContext.Provider value={{ onClose }}>
        <Modal {...props}>{children}</Modal>
      </DialogContext.Provider>
    );
  },

  Trigger: ({ children, asChild, ...props }) => {
    // Chakra Modal is controlled externally; Trigger is a no-op passthrough for parity.
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { ...props });
    }
    return <>{children}</>;
  },

  Backdrop: (props) => <ModalOverlay {...props} />,

  Positioner: ({ children }) => <>{children}</>,

  Content: ({ children, ...props }) => <ModalContent {...props}>{children}</ModalContent>,

  Header: ({ children, ...props }) => <ModalHeader {...props}>{children}</ModalHeader>,

  Body: ({ children, ...props }) => <ModalBody {...props}>{children}</ModalBody>,

  Footer: ({ children, ...props }) => <ModalFooter {...props}>{children}</ModalFooter>,

  Title: ({ children }) => <>{children}</>,

  // ActionTrigger: usually used to wrap action buttons; pass-through that can optionally close.
  ActionTrigger: ({ children, closeOnAction = false }) => {
    const ctx = useContext(DialogContext);
    if (React.isValidElement(children)) {
      const onClick = children.props.onClick;
      const handler = (e) => {
        if (onClick) onClick(e);
        if (closeOnAction && ctx?.onClose) ctx.onClose();
      };
      return React.cloneElement(children, { onClick: handler });
    }
    return children;
  },

  // CloseTrigger: clone child and call dialog onClose when clicked
  CloseTrigger: ({ children }) => {
    const ctx = useContext(DialogContext);
    if (React.isValidElement(children)) {
      const onClick = children.props.onClick;
      const handler = (e) => {
        if (onClick) onClick(e);
        if (ctx?.onClose) ctx.onClose();
      };
      return React.cloneElement(children, { onClick: handler });
    }
    return children;
  },
};

export default Dialog;
