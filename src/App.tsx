/*
Fully client/web side SQL validation for the database course at Stockholm University
Copyright (C) 2024 Edwin Sundberg

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import { useCallback, useEffect, useState } from 'react';
import './App.css';
import logo from './logo.svg';
import ResultTable from './ResultTable';
import Editor from 'react-simple-code-editor';

// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import initSqlJs from "sql.js";
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';

function App() {
  const [database, setDatabase] = useState<initSqlJs.Database>();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('SELECT * FROM student');
  const [correctResult, setCorrectResult] = useState<boolean>(false);
  const [result, setResult] = useState<{ columns: string[], data: (number | string | Uint8Array | null)[][] } | null>(null);

  const initDb = useCallback(async () => {
    const sqlPromise = initSqlJs(
      {
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      }
    );
    const dataPromise = fetch('/data.sqlite').then((res) => res.arrayBuffer());
    const [SQL, data] = await Promise.all([sqlPromise, dataPromise]);
    const db = new SQL.Database(new Uint8Array(data));
    setDatabase(db);
  }, []);

  useEffect(() => {
    initDb();
  }, [initDb]);

  useEffect(() => {
    if (!database) {
      return;
    }
    const res = database.exec('SELECT * FROM student');
    console.log(res);
  }, [database]);

  useEffect(() => {
    if (!database) {
      return;
    }
    try {
      database.prepare(query);
      setError(null);
    } catch (e) {
      // @ts-ignore
      setError(e.message);
    }
  }, [database, query]);

  const runQuery = useCallback(() => {
    if (!database) {
      return;
    }
    try {
      const res = database.exec(query);
      if (res.length === 0) {
        setResult({ columns: [], data: [] });
        return;
      }
      const { columns, values } = res[0];
      setResult({ columns, data: values });
      setCorrectResult(true);
    } catch (e) {
      // @ts-ignore
      setError(e.message);
    }
  }, [database, query]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Editor
       value={query}
       onValueChange={code => setQuery(code)}
       highlight={code => highlight(code, languages.sql)}
       padding={10}
       className="font-mono text-3xl  min-w-96 max-w-4xl bg-slate-800 border-2 "/>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {error && <p className='font-mono text-red-500 max-w-4xl break-all'>{error}</p>}
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={initDb} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' type='submit'>Reset DB</button>
        <button onClick={runQuery} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' type='submit'>Run query</button>
        {result && <>
          {/* if correct result else display wrong result */}
          {correctResult ? <><p className="text-green-500">Correct result!</p>
            <p className="text-sm italic">... but it may not be correct! Make sure that all joins are complete and that the query only uses information from the assignment before submitting.</p>
          </> : <p className="text-red-500">Wrong result!</p>}
          {/* Two different result tables next to each other, actual and expected */}
          <div className="flex max-w-full">
            <div className="flex-1 px-2">
              <h2>Expected</h2>
              <ResultTable columns={result.columns} data={result.data} />
            </div>
            <div className="flex-1 px-2">
              {/* TODO */}
              <h2>Actual</h2>
              <ResultTable columns={result.columns} data={result.data} />
            </div>
          </div>
        </>}
      </header>
    </div>
  );
}

export default App;
