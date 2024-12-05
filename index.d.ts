import "dotenv/config";
import { BlockName, GameClient } from "pixelwalker.js";
declare const Client: (options: {
    world_title: string;
    world_width?: 400 | 375 | 350 | 325 | 300 | 275 | 250 | 225 | 200 | 175 | 150 | 125 | 100 | 75 | 50 | 636;
    world_height?: 400 | 375 | 350 | 325 | 300 | 275 | 250 | 225 | 200 | 175 | 150 | 125 | 100 | 75 | 50;
} | string, digit?: 0 | 1) => Promise<GameClient>;
export default Client;
export declare function parse(message: string): string[];
type Change = {
    x: number;
    y: number;
    layer: number;
    blockId: number;
    extraFields: Uint8Array;
};
export declare function createPlacer(client: GameClient, maxItems?: number): (changes: Change[]) => void;
type Structure = {
	type: BlockName
	positions: string[]
	layer: 0 | 1
}[]
export declare function parseStructure(structure: Structure): Change[]