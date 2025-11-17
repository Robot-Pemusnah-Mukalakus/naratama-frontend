const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Important for session cookies
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "An error occurred");
        error.errors = data.errors;
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Auth Service
export const authService = {
  login: (credentials) => apiClient.post("/api/auth/login", credentials),
  register: (userData) => apiClient.post("/api/auth/register", userData),
  logout: () => apiClient.post("/api/auth/logout"),
  getProfile: () => apiClient.get("/api/auth/me"),
  changePassword: (passwords) =>
    apiClient.post("/api/auth/change-password", passwords),
  setPassword: (data) => apiClient.post("/api/auth/set-password", data),
  // Google OAuth - redirects to Google login page
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },
};

// Books Service
export const booksService = {
  getBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/books${query ? `?${query}` : ""}`);
  },
  getBook: (id) => apiClient.get(`/api/books/${id}`),
  getCategories: () => apiClient.get("/api/books/categories"),
  getNewBooks: (limit = 10) => apiClient.get(`/api/books/new?limit=${limit}`),
  searchBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/books${query ? `?${query}` : ""}`);
  },
  createBook: (bookData) => apiClient.post("/api/books", bookData),
  updateBook: (id, bookData) => apiClient.put(`/api/books/${id}`, bookData),
  updateBookQuantity: (id, quantities) =>
    apiClient.put(`/api/books/${id}/quantity`, quantities),
  deleteBook: (id) => apiClient.delete(`/api/books/${id}`),
};

// Announcements Service
export const announcementsService = {
  getAnnouncements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/announcements${query ? `?${query}` : ""}`);
  },
  getAnnouncement: (id) => apiClient.get(`/api/announcements/${id}`),
  createAnnouncement: (data) => apiClient.post("/api/announcements", data),
  updateAnnouncement: (id, data) =>
    apiClient.put(`/api/announcements/${id}`, data),
  deleteAnnouncement: (id) => apiClient.delete(`/api/announcements/${id}`),
};

// Book Loans Service
export const bookLoansService = {
  getLoans: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/book-loans${query ? `?${query}` : ""}`);
  },
  getLoan: (id) => apiClient.get(`/api/book-loans/${id}`),
  getOverdueLoans: () => apiClient.get("/api/book-loans/overdue"),
  createLoan: (loanData) => apiClient.post("/api/book-loans", loanData),
  returnLoan: (id, returnData) =>
    apiClient.put(`/api/book-loans/${id}/return`, returnData),
  extendLoan: (id, extensionData) =>
    apiClient.put(`/api/book-loans/${id}/extend`, extensionData),
};

// Rooms Service
export const roomsService = {
  getRooms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/rooms${query ? `?${query}` : ""}`);
  },
  getRoomAvailability: (roomId, date) => {
    return apiClient.get(`/api/rooms/availability/${roomId}?date=${date}`);
  },
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/rooms/bookings${query ? `?${query}` : ""}`);
  },
  createBooking: (bookingData) =>
    apiClient.post("/api/rooms/bookings", bookingData),
  updateBookingStatus: (id, statusData) =>
    apiClient.put(`/api/rooms/bookings/${id}/status`, statusData),
  deleteBooking: (id) => apiClient.delete(`/api/rooms/bookings/${id}`),
};

// Users Service
export const usersService = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/api/users${query ? `?${query}` : ""}`);
  },
  getUser: (id) => apiClient.get(`/api/users/${id}`),
  getUserByEmail: (email) => apiClient.get(`/api/users/email/${email}`),
  getCurrentUser: () => apiClient.get("/api/users/me"),
  updateUser: (id, userData) => apiClient.put(`/api/users/${id}`, userData),
  updateMembership: (id, membershipData) =>
    apiClient.put(`/api/users/${id}/membership`, membershipData),
  deleteMembership: (id) => apiClient.delete(`/api/users/${id}/membership`),
  deleteUser: (id) => apiClient.delete(`/api/users/${id}`),
};

export const paymentService = {
  // POST request - pass userId in request body
  createMembershipPayment: (userId) =>
    apiClient.post("/api/payment/membership", { userId }),
  finishMembershipPayment: (userId, paymentId) =>
    apiClient.post("/api/payment/membership/finish", { userId, paymentId }),
  createRoomPayment: (roomData) =>
    apiClient.post("/api/payment/room", roomData),
};
export default apiClient;
