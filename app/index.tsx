import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { Checkbox } from 'react-native-paper';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  children: Todo[];
  childrenYn: boolean;
}

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null); 
  const [editText, setEditText] = useState<string>('');

  const addTodo = () => {
    if (text.trim()) {
      setTodos([
        ...todos,
        {
          id: Math.random().toString(),
          text: text.trim(),
          completed: false,
          children: [],
          childrenYn: false,
        },
      ]);
      setText('');
    }
  };
  const addSubTodo = (id: string) => {
    const newTodos = todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          children: [
            ...todo.children,
            {
              id: Math.random().toString(),
              text: 'New SubTodo',
              completed: false,
              children: [],
              childrenYn: true,
            },
          ],
        };
      }
      return todo;
    });
    setTodos(newTodos);
  };

  const deleteTodo = (id: string) => {
    const filterTodos = (list: Todo[]): Todo[] => {
      return list.reduce((arr: Todo[], todo: Todo) => {
        if (todo.id !== id) {
          const children = filterTodos(todo.children);
          if (todo.id !== id) {
            arr.push({ ...todo, children });
          }
        }
        return arr;
      }, []);
    };
    setTodos(filterTodos(todos));
  };

  const toggleTodoCompletion = (id: string) => {
    const toggleCompletion = (todos: Todo[], id: string): Todo[] => {
      return todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed };
        }
        return { ...todo, children: toggleCompletion(todo.children, id) };
      });
    };
    setTodos(toggleCompletion(todos, id));
  };
  
  const updateTodoText = (id: string, newText: string) => {
    const updateTextRecursively = (todos: Todo[], id: string, newText: string): Todo[] => {
      return todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, text: newText };
        }
        return { ...todo, children: updateTextRecursively(todo.children, id, newText) };
      });
    };
    setTodos(updateTextRecursively(todos, id, newText));
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <View style={styles.todoContainer}>
      <View style={styles.todoRow}>
        <Checkbox
          status={item.completed ? 'checked' : 'unchecked'}
          onPress={() => toggleTodoCompletion(item.id)}
        />
        {editId === item.id ? (
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              onSubmitEditing={() => {
                updateTodoText(item.id, editText);
                setEditId(null);
                setEditText('');
              }}
              autoFocus
            />
          ) : (
            <TouchableOpacity
              style={[styles.todoText,]}
              onPress={() => {
                setEditId(item.id);
                setEditText(item.text);
              }}
            >
              <Text style={[item.completed && styles.completedText]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
        {!item.childrenYn && (
          <TouchableOpacity onPress={() => addSubTodo(item.id)}>
            <Icon name="addr" size={20} color="green" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => deleteTodo(item.id)}>
          <Icon name="close" size={20} color="red" />
        </TouchableOpacity>
      </View>
      {item.children.length > 0 && (
        <FlatList
          data={item.children}
          renderItem={renderTodo}
          keyExtractor={(subItem) => subItem.id}
          style={styles.subTodoList}
        />
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Enter todo"
        onSubmitEditing={addTodo}
      />
      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  todoContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoText: {
    fontSize: 10,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  editInput: {
    fontSize: 10,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  addSubTodoText: {
    color: 'blue',
    marginHorizontal: 8,
  },
  subTodoList: {
    marginLeft: 20,
  },
});