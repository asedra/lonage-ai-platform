'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const PLANS = [
  {
    id: 'basic',
    name: 'Temel',
    price: '₺199',
    period: 'aylık',
    credits: 1000,
    features: ['5 AI Asistanı', '1000 kredi/ay', 'Temel destek'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Profesyonel',
    price: '₺499',
    period: 'aylık',
    credits: 5000,
    features: ['25 AI Asistanı', '5000 kredi/ay', '7/24 destek', 'API erişimi'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    price: 'İletişime geçin',
    period: '',
    credits: null,
    features: ['Sınırsız AI Asistan', 'Özel kredi paketi', 'Öncelikli destek', 'Özel entegrasyonlar'],
    popular: false,
  },
]

export default function BillingSettingsPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [annualBilling, setAnnualBilling] = useState(false)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ödeme Ayarları</h1>
        <Button>Fatura Geçmişi</Button>
      </div>

      {/* Mevcut Plan Bilgisi */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Mevcut Abonelik</CardTitle>
          <CardDescription>
            Mevcut plan bilgileriniz ve kredi durumunuz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-1">Profesyonel Plan</h3>
              <p className="text-sm text-muted-foreground">5000 kredi/ay, 25 AI Asistanı</p>
              <p className="text-sm mt-2">Bir sonraki fatura: <span className="font-medium">15 Mayıs 2024</span></p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">₺499/ay</p>
              <Badge className="mt-1">Aktif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ödeme Bilgileri */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ödeme Yöntemi</CardTitle>
          <CardDescription>
            Kayıtlı ödeme yönteminizi güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-2 rounded">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <p className="font-medium">**** **** **** 4242</p>
                <p className="text-sm text-muted-foreground">Son kullanma: 12/25</p>
              </div>
            </div>
            <Button variant="outline">Düzenle</Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Değiştirme */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Değiştir</CardTitle>
          <CardDescription>
            İhtiyaçlarınıza göre planınızı yükseltin veya düşürün.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-6">
            <div className="flex items-center space-x-2">
              <Label htmlFor="annual-billing">Yıllık fatura</Label>
              <Switch
                id="annual-billing"
                checked={annualBilling}
                onCheckedChange={setAnnualBilling}
              />
              <span className="text-sm font-medium text-green-600">%15 indirim</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${selectedPlan === plan.id ? 'border-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 right-2">Popüler</Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 min-h-[120px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? 'Mevcut Plan' : 'Seç'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            disabled={selectedPlan === 'pro'} 
            className="w-full md:w-auto"
          >
            Plan Değişikliğini Kaydet
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 