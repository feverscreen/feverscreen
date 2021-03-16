interface IAllocation {
  stack: string;
  size: number;
  align: number;
  pointer: number;
}

interface DumpTableOpts {
  keyLabel: string;
  valueLabel: string;
  getKey: (val: IAllocation) => string;
  getValue: (val: IAllocation) => number;
}

class Allocation {
  public stack: string;
  constructor(
    public size: number,
    public align: number,
    public pointer: number
  ) {
    this.stack = getStack();
  }
}

class InvalidFree {
  public stack: string;
  constructor(
    public size: number,
    public align: number,
    public pointer: number
  ) {
    this.stack = getStack();
  }
}

const liveAllocs: Map<number, Allocation> = new Map();
const invalidFrees: InvalidFree[] = [];

function getStack() {
  if (Error) {
    return (Error!() as Error)!
      .stack!.split("\n")
      .filter(
        frame =>
          !frame.match(/tracing-allocator\.ts/) && !frame.startsWith("Error")
      )

      .map(frame => frame.substring(frame.indexOf("./src/")))
      .join("\n");
  }
  return "";
}

function onAlloc(size: number, align: number, pointer: number) {
  const a = new Allocation(size, align, pointer);
  //console.log("Alloc", a);
  liveAllocs.set(pointer, a);
}

function onDealloc(size: number, align: number, pointer: number) {
  const p = liveAllocs.get(pointer);
  const wasLive = liveAllocs.delete(pointer);
  if (!wasLive) {
    invalidFrees.push(new InvalidFree(size, align, pointer));
  } else {
    //console.log("dealloc", p);
  }
}

function onAllocZeroed(size: number, align: number, pointer: number) {
  onAlloc(size, align, pointer);
}

function onRealloc(
  oldPointer: number,
  newPointer: number,
  oldSize: number,
  newSize: number,
  align: number
) {
  onDealloc(oldSize, align, oldPointer);
  onAlloc(newSize, align, newPointer);
}

function dumpTable(
  entries: IAllocation[] | IterableIterator<IAllocation>,
  { keyLabel, valueLabel, getKey, getValue }: DumpTableOpts
) {
  const byKey = new Map();
  let total = 0;

  for (const entry of entries) {
    const key = getKey(entry);
    const keyValue = byKey.get(key) || 0;
    const entryValue = getValue(entry);
    total += entryValue;
    byKey.set(key, keyValue + entryValue);
  }

  const table = [...byKey]
    .sort((a, b) => b[1] - a[1])
    .map(a => ({ [keyLabel]: a[0], [valueLabel]: a[1] }));

  table.unshift({ [keyLabel]: "<total>", [valueLabel]: total });

  console.table(table, [keyLabel, valueLabel]);
}

export const WasmTracingAllocator = {
  on_alloc: onAlloc,
  on_dealloc: onDealloc,
  on_alloc_zeroed: onAllocZeroed,
  on_realloc: onRealloc,

  dumpLiveAllocations() {
    dumpTable(
      liveAllocs.values(),
      Object.assign({
        keyLabel: "Live Allocations",
        valueLabel: "Size (Bytes)",
        getKey: (entry: IAllocation) => entry.stack,
        getValue: (_entry: IAllocation) => 1
      })
    );
  },

  dumpTotal() {
    const entries = liveAllocs.values();
    const byKey = new Map();
    let total = 0;
    const getKey = (entry: IAllocation) => entry.stack;
    const getValue = (_entry: IAllocation) => 1;

    for (const entry of entries) {
      const key = getKey(entry);
      const keyValue = byKey.get(key) || 0;
      const entryValue = getValue(entry);
      total += entry.size;
      byKey.set(key, keyValue + entryValue);
    }
    return total;
  },

  dumpInvalidFrees() {
    dumpTable(
      invalidFrees,
      Object.assign({
        keyLabel: "Invalid Free",
        valueLabel: "Count",
        getKey: (entry: IAllocation) => entry.stack,
        getValue: (_entry: IAllocation) => 1
      })
    );
  }
};
