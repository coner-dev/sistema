'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RequiredField {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'email' | 'number' | 'file' | 'textarea';
}

interface ServiceOrderFormProps {
  service: {
    id: string;
    name: string;
    price: number;
    requiredFields?: string | null;
  };
  onOrderCreated?: () => void;
  token?: string;
}

export function ServiceOrderForm({
  service,
  onOrderCreated,
  token,
}: ServiceOrderFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  let requiredFields: RequiredField[] = [];
  if (service.requiredFields) {
    try {
      requiredFields = JSON.parse(service.requiredFields);
    } catch {
      console.error('Error parsing required fields');
    }
  }

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    setError(null);
  };

  const handleFileChange = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, store file name. In production, you'd upload to storage
      setFormData((prev) => ({
        ...prev,
        [key]: file.name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate all required fields
      for (const field of requiredFields) {
        if (field.required && !formData[field.key]?.trim()) {
          setError(`El campo "${field.label}" es obligatorio`);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          serviceId: service.id,
          fieldValues: JSON.stringify(formData),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear la orden');
        return;
      }

      toast({
        title: '✅ Orden creada exitosamente',
        description: `Tu orden para ${service.name} ha sido creada. Te descontamos $${service.price.toFixed(2)} de tu saldo.`,
      });

      setFormData({});
      onOrderCreated?.();
    } catch (err) {
      setError('Error al procesar la solicitud');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (requiredFields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{service.name}</CardTitle>
          <CardDescription>No hay campos requeridos</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              `Crear orden - $${service.price.toFixed(2)}`
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>Completa los siguientes datos requeridos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400 border border-red-500/30">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {requiredFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-gray-300">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </Label>

              {field.type === 'file' ? (
                <Input
                  id={field.key}
                  type="file"
                  onChange={(e) => handleFileChange(field.key, e)}
                  className="bg-gray-900 border-gray-700 cursor-pointer"
                  required={field.required}
                />
              ) : field.type === 'textarea' ? (
                <Textarea
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Ingresa ${field.label.toLowerCase()}`}
                  className="bg-gray-900 border-gray-700 min-h-24"
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Ingresa ${field.label.toLowerCase()}`}
                  className="bg-gray-900 border-gray-700"
                  required={field.required}
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              `Crear orden - $${service.price.toFixed(2)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
