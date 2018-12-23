
/** Record of actions history implemented in `redoundo.Hist`. */
export interface IRecord {
    /** What will be done. */
    Redo: ()=>void;
    /** What will be undone then. */
    Undo: ()=>void;
};

/** Interface of `redoundo.Hist` object. */
export interface IHistory {
    /** Add new record to a history, then `r.Redo()` will be called automatically. */
    add(r: IRecord);
    /** Undo the last record in a history. */
    undo();
    /** Redo last undone record and return it back to the history. */
    redo();
    /** Clean the history. */
    clean();
    /** Length of undoing history. */
    readonly UndoLength: number;
    /** Length of redoing history. */
    readonly RedoLength: number;
}

