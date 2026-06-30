import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "../services/authService";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

const useAuthStore = create(
  persist(
    (set, get) => {
      const authenticate = async (apiCall, payload) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const { data } = await apiCall(payload);

          const { user, accessToken } = data.data;

          set({
            user,
            accessToken,
            isAuthenticated: true,
          });

          return {
            success: true,
          };
        } catch (error) {
          const message = getErrorMessage(error);

          set({
            error: message,
            isAuthenticated: false,
          });

          return {
            success: false,
            message,
          };
        } finally {
          set({
            isLoading: false,
          });
        }
      };

      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Register
        register: (payload) => authenticate(authService.register, payload),

        // Login
        login: (payload) => authenticate(authService.login, payload),

        // Logout
        logout: async () => {
          try {
            await authService.logout();
          } catch (error) {
            console.error("Logout Error:", error);
          } finally {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              error: null,
              isLoading: false,
            });
          }
        },

        // Current User
        fetchProfile: async () => {
          if (!get().accessToken) return;

          set({
            isLoading: true,
            error: null,
          });

          try {
            const { data } = await authService.getProfile();

            set({
              user: data.data,
              isAuthenticated: true,
            });
          } catch (error) {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              error: getErrorMessage(error),
            });
          } finally {
            set({
              isLoading: false,
            });
          }
        },

        // App Start
        initialize: async () => {
          if (!get().accessToken) return;

          await get().fetchProfile();
        },

        // Clear Error
        clearError: () =>
          set({
            error: null,
          }),
      };
    },
    {
      name: "auth-storage",

      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
