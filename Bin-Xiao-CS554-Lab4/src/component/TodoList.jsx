import React from 'react';


const TodoList = ({ todos, deleteTodo, toggleCompleted }) => {
  return (
    <div >
      <h2>Todos</h2>
      {todos.map(todo => (
        <div key={todo.id} className='box'>
          <h1>{todo.title}</h1>
          <p>{todo.description}</p>
          <p >Due Date: {todo.due}</p>
          <p>Completed: No</p>
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          <button onClick={() => toggleCompleted(todo)}>Complete</button>
        </div>
      ))}
    </div>
  );
};

export default TodoList;