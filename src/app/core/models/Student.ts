export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  email?: string;
  ci?: string;
  // Comisión de diciembre del año anterior (ya es monto de comisión)
  lastDecemberCommission?: number;
} 