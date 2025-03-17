import React, { useState } from 'react';
import TodoList from './component/TodoList';
import CompletedTodos from './component/CompletedTodos';
import AddTodo from './component/AddTodo';

const App = () => {
  const [todos, setTodos] = useState([
    { id: 1, title: 'Pay cable bill', description: 'Pay the cable bill by the 15th of the month', due: '3/15/2023', completed: false },
    { id: 2, title: 'Grocery shopping', description: 'Buy vegetables, fruits, and snacks for the week', due: '3/20/2023', completed: false },
    { id: 3, title: 'Finish lab assignment', description: 'Complete Lab 4 assignment and submit by Friday', due: '3/22/2023', completed: false },
    { id: 4, title: 'Book flight tickets', description: 'Book tickets for summer vacation to California', due: '3/18/2023', completed: false },
    { id: 5, title: 'Call insurance company', description: 'Inquire about car insurance renewal policy and offers', due: '3/16/2023', completed: false },
    { id: 6, title: 'Read new book', description: 'Start reading the new thriller novel bought last week', due: '3/30/2023', completed: false },
    { id: 7, title: 'Dentist appointment', description: 'Visit dentist for routine checkup and cleaning', due: '3/19/2023', completed: false },
    { id: 8, title: 'Water the plants', description: 'Make sure to water the balcony and living room plants', due: '3/14/2023', completed: false },
    { id: 9, title: 'Laundry', description: 'Wash, dry, and fold all dirty clothes by tomorrow', due: '3/15/2023', completed: false },
    { id: 10, title: 'Fix the sink', description: 'Call a plumber to repair the leaking sink in the kitchen', due: '3/21/2023', completed: false },
  ]);

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleCompleted = (todo) => {
    setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
  };

  const addTodo = (newTodo) => {
    const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
    const todoToAdd = { id: newId, ...newTodo, completed: false };
    setTodos([...todos, todoToAdd]);
  };

  return (
    <div>
      <h1 className='font_size'>My Todo App</h1>
      <AddTodo addTodo={addTodo} />
      <TodoList todos={todos.filter(todo => !todo.completed)} deleteTodo={deleteTodo} toggleCompleted={toggleCompleted} />
      <CompletedTodos todos={todos.filter(todo => todo.completed)} toggleCompleted={toggleCompleted} />
    </div>
  );
};

export default App;