import React, { useState } from 'react';

const AddTodo = ({ addTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [due, setDue] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    if (trimmedTitle.length < 5 || trimmedDesc.length < 25 || !due) {
      alert('Please fill in all fields correctly.');
      return;
    }

    const [yyyy, mm, dd] = due.split('-');
    const formattedDue = `${mm}/${dd}/${yyyy}`;
    addTodo({ title: trimmedTitle, description: trimmedDesc, due: formattedDue });
    setTitle('');
    setDescription('');
    setDue('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Todo</h2>
      <input
        type="text"
        placeholder=" at least 5 characters "
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder="at least 25 characters long"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <br />
      <input
        type="date"
        min={today}
        value={due}
        onChange={(e) => setDue(e.target.value)}
      />
      <br />
      <button type="submit">Add Todo</button>
    </form>
  );
};

export default AddTodo;