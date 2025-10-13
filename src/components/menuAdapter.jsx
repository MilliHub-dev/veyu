import React from 'react';
import {
  Menu as ChakraMenu,
  MenuButton as ChakraMenuButton,
  MenuList as ChakraMenuList,
  MenuItem as ChakraMenuItem,
  MenuGroup as ChakraMenuGroup,
  MenuDivider as ChakraMenuDivider,
  MenuItemOption as ChakraMenuItemOption,
  MenuOptionGroup as ChakraMenuOptionGroup,
} from '@chakra-ui/react';

// Adapter that exposes the new Menu.* API while delegating to Chakra UI components.
// This keeps markup stable while allowing an incremental migration.

export const Menu = {
  Root: ({ children, ...props }) => (
    <ChakraMenu {...props}>{children}</ChakraMenu>
  ),

  // Trigger maps to Chakra's MenuButton. Accepts either children or an `as` prop.
  Trigger: ({ children, ...props }) => (
    <ChakraMenuButton {...props}>{children}</ChakraMenuButton>
  ),

  // Positioner is a no-op wrapper for Chakra's internal positioning. Keep for API parity.
  Positioner: ({ children }) => <React.Fragment>{children}</React.Fragment>,

  // Content maps to Chakra's MenuList
  Content: ({ children, ...props }) => <ChakraMenuList {...props}>{children}</ChakraMenuList>,

  // Simple item wrapper
  Item: ({ children, ...props }) => <ChakraMenuItem {...props}>{children}</ChakraMenuItem>,

  // Item group
  ItemGroup: ({ title, children, ...props }) => (
    <ChakraMenuGroup title={title} {...props}>{children}</ChakraMenuGroup>
  ),

  Separator: (props) => <ChakraMenuDivider {...props} />,

  // Radio/Option mapping (basic)
  RadioItemGroup: ({ children, ...props }) => (
    <ChakraMenuOptionGroup {...props}>{children}</ChakraMenuOptionGroup>
  ),
  RadioItem: ({ children, ...props }) => <ChakraMenuItemOption {...props}>{children}</ChakraMenuItemOption>,

  // Checkbox-like item - fallback to a regular item (behavior may differ from a native checkbox item)
  CheckboxItem: ({ children, ...props }) => <ChakraMenuItem {...props}>{children}</ChakraMenuItem>,
  ItemIndicator: ({ children }) => <React.Fragment>{children}</React.Fragment>,
};

export default Menu;
