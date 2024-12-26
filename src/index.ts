import { readFileSync } from 'fs'
import * as path from 'path'
import * as readline from 'readline/promises'
import { stdin, stdout } from 'process'

const program = readFileSync(path.resolve(__dirname, 'program.txt'), 'utf-8').split(',').map(i => +i)
const amp = readFileSync(path.resolve(__dirname, 'amp.txt'), 'utf-8').split(',').map(i => +i)
const rl = readline.createInterface({ input: stdin, output: stdout })

const EOF = 99 as const
const ADD = 1 as const
const MUL = 2 as const
const MALLOC = 3 as const
const OUT = 4 as const
const JUMP_IF_TRUE = 5 as const
const JUMP_IF_FALSE = 6 as const
const LESS_THAN = 7 as const
const EQ = 8 as const

class IntCode {
    program: number[]
    input: number[] = []
    outputValues: number[] = []
    constructor(program: number[], input?: number[]) {
        this.program = program
        this.input = input ?? []
    }

    parseInstruction(instruction: number) {
        const opcode = instruction % 100
        const p = Math.floor(instruction / 100).toString(10)
        const params: number[] = []
        for (let i = p.length - 1; i >= 0; i--) {
            params.push(+p[i])
        }

        return { opcode, params }
    }

    add(index: number, params: number[]) {
        const param1 = params[0] ? this.program[index + 1] : this.program[this.program[index + 1]]
        const param2 = params[1] ? this.program[index + 2] : this.program[this.program[index + 2]]
        const memoryPos = params[2] ? index + 3 : this.program[index + 3]

        this.program[memoryPos] = param1 + param2
    }

    mul(index: number, params: number[]) {
        const param1 = params[0] ? this.program[index + 1] : this.program[this.program[index + 1]]
        const param2 = params[1] ? this.program[index + 2] : this.program[this.program[index + 2]]
        const memoryPos = params[2] ? index + 3 : this.program[index + 3]

        this.program[memoryPos] = param1 * param2
    }

    malloc(index: number, params: number[]) {
        const memoryPos = params[0] ? index + 1 : this.program[index + 1]
        const inputValue = this.input.shift()
        if(inputValue !== undefined) {
            this.program[memoryPos] = inputValue
        } else {
            console.log('there is not enought input values for this program')
        }
    }

    out(index: number, params: number[]) {
        const memoryPos = params[0] ? index + 1 : this.program[index + 1]

        console.log(this.program[memoryPos])
        this.outputValues.push(this.program[memoryPos])
    }

    jumpIfTrue(index: number, params: number[]): number | null {
        const param1 = params[0] ? this.program[index + 1] : this.program[this.program[index + 1]]
        const param2 = params[1] ? this.program[index + 2] : this.program[this.program[index + 2]]
        if (param1) {
            return param2
        } else {
            return null
        }
    }

    jumpIfFalse(index: number, params: number[]): number | null {
        const param1 = params[0] ? this.program[index + 1] : this.program[this.program[index + 1]]
        const param2 = params[1] ? this.program[index + 2] : this.program[this.program[index + 2]]

        if (!param1) {
            return param2
        } else {
            return null
        }
    }

    lessThan(index: number, params: number[]) {
        const param1 = params[0] ? this.program[index + 1] : this.program[this.program[index + 1]]
        const param2 = params[1] ? this.program[index + 2] : this.program[this.program[index + 2]]
        const memoryPos = params[2] ? index + 3 : this.program[index + 3]

        if (param1 < param2) {
            this.program[memoryPos] = 1
        } else {
            this.program[memoryPos] = 0
        }
    }

    equals(index: number, params: number[]) {
        const param1 = params[0] ? this.program[index + 1] : this.program[this.program[index + 1]]
        const param2 = params[1] ? this.program[index + 2] : this.program[this.program[index + 2]]
        const memoryPos = params[2] ? index + 3 : this.program[index + 3]

        if (param1 === param2) {
            this.program[memoryPos] = 1
        } else {
            this.program[memoryPos] = 0
        }
    }

    run() {
        let i = 0
        let jumpidx = null
        programLoop: while (i < this.program.length) {
            const { opcode, params } = this.parseInstruction(this.program[i])
            switch (opcode) {
                case ADD:
                    this.add(i, params)
                    i += 4
                    break;
                case MUL:
                    this.mul(i, params)
                    i += 4
                    break
                case MALLOC:
                    this.malloc(i, params)
                    i += 2
                    break
                case OUT:
                    this.out(i, params)
                    i += 2
                    break
                case JUMP_IF_TRUE:
                    jumpidx = this.jumpIfTrue(i, params)
                    jumpidx ? i = jumpidx : i += 3
                    break
                case JUMP_IF_FALSE:
                    jumpidx = this.jumpIfFalse(i, params)
                    jumpidx ? i = jumpidx : i += 3
                    break
                case LESS_THAN:
                    this.lessThan(i, params)
                    i += 4
                    break
                case EQ:
                    this.equals(i, params)
                    i += 4
                    break
                case EOF:
                    console.log("Process exit")
                    break programLoop
                default:
                    i++
                    break
            }
        }
    }

    get ampPhase(): number {
        if(this.outputValues.length > 1) {
            console.log('There seems to be more than 1 amp phases')
        }
        return this.outputValues[0]
    }
}

let phase = 0
for (let i = 0; i < amp.length; i++) {
    const proc = new IntCode(program, [amp[i], phase])
    proc.run()
    phase = proc.ampPhase
}

process.exit(0)
