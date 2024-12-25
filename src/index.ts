import { readFileSync } from 'fs'
import * as path from 'path'

const input = readFileSync(path.resolve(__dirname, 'input.txt'), 'utf-8').split(',').map(i => +i)
input[1] = 12
input[2] = 2

const EOF = 99 as const
const ADD = 1 as const
const MUL = 2 as const

function run(input: number[]): number[] {
    let i = 0
    while (i < input.length) {
        if (input[i] === ADD) {
            input[input[i + 3]] = input[input[i + 1]] + input[input[i + 2]]
            i += 3
        }
        if (input[i] === MUL) {
            input[input[i + 3]] = input[input[i + 1]] * input[input[i + 2]]
            i += 3
        }
        if (input[i] === EOF) break
        i++
    }
    
    return input
}

console.log(run(input)[0])
