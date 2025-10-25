import { createContext, Fragment, useEffect, useState, lazy, Suspense } from "react";
import { Outlet, BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { ChakraProvider, useToast } from "@chakra-ui/react";
import ErrorBoundary from "./components/error";
import { LoadingSpinner } from "./components/loaders";
import VeyuTheme from "./theme.jsx";
import {APIProvider} from '@vis.gl/react-google-maps';
import {Autocomplete, LoadScript} from "@react-google-maps/api";

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
const ChatLayout = lazy(() => import("./pages/marketplace/chat/Layout"));
const ChatRoom = lazy(() => import("./pages/marketplace/chat/ChatRoom"));
const CartPage = lazy(() => import("./pages/marketplace/CartPage"));
const CheckoutPage = lazy(() => import("./pages/marketplace/checkout/CheckoutPage"));
const CheckoutWithInspection = lazy(() => import("./pages/marketplace/checkout/CheckoutInspection"));
const DocumentSigningPage = lazy(() => import("./pages/marketplace/checkout/DocumentSigningPage"));
const NotificationsPage = lazy(() => import("./pages/marketplace/Notifications"));

// Mechanic Dashboard
const MechanicDashboardLayout = lazy(() => import("./pages/dashboard/mechanic/Layout"));
const MechanicDashboard = lazy(() => import("./pages/dashboard/mechanic/MechanicDashboard"));
const BookingsAdmin = lazy(() => import("./pages/dashboard/mechanic/Bookings"));
const ServiceOfferings = lazy(() => import("./pages/dashboard/mechanic/services/ServiceOfferings"));
const MechanicAnalytics = lazy(() => import("./pages/dashboard/mechanic/Analytics"));
const CreateServiceOffering = lazy(() => import("./pages/dashboard/mechanic/services/CreateServiceOffering"));
const BusinessProfile = lazy(() => import("./pages/dashboard/mechanic/settings/BusinessProfile"));

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

  const axiosClient = axios.create({
    baseURL: "https://dev.veyu.cc/api/v1",
    headers: { "Content-Type": "application/json" },
    withCredentials: false, // Disabled due to backend CORS wildcard (*) config
    timeout: 30000, // 30 second timeout
  });

  // Sync axios auth header
  useEffect(() => {
    if (authUser?.token) {
      axiosClient.defaults.headers.Authorization = `Token ${authUser.token}`;
    } else {
      delete axiosClient.defaults.headers.Authorization;
    }
  }, [authUser]);

  const notify = ({ title, body, color = "green", duration = 2500 }) =>
    toast({ title, description: body, colorScheme: color, duration });

  const redirect = (url, timeout) => {
    timeout ? setTimeout(() => (window.location.href = url), timeout) : (window.location.href = url);
  };

  const onAuthenticated = (data) => {
    localStorage.setItem("veyu-auth-user", JSON.stringify(data));
    setAuthUser(data);
    setAuthState(true);
  };

  const onLogout = () => {
    setAuthState(false);
    setAuthUser(null);
    localStorage.removeItem("veyu-auth-user");
    window.location.href = '/login';
  };

  const getAuthUser = () => {
    const user = localStorage.getItem("veyu-auth-user");
    if (user) {
      const data = JSON.parse(user);
      setAuthUser(data);
      setAuthState(true);
    }
  };

  const init = () => {
    // setLoading(true);
    // setLoading(false);
    getAuthUser();
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

  return (
    <ChakraProvider theme={VeyuTheme}>
      <ErrorBoundary>
      <GlobalStore.Provider value={context}>
        <LoadScript googleMapsApiKey="AIzaSyBcwRVb-mzVQuHVJyaOkgbGXtmFT-c_II0" libraries={['places', 'maps']}>
          <Router>
            <Suspense fallback={<LoadingSpinner fullscreen message="Veyu is Loading..." />}>
              <Routes>
                {authUser ? (
                  <Fragment>
                    {/* Dealer Dashboard */}
                    {authUser.user_type === "dealer" ? (
                      <Route element={<DealerDashboardLayout />}>
                        <Route path="/dashboard" element={<DealerDashboard />} />
                        <Route path="/orders" element={<OrderListAdmin />} />
                        <Route path="/inventory" element={<Outlet />}>
                          <Route path="edit/:listingId" element={<EditListingAdmin />} />
                          <Route path="add" element={<CreateListingAdmin />} />
                          <Route path="" element={<ListingsAdmin />} />
                        </Route>
                        <Route path="/analytics" element={<AnalyticsDashboard />} />
                        <Route path="/settings" element={<DealershipSettings />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/*" element={<Navigate to="/dashboard" />} />
                      </Route>
                    ) : authUser.user_type === "mechanic" ? (
                      /* Mechanic Dashboard */
                      <Route element={<MechanicDashboardLayout />}>
                        <Route path="/dashboard" element={<MechanicDashboard />} />
                        <Route path="/bookings" element={<BookingsAdmin />} />
                        <Route path="/analytics" element={<MechanicAnalytics />} />
                        <Route path="/services" element={<Outlet />}>
                          <Route path="edit/:serviceId" element={<ServiceOfferings />} />
                          <Route path="add" element={<CreateServiceOffering />} />
                          <Route path="" element={<ServiceOfferings />} />
                        </Route>
                        <Route path="/settings" element={<BusinessProfile />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/*" element={<Navigate to="/dashboard" />} />
                      </Route>
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
                        <Route path="/search/cars" element={<CarSearchPage />} />
                        <Route path="/search/mechanics" element={<MechanicSearchPage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/*" element={<Navigate to="/home" />} />
                      </Route>
                    )}

                    {/* Wallet Routes */}
                    <Route
                      element={
                        authUser.user_type === "dealer" ? (
                          <DealerDashboardLayout hideSidebar hideFooter />
                        ) : authUser.user_type === "mechanic" ? (
                          <MechanicDashboardLayout hideSidebar hideFooter />
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
