import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }


  async getEspecialidades() {
    const { data, error } = await this.supabase
    .from('especialidades')
    .select('*')
    .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createEspecialidad(nombre: string, descripcion: string) {
    const { data, error } = await this.supabase
    .from('especialidades')
    .insert([{ nombre, descripcion }])
    .select('*');
    if (error) throw error;
    return data;
  }

  async updateEspecialidad(id: string, nombre: string, descripcion: string) {
    const { data, error } = await this.supabase
    .from('especialidades')
    .update({ nombre, descripcion })
    .eq('id', id);
    if (error) throw error;
    return data;
  }

  async deleteEspecialidad(id: string) {
    const { data, error } = await this.supabase
    .from('especialidades')
    .delete()
    .eq('id', id);
    if (error) throw error;
    return data;
  }


  async getObrasSociales() {
    const { data, error } = await this.supabase.from('obras_sociales').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async createObraSocial(nombre: string, descripcion: string) {
    const { data, error } = await this.supabase.from('obras_sociales').insert([{ nombre, descripcion }]);
    if (error) throw error;
    return data;
  }

  async updateObraSocial(id: string, nombre: string, descripcion: string) {
    const { data, error } = await this.supabase.from('obras_sociales').update({ nombre, descripcion }).eq('id', id);
    if (error) throw error;
    return data;
  }

  async deleteObraSocial(id: string) {
    const { data, error } = await this.supabase.from('obras_sociales').delete().eq('id', id);
    if (error) throw error;
    return data;
  }
}
