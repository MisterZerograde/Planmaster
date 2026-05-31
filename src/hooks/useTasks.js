import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

function getAllDescendantIds(tasks, parentId) {
  const children = tasks.filter(t => t.parentId === parentId)
  return children.flatMap(c => [c.id, ...getAllDescendantIds(tasks, c.id)])
}

export function useTasks(userId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(
      collection(db, 'users', userId, 'tasks'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addTask = (task) =>
    addDoc(collection(db, 'users', userId, 'tasks'), {
      ...task,
      parentId: task.parentId || null,
      completed: false,
      createdAt: serverTimestamp(),
    })

  const updateTask = (id, updates) =>
    updateDoc(doc(db, 'users', userId, 'tasks', id), updates)

  const toggleTask = (id, completed) =>
    updateDoc(doc(db, 'users', userId, 'tasks', id), { completed: !completed })

  // Deletes task and all its descendants recursively
  const deleteTask = (id) => {
    const ids = [id, ...getAllDescendantIds(tasks, id)]
    return Promise.all(ids.map(tid => deleteDoc(doc(db, 'users', userId, 'tasks', tid))))
  }

  return { tasks, loading, addTask, updateTask, toggleTask, deleteTask }
}
