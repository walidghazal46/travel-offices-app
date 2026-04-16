import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const createInitialCvData = () => ({
  fullName: "", jobTitle: "", country: "", location: "", phone: "", whatsapp: "", email: "",
  nationality: "", maritalStatus: "", iqama: "", iqamaStatus: "transferable",
  memberships: [{ id: Date.now(), name: "", number: "", hasNo: false }],
  summary: "",
  experiences: [{ id: 1, jobTitle: "", company: "", location: "", startDate: "", endDate: "", current: false, responsibilities: [""], projects: [] }],
  coreCompetencies: [],
  toolsSoftware: [],
  achievements: [""],
  education: [{ degree: "", major: "", university: "", year: "" }],
  certifications: [{ name: "", issuer: "", year: "" }],
  languages: [{ lang: "", level: "intermediate" }],
  keywords: "",
});

export const useCvStore = create(
  persist(
    (set, get) => ({
      cvData: createInitialCvData(),
      cvStep: 0,
      cvUnlocked: false,
      cvMode: null,
      selectedCvPackage: null,
      cvBuilderScreen: "menu",
      cvBuilderOrders: [],
      cvSectionsSaved: {
        step0: false,
        step1: false,
        step2: false,
        step3: false,
      },

      setCvData: (data) => set((state) => ({
        cvData: typeof data === 'function' ? data(state.cvData) : { ...state.cvData, ...data }
      })),

      resetCvData: () => set({ cvData: createInitialCvData(), cvStep: 0, cvSectionsSaved: { step0: false, step1: false, step2: false, step3: false } }),

      setCvStep: (step) => set({ cvStep: step }),
      setCvUnlocked: (unlocked) => set({ cvUnlocked: unlocked }),
      setCvMode: (mode) => set({ cvMode: mode }),
      setSelectedCvPackage: (pkg) => set({ selectedCvPackage: pkg }),
      setCvBuilderScreen: (screen) => set({ cvBuilderScreen: screen }),
      setCvBuilderOrders: (orders) => set({ cvBuilderOrders: orders }),
      setCvSectionsSaved: (sections) => set((state) => ({
        cvSectionsSaved: typeof sections === 'function' ? sections(state.cvSectionsSaved) : { ...state.cvSectionsSaved, ...sections }
      })),

      // Helper for nested updates (like App.jsx's cvUpdate)
      cvUpdate: (field, value) => set((state) => ({
        cvData: { ...state.cvData, [field]: value }
      })),
    }),
    {
      name: 'trusted-offices-cv-store',
      partialize: (state) => ({
        cvData: state.cvData,
        cvBuilderOrders: state.cvBuilderOrders,
        cvSectionsSaved: state.cvSectionsSaved,
      }),
    }
  )
);
