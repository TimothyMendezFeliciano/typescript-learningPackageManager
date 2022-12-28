import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import * as utils from './utils'
import {Manifest} from './resolve'
import it from "node:test";
import * as util from "util";

interface Lock {
    [index: string]: {
        url: string,
        version: string,
        shasum: string,
        dependencies: { [dependency: string]: string },
    }
}


const oldLock: Lock = Object.create(null) // Only for reading
const newLock: Lock = Object.create(null) // Only for writing

export function updateOrCreate(name: string, info: object) {
    if (!newLock[name]) {
        newLock[name] = Object.create(null)
    }

    Object.assign(newLock[name], info)
}

export function getItem(name: string, constraints: string): Manifest | null {
    const item = oldLock[`${name}@${constraints}`]

    if (!item) {
        return null
    }

    return {
        [item.version]: {
            dependencies: item.dependencies,
            dist: {shasum: item.shasum, tarball: item.url}
        }
    }
}

export async function writeLock() {
    await fs.writeFile(
        './tiny-pm.yml',
        yaml.safeDump(utils.sortKeys(newLock), {noRefs: true})
    )
}

export async function readLock() {
    if(fs.path('./tiny-pm.yml')) {
        Object.assign(
            oldLock,
            yaml.safeLoad(await fs.readFile('./tiny-pm.yml', 'utf-8'))
        )
    }
}