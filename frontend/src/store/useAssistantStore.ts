import { create } from 'zustand'

interface Assistant {
  id: number
  name: string
  role_description: string
  base_prompt: string
  created_at: string
  updated_at: string
}

interface AssistantState {
  assistants: Assistant[]
  isLoading: boolean
  error: string | null
  setAssistants: (assistants: Assistant[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  createAssistant: (data: Omit<Assistant, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

const mockAssistants: Assistant[] = [
  {
    id: 1,
    name: 'Müşteri Hizmetleri Asistanı',
    role_description: 'Müşteri sorularını yanıtlayan ve destek sağlayan asistan',
    base_prompt: 'Sen bir müşteri hizmetleri temsilcisisin...',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z'
  },
  {
    id: 2,
    name: 'Satış Danışmanı',
    role_description: 'Ürün ve hizmetler hakkında bilgi veren satış asistanı',
    base_prompt: 'Sen bir satış danışmanısın...',
    created_at: '2024-03-20T11:00:00Z',
    updated_at: '2024-03-20T11:00:00Z'
  }
]

export const useAssistantStore = create<AssistantState>()((set, get) => ({
  assistants: [],
  isLoading: false,
  error: null,
  setAssistants: (assistants) => set({ assistants }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  createAssistant: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Asistan oluşturulurken bir hata oluştu');
      }
      
      const newAssistant = await response.json();
      set((state) => ({
        assistants: [...state.assistants, newAssistant],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Bir hata oluştu', isLoading: false });
    }
  },
})) 