import "@djthoms/pretty-checkbox";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Checkbox } from "pretty-checkbox-react";
import React, { forwardRef, useImperativeHandle, useRef } from "react";

interface ExportSelectorModalProps {
  correctQuestions: number[];
  onExport: (include: number[]) => void;
}

export interface ExportSelectorModalHandle {
  openDialog: () => void;
  closeDialog: () => void;
}

const ExportSelectorModal = forwardRef<ExportSelectorModalHandle, ExportSelectorModalProps>(
  ({ correctQuestions, onExport }, ref) => {
    const [includeAll, setIncludeAll] = React.useState<boolean>(true);
    const [dontInclude, setDontInclude] = React.useState<number[]>([]);

    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      openDialog: openDialog,
      closeDialog: closeDialog,
    }));

    const openDialog = () => dialogRef.current?.showModal();
    const closeDialog = () => dialogRef.current?.close();

    return (
      <div>
        <dialog ref={dialogRef} className="rounded-lg max-w-4xl w-full p-6 shadow-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Export Data</h2>
            <XMarkIcon className="w-6 h-6 cursor-pointer text-red-500 hover:text-red-700" onClick={closeDialog} />
          </div>
          <p className="text-left text-lg font-medium mb-4">Choose to export all questions or only selected questions to a save file.</p>
          <div className="flex items-center mb-4 text-lg">
            <Checkbox
              color="primary"
              shape="curve"
              checked={includeAll}
              onChange={(e) => setIncludeAll(e.target.checked)}
            >
              Include all questions
            </Checkbox>
          </div>
          {!includeAll && correctQuestions.length > 0 &&
          <>
            <p className="text-lg font-medium mb-4">Only include ...</p>
            <div className="grid grid-cols-4 gap-4 text-lg">
              {correctQuestions.map((q) => (
                <div key={q} className="flex items-center">
                  <Checkbox
                    color="primary"
                    shape="curve"
                    checked={!dontInclude.includes(q)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDontInclude(dontInclude.filter((i) => i !== q));
                      } else {
                        setDontInclude([...dontInclude, q]);
                      }

                    }}
                  >
                    Question {q}
                  </Checkbox>
                </div>
              ))}
            </div>
          </>
          }
          {!includeAll && correctQuestions.length === 0 &&
          <p className="text-lg font-medium text-red-500">No questions are completed - nothing to export as correct to file (partial answers are always included).</p>
          }
          <div className="mt-3.5">
            <button 
              onClick={() => {
                if (includeAll) {
                  onExport(correctQuestions);
                } else {
                  onExport(correctQuestions.filter((q) => !dontInclude.includes(q)));
                }
                closeDialog();
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white text-lg font-semibold py-2 px-4 mt-3.5 rounded mr-3 w-44"
            >
              Export Selected
            </button>
            <button 
              onClick={closeDialog} 
              className="bg-red-500 hover:bg-red-700 text-white text-lg font-semibold py-2 px-4 mt-3.5 rounded w-44"
            >
              Abort
            </button>
          </div>
        </dialog>
      </div>
    );
  });

ExportSelectorModal.displayName = "ExportSelectorModal";
export default ExportSelectorModal;
