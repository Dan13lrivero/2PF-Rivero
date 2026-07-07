import { Router } from 'express';
import { memoryStore } from '../data/in-memory-store.js';

const router = Router();

const normalizeUser = (user) => ({
  ...user,
  id: String(user.id ?? user._id ?? ''),
  username: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email,
  role: user.role ? String(user.role).toUpperCase() : 'USER',
});

const normalizeStudent = (student) => ({
  ...student,
  id: String(student.id ?? ''),
  nombre: student.nombre ?? student.name ?? '',
  apellido: student.apellido ?? '',
  email: student.email ?? '',
  ci: student.ci ?? '',
  lastDecemberCommission: Number(student.lastDecemberCommission ?? 0),
});

const normalizeCourse = (course) => ({
  ...course,
  id: String(course.id ?? ''),
  title: course.title ?? '',
  description: course.description ?? '',
  serviceDone: course.serviceDone === true,
  lastServiceDate: course.lastServiceDate ? new Date(course.lastServiceDate) : undefined,
});

const nextId = (items) => String((items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1));

router.get('/users', (_req, res) => {
  res.json(memoryStore.users.map(normalizeUser));
});

router.post('/users', (req, res) => {
  const user = { ...req.body, id: nextId(memoryStore.users), role: req.body.role ?? 'USER' };
  memoryStore.users.push(user);
  res.status(201).json(normalizeUser(user));
});

router.get('/students', (_req, res) => {
  res.json(memoryStore.students.map(normalizeStudent));
});

router.post('/students', (req, res) => {
  const student = normalizeStudent({ ...req.body, id: nextId(memoryStore.students) });
  memoryStore.students.push(student);
  res.status(201).json(student);
});

router.put('/students/:id', (req, res) => {
  const index = memoryStore.students.findIndex((student) => String(student.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Estudiante no encontrado' });
  }
  const updated = normalizeStudent({ ...memoryStore.students[index], ...req.body, id: req.params.id });
  memoryStore.students[index] = updated;
  res.json(updated);
});

router.delete('/students/:id', (req, res) => {
  const index = memoryStore.students.findIndex((student) => String(student.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Estudiante no encontrado' });
  }
  memoryStore.students.splice(index, 1);
  res.status(204).send();
});

router.get('/courses', (_req, res) => {
  res.json(memoryStore.courses.map(normalizeCourse));
});

router.get('/courses/:id', (req, res) => {
  const course = memoryStore.courses.find((course) => String(course.id) === String(req.params.id));
  if (!course) {
    return res.status(404).json({ error: 'Curso no encontrado' });
  }
  res.json(normalizeCourse(course));
});

router.post('/courses', (req, res) => {
  const course = normalizeCourse({ ...req.body, id: nextId(memoryStore.courses) });
  memoryStore.courses.push(course);
  res.status(201).json(course);
});

router.put('/courses/:id', (req, res) => {
  const index = memoryStore.courses.findIndex((course) => String(course.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Curso no encontrado' });
  }
  const updated = normalizeCourse({ ...memoryStore.courses[index], ...req.body, id: req.params.id });
  memoryStore.courses[index] = updated;
  res.json(updated);
});

router.delete('/courses/:id', (req, res) => {
  const index = memoryStore.courses.findIndex((course) => String(course.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Curso no encontrado' });
  }
  memoryStore.courses.splice(index, 1);
  res.status(204).send();
});

router.get('/driverMonths', (req, res) => {
  const { studentId, month } = req.query;
  let records = memoryStore.driverMonths.filter((record) => String(record.studentId) === String(studentId));
  if (month !== undefined) {
    records = records.filter((record) => String(record.month) === String(month));
  }
  res.json(records);
});

router.post('/driverMonths', (req, res) => {
  const record = { id: nextId(memoryStore.driverMonths), ...req.body };
  memoryStore.driverMonths.push(record);
  res.status(201).json(record);
});

router.put('/driverMonths/:id', (req, res) => {
  const index = memoryStore.driverMonths.findIndex((record) => String(record.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }
  memoryStore.driverMonths[index] = { ...memoryStore.driverMonths[index], ...req.body, id: req.params.id };
  res.json(memoryStore.driverMonths[index]);
});

export default router;
