import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useVadeMecumStore = create(persist(
  (set) => ({
    annotations: {},
    favorites: [],
    markings: {},

    addAnnotation: (articleId, annotation) => set((state) => ({
      annotations: {
        ...state.annotations,
        [articleId]: [...(state.annotations[articleId] || []), annotation],
      },
    })),

    removeAnnotation: (articleId, annotationIndex) => set((state) => ({
      annotations: {
        ...state.annotations,
        [articleId]: state.annotations[articleId].filter((_, i) => i !== annotationIndex),
      },
    })),

    addFavorite: (article) => set((state) => ({
      favorites: [...state.favorites, article],
    })),

    removeFavorite: (articleId) => set((state) => ({
      favorites: state.favorites.filter(fav => fav.artigo !== articleId),
    })),

    addMarking: (articleId, marking) => set((state) => ({
      markings: {
        ...state.markings,
        [articleId]: [...(state.markings[articleId] || []), marking],
      },
    })),

    removeMarking: (articleId, markingIndex) => set((state) => ({
      markings: {
        ...state.markings,
        [articleId]: state.markings[articleId].filter((_, i) => i !== markingIndex),
      },
    })),

    clearAll: () => set({
      annotations: {},
      favorites: [],
      markings: {},
    }),
  }),
  {
    name: 'vademecum-storage',
    storage: createJSONStorage(() => localStorage),
  }
));


