export type Record = {
    Redo: ()=>void;
    Undo: ()=>void;
}

export default interface History {
    readonly UndoLength: number;
    readonly RedoLength: number;

    add(r: Record);
    undo();
    redo();
    clean();
}

class HistoryImpl implements History {

    private offset_: number;
    private list_:   Record[];
    private depth_:  number;

    constructor(depth: number) {
        this.depth_ = depth;
        this.list_ = [];
        this.offset_ = 0;
    }

    get UndoLength(): number {
        return this.list_.length-this.offset_;
    }

    get RedoLength(): number {
        return this.offset_;
    }

    add(r: Record) {
        let lst = this.list_.slice(0, this.list_.length-this.offset_);
        if (lst.length === this.depth_) {
            lst = lst.splice(0, 1);
        }
        lst.push(r);
        this.offset_ = 0;
        this.list_ = lst;
        r.Redo();
    }

    undo() {
        if (this.list_.length) {
            let maxOffset = this.list_.length-1;
            if (this.offset_ <= maxOffset) {
                this.list_[maxOffset-this.offset_].Undo();
                this.offset_++;
            }
        }
    }

    redo() {
        if (this.list_.length) {
            let maxOffset = this.list_.length-1;
            if (this.offset_ > 0) {
                this.offset_--;
                this.list_[maxOffset-this.offset_].Redo();
            }
        }
    }

    clean() {
        this.list_ = [];
        this.offset_ = 0;
    }
}

export function makeHistory(depth: number): History {
    return new HistoryImpl(depth);
}