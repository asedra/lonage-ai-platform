import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssistantsPage from '../page'
import { useAssistantStore } from '@/store/useAssistantStore'

// Mock Zustand store
jest.mock('@/store/useAssistantStore', () => ({
  useAssistantStore: jest.fn()
}))

const mockAssistants = [
  {
    id: 1,
    name: 'Test Asistan 1',
    role_description: 'Test Açıklama 1',
    base_prompt: 'Test Prompt 1',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z'
  },
  {
    id: 2,
    name: 'Test Asistan 2',
    role_description: 'Test Açıklama 2',
    base_prompt: 'Test Prompt 2',
    created_at: '2024-03-20T11:00:00Z',
    updated_at: '2024-03-20T11:00:00Z'
  }
]

describe('AssistantsPage', () => {
  const mockAddAssistant = jest.fn()

  beforeEach(() => {
    // Store mock'unu sıfırla
    jest.clearAllMocks()
    // Store'u mock data ile başlat
    ;(useAssistantStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        assistants: mockAssistants,
        addAssistant: mockAddAssistant
      }
      return selector(state)
    })
  })

  test('sayfa yüklendiğinde asistan kartları görüntüleniyor', () => {
    render(<AssistantsPage />)
    
    // Başlık kontrolü
    expect(screen.getByText('AI Asistanlarım')).toBeInTheDocument()
    
    // Asistan kartları kontrolü
    mockAssistants.forEach(assistant => {
      expect(screen.getByText(assistant.name)).toBeInTheDocument()
      expect(screen.getByText(assistant.role_description)).toBeInTheDocument()
    })
  })

  test('yeni asistan oluşturma modalı açılıyor', async () => {
    render(<AssistantsPage />)
    
    const createButton = screen.getByRole('button', { name: 'Yeni Asistan Oluştur' })
    fireEvent.click(createButton)
    
    // Modal başlığını kontrol et
    expect(screen.getByRole('heading', { name: 'Yeni Asistan Oluştur' })).toBeInTheDocument()
  })

  test('yeni asistan başarıyla oluşturulabiliyor', async () => {
    render(<AssistantsPage />)
    
    // Modal'ı aç
    const createButton = screen.getByText('Yeni Asistan Oluştur')
    await userEvent.click(createButton)
    
    // Form alanlarını doldur
    await userEvent.type(screen.getByLabelText('İsim'), 'Yeni Asistan')
    await userEvent.type(screen.getByLabelText('Rol Açıklaması'), 'Yeni Rol')
    await userEvent.type(screen.getByLabelText('Temel Prompt'), 'Yeni Prompt')
    
    // Formu gönder
    const submitButton = screen.getByText('Oluştur')
    await userEvent.click(submitButton)
    
    // Store'daki addAssistant fonksiyonunun çağrıldığını kontrol et
    expect(mockAddAssistant).toHaveBeenCalledWith({
      name: 'Yeni Asistan',
      role_description: 'Yeni Rol',
      base_prompt: 'Yeni Prompt'
    })
  })

  test('boş form gönderilemiyor', async () => {
    render(<AssistantsPage />)
    
    // Modal'ı aç
    const createButton = screen.getByText('Yeni Asistan Oluştur')
    await userEvent.click(createButton)
    
    // Formu boş göndermeyi dene
    const submitButton = screen.getByText('Oluştur')
    await userEvent.click(submitButton)
    
    // HTML5 validasyonu nedeniyle form gönderilemez
    expect(mockAddAssistant).not.toHaveBeenCalled()
    
    // Required alanların varlığını kontrol et
    expect(screen.getByLabelText('İsim')).toHaveAttribute('required')
    expect(screen.getByLabelText('Rol Açıklaması')).toHaveAttribute('required')
    expect(screen.getByLabelText('Temel Prompt')).toHaveAttribute('required')
  })

  test('modal kapatıldığında form alanları sıfırlanıyor', async () => {
    render(<AssistantsPage />)
    
    // Modal'ı aç
    const createButton = screen.getByText('Yeni Asistan Oluştur')
    await userEvent.click(createButton)
    
    // Form alanlarını doldur
    const nameInput = screen.getByLabelText('İsim')
    const roleInput = screen.getByLabelText('Rol Açıklaması')
    const promptInput = screen.getByLabelText('Temel Prompt')
    
    await userEvent.type(nameInput, 'Test Asistan')
    await userEvent.type(roleInput, 'Test Rol')
    await userEvent.type(promptInput, 'Test Prompt')
    
    // Modal'ı kapat (ESC tuşu ile)
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' })
    
    // Modal'ı tekrar aç
    await userEvent.click(createButton)
    
    // Form alanlarının boş olduğunu kontrol et
    expect(screen.getByLabelText('İsim')).toHaveValue('')
    expect(screen.getByLabelText('Rol Açıklaması')).toHaveValue('')
    expect(screen.getByLabelText('Temel Prompt')).toHaveValue('')
  })

  test('form alanları doğru şekilde dolduruluyor', async () => {
    render(<AssistantsPage />)
    
    const createButton = screen.getByRole('button', { name: 'Yeni Asistan Oluştur' })
    fireEvent.click(createButton)
    
    // Form alanlarını doldur
    await userEvent.type(screen.getByLabelText('İsim'), 'Yeni Asistan')
    await userEvent.type(screen.getByLabelText('Rol Açıklaması'), 'Yeni Rol')
    await userEvent.type(screen.getByLabelText('Temel Prompt'), 'Yeni Prompt')
    
    // Formu gönder
    const submitButton = screen.getByText('Oluştur')
    await userEvent.click(submitButton)
    
    // Store'daki addAssistant fonksiyonunun çağrıldığını kontrol et
    expect(mockAddAssistant).toHaveBeenCalledWith({
      name: 'Yeni Asistan',
      role_description: 'Yeni Rol',
      base_prompt: 'Yeni Prompt'
    })
  })

  test('form gönderildiğinde store güncelleniyor', async () => {
    render(<AssistantsPage />)
    
    const createButton = screen.getByRole('button', { name: 'Yeni Asistan Oluştur' })
    fireEvent.click(createButton)
    
    // Form alanlarını doldur
    await userEvent.type(screen.getByLabelText('İsim'), 'Yeni Asistan')
    await userEvent.type(screen.getByLabelText('Rol Açıklaması'), 'Yeni Rol')
    await userEvent.type(screen.getByLabelText('Temel Prompt'), 'Yeni Prompt')
    
    // Formu gönder
    const submitButton = screen.getByText('Oluştur')
    await userEvent.click(submitButton)
    
    // Store'daki addAssistant fonksiyonunun çağrıldığını kontrol et
    expect(mockAddAssistant).toHaveBeenCalledWith({
      name: 'Yeni Asistan',
      role_description: 'Yeni Rol',
      base_prompt: 'Yeni Prompt'
    })
  })
}) 