import { type PathOrFileDescriptor, writeFileSync } from 'node:fs';

import ts from 'typescript';

import * as module from './module';
import * as typedef from './typedef';
import * as types from './types';
import { addLeadingComment, tsNodeToString } from './utils';

export type { Property } from './typedef';
export type { Comments } from './utils';
export type { Node, TypeNode } from 'typescript';

export class TypeScriptFile {
    private _headers: Array<string> = [];
    private _imports: Array<ts.Node> = [];
    private _items: Array<ts.Node | string> = [];

    public add(...nodes: Array<ts.Node | string>): void {
        this._items = [...this._items, ...nodes];
    }

    public addHeader() {
        const text = 'This file is auto-generated by @hey-api/openapi-ts';
        const comment = addLeadingComment(undefined, [text], true, false);
        this._headers = [...this._headers, comment];
        return this;
    }

    public addNamedImport(...params: Parameters<typeof module.createNamedImportDeclarations>): void {
        this._imports = [...this._imports, compiler.import.named(...params)];
    }

    public toString(seperator: string = '\n') {
        let output: string[] = [];
        if (this._headers.length) {
            output = [...output, this._headers.join('\n')];
        }
        if (this._imports.length) {
            output = [...output, this._imports.map(v => tsNodeToString(v)).join('\n')];
        }
        output = [...output, ...this._items.map(v => (typeof v === 'string' ? v : tsNodeToString(v)))];
        return output.join(seperator);
    }

    public write(file: PathOrFileDescriptor, seperator: string = '\n') {
        if (!this._items.length) {
            return;
        }
        writeFileSync(file, this.toString(seperator));
    }
}

export const compiler = {
    export: {
        all: module.createExportAllDeclaration,
        asConst: module.createExportVariableAsConst,
        named: module.createNamedExportDeclarations,
    },
    import: {
        named: module.createNamedImportDeclarations,
    },
    typedef: {
        alias: typedef.createTypeAliasDeclaration,
        array: typedef.createTypeArrayNode,
        basic: typedef.createTypeNode,
        interface: typedef.createTypeInterfaceNode,
        intersect: typedef.createTypeIntersectNode,
        record: typedef.createTypeRecordNode,
        tuple: typedef.createTypeTupleNode,
        union: typedef.createTypeUnionNode,
    },
    types: {
        array: types.createArrayType,
        enum: types.createEnumDeclaration,
        object: types.createObjectType,
    },
    utils: {
        toString: tsNodeToString,
    },
};
