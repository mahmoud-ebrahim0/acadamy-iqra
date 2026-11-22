import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { API_URL } from './api';

/**
 * Returns the course for the current /course/:courseId or /checkout/:courseId page.
 * Uses the course passed through navigation when available, otherwise loads it from the server
 * (so refreshing the page or opening a shared link works).
 * status: 'loading' | 'ready' | 'not-found' | 'error'
 */
export const useCourse = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const stateCourse = location.state?.course;
  const hasStateCourse = stateCourse && stateCourse._id === courseId;

  const [fetched, setFetched] = useState({ id: null, course: null, status: 'loading' });

  useEffect(() => {
    if (hasStateCourse) return;
    let cancelled = false;

    fetch(`${API_URL}/api/client/courses/${encodeURIComponent(courseId)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) setFetched({ id: courseId, course: await res.json(), status: 'ready' });
        else setFetched({ id: courseId, course: null, status: res.status === 404 || res.status === 400 ? 'not-found' : 'error' });
      })
      .catch(() => !cancelled && setFetched({ id: courseId, course: null, status: 'error' }));

    return () => { cancelled = true; };
  }, [courseId, hasStateCourse]);

  if (hasStateCourse) return { course: stateCourse, status: 'ready' };
  if (fetched.id !== courseId) return { course: null, status: 'loading' };
  return { course: fetched.course, status: fetched.status };
};

export const formatPrice = (price, freeLabel = 'Free') => (Number(price) > 0 ? `$${price}` : freeLabel);
