import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthSession, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  static from(tableName: string) {
    throw new Error('Method not implemented.');
  }
  private supabase: SupabaseClient;
  private session: AuthSession | null = null;
  public authChanges = new BehaviorSubject<AuthSession | null>(null);

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session = session;
      this.authChanges.next(session);
    });
  }
  get client(): SupabaseClient {
    return this.supabase;
  }

  
  async getEspecialidadIdByName(nombre: string) {
    const { data, error } = await this.supabase
    .from('especialidades')
      .select('id')
      .eq('nombre', nombre)
      .maybeSingle();
      if (error) throw error;
      return data?.id || null;
    }

    async getObraSocialIdByName(nombre: string) {
    const { data, error } = await this.supabase
    .from('obras_sociales')
    .select('id')
    .eq('nombre', nombre)
    .maybeSingle();
    if (error) throw error;
    if (!data) {
  console.warn(`Especialidad "${nombre}" no encontrada`);
  return null;
}
return data.id;
  }
  
  
  
  
  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }
  

  
  async signOut() {
    return await this.supabase.auth.signOut();
  }
  getMessages() {
    return this.supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });
  }
  


async saveUserData(
  user: User,
  avatarUrl: string | null,
  datos: {
    firstName: string,
    lastName: string,
    age: number,
    dni: string,
    email: string,
    obraSocial: string,
    userType: string,
    especialidadesSeleccionadas: string[]
  }
): Promise<void> {
    // console.log('Guardando datos del usuario:', user, avatarUrl, this.firstName);
    const obra_social_id = await this.getObraSocialIdByName(datos.obraSocial);
  const { data: userData, error: userError } = await this.supabase
    .from('usuarios')
    .insert([{
      nombre: datos.firstName,
      apellido: datos.lastName,
      edad: datos.age,
      dni: datos.dni,
      email: datos.email,
      obra_social_id,
      url_imagen: avatarUrl ?? '',
      rol: datos.userType,
      validado: false,
      verificado: false,
      auth_user_id: user.id
    }])
      .select('id');
if (userError) throw userError;
  if (!userData || userData.length === 0) throw new Error('No se pudo crear el usuario');
  const usuarioId = userData[0].id;

  await this.addEspecialidadesToUsuario(usuarioId, datos.especialidadesSeleccionadas);


}

async addEspecialidadesToUsuario(usuarioId: string, especialidades: string[]): Promise<void> {
  for (const nombreEsp of especialidades) {
    const especialidadId = await this.getEspecialidadIdByName(nombreEsp);
    if (especialidadId) {
      await this.supabase
        .from('usuario_especialidad')
        .insert([{ usuario_id: usuarioId, especialidad_id: especialidadId }]);
    }
  }
}

async uploadProfileImage(file: File, userId: string): Promise<string | null> {
  if (!file) return null;
  const filePath = `users/${userId}/${file.name}`;
  const { error } = await this.supabase
    .storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  if (error) throw error;
  const { data } = this.supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath);
  return data.publicUrl;
}

async uploadCarnetImage(file: File, userId: string): Promise<string | null> {
  if (!file) return null;
  const filePath = `users/${userId}/carnet_${file.name}`;
  const { error } = await this.supabase
    .storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  if (error) throw error;
  const { data } = this.supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath);
  return data.publicUrl;
}
async getQuickLoginUsers() {
  const emails = [
    'lisox99163@calorpg.com',
    'wigam24440@ethsms.com',
    'nagaf80799@cristout.com',
    'nodon51795@hosliy.com',
    'tetetef557@forcrack.com',
    'celiyob775@calorpg.com'
  ];
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('email, rol, url_imagen')
    .in('email', emails);
  if (error) throw error;
  return data;
}


async getEspecialistas() {
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('id, nombre, apellido, url_imagen, validado, verificado, auth_user_id')
    .eq('rol', 'Especialista');
  if (error) throw error;
  return data;
}

async setEspecialistaValidado(id: string, validado: boolean) {
  const { error } = await this.supabase
    .from('usuarios')
    .update({ validado })
    .eq('id', id);
  if (error) throw error;
}


async getEspecialidades() {
  const { data, error } = await this.supabase
    .from('especialidades')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data;
}

async getEspecialidadesDeEspecialista(especialistaId: string) {
  const { data, error } = await this.supabase
    .from('usuario_especialidad')
    .select('especialidades(id, nombre)')
    .eq('usuario_id', especialistaId);
  if (error) throw error;
  return data.map((item: any) => item.especialidades);
}

async getEspecialistasPorEspecialidad(especialidadId: string) {
  const { data, error } = await this.supabase
    .from('usuario_especialidad')
    .select('usuario_id, usuarios(nombre, apellido)')
    .eq('especialidad_id', especialidadId);

  if (error) throw error;
  if (error) throw error;
  return data.map((item: any) => ({
    id: item.usuario_id,
    nombre: item.usuarios.nombre,
    apellido: item.usuarios.apellido
  }));
}

async getTurnosPorEspecialistaYFecha(especialistaId: string, fechaInicio: string, fechaFin: string) {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('fecha, hora, estado')
    .eq('especialista_id', especialistaId)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin);
  if (error) throw error;
  return data;
}


async crearTurno(turno: {
  paciente_id: string,
  especialista_id: string,
  especialidad_id: string,
  fecha: string,
  hora: string,
  estado: string
}) {
  const { data, error } = await this.supabase
    .from('turnos')
    .insert([turno]);
  if (error) throw error;
  return data;
}
async getUserIdByEmail(email: string): Promise<string> {
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (error || !data) return '';
  return data.id;
}


async getTurnosPaciente(pacienteId: string) {
  const { data, error } = await this.supabase
    .from('turnos')
    .select(`
      *,
      especialidades(nombre),
      usuarios:especialista_id(id, nombre, apellido)
    `)
    .eq('paciente_id', pacienteId)
    .order('fecha', { ascending: true });
  if (error) throw error;
  return data;
}

async getTurnosEspecialista(especialistaId: string) {
  const { data, error } = await this.supabase
    .from('turnos')
    .select(`
      *,
      especialidades(nombre),
      usuarios:paciente_id(id, nombre, apellido)
    `)
    .eq('especialista_id', especialistaId)
    .order('fecha', { ascending: true });
  if (error) throw error;
  return data;
}




async cancelarTurno(turnoId: string, comentario: string) {
  await this.supabase
    .from('turnos')
    .update({ estado: 'cancelado', comentario_cancelacion: comentario })
    .eq('id', turnoId);
}

async rechazarTurno(turnoId: string, comentario: string) {
  await this.supabase
    .from('turnos')
    .update({ estado: 'rechazado', comentario_cancelacion: comentario })
    .eq('id', turnoId);
}

async aceptarTurno(turnoId: string) {
  await this.supabase
    .from('turnos')
    .update({ estado: 'aceptado' })
    .eq('id', turnoId);
}

async finalizarTurno(turnoId: string, reseña: string) {
  await this.supabase
    .from('turnos')
    .update({ estado: 'realizado', reseña })
    .eq('id', turnoId);
}

async completarEncuesta(turnoId: string, encuesta: any) {
  await this.supabase
    .from('turnos')
    .update({ encuesta })
    .eq('id', turnoId);
}

async calificarAtencion(turnoId: string, calificacion: number, comentario: string) {
  await this.supabase
    .from('turnos')
    .update({ calificacion, comentario_calificacion: comentario })
    .eq('id', turnoId);
}




async getTurnosClinica() {
  const { data, error } = await this.supabase
    .from('turnos')
    .select(`
      *,
      especialidades(id, nombre),
      usuarios:especialista_id(id, nombre, apellido)
    `)
    .order('fecha', { ascending: true });
  if (error) throw error;
  return data;
}



async getDisponibilidadEspecialista(especialistaId: string) {
  const { data, error } = await this.supabase
    .from('disponibilidad')
    .select('id, especialidad_id, dia, hora_inicio, hora_fin')
    .eq('especialista_id', especialistaId);
  if (error) throw error;
  return data;
}

async setDisponibilidadEspecialista(especialistaId: string, especialidadId: string, dia: number, horaInicio: string, horaFin: string) {
  const { data, error } = await this.supabase
    .from('disponibilidad')
    .upsert(
  [{ especialista_id: especialistaId, especialidad_id: especialidadId, dia, hora_inicio: horaInicio, hora_fin: horaFin }],
  { onConflict: 'especialista_id,especialidad_id,dia' }
);
  if (error) throw error;
  return data;
}


async getUsuarioByEmail(email: string) {
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data;
}


async getDisponibilidadEspecialistaPorEspecialidad(especialistaId: string, especialidadId: string) {
  const { data, error } = await this.supabase
    .from('disponibilidad')
    .select('id, dia, hora_inicio, hora_fin')
    .eq('especialista_id', especialistaId)
    .eq('especialidad_id', especialidadId);
  if (error) throw error;
  return data;
}

async eliminarDisponibilidadEspecialista(especialistaId: string, especialidadId: string, dia: number) {
  const { error } = await this.supabase
    .from('disponibilidad')
    .delete()
    .eq('especialista_id', especialistaId)
    .eq('especialidad_id', especialidadId)
    .eq('dia', dia);
  if (error) throw error;
}

async getUsuarios() {
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('*');
  if (error) throw error;
  return data;
}

async getDisponibilidadEspecialistaPorEspecialidadYFecha(especialistaId: string, especialidadId: string, dia: number) {
  const { data, error } = await this.supabase
    .from('disponibilidad')
    .select('hora_inicio, hora_fin')
    .eq('especialista_id', especialistaId)
    .eq('especialidad_id', especialidadId)
    .eq('dia', dia)
    .maybeSingle();
  if (error) throw error;
  return data;
}
async getDiasDisponiblesEspecialista(especialistaId: string, especialidadId: string) {
  const { data, error } = await this.supabase
    .from('disponibilidad')
    .select('dia')
    .eq('especialista_id', especialistaId)
    .eq('especialidad_id', especialidadId);
  if (error) throw error;
  return data.map((d: any) => d.dia);
}


async crearHistoriaClinica(historia: any) {
  const { data, error } = await this.supabase
    .from('historia_clinica')
    .insert([historia]);
  if (error) throw error;
  return data;
}

async getHistoriaClinicaPorPaciente(pacienteId: string) {
  const { data, error } = await this.supabase
    .from('historia_clinica')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('fecha_atencion', { ascending: false });
  if (error) throw error;
  return data;
}

async getPacientesAtendidosPorEspecialista(especialistaId: string) {
  const { data, error } = await this.supabase
    .from('historia_clinica')
    .select('paciente_id')
    .eq('especialista_id', especialistaId);
  if (error) throw error;
  const unicos = Array.from(new Set(data.map((d: any) => d.paciente_id)));
  return unicos;
}

async getUsuariosByIds(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('*')
    .in('id', ids);
  if (error) throw error;
  return data;
}


async getHistoriaClinicaPorTurno(turnoId: string) {
  const { data, error } = await this.supabase
    .from('historia_clinica')
    .select('*')
    .eq('turno_id', turnoId);
  if (error) throw error;
  return data;
}


async getTodasLasHistoriasClinicas() {
  const { data, error } = await this.supabase
    .from('historia_clinica')
    .select('*')
    .order('fecha_atencion', { ascending: false });
  if (error) throw error;
  return data;
}

async getTurnosPorEspecialidad() {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('especialidades(nombre), id', { count: 'exact', head: false });
  if (error) throw error;
  const conteo: { [nombre: string]: number } = {};
  data.forEach((t: any) => {
    const nombre = t.especialidades?.nombre || 'Sin especialidad';
    conteo[nombre] = (conteo[nombre] || 0) + 1;
  });
  return Object.entries(conteo).map(([especialidad, cantidad]) => ({ especialidad, cantidad }));
}


async getLogIngresos() {
  const { data, error } = await this.supabase
    .from('log_ingresos')
    .select('usuario_email, fecha_hora')
    .order('fecha_hora', { ascending: false });
  if (error) throw error;
  return data;
}

async getTurnosPorDia() {
  const { data, error } = await this.supabase
    .from('turnos')
    .select('fecha, id');
  if (error) throw error;
  const conteo: { [fecha: string]: number } = {};
  data.forEach((t: any) => {
    conteo[t.fecha] = (conteo[t.fecha] || 0) + 1;
  });
  return Object.entries(conteo).map(([fecha, cantidad]) => ({ fecha, cantidad }));
}


async getTurnosPorMedicoYEstado(fechaDesde: string, fechaHasta: string, estado: string) {
  console.log('Obteniendo turnos por médico y estado:', fechaDesde, fechaHasta, estado);
  const { data, error } = await this.supabase
    .from('turnos')
    .select('especialista_id, especialista:usuarios!turnos_especialista_id_fkey(nombre, apellido), estado, fecha')
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .eq('estado', estado);
  if (error) {
    console.error('Error en la consulta Supabase:', error);
    throw error;
  }

  console.log('Datos recibidos de Supabase:', data);

  if (!data || data.length === 0) {
    console.warn('No se encontraron turnos para los filtros dados.');
    return [];
  }

const conteo: { [medico: string]: number } = {};
  data.forEach((t: any) => {
    const nombre = t.especialista?.nombre + ' ' + t.especialista?.apellido;
    if (!nombre || nombre === 'undefined undefined') {
      console.warn('Turno sin nombre de médico:', t);
    }
    conteo[nombre] = (conteo[nombre] || 0) + 1;
  });

  console.log('Conteo agrupado por médico:', conteo);

  const resultado = Object.entries(conteo).map(([medico, cantidad]) => ({ medico, cantidad }));
  console.log('Resultado final:', resultado);

  return resultado;
}












}


