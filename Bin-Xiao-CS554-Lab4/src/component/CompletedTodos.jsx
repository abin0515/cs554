import React from 'react';

const CompletedTodos = ({ todos, toggleCompleted }) => {
  return (
    <div>
      <h2>Completed Todos</h2>
      {todos.map(todo => (
        <div key={todo.id} className='box'>
          <h1>{todo.title}</h1>
          <p>{todo.description}</p>
          <p>Due Date: {todo.due}</p>
          <p>Completed: Yes</p>
          <button onClick={() => toggleCompleted(todo)}>Mark Incomplete</button>
        </div>
      ))}
    </div>
  );
};

export default CompletedTodos;