// Grocery store database and Leaflet map integration for Rasoi

export const POPULAR_NATIVE_PLACES = [
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.648 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Dallas (USA)", state: "Texas", lat: 32.7767, lng: -96.797 },
  { name: "London (UK)", state: "UK", lat: 51.5074, lng: -0.1278 },
];

export const GROCERY_STORES = [
  // Hyderabad
  {
    id: "hyd-1",
    name: "Begum Bazar Whole Spice Market",
    type: "indian",
    typeLabel: "Indian Wholesale Spices & Kirana",
    city: "Hyderabad",
    lat: 17.3736,
    lng: 78.4716,
    address: "Begum Bazar, Old City, Hyderabad",
    phone: "+91 40 2412 8899",
    hours: "9:00 AM – 9:00 PM",
    rating: 4.8,
    specialties: ["Authentic Turmeric", "Cumin", "Dried Chilies", "Lentils", "Whole Spices"],
  },
  {
    id: "hyd-2",
    name: "Rythu Bazaar (Farmers Fresh Market)",
    type: "fresh",
    typeLabel: "Direct Farmers Produce",
    city: "Hyderabad",
    lat: 17.3986,
    lng: 78.4902,
    address: "Mehdipatnam / Erragadda, Hyderabad",
    phone: "+91 40 2353 1120",
    hours: "6:00 AM – 8:00 PM",
    rating: 4.6,
    specialties: ["Farm Fresh Tomatoes", "Potatoes", "Spinach", "Green Chilies", "Coriander"],
  },
  {
    id: "hyd-3",
    name: "Ratnadeep Supermarket",
    type: "supermarket",
    typeLabel: "Gourmet & Daily Grocery",
    city: "Hyderabad",
    lat: 17.4156,
    lng: 78.435,
    address: "Banjara Hills Rd 12, Hyderabad",
    phone: "+91 40 6688 2211",
    hours: "8:00 AM – 10:00 PM",
    rating: 4.7,
    specialties: ["Daily Groceries", "Organic Pulses", "Oils", "Dairy & Paneer"],
  },
  {
    id: "hyd-4",
    name: "Kukatpally Kirana & Vegetable Mandi",
    type: "indian",
    typeLabel: "Traditional Indian Grocery",
    city: "Hyderabad",
    lat: 17.4938,
    lng: 78.3995,
    address: "KPHB Main Road, Kukatpally, Hyderabad",
    phone: "+91 40 2305 4400",
    hours: "7:00 AM – 9:30 PM",
    rating: 4.5,
    specialties: ["South Indian Masalas", "Fresh Herbs", "Chickpeas", "Pantry Essentials"],
  },

  // Vijayawada
  {
    id: "vja-1",
    name: "Swaraj Maidan Rythu Bazaar",
    type: "fresh",
    typeLabel: "Fresh Farmers Market",
    city: "Vijayawada",
    lat: 16.5085,
    lng: 80.6358,
    address: "MG Road, Swaraj Maidan, Vijayawada",
    phone: "+91 866 257 3344",
    hours: "6:00 AM – 8:00 PM",
    rating: 4.7,
    specialties: ["Fresh Vegetables", "Palak / Spinach", "Country Tomatoes", "Green Chilies"],
  },
  {
    id: "vja-2",
    name: "Kaleswara Rao Market (KR Market)",
    type: "indian",
    typeLabel: "Heritage Spice & Grocery Bazaar",
    city: "Vijayawada",
    lat: 16.5165,
    lng: 80.612,
    address: "Tarapet, One Town, Vijayawada",
    phone: "+91 866 242 1190",
    hours: "7:00 AM – 9:00 PM",
    rating: 4.8,
    specialties: ["Guntur Red Chilies", "Turmeric Roots", "Lentils", "Pure Gingelly Oil"],
  },
  {
    id: "vja-3",
    name: "Spencer's / Reliance Smart Superstore",
    type: "supermarket",
    typeLabel: "Complete Supermarket",
    city: "Vijayawada",
    lat: 16.502,
    lng: 80.655,
    address: "Benz Circle, Vijayawada",
    phone: "+91 866 667 8000",
    hours: "8:00 AM – 10:00 PM",
    rating: 4.5,
    specialties: ["Packaged Pulses", "Cooking Oils", "Spices", "Dairy"],
  },

  // Visakhapatnam
  {
    id: "viz-1",
    name: "MVP Colony Rythu Bazaar",
    type: "fresh",
    typeLabel: "Farmers Fresh Market",
    city: "Visakhapatnam",
    lat: 17.742,
    lng: 83.336,
    address: "Sector 3, MVP Colony, Visakhapatnam",
    phone: "+91 891 254 8830",
    hours: "6:00 AM – 7:30 PM",
    rating: 4.7,
    specialties: ["Fresh Greens", "Country Eggs", "Potatoes & Onions", "Tomatoes"],
  },
  {
    id: "viz-2",
    name: "Poorna Market Heritage Spices",
    type: "indian",
    typeLabel: "Authentic Grocery & Spices",
    city: "Visakhapatnam",
    lat: 17.701,
    lng: 83.298,
    address: "Main Rd, Jagadamba Centre, Visakhapatnam",
    phone: "+91 891 256 1200",
    hours: "8:00 AM – 9:00 PM",
    rating: 4.6,
    specialties: ["Whole Spices", "Cold Pressed Oils", "Dals", "Pickling Spices"],
  },

  // Bengaluru
  {
    id: "blr-1",
    name: "Gandhi Bazaar Traditional Market",
    type: "indian",
    typeLabel: "Heritage Spices & Herbs",
    city: "Bengaluru",
    lat: 12.946,
    lng: 77.571,
    address: "Gandhi Bazaar Main Rd, Basavanagudi, Bengaluru",
    phone: "+91 80 2660 3344",
    hours: "7:00 AM – 9:00 PM",
    rating: 4.8,
    specialties: ["Fresh Curry Leaves", "Spices", "Pantry Lentils", "Organic Ghee"],
  },
  {
    id: "blr-2",
    name: "Malleswaram Vegetable & Kirana Mandi",
    type: "fresh",
    typeLabel: "Fresh Daily Produce",
    city: "Bengaluru",
    lat: 13.003,
    lng: 77.568,
    address: "8th Cross, Malleswaram, Bengaluru",
    phone: "+91 80 2334 1188",
    hours: "6:30 AM – 9:00 PM",
    rating: 4.7,
    specialties: ["Fresh Greens", "Country Vegetables", "Ginger & Garlic"],
  },
  {
    id: "blr-3",
    name: "Nature's Basket / MK Retail",
    type: "supermarket",
    typeLabel: "Gourmet Grocery & Supermarket",
    city: "Bengaluru",
    lat: 12.978,
    lng: 77.641,
    address: "100 Feet Rd, Indiranagar, Bengaluru",
    phone: "+91 80 4125 7700",
    hours: "8:00 AM – 10:00 PM",
    rating: 4.6,
    specialties: ["Specialty Ingredients", "Organic Grains", "Paneer & Dairy"],
  },

  // Chennai
  {
    id: "chn-1",
    name: "Mylapore Traditional Kirana & Spices",
    type: "indian",
    typeLabel: "Authentic South Indian Groceries",
    city: "Chennai",
    lat: 13.033,
    lng: 80.268,
    address: "South Mada St, Mylapore, Chennai",
    phone: "+91 44 2464 1212",
    hours: "7:30 AM – 9:30 PM",
    rating: 4.8,
    specialties: ["Sambar Spices", "Asafoetida", "Dals", "Mustard & Cumin"],
  },
  {
    id: "chn-2",
    name: "Koyambedu Wholesale Vegetable Market",
    type: "fresh",
    typeLabel: "Wholesale Produce Market",
    city: "Chennai",
    lat: 13.069,
    lng: 80.191,
    address: "Koyambedu Market Complex, Chennai",
    phone: "+91 44 2479 5500",
    hours: "5:00 AM – 7:00 PM",
    rating: 4.7,
    specialties: ["All Fresh Vegetables", "Onions & Potatoes", "Greens in Bulk"],
  },

  // Mumbai
  {
    id: "mum-1",
    name: "APMC Masala Market Vashi",
    type: "indian",
    typeLabel: "Asia's Largest Spice & Grain Mandi",
    city: "Mumbai",
    lat: 19.076,
    lng: 73.003,
    address: "Sector 19, APMC Market, Vashi, Navi Mumbai",
    phone: "+91 22 2788 1234",
    hours: "9:00 AM – 8:00 PM",
    rating: 4.9,
    specialties: ["Whole Spices", "Chickpeas", "Turmeric Finger", "Oils"],
  },
  {
    id: "mum-2",
    name: "Dadar Phool & Bhaji Mandi",
    type: "fresh",
    typeLabel: "Daily Vegetable Mandi",
    city: "Mumbai",
    lat: 19.019,
    lng: 72.843,
    address: "Station Road, Dadar West, Mumbai",
    phone: "+91 22 2430 7711",
    hours: "6:00 AM – 9:00 PM",
    rating: 4.6,
    specialties: ["Fresh Produce", "Spinach", "Tomatoes", "Ginger-Garlic Paste"],
  },

  // Delhi
  {
    id: "del-1",
    name: "Khari Baoli Historic Spice Market",
    type: "indian",
    typeLabel: "Historic Wholesale Spice Bazaar",
    city: "Delhi",
    lat: 28.657,
    lng: 77.221,
    address: "Khari Baoli, Chandni Chowk, Old Delhi",
    phone: "+91 11 2395 4400",
    hours: "10:00 AM – 8:00 PM",
    rating: 4.9,
    specialties: ["Pure Cumin", "Kashmiri Chili", "Garam Masala", "Dry Fruits"],
  },
  {
    id: "del-2",
    name: "INA Fresh Food & Vegetable Market",
    type: "fresh",
    typeLabel: "Gourmet & Fresh Produce Market",
    city: "Delhi",
    lat: 28.577,
    lng: 77.209,
    address: "Aurobindo Marg, INA Colony, New Delhi",
    phone: "+91 11 2462 8820",
    hours: "9:00 AM – 9:00 PM",
    rating: 4.7,
    specialties: ["Fresh Herbs", "Vegetables", "Specialty Cheeses & Paneer"],
  },

  // Pune
  {
    id: "pune-1",
    name: "Mahatma Phule Mandai",
    type: "fresh",
    typeLabel: "Historic Central Produce Market",
    city: "Pune",
    lat: 18.513,
    lng: 73.856,
    address: "Shukrawar Peth, Mandai, Pune",
    phone: "+91 20 2445 1100",
    hours: "6:00 AM – 8:30 PM",
    rating: 4.7,
    specialties: ["Farm Produce", "Leafy Greens", "Onion & Garlic"],
  },

  // Dallas (US)
  {
    id: "dal-1",
    name: "Patel Brothers Indian Supermarket",
    type: "indian",
    typeLabel: "Indian Grocery & Fresh Produce",
    city: "Dallas (USA)",
    lat: 32.853,
    lng: -96.945,
    address: "3540 N Belt Line Rd, Irving, TX 75062",
    phone: "+1 972 570 0990",
    hours: "10:00 AM – 8:30 PM",
    rating: 4.8,
    specialties: ["Indian Spices", "Atta & Dals", "Fresh Curry Leaves & Chilies", "Paneer"],
  },
  {
    id: "dal-2",
    name: "India Bazaar (Plano / Frisco)",
    type: "indian",
    typeLabel: "Desi Groceries & Produce",
    city: "Dallas (USA)",
    lat: 33.072,
    lng: -96.772,
    address: "8400 Preston Rd, Plano, TX 75024",
    phone: "+1 972 312 0114",
    hours: "9:30 AM – 9:30 PM",
    rating: 4.7,
    specialties: ["Ghee & Spices", "South Indian Mixes", "Fresh Okra & Gourds"],
  },

  // London (UK)
  {
    id: "ldn-1",
    name: "Quality Foods Southall",
    type: "indian",
    typeLabel: "South Asian Supermarket",
    city: "London (UK)",
    lat: 51.506,
    lng: -0.378,
    address: "88-100 South Rd, Southall, London UB1 1RD",
    phone: "+44 20 8813 8181",
    hours: "8:30 AM – 8:00 PM",
    rating: 4.7,
    specialties: ["Whole Spices", "Lentils", "Paneer", "Fresh Coriander & Chilies"],
  },
];

// Distance calculation using Haversine formula
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export class GroceryMapController {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.map = null;
    this.markersGroup = null;
    this.userMarker = null;
    this.currentLat = 17.385; // Default: Hyderabad
    this.currentLng = 78.4867;
    this.cityName = "Hyderabad";
    this.selectedType = "all";
    this.highlightIngredient = null;
    this.onSelectStore = options.onSelectStore || (() => {});
  }

  isLeafletAvailable() {
    return typeof window.L !== "undefined";
  }

  init() {
    if (!this.isLeafletAvailable()) return false;
    const container = document.getElementById(this.containerId);
    if (!container) return false;

    if (this.map) {
      this.map.invalidateSize();
      return true;
    }

    // Initialize Leaflet map
    this.map = window.L.map(this.containerId, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([this.currentLat, this.currentLng], 12);

    // Add high-contrast OpenStreetMap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersGroup = window.L.layerGroup().addTo(this.map);
    this.renderMarkers();
    return true;
  }

  setLocation(lat, lng, cityName) {
    this.currentLat = lat;
    this.currentLng = lng;
    if (cityName) this.cityName = cityName;

    if (this.map) {
      this.map.setView([lat, lng], 13);
      this.updateUserPin(lat, lng, cityName);
      this.renderMarkers();
    }
  }

  updateUserPin(lat, lng, label) {
    if (!this.map || !this.isLeafletAvailable()) return;
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }
    const userIcon = window.L.divIcon({
      className: "custom-user-marker",
      html: `<div class="user-pulse-marker"><span>📍</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    this.userMarker = window.L.marker([lat, lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup(`<strong>📍 Native Place / Your Location:</strong><br>${label || "Selected Center"}`);
  }

  setFilter(type) {
    this.selectedType = type;
    this.renderMarkers();
  }

  setHighlightIngredient(ingredient) {
    this.highlightIngredient = ingredient;
    this.renderMarkers();
  }

  getFilteredStores() {
    return GROCERY_STORES.map((store) => {
      const distance = calculateDistanceKm(this.currentLat, this.currentLng, store.lat, store.lng);
      return { ...store, distance };
    }).filter((store) => {
      if (this.selectedType !== "all" && store.type !== this.selectedType) return false;
      return true;
    }).sort((a, b) => a.distance - b.distance);
  }

  renderMarkers() {
    if (!this.map || !this.markersGroup || !this.isLeafletAvailable()) return;
    this.markersGroup.clearLayers();

    const stores = this.getFilteredStores();

    stores.forEach((store) => {
      const iconEmoji = store.type === "indian" ? "🇮🇳" : store.type === "fresh" ? "🥬" : "🛒";
      const icon = window.L.divIcon({
        className: "custom-store-pin",
        html: `<div class="store-pin-badge store-pin-${store.type}">
          <span>${iconEmoji}</span>
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
      const popupHtml = `
        <div class="store-popup">
          <h4>${store.name}</h4>
          <span class="store-popup-type">${store.typeLabel} · ★ ${store.rating}</span>
          <p class="store-popup-address">📍 ${store.address}</p>
          <p class="store-popup-specialties"><strong>In stock:</strong> ${store.specialties.join(", ")}</p>
          <div class="store-popup-footer">
            <span class="store-popup-dist">${store.distance} km away</span>
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="map-popup-btn">
              Open Google Maps 🧭
            </a>
          </div>
        </div>
      `;

      const marker = window.L.marker([store.lat, store.lng], { icon })
        .bindPopup(popupHtml)
        .addTo(this.markersGroup);

      marker.on("click", () => {
        this.onSelectStore(store);
      });
    });
  }

  async geocodeCity(query) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
        headers: { "Accept-Language": "en" },
      });
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.display_name.split(",")[0],
        };
      }
    } catch {
      // Fallback
    }
    return null;
  }
}
