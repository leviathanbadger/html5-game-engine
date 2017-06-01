﻿import { GameItem } from './dbs/item-db';


export class Inventory {
    constructor() {

    }

    private _MAX_ITEM_COUNT = 27;
    get MAX_ITEM_COUNT() {
        return this._MAX_ITEM_COUNT;
    }

    private _currentItemCount = 0;
    get currentItemCount() {
        return this._currentItemCount;
    }

    private _items: GameItem[] = [];
    get items() {
        return this._items;
    }

    containsItem(itemToFind: GameItem) {
        return this.items.indexOf(itemToFind) >= 0;
    }

    addItem(newItem: GameItem) {
        if (this._currentItemCount == this._MAX_ITEM_COUNT) {
            throw new Error('Attempted to add an item when the inventory was full');
        }
        this.items.push(newItem);
        ++this._currentItemCount;
    }

    removeItem(itemToRemove: GameItem) {
        if (!this.containsItem(itemToRemove)) {
            throw new Error('Attempted to remove an item that was not in the inventory from the inventory.');
        }
        this.items.splice(this.items.indexOf(itemToRemove), 1);
        --this._currentItemCount;
    }
}