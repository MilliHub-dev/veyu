import { createContext, Fragment, useEffect, useState, lazy, Suspense } from "react";
import { Outlet, BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { ChakraProvider, useToast } from "@chakra-ui/react";
import { apiClient, TokenManager } from "./services/api";
import ErrorBoundary from "./components/error";
import { LoadingSpinner } from "./components/loaders";
import BusinessProfileGuard from "./components/BusinessProfileGuard";
import VeyuTheme from "./theme.jsx";
import { APIProvider } from '@vis.gl/react-google-maps';
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import { enhanceUserWithCompletionStatus } from "./utils/profileCompletionUtils";

// Lazy-loaded pages (split chunks)
const Layout = lazy(() => import("./pages/Layout"));
const HomePage = lazy(() => import("./pages/marketplace/HomePage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const AboutPage = lazy(() => import("./pages/About"));
const ServicesPage = lazy(() => import("./pages/Services"));
const ContactPage = lazy(() => import("./pages/Contact"));
const PublicProfilePage = lazy(() => import("./pages/Profile"));

const RentListing = lazy(() => import("./pages/marketplace/rent/RentListing"));
const RentDetail = lazy(() => import("./pages/marketplace/rent/RentDetail"));
const BuyListing = lazy(() => import("./pages/marketplace/buy/BuyListing"));
const BuyDetail = lazy(() => import("./pages/marketplace/buy/BuyDetail"));
const MechanicSearchPage = lazy(() => import("./pages/marketplace/search/MechanicSearch"));
const CarSearchPage = lazy(() => import("./pages/marketplace/search/CarSearch"));
const MechanicListPage = lazy(() => import("./pages/marketplace/mechanics/MechanicsListing"));
const ConfirmMechanicBookingPage = lazy(() => import("./pages/marketplace/mechanics/ConfirmBooking"));
const MechanicDetailPage = lazy(() => import("./pages/marketplace/mechanics/MechanicDetail"));
const LoginView = lazy(() => import("./pages/auth/Login"));
const SignupView = lazy(() => import("./pages/auth/Signup"));
const BusinessSignupView = lazy(() => import("./pages/auth/BusinessProfile"));
const BusinessProfileSetup = lazy(() => import("./pages/auth/BusinessProfile"));
const ChatLayout = lazy(() => import("./pages/marketplace/chat/Layout"));
const ChatRoom = lazy(() => import("./pages/marketplace/chat/ChatRoom"));
const CartPage = lazy(() => import("./pages/marketplace/CartPage"));
const CheckoutPage = lazy(() => import("./pages/marketplace/checkout/CheckoutPage"));
const CheckoutWithInspection = lazy(() => import("./pages/marketplace/checkout/CheckoutInspection"));
const DocumentSigningPage = lazy(() => import("./pages/marketplace/checkout/DocumentSigningPage"));
const NotificationsPage = lazy(() => import("./pages/marketplace/Notifications"));

// Support Pages
const TicketList = lazy(() => import("./pages/support/TicketList"));
const CreateTicket = lazy(() => import("./pages/support/CreateTicket"));
const TicketDetail = lazy(() => import("./pages/support/TicketDetail"));

// Inspection Pages
const InspectionSlipPage = lazy(() => import("./pages/marketplace/inspection/InspectionSlipPage"));
const InspectionFormPage = lazy(() => import("./pages/marketplace/inspection/InspectionFormPage"));
const DocumentPreviewPage = lazy(() => import("./pages/marketplace/inspection/DocumentPreviewPage"));
const InspectionDetailPage = lazy(() => import("./pages/marketplace/InspectionDetailPage"));

// Mechanic Dashboard
const MechanicDashboardLayout = lazy(() => import("./pages/dashboard/mechanic/Layout"));
const MechanicDashboard = lazy(() => import("./pages/dashboard/mechanic/MechanicDashboard"));
const BookingsAdmin = lazy(() => import("./pages/dashboard/mechanic/Bookings"));
const ServiceOfferings = lazy(() => import("./pages/dashboard/mechanic/services/ServiceOfferings"));
const MechanicAnalytics = lazy(() => import("./pages/dashboard/mechanic/Analytics"));
const CreateServiceOffering = lazy(() => import("./pages/dashboard/mechanic/services/CreateServiceOffering"));
const MechanicBusinessProfile = lazy(() => import("./pages/dashboard/mechanic/settings/BusinessProfile"));

// Dealer Dashboard
const DealerProfile = lazy(() => import("./pages/marketplace/DealerProfile"));
const DealerDashboardLayout = lazy(() => import("./pages/dashboard/dealer/Layout"));
const DealerDashboard = lazy(() => import("./pages/dashboard/dealer/Dashboard"));
const ListingsAdmin = lazy(() => import("./pages/dashboard/dealer/inventory/Listings"));
const CreateListingAdmin = lazy(() => import("./pages/dashboard/dealer/inventory/CreateListing"));
const EditListingAdmin = lazy(() => import("./pages/dashboard/dealer/inventory/EditListing"));
const OrderListAdmin = lazy(() => import("./pages/dashboard/dealer/orders/OrderList"));
const AnalyticsDashboard = lazy(() => import("./pages/dashboard/dealer/analytics/AnalyticsOverview"));
const DealershipSettings = lazy(() => import("./pages/dashboard/dealer/settings/Settings"));
const MyBoosts = lazy(() => import("./pages/dashboard/dealer/boost/MyBoosts"));
const VerifyInspectionPage = lazy(() => import("./pages/dashboard/dealer/VerifyInspectionPage"));

// Wallet
const WalletLayout = lazy(() => import("./pages/marketplace/wallet/Layout"));
const WalletHomePage = lazy(() => import("./pages/marketplace/wallet/Dashboard"));
const WalletDepositPage = lazy(() => import("./pages/marketplace/wallet/Deposit"));
const WalletTransactionsPage = lazy(() => import("./pages/marketplace/wallet/Transactions"));
const WalletWithdrawalPage = lazy(() => import("./pages/marketplace/wallet/Withdraw"));

export const GlobalStore = createContext({});

function App() {
  const toast = useToast();
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setAuthState] = useState(false);
  const [otherContext, setOtherContext] = useState({});
  const commaInt = (n) => {
    try { return Number(n || 0).toLocaleString(); } catch { return '0'; }
  };



  // Use the centralized API client instead of creating a new one
  const axiosClient = apiClient;

  // Sync token with the old axios instance for backward compatibility
  useEffect(() => {
    const token = TokenManager.getAccessToken();
    if (token) {
      // Set Bearer token for the new format
      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token synced with axios client:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      delete axiosClient.defaults.headers.Authorization;
      console.log('🔐 No token found, removed Authorization header');
    }
  }, [authUser]);

  const notify = ({ title, body, color = "green", duration = 2500 }) =>
    toast({ title, description: body, colorScheme: color, duration });

  if (typeof window !== 'undefined') {
    window.notify = notify;
  }

  const redirect = (url, timeout) => {
    timeout ? setTimeout(() => (window.location.href = url), timeout) : (window.location.href = url);
  };

  const onAuthenticated = (data) => {
    try {
      console.log('🔐 App.jsx onAuthenticated called with:', data);

      // Handle missing authentication data gracefully
      if (!data || typeof data !== 'object') {
        console.error('❌ Invalid authentication data provided');
        return;
      }

      // Extract user data from various response formats with graceful handling
      let userData = data.user || data;

      // Handle missing or invalid user data gracefully
      if (!userData || typeof userData !== 'object') {
        console.error('❌ No valid user data found in authentication response');
        return;
      }

      // Provide sensible defaults for missing user data fields
      const safeUserData = {
        id: userData.id || null,
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        user_type: userData.user_type || 'customer',
        phone_number: userData.phone_number || '',
        business_name: userData.business_name || '',
        email_verified: userData.email_verified || false,
        is_verified: userData.is_verified || false,
        business_profile_completed: userData.business_profile_completed || false,
        ...userData // Preserve any additional fields
      };

      // Enhance user data with business_profile_completed field if not present
      const enhancedUserData = enhanceUserWithCompletionStatus(safeUserData);

      // Store user data in both formats for compatibility
      localStorage.setItem("veyu_user_data", JSON.stringify(enhancedUserData));

      // Store tokens using TokenManager for consistency with graceful handling
      let accessToken = null;
      let refreshToken = null;

      try {
        if (data.token) {
          if (typeof data.token === 'string') {
            // Token is a string directly (old format)
            accessToken = data.token;
          } else if (data.token.access) {
            // Token is an object with access/refresh (new format)
            accessToken = data.token.access;
            refreshToken = data.token.refresh;
          }
        } else if (data.tokens) {
          // Tokens object (new format)
          accessToken = data.tokens.access;
          refreshToken = data.tokens.refresh;
        } else if (data.access_token) {
          // Direct access_token field
          accessToken = data.access_token;
          refreshToken = data.refresh_token;
        } else if (data.api_token) {
          // API token field
          accessToken = data.api_token;
        }

        if (accessToken) {
          TokenManager.setTokens(accessToken, refreshToken);
          console.log('🔐 Tokens stored via TokenManager');
        } else {
          console.warn('⚠️ No access token found in authentication data');
        }
      } catch (tokenError) {
        console.error('❌ Error processing authentication tokens:', tokenError);
      }

      // Set the enhanced user data
      // Flatten user properties to top level for backward compatibility with routing
      // The routing checks authUser.user_type, so we need it at the top level
      setAuthUser({
        ...data,
        ...enhancedUserData, // Spread user properties at top level
        user: enhancedUserData // Also keep nested for consistency
      });
      setAuthState(true);

      console.log('✅ Authentication completed with graceful handling:', {
        userId: enhancedUserData.id,
        userType: enhancedUserData.user_type,
        emailVerified: enhancedUserData.email_verified || enhancedUserData.is_verified,
        hasRequiredFields: !!(enhancedUserData.email && enhancedUserData.user_type)
      });
    } catch (error) {
      console.error('❌ Error in onAuthenticated with graceful handling:', error);
    }
  };

  const onLogout = () => {
    setAuthState(false);
    setAuthUser(null);

    // Use TokenManager to clear tokens properly
    TokenManager.clearTokens();

    window.location.href = '/login';
  };

  const getAuthUser = () => {
    try {
      // Check if we have a valid token first
      const hasToken = TokenManager.isAuthenticated();

      if (hasToken) {
        // Try to get user data from localStorage with graceful error handling
        let userData = null;
        let fullAuthData = null;

        // Try new format first
        const newUserData = localStorage.getItem("veyu_user_data");
        if (newUserData) {
          try {
            userData = JSON.parse(newUserData);

            // Validate user data structure
            if (userData && typeof userData === 'object') {
              // Provide sensible defaults for missing user data fields
              userData = {
                id: userData.id || null,
                email: userData.email || '',
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                user_type: userData.user_type || 'customer',
                phone_number: userData.phone_number || '',
                business_name: userData.business_name || '',
                email_verified: userData.email_verified || false,
                is_verified: userData.is_verified || false,
                business_profile_completed: userData.business_profile_completed || false,
                ...userData // Preserve any additional fields
              };
            } else {
              console.warn('⚠️ Invalid user data format in veyu_user_data');
              userData = null;
            }
          } catch (e) {
            console.error('❌ Error parsing veyu_user_data:', e);
            userData = null;
          }
        }

        // Try to get full auth data for backward compatibility
        const oldUserData = localStorage.getItem("veyu-auth-user");
        if (oldUserData) {
          try {
            fullAuthData = JSON.parse(oldUserData);
            // If we don't have userData from new format, extract from old format
            if (!userData && fullAuthData) {
              const extractedUser = fullAuthData.user || fullAuthData;
              if (extractedUser && typeof extractedUser === 'object') {
                userData = {
                  id: extractedUser.id || null,
                  email: extractedUser.email || '',
                  first_name: extractedUser.first_name || '',
                  last_name: extractedUser.last_name || '',
                  user_type: extractedUser.user_type || 'customer',
                  phone_number: extractedUser.phone_number || '',
                  business_name: extractedUser.business_name || '',
                  email_verified: extractedUser.email_verified || false,
                  is_verified: extractedUser.is_verified || false,
                  business_profile_completed: extractedUser.business_profile_completed || false,
                  ...extractedUser // Preserve any additional fields
                };
              }
            }
          } catch (e) {
            console.error('❌ Error parsing veyu-auth-user:', e);
            fullAuthData = null;
          }
        }

        if (userData) {
          // Enhance user data with completion status for backward compatibility
          const enhancedUserData = enhanceUserWithCompletionStatus(userData);

          // Update localStorage with enhanced data
          localStorage.setItem("veyu_user_data", JSON.stringify(enhancedUserData));

          // Prepare full auth data structure
          let authData;
          if (fullAuthData) {
            authData = {
              ...fullAuthData,
              ...enhancedUserData, // Spread user properties at top level for routing compatibility
              user: enhancedUserData
            };
          } else {
            authData = enhancedUserData;
          }

          console.log('🔐 Restored user session with graceful handling:', {
            userId: enhancedUserData.id,
            userType: enhancedUserData.user_type,
            emailVerified: enhancedUserData.email_verified || enhancedUserData.is_verified,
            hasRequiredFields: !!(enhancedUserData.email && enhancedUserData.user_type)
          });

          setAuthUser(authData);
          setAuthState(true);
        } else {
          console.log('🔐 Token exists but no valid user data found, clearing tokens');
          TokenManager.clearTokens();
        }
      } else {
        console.log('🔐 No valid token found');
      }
    } catch (error) {
      console.error('❌ Error in getAuthUser with graceful handling:', error);
      // Clear potentially corrupted data
      TokenManager.clearTokens();
    }
  };

  const init = () => {
    setLoading(true);
    getAuthUser();
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const context = {
    notify,
    authUser,
    loading,
    axios: axiosClient,
    redirect,
    onAuthenticated,
    isAuthenticated,
    onLogout,
    logout: onLogout, // Alias for backward compatibility
    setOtherContext,
    otherContext,
    commaInt,
  };

  if (loading) {
    return (
      <ChakraProvider theme={VeyuTheme}>
        <LoadingSpinner fullscreen message="Veyu is Loading..." />
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={VeyuTheme}>
      <ErrorBoundary>
        <GlobalStore.Provider value={context}>
          <LoadScript googleMapsApiKey="AIzaSyBcwRVb-mzVQuHVJyaOkgbGXtmFT-c_II0" libraries={['places', 'maps']}>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<LoadingSpinner fullscreen message="Veyu is Loading..." />}>
                <Routes>
                  {authUser ? (
                    <Fragment>
                      {/* Dealer Dashboard */}
                      {authUser.user_type === "dealer" ? (
                        <>
                          <Route element={
                            <BusinessProfileGuard>
                              <DealerDashboardLayout />
                            </BusinessProfileGuard>
                          }>
                            <Route path="/dashboard" element={<DealerDashboard />} />
                            <Route path="/orders" element={<OrderListAdmin />} />
                            <Route path="/inventory" element={<Outlet />}>
                              <Route path="edit/:listingId" element={<EditListingAdmin />} />
                              <Route path="add" element={<CreateListingAdmin />} />
                              <Route path="boost" element={<MyBoosts />} />
                              <Route path="" element={<ListingsAdmin />} />
                            </Route>
                            <Route path="/analytics" element={<AnalyticsDashboard />} />
                            <Route path="/verify-inspection" element={<VerifyInspectionPage />} />
                            <Route path="/settings" element={<DealershipSettings />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="/support" element={<TicketList />} />
                            <Route path="/support/create" element={<CreateTicket />} />
                            <Route path="/support/tickets/:id" element={<TicketDetail />} />
                            <Route path="/*" element={<Navigate to="/dashboard" />} />
                          </Route>
                          {/* Marketplace routes for dealers */}
                          <Route element={<Layout />}>
                            <Route path="/buy" element={<BuyListing />} />
                            <Route path="/buy/:listingId" element={<BuyDetail />} />
                            <Route path="/rent" element={<RentListing />} />
                            <Route path="/rent/:listingId" element={<RentDetail />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout/pay" element={<CheckoutPage />} />
                            <Route path="/checkout/docs" element={<DocumentSigningPage />} />
                            <Route path="/checkout/inspection" element={<CheckoutWithInspection />} />
                            <Route path="/inspections/:inspectionId" element={<InspectionDetailPage />} />
                            <Route path="/inspections/slip/:slipReference" element={<InspectionSlipPage />} />
                          </Route>
                        </>
                      ) : authUser.user_type === "mechanic" ? (
                        /* Mechanic Dashboard */
                        <>
                          <Route element={
                            <BusinessProfileGuard>
                              <MechanicDashboardLayout />
                            </BusinessProfileGuard>
                          }>
                            <Route path="/dashboard" element={<MechanicDashboard />} />
                            <Route path="/bookings" element={<BookingsAdmin />} />
                            <Route path="/analytics" element={<MechanicAnalytics />} />
                            <Route path="/services" element={<Outlet />}>
                              <Route path="edit/:serviceId" element={<ServiceOfferings />} />
                              <Route path="add" element={<CreateServiceOffering />} />
                              <Route path="" element={<ServiceOfferings />} />
                            </Route>
                            <Route path="/settings" element={<MechanicBusinessProfile />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="/support" element={<TicketList />} />
                            <Route path="/support/create" element={<CreateTicket />} />
                            <Route path="/support/tickets/:id" element={<TicketDetail />} />
                            <Route path="/*" element={<Navigate to="/dashboard" />} />
                          </Route>
                          {/* Marketplace routes for mechanics */}
                          <Route element={<Layout />}>
                            <Route path="/buy" element={<BuyListing />} />
                            <Route path="/buy/:listingId" element={<BuyDetail />} />
                            <Route path="/rent" element={<RentListing />} />
                            <Route path="/rent/:listingId" element={<RentDetail />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout/pay" element={<CheckoutPage />} />
                            <Route path="/checkout/docs" element={<DocumentSigningPage />} />
                            <Route path="/checkout/inspection" element={<CheckoutWithInspection />} />
                            <Route path="/inspections/:inspectionId" element={<InspectionDetailPage />} />
                            <Route path="/inspections/slip/:slipReference" element={<InspectionSlipPage />} />
                          </Route>
                        </>
                      ) : (
                        /* General Marketplace */
                        <Route element={<Layout />}>
                          <Route path="/rent" element={<RentListing />} />
                          <Route path="/rent/:listingId" element={<RentDetail />} />
                          <Route path="/buy" element={<BuyListing />} />
                          <Route path="/buy/:listingId" element={<BuyDetail />} />
                          <Route path="/mechanics" element={<MechanicListPage />} />
                          <Route path="/mechanics/book/:mechId" element={<ConfirmMechanicBookingPage />} />
                          <Route path="/mechanics/:mechId" element={<MechanicDetailPage />} />
                          <Route path="/dealership/:dealerId" element={<DealerProfile />} />
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/checkout/pay" element={<CheckoutPage />} />
                          <Route path="/checkout/docs" element={<DocumentSigningPage />} />
                          <Route path="/checkout/inspection" element={<CheckoutWithInspection />} />
                          <Route path="/inspection/slip" element={<InspectionSlipPage />} />
                          <Route path="/inspection/form" element={<InspectionFormPage />} />
                          <Route path="/inspection/document" element={<DocumentPreviewPage />} />
                          <Route path="/inspections/:inspectionId" element={<InspectionDetailPage />} />
                          <Route path="/inspections/slip/:slipReference" element={<InspectionSlipPage />} />
                          <Route path="/search/cars" element={<CarSearchPage />} />
                          <Route path="/search/mechanics" element={<MechanicSearchPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/support" element={<TicketList />} />
                          <Route path="/support/create" element={<CreateTicket />} />
                          <Route path="/support/tickets/:id" element={<TicketDetail />} />
                          <Route path="/home" element={<HomePage />} />
                          <Route path="/*" element={<Navigate to="/home" />} />
                        </Route>
                      )}

                      {/* Business Profile Setup Route - for post-signup business profile completion */}
                      <Route path="/business-profile" element={<BusinessProfileSetup />} />

                      {/* Wallet Routes */}
                      <Route
                        element={
                          authUser.user_type === "dealer" ? (
                            <BusinessProfileGuard>
                              <DealerDashboardLayout hideSidebar hideFooter />
                            </BusinessProfileGuard>
                          ) : authUser.user_type === "mechanic" ? (
                            <BusinessProfileGuard>
                              <MechanicDashboardLayout hideSidebar hideFooter />
                            </BusinessProfileGuard>
                          ) : (
                            <Layout hideFooter />
                          )
                        }
                      >
                        <Route path="/wallet" element={<WalletLayout />}>
                          <Route path="home" element={<WalletHomePage />} />
                          <Route path="transactions" element={<WalletTransactionsPage />} />
                          <Route path="deposit" element={<WalletDepositPage />} />
                          <Route path="withdraw" element={<WalletWithdrawalPage />} />
                          <Route path="" element={<Navigate to="home" />} />
                        </Route>

                        <Route path="/chat" element={<ChatLayout />}>
                          <Route path="/chat/:room" element={<ChatRoom />} />
                        </Route>
                      </Route>
                    </Fragment>
                  ) : (
                    /* Public Routes */
                    <Route element={<Layout />}>
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/profile" element={<PublicProfilePage />} />
                      <Route path="/support" element={<Navigate to="/login" />} />
                      <Route path="/login" element={<LoginView />} />
                      <Route path="/signup" element={<SignupView />} />
                      <Route path="/signup/business" element={<BusinessSignupView />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                      <Route path="/*" element={<LandingPage />} />
                    </Route>
                  )}
                </Routes>
              </Suspense>
            </Router>
          </LoadScript>
        </GlobalStore.Provider>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;
