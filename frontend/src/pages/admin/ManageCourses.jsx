import { useState, useEffect } from 'react';
import { fetchWithAuth, readJson } from '../../utils/api';
import { useAdminLang } from '../../i18n/lang';

const EMPTY_COURSE = { title: '', age: '', description: '', price: '', image: null };

const ManageCourses = () => {
  const { t } = useAdminLang();
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState(EMPTY_COURSE);
  const [loading, setLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editing, setEditing] = useState(null); // course being edited (with an optional new image)
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const formatPrice = (price) => (Number(price) > 0 ? `$${price}` : t('courses.free'));

  useEffect(() => {
    fetchWithAuth('/api/admin/courses')
      .then(readJson)
      .then(data => { if (Array.isArray(data)) setCourses(data); })
      .catch(err => console.error('Failed to fetch courses', err));
  }, []);

  const handleImageUpload = (e) => {
    // Sent to the server (Cloudinary or local storage) together with the course.
    setNewCourse({...newCourse, image: e.target.files[0] || null});
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    const courseData = new FormData();
    courseData.append('title', newCourse.title);
    courseData.append('level', newCourse.age);
    courseData.append('description', newCourse.description);
    courseData.append('price', newCourse.price);
    courseData.append('icon', '📖'); // Fallback for existing UI
    if (newCourse.image) {
      courseData.append('image', newCourse.image);
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/admin/courses', {
        method: 'POST',
        body: courseData
      });
      const data = await readJson(res);
      if (res.ok) {
        setCourses([...courses, data]);
        setNewCourse(EMPTY_COURSE);
        setFileInputKey(k => k + 1);
        alert(t('courses.created'));
      } else {
        alert(t.server(data.message) || t('courses.createFailed'));
      }
    } catch (err) {
      console.error(err);
      alert(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (course) => {
    setEditError('');
    setEditing({ ...course, newImage: null, removeImage: false });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('title', editing.title);
    form.append('level', editing.level);
    form.append('description', editing.description);
    form.append('price', editing.price);
    if (editing.newImage) form.append('image', editing.newImage);
    else if (editing.removeImage) form.append('removeImage', 'true');

    setSavingEdit(true);
    setEditError('');
    try {
      const res = await fetchWithAuth(`/api/admin/courses/${editing._id}`, { method: 'PUT', body: form });
      const data = await readJson(res);
      if (res.ok) {
        setCourses(courses.map(c => (c._id === data._id ? data : c)));
        setEditing(null);
      } else {
        setEditError(t.server(data.message) || t('courses.updateFailed'));
      }
    } catch {
      setEditError(t('common.networkError'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm(t('courses.confirmDelete'))) return;
    try {
      const res = await fetchWithAuth(`/api/admin/courses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCourses(courses.filter(c => c._id !== id));
      } else {
        alert(t('courses.deleteFailed'));
      }
    } catch (err) {
      console.error(err);
      alert(t('common.networkError'));
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h2>{t('courses.title')}</h2>
      </div>

      <div className="admin-table-container" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)', textShadow: '0 0 10px rgba(250,204,21,0.3)' }}>{t('courses.addTitle')}</h3>
        <form onSubmit={handleAddCourse} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">{t('courses.courseTitle')}</label>
            <input type="text" className="form-control" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('courses.ageGroup')}</label>
            <input type="text" className="form-control" placeholder={t('courses.agePlaceholder')} value={newCourse.age} onChange={e => setNewCourse({...newCourse, age: e.target.value})} required />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">{t('courses.description')}</label>
            <textarea className="form-control" rows="3" placeholder={t('courses.descriptionPlaceholder')} value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">{t('courses.price')}</label>
            <input type="number" min="0" step="0.01" className="form-control" placeholder={t('courses.pricePlaceholder')} value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} required />
          </div>

          {/* Image Upload Button (Glassmorphic) */}
          <div className="form-group">
            <label className="form-label">{t('courses.image')}</label>
            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
              <button type="button" className="btn btn-outline" style={{ width: '100%', padding: '0.8rem', borderStyle: 'dashed', borderColor: 'var(--accent-color)' }}>
                 {newCourse.image ? t('courses.imageSelected') : t('courses.imageUpload')}
              </button>
              <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} className="btn btn-accent" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', textShadow: '0 0 10px rgba(56,189,248,0.5)' }}>
              {loading ? t('courses.creating') : t('courses.create')}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('courses.col.icon')}</th>
              <th>{t('courses.col.title')}</th>
              <th>{t('courses.col.age')}</th>
              <th>{t('courses.col.price')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course._id}>
                <td style={{ fontSize: '1.5rem' }}>
                  {course.imageUrl
                    ? <img src={course.imageUrl} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                    : course.icon}
                </td>
                <td style={{ fontWeight: '600' }}>{course.title}</td>
                <td>{course.level}</td>
                <td><span style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.8rem', borderRadius: '1rem', fontSize: '0.9rem' }}>{formatPrice(course.price)}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button onClick={() => openEdit(course)} style={{ backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'inherit', marginInlineEnd: '0.5rem' }}>{t('common.edit')}</button>
                  <button onClick={() => handleDeleteCourse(course._id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontFamily: 'inherit' }}>{t('common.delete')}</button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>{t('courses.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: 'var(--card-bg)', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(250, 204, 21, 0.2)', position: 'relative' }}>
            <button onClick={() => setEditing(null)} aria-label="Close" style={{ position: 'absolute', top: '1.2rem', insetInlineEnd: '1.2rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>{t('courses.editTitle')}</h2>
            <form onSubmit={handleSaveEdit}>
              {editError && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{editError}</p>}
              <div className="form-group">
                <label className="form-label">{t('courses.courseTitle')}</label>
                <input required type="text" className="form-control" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('courses.ageGroup')}</label>
                <input required type="text" className="form-control" value={editing.level} onChange={e => setEditing({ ...editing, level: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('courses.description')}</label>
                <textarea required rows="4" className="form-control" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">{t('courses.price')}</label>
                <input required type="number" min="0" step="0.01" className="form-control" value={editing.price} onChange={e => setEditing({ ...editing, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('courses.image')}</label>
                {editing.imageUrl && !editing.newImage && !editing.removeImage && (
                  <img src={editing.imageUrl} alt="" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem' }} />
                )}
                <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
                  <button type="button" className="btn btn-outline" style={{ width: '100%', padding: '0.7rem', borderStyle: 'dashed', borderColor: 'var(--accent-color)' }}>
                    {editing.newImage ? t('courses.imageSelected') : t('courses.newImage')}
                  </button>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setEditing({ ...editing, newImage: e.target.files[0] || null, removeImage: false })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </div>
                {editing.imageUrl && !editing.newImage && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={editing.removeImage} onChange={e => setEditing({ ...editing, removeImage: e.target.checked })} />
                    {t('courses.removeImage')}
                  </label>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" disabled={savingEdit} className="btn btn-accent" style={{ flex: 1 }}>{savingEdit ? t('courses.saving') : t('common.save')}</button>
                <button type="button" onClick={() => setEditing(null)} className="btn btn-outline" style={{ flex: 1 }}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
