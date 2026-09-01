'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, createClassCode, db, onAuthStateChanged } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

interface ClassRecord {
  id: string;
  code: string;
  className: string;
  teacherUid: string;
  students: { id: string; name: string }[];
  createdAt?: string;
}

export default function TeacherClassesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [teacherUid, setTeacherUid] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/auth');
        return;
      }
      setTeacherUid(user.uid);
      setReady(true);
    });
    return unsub;
  }, [router]);

  useEffect(() => {
    if (!ready || !teacherUid || !db) return;
    loadClasses();
  }, [ready, teacherUid]);

  async function loadClasses() {
    if (!db || !teacherUid) return;
    const snapshot = await getDocs(collection(db, 'classCodes'));
    const rows = snapshot.docs
      .map((item) => {
        const data = item.data() as any;
        return {
          id: item.id,
          code: data.code ?? item.id,
          className: data.className ?? 'New class',
          teacherUid: data.teacherUid ?? '',
          students: Array.isArray(data.students) ? data.students : [],
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : '',
        } as ClassRecord;
      })
      .filter((item) => item.teacherUid === teacherUid)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    setClasses(rows);
    if (!selectedClassId && rows[0]) {
      setSelectedClassId(rows[0].id);
    }
  }

  async function handleCreateClass() {
    if (!teacherUid || !db) return;
    setLoading(true);
    try {
      const code = await createClassCode(teacherUid);
      const classDoc = doc(db, 'classCodes', code);
      await setDoc(classDoc, {
        code,
        className: className.trim() || `Class ${classes.length + 1}`,
        teacherUid,
        students: [],
        createdAt: serverTimestamp(),
      }, { merge: true });
      setClassName('');
      await loadClasses();
      setSelectedClassId(code);
    } finally {
      setLoading(false);
    }
  }

  async function addStudentToClass(classId: string, name: string) {
    if (!db || !name.trim()) return;
    const target = classes.find((item) => item.id === classId);
    if (!target) return;
    const students = [...target.students, { id: `${Date.now()}`, name: name.trim() }];
    await updateDoc(doc(db, 'classCodes', classId), { students });
    await loadClasses();
    setStudentName('');
  }

  async function editStudentInClass(classId: string, studentId: string, oldName: string) {
    if (!db) return;
    const nextName = window.prompt('Edit student name', oldName)?.trim();
    if (!nextName) return;
    const target = classes.find((item) => item.id === classId);
    if (!target) return;
    const students = target.students.map((student) =>
      student.id === studentId ? { ...student, name: nextName } : student,
    );
    await updateDoc(doc(db, 'classCodes', classId), { students });
    await loadClasses();
  }

  async function deleteStudentInClass(classId: string, studentId: string) {
    if (!db) return;
    const target = classes.find((item) => item.id === classId);
    if (!target) return;
    const students = target.students.filter((student) => student.id !== studentId);
    await updateDoc(doc(db, 'classCodes', classId), { students });
    await loadClasses();
  }

  const selectedClass = useMemo(
    () => classes.find((item) => item.id === selectedClassId) ?? classes[0] ?? null,
    [classes, selectedClassId],
  );

  if (!ready) return null;

  return (
    <div className="teacher-classes-page" style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px 48px' }}>
      <div className="shell-card" style={{ padding: '24px', marginBottom: 20 }}>
        <p className="suggestions-kicker">Teacher workspace</p>
        <h1 style={{ margin: '10px 0 8px', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontFamily: 'var(--font-display, Syne)' }}>Classes & Students</h1>
        <p style={{ color: 'var(--muted)', margin: 0 }}>Create classes, copy class codes, and manage your classroom rosters.</p>
      </div>

      <div className="shell-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            placeholder="New class name"
            className="lb-input"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button className="pill-btn active" onClick={handleCreateClass} disabled={loading}>
            {loading ? 'Creating...' : 'Create class'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) minmax(0, 1fr)', gap: 20 }}>
        <aside className="shell-card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>My classes</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {classes.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>No classes yet.</p>}
            {classes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedClassId(item.id)}
                className="pill-btn"
                style={{
                  justifyContent: 'space-between',
                  width: '100%',
                  background: selectedClass?.id === item.id ? 'rgba(78, 194, 181, 0.14)' : undefined,
                  borderColor: selectedClass?.id === item.id ? 'var(--teal)' : undefined,
                }}
              >
                <span>{item.className}</span>
                <strong style={{ letterSpacing: '.1em', color: 'var(--gold)' }}>{item.code}</strong>
              </button>
            ))}
          </div>
        </aside>

        {selectedClass && (
          <section className="shell-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              <div>
                <p className="suggestions-kicker">Current class</p>
                <h2 style={{ margin: '8px 0 0' }}>{selectedClass.className}</h2>
              </div>
              <button
                className="pill-btn active"
                onClick={() => navigator.clipboard.writeText(selectedClass.code)}
              >
                Copy class code: {selectedClass.code}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <input
                type="text"
                className="lb-input"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Add a student name"
                style={{ flex: 1, minWidth: 220 }}
              />
              <button className="pill-btn" onClick={() => addStudentToClass(selectedClass.id, studentName)}>
                Add student
              </button>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {selectedClass.students.length === 0 && (
                <p style={{ color: 'var(--muted)', margin: 0 }}>No students in this class yet.</p>
              )}
              {selectedClass.students.map((student) => (
                <div key={student.id} className="mp-player-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mp-player-name" style={{ flex: 1 }}>{student.name}</span>
                  <button className="pill-btn" onClick={() => editStudentInClass(selectedClass.id, student.id, student.name)}>
                    Edit
                  </button>
                  <button className="pill-btn" onClick={() => deleteStudentInClass(selectedClass.id, student.id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
