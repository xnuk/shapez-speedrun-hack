import { readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { decompressX64, compressX64 } from './lzstring.js'
import { decompressObject, compressObject } from './savegame_compressor.js'
import { crc32 } from './crc32.js'

const salt = "Ec'])@^+*9zMevK3uMV4432x9%iK'="

const CRC_PREFIX = 'crc32'.padEnd(32, '-')
const computeCrc = str => CRC_PREFIX + crc32(str).toString(16).padStart(8, '0')

const read = path => {
	const file = readFileSync(path, 'utf8')
	assert.strictEqual(file[0], '\x01')

	const decompressed = decompressX64(file.substring(1))
	assert.ok(decompressed != null, 'decompressed should not null')

	const checksum = decompressed.substring(0, 40)
	const jsonString = decompressed.substring(40)
	assert.strictEqual(computeCrc(jsonString + salt), checksum)

	const contents = decompressObject(JSON.parse(jsonString))
	return contents
}

const write = (path, contents) => {
	const jsonString = JSON.stringify(compressObject(contents))
	const checksum = computeCrc(jsonString + salt)
	const data = '\x01' + compressX64(checksum + jsonString)
	writeFileSync(path, data)
}

write('./speedrun-hack.bin', {
	version: 1010,
	dump: {
		camera: {
			zoomLevel: 3,
			center: { x: 0, y: 0 },
		},
		time: {
			timeSeconds: 0,
			speed: { $: 'regular', data: {} },
			realtimeSeconds: 0,
		},
		map: { seed: 27378 },
		gameMode: { $: 'regularMode', data: {} },
		entityMgr: { nextUid: 10014 },
		hubGoals: {
			level: 1,
			storedShapes: {
				CuCuCuCu: 30,
				'----CuCu': 40,
				RuRuRuRu: 70,
				'RuRu----': 125,
				'Cu----Cu': 170,
				'Cu------': 270,
				CrCrCrCr: 300,
				'RbRb----': 480,
				CpCpCpCp: 600,
				ScScScSc: 800,
				CgScScCg: 1000,
				'CbCbCbRb:CwCwCwCw': 1000,
			},
			upgradeLevels: { belt: 0, miner: 0, processors: 0, painting: 0 },
		},
		entities: [
			{
				uid: 10000,
				components: {
					StaticMapEntity: {
						origin: { x: -2, y: -2 },
						rotation: 0,
						originalRotation: 0,
						code: 26,
					},
					ItemProcessor: {
						nextOutputSlot: 0,
					},
					WiredPins: {
						slots: [
							{
								value: { $: 'shape', data: 'CuCuCuCu' },
							},
						],
					},
				},
			},
		],
		beltPaths: [],
		pinnedShapes: { shapes: [] },
		waypoints: {
			waypoints: [
				{
					label: null,
					center: { x: 0, y: 0 },
					zoomLevel: 3,
					layer: 'regular',
				},
			],
		},
		modExtraData: {},
	},
	stats: { failedMam: true, trashedCount: 0, usedInverseRotater: false },
	lastUpdate: Date.now(),
	mods: [],
})
