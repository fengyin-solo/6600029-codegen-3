import axios from 'axios';
import type { TaskTemplate } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchTemplatesSafe(): Promise<TaskTemplate[]> {
  try {
    const { data } = await api.get<TaskTemplate[]>('/templates');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createTemplateRemote(t: TaskTemplate): Promise<TaskTemplate | null> {
  try {
    const { data } = await api.post<TaskTemplate>('/templates', t);
    return data;
  } catch {
    return null;
  }
}

export async function updateTemplateRemote(
  id: string,
  t: Partial<TaskTemplate>
): Promise<TaskTemplate | null> {
  try {
    const { data } = await api.put<TaskTemplate>(`/templates/${id}`, t);
    return data;
  } catch {
    return null;
  }
}

export async function deleteTemplateRemote(id: string): Promise<boolean> {
  try {
    await api.delete(`/templates/${id}`);
    return true;
  } catch {
    return false;
  }
}
