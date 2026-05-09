import { useEffect, useState } from 'react';
import axios from 'axios';
import CategoryModal from './components/CategoryModal';
import TodoItem from './components/TodoItem';
import TodoModal from './components/TodoModal';
import type {
  Category,
  Todo,
  TodoSearchParams,
  ViewMode,
  NewTodo,
} from './types';

// --------------------------------------------------------------------------
function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('TOP');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[newCategoryName,setNewCategoryName]=useState('');
  const[isCategoryModalOpen,setIsCategoryModalOpen]=useState(false);
  const [refreshKey,setRefreshKey]=useState(0);

  const [newTodo, setNewTodo] = useState<newTodo>({
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
  }, [viewMode, selectedCategoryId, refreshKey]); // ← 末尾に refreshKey を追加！


 const addTodo = async () => {
    if (!newTodo.title.trim()) { alert('タイトルを入力してください'); return; }
    const finalCategoryId = viewMode === 'CATEGORY_DETAIL' ? selectedCategoryId : newTodo.categoryId;
    if (!finalCategoryId) { alert('カテゴリを選択してください'); return; }

    const payload = { 
      ...newTodo, 
      categoryId: Number(finalCategoryId), 
      dueDate: newTodo.dueDate || null, 
      status: 'INCOMPLETE' 
    };

    try {
      await axios.post('http://localhost:8080/todos', payload);
      
      // タスク一覧を再取得するために useEffect を再実行する
      setRefreshKey(prev => prev + 1);
      setNewTodo({ 
        title: '', details: '', categoryId: '', 
        dueDate: '', daily: false, hasFlag: false, autoCarryOver: false, overdueBehavior: 0 
      });
      setIsModalOpen(false); 
    } catch (error) { 
      console.error('作成失敗:', error); 
    }
  };

  const addCategory=async()=>{
    if(!newCategoryName.trim())return;
    try{
      const response=await axios.post<Category>('http://localhost:8080/categories',{
        name:newCategoryName
      });
      setCategories(prev=>[...prev,response.data]);
      setNewCategoryName('');
        setIsCategoryModalOpen(false);
    }catch(error){
      console.log('カテゴリ作成失敗:',error);
      alert('カテゴリ作成に失敗しました。')
    }
  };

  const toggleStatus = async (id: number, currentStatus: Todo['status']) => {
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
        <TodoModal
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            categories={categories}
            viewMode={viewMode}
            onClose={() => setIsModalOpen(false)}
            onAddTodo={addTodo}
          />
        )}

        {isCategoryModalOpen&&(
          <CategoryModal
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            onClose={()=>setIsCategoryModalOpen(false)}
            onAddCategory={addCategory}/>
        )}

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
               <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleStatus={toggleStatus}
                  onDeleteTodo={deleteTodo}
                />
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