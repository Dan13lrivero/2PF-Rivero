export interface Course {
  id: number | string;
  title: string;
  description: string;
  // Fecha del último service
  lastServiceDate?: Date;
  // true = service hecho, false = pendiente
  serviceDone: boolean;
}

export const courseColumns: string[] = [
  'id',
  'title',
  'description',
  'lastServiceDate',
  'service',
  'actions',
];