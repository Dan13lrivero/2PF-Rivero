import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storeFilePath = join(__dirname, 'memory-store.json');

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

const defaultStore = {
  users: [...initialUsers],
  students: [...initialStudents],
  courses: [...initialCourses],
  driverMonths: [...initialDriverMonths],
};

const parseStore = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : defaultStore.users,
      students: Array.isArray(parsed.students) ? parsed.students : defaultStore.students,
      courses: Array.isArray(parsed.courses) ? parsed.courses : defaultStore.courses,
      driverMonths: Array.isArray(parsed.driverMonths) ? parsed.driverMonths : defaultStore.driverMonths,
    };
  } catch {
    return defaultStore;
  }
};

const saveStore = (store) => {
  try {
    writeFileSync(storeFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (error) {
    console.warn('[memory-store] No se pudo guardar el store en disco:', error.message);
  }
};

const loadStore = () => {
  if (!existsSync(storeFilePath)) {
    saveStore(defaultStore);
    return JSON.parse(JSON.stringify(defaultStore));
  }

  try {
    const raw = readFileSync(storeFilePath, 'utf-8');
    return parseStore(raw);
  } catch (error) {
    console.warn('[memory-store] No se pudo leer el store desde disco, usando valores iniciales:', error.message);
    return JSON.parse(JSON.stringify(defaultStore));
  }
};

export const memoryStore = loadStore();
export const persistMemoryStore = () => saveStore(memoryStore);
