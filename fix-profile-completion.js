// Quick fix script to mark your business profile as complete
// Run this in your browser console (F12 → Console tab)

// Get current user data
const userData = JSON.parse(localStorage.getItem('veyu_user_data') || '{}');
const authUser = JSON.parse(localStorage.getItem('veyu-auth-user') || '{}');

// Update both storage locations
const updatedUser = {
  ...userData,
  business_profile_completed: true,
  email_verified: true,
  is_verified: true
};

const updatedAuthUser = {
  ...authUser,
  business_profile_completed: true,
  email_verified: true,
  is_verified: true
};

// Save back to localStorage
localStorage.setItem('veyu_user_data', JSON.stringify(updatedUser));
localStorage.setItem('veyu-auth-user', JSON.stringify(updatedAuthUser));

console.log('✅ Profile marked as complete!');
console.log('Updated user data:', updatedUser);

// Reload the page
setTimeout(() => {
  console.log('🔄 Reloading page...');
  window.location.reload();
}, 1000);
