import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DiaryProvider } from './context/DiaryContext';
import { ThemeProvider } from './context/ThemeContext';
import { TemplateProvider } from './context/TemplateContext';
import Layout from './components/Layout/Layout';
import Calendar from './components/Calendar/Calendar';

import Editor from './components/Editor/Editor';
import TagManager from './components/TagManager/TagManager';
import EntryList from './components/EntryList/EntryList';
import DailyLog from './components/DailyLog/DailyLog';
import Search from './components/Search/Search';
import TemplateList from './components/Templates/TemplateList';
import TemplateEditor from './components/Templates/TemplateEditor';

import PinnedEntries from './components/PinnedEntries/PinnedEntries';

function App() {
  return (
    <ThemeProvider>
      <DiaryProvider>
        <TemplateProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<div className="flex justify-center"><Calendar /></div>} />
                <Route path="day/:date" element={<DailyLog />} />
                <Route path="entry/:id" element={<Editor />} />
                <Route path="search" element={<Search />} />
                <Route path="pinned" element={<PinnedEntries />} />
                <Route path="tags" element={<TagManager />} />
                <Route path="tag/:tagId" element={<EntryList />} />
                <Route path="templates" element={<TemplateList />} />
                <Route path="templates/new" element={<TemplateEditor />} />
                <Route path="templates/:id" element={<TemplateEditor />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TemplateProvider>
      </DiaryProvider>
    </ThemeProvider>
  );
}

export default App;
