'use client';

import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// 应用状态类型定义
interface AppState {
  theme: 'light' | 'dark';
  user: {
    isLoggedIn: boolean;
    data: any | null;
  };
  isLoading: boolean;
}

// 初始状态
const initialState: AppState = {
  theme: 'light',
  user: {
    isLoggedIn: false,
    data: null,
  },
  isLoading: false,
};

// 定义可能的动作类型
type Action =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'LOGIN'; payload: any }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

// 减速器函数
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'LOGIN':
      return {
        ...state,
        user: {
          isLoggedIn: true,
          data: action.payload,
        },
      };
    case 'LOGOUT':
      return {
        ...state,
        user: {
          isLoggedIn: false,
          data: null,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// 创建上下文
const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

// 提供者组件
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义钩子，用于访问上下文
export const useAppContext = () => useContext(AppContext);

export default AppContext;