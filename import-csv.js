/// <reference types="@mapeditor/tiled-api" />

/*
 * import-csv.js
 *
 * This simple extension adds a `Import Brush CSV (Ctrl+K)` action to the
 * Edit menu, which can be used to import a brush layer using a CSV string.
 *
 * Made for the [Tiled Map Editor](https://www.mapeditor.org/), and intended to be used with
 * external 3rd-party tools.
 *
 * GitHub repository: https://github.com/luxmiyu/tiled-import-csv.
 */

/**
 * Logs and alerts of a message.
 * @param {string} msg
 */
function error(msg) {
  tiled.log("ImportCSV: " + msg)
  tiled.alert(msg)
}

/**
 * Fills an array with a certain value until it reaches the target length.
 * @param {any[]} arr
 * @param {number} targetLength 
 * @param {any} fillValue 
 * @returns {any[]}
 */
function padEnd(arr, targetLength, fillValue) {
  if (arr.length >= targetLength) return arr
  return arr.concat(Array(targetLength - arr.length).fill(fillValue))
}

/**
 * Parses a CSV string into a 2D array of numbers.
 * @param {string} csv
 * @returns {number[][]}
 */
function parseCSV(csv) {
  const grid = []
  const rows = csv.split("\n").filter(r => r.trim() !== "")

  let maxLength = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const values = row.split(",").map(x => parseInt(x.trim(), 10)).filter(n => !Number.isNaN(n))
    grid.push(values)

    if (values.length > maxLength) maxLength = values.length
  }

  return grid.map(r => padEnd(r, maxLength, -1))
}

// ########################################################################### //

function onclick() {
  const brush = tiled.mapEditor.currentBrush

  if (brush.tilesets.length <= 0) {
    error("Please make sure you have a tileset selected.")
    return
  }

  const csv = tiled.prompt("Paste the CSV below:")
  if (csv.trim() === "") return

  const grid = parseCSV(csv)
  if (!Array.isArray(grid) || grid.length <= 0 || grid[0].length <= 0) {
    return error("Must be a valid CSV.")
  }

  const width = grid[0].length
  const height = grid.length

  brush.setSize(width, height)

  while (brush.layerCount > 0) {
    brush.removeLayerAt(0)
  }

  const layer = new TileLayer()
  const edit = layer.edit()

  const tileset = brush.tilesets[0]

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const id = grid[j][i]
      if (id < 0) continue
      edit.setTile(i, j, tileset.tile(id))
    }
  }

  edit.apply()
  brush.addLayer(layer)
  tiled.mapEditor.currentBrush = brush
}

let action = tiled.registerAction("ImportCSV", onclick)

action.text = "Import Brush CSV"
action.shortcut = "Ctrl+K"
action.icon = "import-csv.svg"

tiled.extendMenu("Edit", [
  { action: "ImportCSV", before: "SelectAll" },
  { separator: true }
])
