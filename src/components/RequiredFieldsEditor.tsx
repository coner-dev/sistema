'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface RequiredField {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'email' | 'number' | 'file' | 'textarea';
}

interface RequiredFieldsEditorProps {
  value?: string | null;
  onChange: (value: string) => void;
}

export function RequiredFieldsEditor({
  value,
  onChange,
}: RequiredFieldsEditorProps) {
  const [fields, setFields] = useState<RequiredField[]>(() => {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  });

  const [newField, setNewField] = useState<RequiredField>({
    key: '',
    label: '',
    required: true,
    type: 'text',
  });

  const handleAddField = () => {
    if (!newField.key.trim() || !newField.label.trim()) {
      alert('Por favor completa la clave y etiqueta del campo');
      return;
    }

    // Check for duplicate keys
    if (fields.some(f => f.key === newField.key)) {
      alert('Ya existe un campo con esa clave');
      return;
    }

    const updated = [...fields, { ...newField }];
    setFields(updated);
    onChange(JSON.stringify(updated));
    setNewField({ key: '', label: '', required: true, type: 'text' });
  };

  const handleRemoveField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    onChange(JSON.stringify(updated));
  };

  const handleUpdateField = (index: number, updates: Partial<RequiredField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
    onChange(JSON.stringify(updated));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const updated = [...fields];
    if (direction === 'up' && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === 'down' && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    setFields(updated);
    onChange(JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm text-gray-300">Agregar Campo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Clave*</Label>
              <Input
                value={newField.key}
                onChange={e =>
                  setNewField({ ...newField, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                }
                placeholder="ej: curp"
                className="bg-gray-700 border-gray-600 text-white text-sm"
              />
              <p className="text-xs text-gray-500">Identificador único del campo</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Etiqueta*</Label>
              <Input
                value={newField.label}
                onChange={e => setNewField({ ...newField, label: e.target.value })}
                placeholder="ej: CURP"
                className="bg-gray-700 border-gray-600 text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Tipo</Label>
              <Select value={newField.type} onValueChange={v => setNewField({ ...newField, type: v as RequiredField['type'] })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="text" className="text-gray-300">Texto</SelectItem>
                  <SelectItem value="email" className="text-gray-300">Email</SelectItem>
                  <SelectItem value="number" className="text-gray-300">Número</SelectItem>
                  <SelectItem value="file" className="text-gray-300">Archivo</SelectItem>
                  <SelectItem value="textarea" className="text-gray-300">Texto Largo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={e => setNewField({ ...newField, required: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs">Requerido</span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleAddField}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
          >
            <Plus className="w-3 h-3 mr-2" /> Agregar Campo
          </Button>
        </CardContent>
      </Card>

      {fields.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-300">Campos Configurados ({fields.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-700/50 rounded border border-gray-600"
              >
                <GripVertical className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{field.label}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {field.key} • {field.type}
                    {field.required && ' • Requerido'}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveField(index, 'up')}
                    disabled={index === 0}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveField(index, 'down')}
                    disabled={index === fields.length - 1}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200"
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveField(index)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
