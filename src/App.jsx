import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DiaryProvider } from './context/DiaryContext';
import Layout from './components/Layout/Layout';
import Calendar from './components/Calendar/Calendar';

import Editor from './components/Editor/Editor';
import TagManager from './components/TagManager/TagManager';
import EntryList from './components/EntryList/EntryList';

function App() {
  return (
    <DiaryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div className="flex justify-center"><Calendar /></div>} />
            <Route path="entry/:date" element={<Editor />} />
            <Route path="tags" element={<TagManager />} />
            <Route path="tag/:tagId" element={<EntryList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DiaryProvider>
  );
}

export default App;
