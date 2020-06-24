import { TodoRepository } from '../repositories/TodoRepository';
import { TodoItem } from '../models/TodoItem';
import { parseUserId } from '../auth/utils';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import * as uuid from 'uuid';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoRepo = new TodoRepository();

export async function getUserTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken);
  return await todoRepo.getTodos(userId);
}

export async function getTodoById(
  todoId: String,
  userId: String
): Promise<TodoItem> {
  return todoRepo.getTodoById(todoId, userId);
}

export async function createTodo(
  CreateTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const itemId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await todoRepo.createTodo({
    todoId: itemId,
    userId: userId,
    name: CreateTodoRequest.name,
    dueDate: CreateTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    attachmentUrl: CreateTodoRequest.attachmentUrl,
    done: false,
  });
}
export async function updateTodo(
  todoId: String,
  UpdateTodoRequest: UpdateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const userId = parseUserId(jwtToken);

  let todo = await getTodoById(todoId, userId);
  todo.name = UpdateTodoRequest.name;
  todo.dueDate = UpdateTodoRequest.dueDate;
  todo.done = UpdateTodoRequest.done;

  return await todoRepo.updateTodo(todo);
}

export async function deleteTodo(
  todoId: String,
  jwtToken: string
): Promise<TodoItem> {
  const userId = parseUserId(jwtToken);

  let todo = await getTodoById(todoId, userId);
  return await todoRepo.deleteTodo(todo);
}

export async function generateUploadUrl(todoId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken);

  let todo = await getTodoById(todoId, userId);
  return await todoRepo.generateUploadUrl(todo);
}
