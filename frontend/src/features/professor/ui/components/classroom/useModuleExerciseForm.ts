import { useState } from 'react';
import type { StudentEnrolled } from '../../../domain/ProfessorModels';

export function useModuleExerciseForm(
  students: readonly StudentEnrolled[],
  onExerciseAdded: (exe: { title: string; description: string; dueDate: string; assignedStudentIds: readonly string[] }) => void
) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedIds, setAssignedIds] = useState<readonly string[]>([]);
  const [success, setSuccess] = useState(false);

  const toggleStudent = (id: string) => {
    setAssignedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (assignedIds.length === students.length) setAssignedIds([]);
    else setAssignedIds(students.map((s) => s.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onExerciseAdded({
      title: title.trim(),
      description: desc.trim(),
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedStudentIds: assignedIds,
    });

    setTitle(''); setDesc(''); setDueDate(''); setAssignedIds([]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return { title, setTitle, desc, setDesc, dueDate, setDueDate, assignedIds, success, toggleStudent, handleSelectAll, handleSubmit };
}
