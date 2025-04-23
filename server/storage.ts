import {
  users,
  type User,
  type InsertUser,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage,
} from '@shared/schema';

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat methods
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(id: number): Promise<Chat | undefined>;
  getAllChats(): Promise<Chat[]>;
  deleteChat(id: number): Promise<boolean>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChatId(chatId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private userId: number;
  private chatId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.userId = 1;
    this.chatId = 1;
    this.messageId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Chat methods
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.chatId++;
    const chat: Chat = {
      ...insertChat,
      id,
      createdAt: new Date(),
      userId: insertChat.userId || null, // Ensure userId is not undefined
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getAllChats(): Promise<Chat[]> {
    return Array.from(this.chats.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  async deleteChat(id: number): Promise<boolean> {
    // Check if chat exists
    if (!this.chats.has(id)) {
      return false;
    }
    
    // Delete all messages associated with the chat
    const messagesToDelete = Array.from(this.messages.values())
      .filter(message => message.chatId === id);
      
    for (const message of messagesToDelete) {
      this.messages.delete(message.id);
    }
    
    // Delete the chat
    return this.chats.delete(id);
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      responseType: insertMessage.responseType || 'text', // Ensure responseType is not undefined
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }
}

export const storage = new MemStorage();
