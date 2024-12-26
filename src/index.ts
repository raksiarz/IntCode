import { readFileSync } from 'fs'
import * as path from 'path'
import * as readline from 'readline/promises'
import { stdin, stdout } from 'process'

const program = readFileSync(path.resolve(__dirname, 'input.txt'), 'utf-8').split(',').map(i => +i)

const EOF = 99 as const
const ADD = 1 as const
const MUL = 2 as const
const MALLOC = 3 as const
const OUT = 4 as const
const JUMP_IF_TRUE = 5 as const
const JUMP_IF_FALSE = 6 as const
const LESS_THAN = 7 as const
const EQ = 8 as const

function getParam(index: number, mode: number) {
    return mode ? program[index + 2] : program[program[index + 2]]
}

function parseInstruction(instruction: number) {
    const opcode = instruction % 100
    const p = Math.floor(instruction / 100).toString(10)
    const params: number[] = []
    for(let i = p.length - 1; i >= 0; i--) {
        params.push(+p[i])
    }
    
    return { opcode, params }
}

function add(index: number, params: number[]) {
    const param1 = params[0] ? program[index + 1] : program[program[index + 1]]
    const param2 = params[1] ? program[index + 2] : program[program[index + 2]]
    const memoryPos = params[2] ? index + 3 : program[index + 3]

    program[memoryPos] = param1 + param2
}

function mul(index: number, params: number[]) {
    const param1 = params[0] ? program[index + 1] : program[program[index + 1]]
    const param2 = params[1] ? program[index + 2] : program[program[index + 2]]
    const memoryPos = params[2] ? index + 3 : program[index + 3]

    program[memoryPos] = param1 * param2
}

function malloc(index: number, params: number[], input: number) {
    const memoryPos = params[0] ? index + 1 : program[index + 1]

    program[memoryPos] = input
}

function out(index: number, params: number[]) {
    const memoryPos = params[0] ? index + 1 : program[index + 1]

    console.log(program[memoryPos])
}

function jumpIfTrue(index: number, params: number[]): number | null {
    const param1 = params[0] ? program[index + 1] : program[program[index + 1]]
    const param2 = params[1] ? program[index + 2] : program[program[index + 2]]
    if(param1) {
        return param2
    } else {
        return null
    }
}

function jumpIfFalse(index: number, params: number[]): number | null {
    const param1 = params[0] ? program[index + 1] : program[program[index + 1]]
    const param2 = params[1] ? program[index + 2] : program[program[index + 2]]

    if(!param1) {
        return param2
    } else {
        return null
    }
}

function lessThan(index: number, params: number[]) {
    const param1 = params[0] ? program[index + 1] : program[program[index + 1]]
    const param2 = params[1] ? program[index + 2] : program[program[index + 2]]
    const memoryPos = params[2] ? index + 3 : program[index + 3]

    if(param1 < param2) {
        program[memoryPos] = 1
    } else {
        program[memoryPos] = 0
    }
}

function equals(index: number, params: number[]) {
    const param1 = params[0] ? program[index + 1] : program[program[index + 1]]
    const param2 = params[1] ? program[index + 2] : program[program[index + 2]]
    const memoryPos = params[2] ? index + 3 : program[index + 3]

    if(param1 === param2) {
        program[memoryPos] = 1
    } else {
        program[memoryPos] = 0
    }
}

function run(program: number[], input: number): number[] {
    let i = 0
    let jumpidx = null
    programLoop: while (i < program.length) {
        const { opcode, params } = parseInstruction(program[i])
        switch(opcode) {
            case ADD:
                add(i, params)
                i += 4
                break;
            case MUL:
                mul(i, params)
                i += 4
                break
            case MALLOC:
                malloc(i, params, input)
                i += 2
                break
            case OUT:
                out(i, params)
                i += 2
                break
            case JUMP_IF_TRUE:
                jumpidx = jumpIfTrue(i, params)
                jumpidx ? i = jumpidx : i += 3
                break
            case JUMP_IF_FALSE:
                jumpidx = jumpIfFalse(i, params)
                jumpidx ? i = jumpidx : i += 3
                break
            case LESS_THAN:
                lessThan(i, params)
                i += 4 
                break
            case EQ:
                equals(i, params)
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
    
    return program
}

const rl = readline.createInterface({ input: stdin, output: stdout })

async function getInput() {
    console.log('Please provide ID:\n1. Test')
    const inp = await rl.question('>> ')
    if(inp === ':q') process.exit(0);

    run(program, +inp)
    process.exit(0)
}

getInput()
