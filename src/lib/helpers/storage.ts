/*
 * Storage helper
 */

import Dexie from 'dexie';
import { IWorldSettings, noa } from '../../values';

interface IMain {
	name: string;
	data: any;
}

interface IResources {
	name: string;
	data: any;
}

interface IWorld {
	name: string;
	settings: IWorldSettings;
	lastplay: number;
}

interface IWorldData {
	name: string;
	data: object;
}

class Database extends Dexie {
	main: Dexie.Table<IMain, string>;
	resources: Dexie.Table<IResources, string>;
	worlds: Dexie.Table<IWorld, string>;
	worlddata: Dexie.Table<IWorldData, string>;

	constructor() {
		super('voxelsrv-storage');
		this.version(1).stores({
			main: `name, data`,
			resources: `name, data, active`,
			worlds: `name, settings, lastplay`,
			worlddata: `name, data`
		});
	}
}

export const db = new Database();

export async function getWorldList() {
	return await db.worlds.orderBy('lastplay').reverse().toArray();
}

export async function saveWorld(name: string, data: object, settings: IWorldSettings) {
	await db.worlds.delete(name);
	await db.worlddata.delete(name);
	await db.worlds.add({name, settings, lastplay: Date.now()}, name)
	await db.worlddata.add({name, data}, name)
}

export async function deleteWorld(name: string) {
	await db.worlds.delete(name);
	db.worlddata.delete(name);
}

export async function getWorld(name: string): Promise<IWorld> {
	const world = db.worlds.where('name').equals(name).first();
	return world;
}

export async function getWorldData(name: string): Promise<IWorldData> {
	const world = db.worlddata.where('name').equals(name).first();
	return world;
}

export async function getSettings(): Promise<object> {
	const x = (await db.main.where('name').equals('settings').toArray())[0];
	if (x != undefined) return x.data;
	return {};
}

export async function saveSettings(data) {
	db.main.put({ name: 'settings', data: data });
}