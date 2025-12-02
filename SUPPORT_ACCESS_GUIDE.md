# How to Access Support Tickets

Users can access the support ticket system in **3 different ways**:

## 1. User Profile Menu (Desktop & Mobile)
**Location:** Click on the user profile icon in the top navigation bar

**Steps:**
1. Click the user profile icon (person icon) in the top right corner
2. A dropdown menu will appear showing:
   - User name and avatar
   - Sign Out button
   - **Contact Support button** (with headphone icon)
3. Click "Contact Support" to go to the support ticket page

**Available for:** All authenticated users (Customers, Dealers, Mechanics)

---

## 2. Mobile Drawer Menu
**Location:** Mobile navigation drawer (hamburger menu)

**Steps:**
1. Open the mobile menu (hamburger icon)
2. Scroll to the bottom of the drawer
3. Click the **"Contact Support"** button in the drawer footer

**Available for:** All users on mobile devices

---

## 3. Footer Button (All Pages)
**Location:** Bottom of every page in the footer

**Steps:**
1. Scroll to the bottom of any page
2. Look for the prominent orange button section with:
   - Large headphone icon
   - "Need Help?" heading
   - Description text
   - **"Create Support Ticket"** button (orange)
3. Click the button to create a new support ticket

**Available for:** All authenticated users on all pages

---

## Support Ticket Features

Once you access the support system, you can:

### For Customers:
- ✅ View all your support tickets
- ✅ Create new tickets with:
  - Subject/description
  - Severity level (High, Moderate, Low)
  - Category selection
  - Tags for better organization
- ✅ View ticket details
- ✅ Track ticket status (Open, In Progress, Awaiting User, Resolved)
- ✅ See if tickets are overdue
- ✅ Chat with support team (live chat integration ready)
- ✅ Filter tickets by status and severity
- ✅ Search through your tickets

### For Staff (Future):
- View all customer tickets
- Assign staff to tickets
- Update ticket status
- Respond via live chat
- View ticket statistics

---

## Routes

- `/support` - Main ticket list page
- `/support/create` - Create new ticket form
- `/support/tickets/:id` - Individual ticket detail page

---

## Visual Locations

### Desktop Profile Menu
```
┌─────────────────────────────────────┐
│  [Logo]  [Nav Items]  [🔔] [🛒] [👤]│ ← Click here
└─────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  John Doe        │
                    │  ──────────────  │
                    │  Sign Out     →  │
                    │  Contact Support🎧│ ← Then click here
                    └──────────────────┘
```

### Footer Button
```
┌─────────────────────────────────────┐
│         [Newsletter Section]         │
├─────────────────────────────────────┤
│              🎧                      │
│         Need Help?                   │
│  Our support team is here to help   │
│                                      │
│   [Create Support Ticket] ← Click   │
└─────────────────────────────────────┘
│  © 2024 Veyu Limited                │
└─────────────────────────────────────┘
```

---

## Notes

- Public (non-authenticated) users who try to access `/support` will be redirected to the login page
- All authenticated user types (Customer, Dealer, Mechanic) have access to support tickets
- The Contact Support button is available in all navbar variants (Customer, Dealer, Mechanic)
