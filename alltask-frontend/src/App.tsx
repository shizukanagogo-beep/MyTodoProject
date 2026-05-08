import { useEffect, useState } from 'react';
import axios from 'axios';

// --- 型定義 (変更なし) ---
interface Category { id: number; name: string; }
interface Todo {
  id: number; categoryId: number | null; title: string; status: 'INCOMPLETE' | 'DONE';
  details: string | null; dueDate: string | null; daily: boolean; hasFlag: boolean;
  autoCarryOver: boolean; overdueBehavior: number;
}
interface TodoSearchParams { categoryId?: number | null; existsDueDate?: boolean; daily?: boolean; hasFlag?: boolean; }
type ViewMode = 'TOP' | 'CATEGORY_DETAIL' | 'DATED' | 'DAILY' | 'FLAGGED';

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('TOP');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[newCategoryName,setNewCategoryName]=useState('');
  const[isCategoryModalOpen,setIsCategoryModalOpen]=useState(false);

  const [newTodo, setNewTodo] = useState({
    title: '', details: '', categoryId: '' as number | '', 
    dueDate: '', daily: false, hasFlag: false, autoCarryOver: false, overdueBehavior: 0
  });

  // --- APIロジック (変更なし) ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>('http://localhost:8080/categories');
        setCategories(response.data);
      } catch (error) { console.error('カテゴリの取得に失敗:', error); }
      finally { setLoading(false); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (viewMode === 'TOP') return;
    const fetchTodos = async () => {
      const params: TodoSearchParams = {};
      if (viewMode === 'CATEGORY_DETAIL') params.categoryId = selectedCategoryId;
      if (viewMode === 'DATED') params.existsDueDate = true;
      if (viewMode === 'DAILY') params.daily = true;
      if (viewMode === 'FLAGGED') params.hasFlag = true;
      try {
        const response = await axios.get<Todo[]>('http://localhost:8080/todos', { params });
        setTodos(response.data);
      } catch (error) { console.error('タスクの取得に失敗:', error); }
    };
    fetchTodos();
  }, [viewMode, selectedCategoryId]);

  const addTodo = async () => {
    if (!newTodo.title.trim()) { alert('タイトルを入力してください'); return; }
    const finalCategoryId = viewMode === 'CATEGORY_DETAIL' ? selectedCategoryId : newTodo.categoryId;
    if (!finalCategoryId) { alert('カテゴリを選択してください'); return; }
    const payload = { ...newTodo, categoryId: finalCategoryId, dueDate: newTodo.dueDate || null, status: 'INCOMPLETE' };
    try {
      const response = await axios.post<Todo>('http://localhost:8080/todos', payload);
      if (viewMode !== 'TOP') { setTodos([...todos, response.data]); }
      setNewTodo({ title: '', details: '', categoryId: '', dueDate: '', daily: false, hasFlag: false, autoCarryOver: false, overdueBehavior: 0 });
      setIsModalOpen(false);
    } catch (error) { console.error('作成失敗:', error); }
  };

  const addCategory=async()=>{
    if(!newCategoryName.trim())return;
    try{
      const response=await axios.post<Category>('http://localhost:8080/categories',{
        name:newCategoryName
      });
      setCategories([...categories,response.data]);
      setNewCategoryName('');
        setIsCategoryModalOpen(false);
    }catch(error){
      console.log('カテゴリ作成失敗:',error);
      alert('カテゴリ作成に失敗しました。')
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'DONE' ? 'INCOMPLETE' : 'DONE';
    setTodos(todos.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await axios.patch(`http://localhost:8080/todos/${id}/status`, `"${newStatus}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) { console.error('更新失敗:', error); }
  };

  const deleteTodo = async (id: number) => {
    if (!window.confirm('削除しますか？')) return;
    setTodos(todos.filter(t => t.id !== id));
    try { await axios.delete(`http://localhost:8080/todos/${id}`); }
    catch (error) { console.error('削除失敗:', error); }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.status === 'DONE' && b.status !== 'DONE') return 1;
    if (a.status !== 'DONE' && b.status === 'DONE') return -1;
    return 0;
  });

  if (loading) return <div className="flex justify-center items-center h-screen text-xl font-bold text-gray-500">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 
            onClick={() => setViewMode('TOP')} 
            className="text-2xl font-black text-indigo-600 cursor-pointer hover:opacity-80 transition-opacity"
          >
            AllTask Todo
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* モーダル起動ボタン */}
        {(viewMode === 'TOP' || viewMode === 'CATEGORY_DETAIL') && (
          <button 
            className="w-full mb-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            onClick={() => setIsModalOpen(true)}
          >
            ＋ 新しいタスクを追加
          </button>
        )}

        {/* モーダル */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">新規タスク作成</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-2xl text-slate-400 hover:text-slate-600">×</button>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" placeholder="タイトル" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newTodo.title} onChange={e => setNewTodo({...newTodo, title: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  {viewMode === 'TOP' && (
                    <select 
                      className="px-4 py-3 border border-slate-200 rounded-lg bg-white"
                      value={newTodo.categoryId} 
                      onChange={e => setNewTodo({...newTodo, categoryId: Number(e.target.value)})}
                    >
                      <option value="">カテゴリを選択</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                  <input 
                    type="date" className="px-4 py-3 border border-slate-200 rounded-lg"
                    value={newTodo.dueDate || ''} onChange={e => setNewTodo({...newTodo, dueDate: e.target.value})}
                  />
                </div>
                <textarea 
                  placeholder="詳細メモ" className="w-full px-4 py-3 border border-slate-200 rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newTodo.details || ''} onChange={e => setNewTodo({...newTodo, details: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" checked={newTodo.hasFlag} onChange={e => setNewTodo({...newTodo, hasFlag: e.target.checked})} /> 🚩重要
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" checked={newTodo.daily} onChange={e => setNewTodo({...newTodo, daily: e.target.checked})} /> 🔄日課
                  </label>
                </div>
                <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md" onClick={addTodo}>
                  タスクを登録
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ↓↓↓ ここから追加 ↓↓↓ */}
        {/* カテゴリ追加用モーダル */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsCategoryModalOpen(false)}>
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-slate-800 mb-4">新しいカテゴリ</h3>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
                placeholder="カテゴリ名 (例: 仕事、買い物)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors" 
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  キャンセル
                </button>
                <button 
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md" 
                  onClick={addCategory}
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ↑↑↑ ここまで追加 ↑↑↑ */}

        {/* メインコンテンツ */}
        {viewMode === 'TOP' ? (
          <div className="space-y-8">
            <section className="grid grid-cols-3 gap-4">
              <button onClick={() => setViewMode('DATED')} className="p-4 bg-blue-500 text-white rounded-xl font-bold shadow-md hover:bg-blue-600">📅 日付あり</button>
              <button onClick={() => setViewMode('DAILY')} className="p-4 bg-emerald-500 text-white rounded-xl font-bold shadow-md hover:bg-emerald-600">🔄 日課</button>
              <button onClick={() => setViewMode('FLAGGED')} className="p-4 bg-amber-500 text-white rounded-xl font-bold shadow-md hover:bg-amber-600">🚩 フラグ</button>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-700 mb-4 px-1">カテゴリ一覧</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
                    onClick={() => { setSelectedCategoryId(cat.id); setViewMode('CATEGORY_DETAIL'); }}
                  >
                    <div className="w-12 h-12 bg-indigo-50 rounded-full mb-3 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <span className="text-indigo-600 font-bold">{cat.name[0]}</span>
                    </div>
                    <h3 className="font-bold text-slate-800">{cat.name}</h3>
                  </div>
                ))}
                <button className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-400 transition-all"
                onClick={()=>setIsCategoryModalOpen(true)}>
                  + カテゴリを追加
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setViewMode('TOP')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">←</button>
              <h2 className="text-2xl font-bold text-slate-800">
                {viewMode === 'CATEGORY_DETAIL' && `${categories.find(c => c.id === selectedCategoryId)?.name}`}
                {viewMode === 'DATED' && '日付ありタスク'}
                {viewMode === 'DAILY' && '日課タスク'}
                {viewMode === 'FLAGGED' && 'フラグ付き'}
              </h2>
            </div>

            <div className="space-y-3">
              {sortedTodos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 group ${todo.status === 'DONE' ? 'opacity-60 bg-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input 
                      type="checkbox" checked={todo.status === 'DONE'} 
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      onChange={() => toggleStatus(todo.id, todo.status)} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className={`font-bold truncate ${todo.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {todo.title}
                        </span>
                        <div className="flex gap-1">
                          {todo.hasFlag && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">🚩</span>}
                          {todo.daily && <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">🔄</span>}
                          {todo.dueDate && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">{todo.dueDate}</span>}
                        </div>
                      </div>
                      {todo.details && <p className="text-sm text-slate-500 line-clamp-1">{todo.details}</p>}
                    </div>
                  </div>
                  <button 
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {sortedTodos.length === 0 && <div className="text-center py-20 text-slate-400">タスクがありません</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;