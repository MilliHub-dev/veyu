const API_KEY = 'AIzaSyBcwRVb-mzVQuHVJyaOkgbGXtmFT-c_II0'; // Replace with your actual API key
const LIBRARIES = ['places'];

export const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=${LIBRARIES.join(',')}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        reject(new Error('Google Maps API failed to load'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Error loading Google Maps API'));
    };
    
    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = () => {
  return !!(window.google && window.google.maps);
};
