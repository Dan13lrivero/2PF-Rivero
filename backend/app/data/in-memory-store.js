const initialUsers = [
  {
    _id: '1',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@mail.com',
    age: 30,
    password: '1234',
    role: 'admin',
  },
];

const initialStudents = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@mail.com',
    ci: '1234567',
    lastDecemberCommission: 0,
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'Gómez',
    email: 'maria@mail.com',
    ci: '7654321',
    lastDecemberCommission: 0,
  },
];

const initialCourses = [
  {
    id: '1',
    title: 'Angular',
    description: 'Curso de Angular para construir aplicaciones modernas.',
    lastServiceDate: '2024-11-01',
    serviceDone: false,
  },
  {
    id: '2',
    title: 'React',
    description: 'Curso de React para interfaces dinámicas.',
    lastServiceDate: '2024-08-15',
    serviceDone: true,
  },
];

const initialDriverMonths = [];

export const memoryStore = {
  users: [...initialUsers],
  students: [...initialStudents],
  courses: [...initialCourses],
  driverMonths: [...initialDriverMonths],
};
